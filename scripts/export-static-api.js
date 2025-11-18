#!/usr/bin/env node
/**
 * Export static API-style JSON endpoints for GitHub Pages.
 *
 * Produces: public/api/v1/grid/<period>/points-m{1..6}.json
 * Response shape mimics the server endpoint:
 *   { period: 'YYYY-MM', points: [ { lat, lon, m: [m1..m6] } ] }
 *
 * Data sources (in priority order):
 *  1) public/data/grid/<period>.csv (lat,lon,m1..m6)
 *  2) public/data/grid/<period>-m{1..6}.json (points: [{lat,lon,v}])
 *  3) public/data/grid/<period>.geo.json (features with properties.m1..m6 + centroids)
 */

const fs = require('fs')
const path = require('path')

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
      if (ch === ',') { out.push(cur); cur = '' }
      else if (ch === '"') inQ = true
      else cur += ch
    }
  }
  out.push(cur)
  return out
}

function readCombinedCsv(p) {
  if (!fs.existsSync(p)) return null
  const text = fs.readFileSync(p, 'utf-8')
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return null
  const header = splitCsv(lines[0])
  const idx = Object.fromEntries(header.map((h,i)=>[h,i]))
  const need = ['lat','lon','m1','m2','m3','m4','m5','m6']
  const hasAll = need.every(k => header.includes(k))
  if (!hasAll) return null
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsv(lines[i])
    const lat = Number(cols[idx.lat] || 'NaN')
    const lon = Number(cols[idx.lon] || 'NaN')
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const m = [1,2,3,4,5,6].map(j => Number(cols[idx[`m${j}`]] || '0') || 0)
    rows.push({ lat, lon, m })
  }
  return rows
}

function readMonthlyPointsJSON(p, month) {
  if (!fs.existsSync(p)) return null
  const json = JSON.parse(fs.readFileSync(p, 'utf-8'))
  const pts = Array.isArray(json?.points) ? json.points : []
  const out = []
  for (const pt of pts) {
    const lat = Number(pt.lat), lon = Number(pt.lon), v = Number(pt.v || 0)
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const m = [0,0,0,0,0,0]; m[month-1] = Number.isFinite(v) ? v : 0
    out.push({ lat, lon, m })
  }
  return out
}

function centroidOfPolygon(coords) {
  const ring = coords?.[0]
  if (!ring || ring.length < 3) return null
  let A2 = 0, Sx = 0, Sy = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[i + 1]
    const cross = x0 * y1 - x1 * y0
    A2 += cross
    Sx += (x0 + x1) * cross
    Sy += (y0 + y1) * cross
  }
  if (A2 === 0) return null
  return [Sx / (3 * A2), Sy / (3 * A2)]
}

function centroidOfGeometry(geom) {
  if (!geom) return null
  if (geom.type === 'Polygon') return centroidOfPolygon(geom.coordinates)
  if (geom.type === 'MultiPolygon') {
    let A2 = 0, Sx = 0, Sy = 0
    for (const poly of geom.coordinates) {
      const ring = poly?.[0]
      if (!ring || ring.length < 3) continue
      for (let i = 0; i < ring.length - 1; i++) {
        const [x0, y0] = ring[i]
        const [x1, y1] = ring[i + 1]
        const cross = x0 * y1 - x1 * y0
        A2 += cross
        Sx += (x0 + x1) * cross
        Sy += (y0 + y1) * cross
      }
    }
    if (A2 === 0) return null
    return [Sx / (3 * A2), Sy / (3 * A2)]
  }
  const b = geom.bbox
  if (b && b.length === 4) return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]
  return null
}

function readFromGeoJSON(p) {
  if (!fs.existsSync(p)) return null
  const raw = JSON.parse(fs.readFileSync(p, 'utf-8'))
  const feats = Array.isArray(raw?.features) ? raw.features : []
  const out = []
  for (const f of feats) {
    const m = [1,2,3,4,5,6].map(i => Number(f?.properties?.[`m${i}`] || 0) || 0)
    const c = centroidOfGeometry(f?.geometry)
    if (!c) continue
    out.push({ lat: c[1], lon: c[0], m })
  }
  return out
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }) }

function main() {
  const root = process.cwd()
  const gridDir = path.join(root, 'public', 'data', 'grid')
  if (!fs.existsSync(gridDir)) {
    console.log('No grid dir found, skipping static API export.')
    return
  }
  const outRoot = path.join(root, 'public', 'api', 'v1', 'grid')
  ensureDir(outRoot)

  const files = fs.readdirSync(gridDir)
  const periods = Array.from(new Set(
    files.map(f => {
      const m = f.match(/(\d{4}-\d{2})(?:\.(?:geo\.json|csv)|-m[1-6]\.json)$/)
      return m ? m[1] : null
    }).filter(Boolean)
  )).sort()
  if (!periods.length) {
    console.log('No grid periods detected.')
    return
  }

  for (const period of periods) {
    const outDir = path.join(outRoot, period)
    ensureDir(outDir)

    const combinedCsv = path.join(gridDir, `${period}.csv`)
    const geojsonPath = path.join(gridDir, `${period}.geo.json`)
    const combined = readCombinedCsv(combinedCsv) || readFromGeoJSON(geojsonPath) || null

    for (let month = 1; month <= 6; month++) {
      let rows = null
      if (combined && combined.length) {
        rows = combined
      } else {
        // Try monthly JSON as last resort
        const monthJson = path.join(gridDir, `${period}-m${month}.json`)
        rows = readMonthlyPointsJSON(monthJson, month) || []
      }
      // Filter by month non-zero to mimic API behavior
      const pts = rows.filter(r => (Number(r.m?.[month-1] || 0) > 0))
      const payload = { period, points: pts }
      const fp = path.join(outDir, `points-m${month}.json`)
      fs.writeFileSync(fp, JSON.stringify(payload))
    }
  }
  console.log(`Exported static API endpoints for ${periods.length} period(s).`)
}

main()

