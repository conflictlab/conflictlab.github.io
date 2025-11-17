#!/usr/bin/env node
/**
 * Join PRIO‑GRID shapefile polygons with a wide matrix CSV (6xN) of predictions
 * and output a compact GeoJSON containing only cells present in the CSV.
 *
 * Usage:
 *   node scripts/priogrid-shp-join-csv.js \
 *     --csv https://.../df_output.csv \
 *     [--shp content/priogrid_cellshp] [--period 2025-10] [--out public/data/grid]
 */

const fs = require('fs')
const path = require('path')

async function main() {
  const args = parseArgs(process.argv)
  const shpDir = path.resolve(args.shp || path.join('content', 'priogrid_cellshp'))
  const shpPath = findShapefile(shpDir)
  if (!shpPath) {
    console.error(`No .shp file found under ${shpDir}`)
    process.exit(1)
  }

  let period = args.period
  if (!period) {
    try {
      const latest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', 'forecasts', 'latest.json'), 'utf-8'))
      period = latest.period
    } catch {}
  }
  if (!args.csv) {
    console.error('Missing --csv URL or file path')
    process.exit(1)
  }
  if (!period) {
    console.error('Missing --period and cannot infer from latest.json')
    process.exit(1)
  }
  const outDir = path.resolve(args.out || path.join('public', 'data', 'grid'))
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, `${period}.geo.json`)

  const csvText = await readText(args.csv)
  const { ids, values } = parseWideMatrix(csvText)
  if (!ids || ids.length === 0) {
    console.error('Could not parse matrix CSV header (no ids)')
    process.exit(1)
  }

  const shapefile = require('shapefile')
  const source = await shapefile.open(shpPath)
  const idSet = new Set(ids)
  const features = []
  let idKey = null
  for (;;) {
    const { done, value } = await source.read()
    if (done) break
    const feat = value
    if (!idKey) idKey = detectIdKey(feat.properties)
    const id = String(feat.properties[idKey])
    if (!idSet.has(id)) continue
    // Attach m1..m6 if available
    const m = values.get(id) || [0,0,0,0,0,0]
    const props = { m1: m[0]||0, m2: m[1]||0, m3: m[2]||0, m4: m[3]||0, m5: m[4]||0, m6: m[5]||0 }
    features.push({ type: 'Feature', properties: props, geometry: feat.geometry })
  }

  if (features.length === 0) {
    console.error('No matching features found in shapefile for CSV ids')
    process.exit(1)
  }

  fs.writeFileSync(outFile, JSON.stringify({ type: 'FeatureCollection', features }))
  console.log(`Wrote ${outFile} with ${features.length} features (joined by id field)`) 
}

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const [k,v] = a.split('=')
    const key = k.replace(/^--/, '')
    if (v !== undefined) out[key] = v
    else if (argv[i+1] && !argv[i+1].startsWith('--')) { out[key] = argv[i+1]; i++ }
    else out[key] = true
  }
  return out
}

async function readText(src) {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`)
    return await res.text()
  }
  return fs.readFileSync(path.resolve(src), 'utf-8')
}

function findShapefile(dir) {
  if (!fs.existsSync(dir)) return null
  const files = fs.readdirSync(dir)
  const shp = files.find(f => f.toLowerCase().endsWith('.shp'))
  return shp ? path.join(dir, shp) : null
}

function detectIdKey(props) {
  const keys = Object.keys(props)
  const candidates = ['gid', 'GID', 'cell', 'CELL', 'cell_id', 'CELL_ID', 'prio_id', 'PRIO_ID', 'id', 'ID']
  for (const c of candidates) if (keys.includes(c)) return c
  for (const k of keys) { if (Number.isInteger(props[k])) return k }
  return keys[0]
}

function splitCsv(line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"') { if (line[i+1] === '"') { cur += '"'; i++ } else { inQ = false } }
      else cur += ch
    } else {
      if (ch === ',') { out.push(cur.trim()); cur = '' }
      else if (ch === '"') inQ = true
      else cur += ch
    }
  }
  out.push(cur.trim())
  return out
}

function parseWideMatrix(text) {
  const lines = text.split(/\r?\n/).filter(l => l.length > 0)
  if (!lines.length) return { ids: [], values: new Map() }
  const header = splitCsv(lines[0])
  // First field is typically blank; remaining are cell IDs
  const ids = header.slice(1).map(String)
  // Next 6 rows are m1..m6 values
  const rows = Math.min(6, lines.length - 1)
  const values = new Map()
  for (let ci = 0; ci < ids.length; ci++) {
    const id = ids[ci]
    const m = []
    for (let r = 1; r <= rows; r++) {
      const cols = splitCsv(lines[r])
      const val = Number(cols[ci + 1] || '0')
      m.push(Number.isFinite(val) ? val : 0)
    }
    while (m.length < 6) m.push(0)
    values.set(id, m)
  }
  return { ids, values }
}

if (require.main === module) {
  if (typeof fetch !== 'function') {
    console.error('This script requires Node 18+ (global fetch).')
    process.exit(1)
  }
  main().catch(err => { console.error(err?.message || err); process.exit(1) })
}

