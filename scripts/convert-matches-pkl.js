#!/usr/bin/env node
/**
 * Convert a Python pickle of DTW matches into a JSON file for the site.
 * The expected pickle structure (as described):
 *   { country_name: [ Series, np.float(distance), Series, np.float(distance), ... ] }
 *
 * Output JSON (normalized):
 *   {
 *     "COUNTRY": [ { series: { values: [...], index: [...]? }, distance: <number> }, ... ]
 *   }
 *
 * Requires Python 3; pandas/numpy recommended if present in the pickle.
 *
 * Usage:
 *   node scripts/convert-matches-pkl.js --src /path/to/matches.pkl --out public/data/matches.json
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
    console.error('Missing --src /path/to/matches.pkl')
    process.exit(1)
  }
  const outPath = path.resolve(args.out || path.join('public', 'data', 'matches.json'))
  const outDir = path.dirname(outPath)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const py = `import pickle, json, sys
from collections.abc import Mapping, Sequence

try:
    import numpy as np  # noqa: F401
except Exception:
    np = None  # type: ignore
try:
    import pandas as pd  # noqa: F401
except Exception:
    pd = None  # type: ignore

def to_list(x):
    # Convert arrays/Series to plain lists; also return index if present
    try:
        if pd is not None and isinstance(x, (pd.Series, pd.Index)):
            idx = None
            try:
                idx = [str(i) for i in x.index] if hasattr(x, 'index') else None
            except Exception:
                idx = None
            vals = x.tolist()
            # capture series name when available (often the matched country's name)
            nm = None
            try:
                nm = (x.name if hasattr(x, 'name') else None)
            except Exception:
                nm = None
            if nm is not None:
                try:
                    nm = str(nm)
                except Exception:
                    nm = None
            out = { 'values': vals }
            if idx is not None:
                out['index'] = idx
            if nm is not None:
                out['name'] = nm
            return out
    except Exception:
        pass
    try:
        if np is not None and hasattr(x, 'tolist'):
            vals = x.tolist()
            return { 'values': vals }
    except Exception:
        pass
    if isinstance(x, Sequence) and not isinstance(x, (str, bytes, bytearray)):
        return { 'values': [to_primitive(v) for v in x] }
    # Fallback scalar
    return { 'values': [to_primitive(x)] }

def to_number(x):
    try:
        return float(x)
    except Exception:
        try:
            return int(x)
        except Exception:
            return None

def to_primitive(x):
    if isinstance(x, (str, int, float)) or x is None:
        return x
    try:
        if np is not None and hasattr(x, 'item'):
            return x.item()
    except Exception:
        pass
    try:
        if hasattr(x, 'tolist'):
            return x.tolist()
    except Exception:
        pass
    return str(x)

def normalize(matches):
    out = {}
    if not isinstance(matches, Mapping):
        return out
    for k, v in matches.items():
        key = str(k)
        arr = []
        if isinstance(v, Sequence) and not isinstance(v, (str, bytes, bytearray)):
            # Two formats supported:
            # 1) Alternating [Series, distance, Series, distance, ...]
            # 2) Pairs [(Series, distance), ...] or [[Series, distance], ...]
            if v and all(isinstance(it, (list, tuple)) and len(it) == 2 for it in v):
                for s, d in v:
                    arr.append({ 'series': to_list(s), 'distance': to_number(d) })
            else:
                i = 0
                L = len(v)
                while i + 1 < L:
                    s = v[i]
                    d = v[i+1]
                    arr.append({ 'series': to_list(s), 'distance': to_number(d) })
                    i += 2
        out[key] = arr
    return out

with open(sys.argv[1], 'rb') as f:
    data = pickle.load(f)

json.dump(normalize(data), sys.stdout)
`

  try {
    const json = execFileSync('python3', ['-c', py, args.src], { encoding: 'utf-8', maxBuffer: 1024 * 1024 * 32 })
    fs.writeFileSync(outPath, json)
    console.log(`Wrote ${outPath}`)
  } catch (e) {
    console.error('Failed converting matches pickle via python3:', e?.message || e)
    process.exit(1)
  }
}

if (require.main === module) main()
