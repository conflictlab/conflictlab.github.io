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

with open(sys.argv[1], 'rb') as f:
    data = pickle.load(f)
json.dump(sanitize(data), sys.stdout)
`

  try {
    const json = execFileSync('python3', ['-c', py, args.src], { encoding: 'utf-8' })
    fs.writeFileSync(outPath, json)
    console.log(`Wrote ${outPath}`)
  } catch (e) {
    console.error('Failed converting pickle via python3:', e?.message || e)
    process.exit(1)
  }
}

if (require.main === module) main()

