#!/usr/bin/env node
/**
 * Convert a Python pickle (sce_dictionary.pkl) into a JSON file for the site to consume.
 * Requires Python 3 on PATH.
 *
 * Usage:
 *   node scripts/convert-scenarios-pkl.js --src /path/to/sce_dictionary.pkl --out public/data/scenarios.json
 */

const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const [k, v] = a.split('=')
    const key = k.replace(/^--/, '')
    if (v !== undefined) out[key] = v
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) { out[key] = argv[i + 1]; i++ }
    else out[key] = true
  }
  return out
}

function main() {
  const args = parseArgs(process.argv)
  if (!args.src) {
    console.error('Missing --src /path/to/sce_dictionary.pkl')
    process.exit(1)
  }
  const outPath = path.resolve(args.out || path.join('public', 'data', 'scenarios.json'))
  const outDir = path.dirname(outPath)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Prefer the Python installed by actions/setup-python (pythonLocation),
  // then PYTHON env, then fall back to 'python3'. This avoids version
  // mismatches (e.g., NumPy 2.x pickles) on runners with multiple pythons.
  function resolvePython() {
    const pLoc = process.env.pythonLocation
    if (pLoc) {
      const cand = path.join(pLoc, 'bin', 'python')
      const cand3 = path.join(pLoc, 'bin', 'python3')
      if (fs.existsSync(cand)) return cand
      if (fs.existsSync(cand3)) return cand3
    }
    // Prefer local project venv if present
    try {
      const venvPy = path.join(process.cwd(), '.venv', 'bin', process.platform === 'win32' ? 'python.exe' : 'python')
      if (fs.existsSync(venvPy)) return venvPy
    } catch {}
    if (process.env.PYTHON && fs.existsSync(process.env.PYTHON)) return process.env.PYTHON
    return 'python3'
  }

  // Best-effort ensure required Python deps exist (numpy>=2, pandas>=2)
  function ensurePythonDeps(pyBin) {
    try {
      const missing = execFileSync(pyBin, ['-c', `import json, importlib
missing=[]
try:
    import numpy as np
    import importlib as _il
    try:
        _il.import_module('numpy._core')
    except Exception:
        pass
except Exception:
    missing.append('numpy>=2.0.0')
try:
    import pandas as pd
except Exception:
    missing.append('pandas>=2.0.0')
print(json.dumps(missing))
`], { encoding: 'utf-8' })
      const mods = JSON.parse(String(missing || '[]'))
      if (Array.isArray(mods) && mods.length) {
        try {
          console.log('Installing missing Python packages:', mods.join(', '))
          execFileSync(pyBin, ['-m', 'pip', 'install', ...mods], { stdio: 'inherit' })
        } catch (e) {
          console.warn('Warning: auto-install of Python deps failed; proceeding anyway')
        }
      }
    } catch {}
  }

  const py = `import pickle, json, sys
from collections.abc import Mapping, Sequence

def sanitize(x):
    try:
        import numpy as np
    except Exception:
        np = None
    if np is not None and hasattr(x, 'tolist'):
        try:
            return x.tolist()
        except Exception:
            pass
    if isinstance(x, (str, int, float)) or x is None:
        return x
    if isinstance(x, bytes):
        try:
            return x.decode('utf-8', 'ignore')
        except Exception:
            return list(x)
    if isinstance(x, Mapping):
        return {str(k): sanitize(v) for k, v in x.items()}
    if isinstance(x, Sequence) and not isinstance(x, (str, bytes, bytearray)):
        return [sanitize(v) for v in x]
    return str(x)

# Provide compatibility shims for older pandas pickles that reference
# removed modules/classes like pandas.core.indexes.numeric.*Index.
try:
    import types as _types
    import sys as _sys
    import pandas as _pd  # noqa: F401
    try:
        # If the legacy module is missing in current pandas, create a stub
        if 'pandas.core.indexes.numeric' not in _sys.modules:
            m = _types.ModuleType('pandas.core.indexes.numeric')
            try:
                from pandas import Index as _Index
                # Map legacy numeric index classes to the modern Index type
                m.Int64Index = _Index
                m.UInt64Index = _Index
                m.Float64Index = _Index
            except Exception:
                pass
            _sys.modules['pandas.core.indexes.numeric'] = m
    except Exception:
        pass
except Exception:
    pass

# Provide NumPy 2.x pickle compatibility on environments with NumPy 1.x
try:
    import sys as _sys, importlib as _il
    import numpy as _np
    try:
        _il.import_module('numpy._core')
    except Exception:
        try:
            import numpy.core as _np_core
            _sys.modules['numpy._core'] = _np_core
        except Exception:
            pass
except Exception:
    pass

with open(sys.argv[1], 'rb') as f:
    data = pickle.load(f)
json.dump(sanitize(data), sys.stdout)
`

  try {
    const pyBin = resolvePython()
    ensurePythonDeps(pyBin)
    const json = execFileSync(pyBin, ['-c', py, args.src], { encoding: 'utf-8' })
    fs.writeFileSync(outPath, json)
    console.log(`Wrote ${outPath}`)
  } catch (e) {
    console.error('Failed converting pickle via python3:', e?.message || e)
    process.exit(1)
  }
}

if (require.main === module) main()
