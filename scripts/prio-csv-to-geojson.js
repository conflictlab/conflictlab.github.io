#!/usr/bin/env node
/**
 * Build a PRIO‑GRID GeoJSON from a CSV file (URL or local path).
 * Each CSV row must include lat/lon columns and 1–6 month values (m1..m6 or similar).
 *
 * Usage:
 *   node scripts/prio-csv-to-geojson.js \
 *     --csv https://.../df_prio.csv \
 *     --period 2025-10 \
 *     [--out public/data/grid] [--gridSize 0.5]
 */

const fs = require('fs')
const path = require('path')

async function main() {
  const args = parseArgs(process.argv)
  let period = args.period
  if (!period) {
    // derive from latest snapshot
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

  const text = await readText(args.csv)
  const defaultCentroids = path.join(process.cwd(), 'public', 'data', 'grid', 'centroids.csv')
  const centroids = args.centroids ? loadCentroids(args.centroids) : (fs.existsSync(defaultCentroids) ? loadCentroids(defaultCentroids) : null)
  const features = csvToFeatures(text, Number(args.gridSize || 0.5), centroids)
  if (!features || features.length === 0) {
    console.error('No features generated from CSV; please check column names')
    process.exit(1)
  }
  const gj = { type: 'FeatureCollection', features }
  fs.writeFileSync(outFile, JSON.stringify(gj))
  console.log(`Wrote ${outFile} with ${features.length} features`)
}

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

async function readText(src) {
  if (/^https?:\/\//i.test(src)) {
    const res = await fetch(src)
    if (!res.ok) throw new Error(`Fetch failed ${res.status}`)
    return await res.text()
  }
  return fs.readFileSync(path.resolve(src), 'utf-8')
}

function csvToFeatures(text, gridSizeDeg, centroids) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return []
  const header = splitCsv(lines[0])
  const latKey = findKey(header, ['lat','latitude','y','Lat','Latitude','Y'])
  const lonKey = findKey(header, ['lon','lng','longitude','x','Lon','Lng','Longitude','X'])
  const hasCoords = !!(latKey && lonKey)
  const mKeys = []
  for (let i = 1; i <= 6; i++) {
    const k = findKey(header, [`m${i}`, `month${i}`, `${i}m`, `pred${i}`, `p${i}`, `h${i}`, `m_${i}`, `value_${i}`])
    if (k) mKeys.push(k)
  }
  if (mKeys.length < 1 && hasCoords) return []
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))
  const features = []
  const half = gridSizeDeg / 2
  if (hasCoords) {
    for (let li = 1; li < lines.length; li++) {
      const cols = splitCsv(lines[li])
      if (!cols.length) continue
      const lat = Number(cols[idx[latKey]] || 'NaN')
      const lon = Number(cols[idx[lonKey]] || 'NaN')
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
      const props = {}
      for (let i = 0; i < 6; i++) {
        const k = mKeys[i]
        const v = k ? Number(cols[idx[k]] || '0') : 0
        props[`m${i+1}`] = Number.isFinite(v) ? v : 0
      }
      const poly = squarePoly(lon, lat, half)
      features.push({ type: 'Feature', properties: props, geometry: poly })
    }
  } else if (centroids) {
    // Wide matrix: header columns are cell ids; data rows are horizons
    const h = Math.min(6, lines.length - 1)
    for (let ci = 1; ci < header.length; ci++) {
      const cellId = header[ci]
      const c = centroids[cellId]
      if (!c) continue
      const props = {}
      for (let r = 1; r <= h; r++) {
        const rowCols = splitCsv(lines[r])
        const v = Number(rowCols[ci] || '0')
        props[`m${r}`] = Number.isFinite(v) ? v : 0
      }
      for (let r = h + 1; r <= 6; r++) props[`m${r}`] = 0
      const poly = squarePoly(c.lon, c.lat, half)
      features.push({ type: 'Feature', properties: props, geometry: poly })
    }
  }
  return features
}

function loadCentroids(pth) {
  const abs = path.resolve(pth)
  if (!fs.existsSync(abs)) return null
  const text = fs.readFileSync(abs, 'utf-8')
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return null
  const header = splitCsv(lines[0])
  const idKey = findKey(header, ['id','cell','cell_id','prio_id'])
  const latKey = findKey(header, ['lat','latitude','y'])
  const lonKey = findKey(header, ['lon','lng','longitude','x'])
  if (!idKey || !latKey || !lonKey) return null
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))
  const map = {}
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsv(lines[i])
    const id = cols[idx[idKey]]
    const lat = Number(cols[idx[latKey]] || 'NaN')
    const lon = Number(cols[idx[lonKey]] || 'NaN')
    if (id && Number.isFinite(lat) && Number.isFinite(lon)) map[id] = { lat, lon }
  }
  return map
}

function squarePoly(lon, lat, half) {
  const ring = [
    [lon - half, lat - half],
    [lon + half, lat - half],
    [lon + half, lat + half],
    [lon - half, lat + half],
    [lon - half, lat - half],
  ]
  return { type: 'Polygon', coordinates: [ring] }
}

function splitCsv(line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else { inQ = false } }
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

function findKey(header, candidates) {
  const lower = header.map(h => h.toLowerCase())
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase())
    if (idx >= 0) return header[idx]
  }
  for (const c of candidates) {
    const idx = lower.findIndex(h => h.includes(c.toLowerCase()))
    if (idx >= 0) return header[idx]
  }
  return null
}

if (require.main === module) {
  if (typeof fetch !== 'function') {
    console.error('This script requires Node 18+ (global fetch).')
    process.exit(1)
  }
  main().catch(err => { console.error(err?.message || err); process.exit(1) })
}
