#!/usr/bin/env node
/**
 * Build monthly point JSONs from a PRIO‑GRID polygon GeoJSON.
 * Input: public/data/grid/{period}.geo.json with features containing m1..m6
 * Output: public/data/grid/{period}-m{1..6}.json with centroid points for non‑zero cells.
 *
 * Usage:
 *   node scripts/geojson-to-month-points.js [--period 2025-10] [--in public/data/grid] [--out public/data/grid]
 */

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

function readLatestPeriod() {
  try {
    const latest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', 'forecasts', 'latest.json'), 'utf-8'))
    return latest.period
  } catch {
    return null
  }
}

function centroidAccum(coords) {
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
  return { A2, Sx, Sy }
}

function centroidOfGeometry(geom) {
  if (!geom) return null
  if (geom.type === 'Polygon') {
    const c = centroidAccum(geom.coordinates)
    return c ? [c.Sx / (3 * c.A2), c.Sy / (3 * c.A2)] : null
  }
  if (geom.type === 'MultiPolygon') {
    let A2 = 0, Sx = 0, Sy = 0
    for (const poly of geom.coordinates) {
      const c = centroidAccum(poly)
      if (!c) continue
      A2 += c.A2
      Sx += c.Sx
      Sy += c.Sy
    }
    if (A2 === 0) return null
    return [Sx / (3 * A2), Sy / (3 * A2)]
  }
  const b = geom.bbox
  if (b && b.length === 4) return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]
  return null
}

async function main() {
  const args = parseArgs(process.argv)
  const period = args.period || readLatestPeriod()
  const inDir = path.resolve(args.in || path.join('public', 'data', 'grid'))
  const outDir = path.resolve(args.out || inDir)
  if (!period) {
    console.error('Missing --period and could not infer from content/forecasts/latest.json')
    process.exit(1)
  }
  const srcFile = path.join(inDir, `${period}.geo.json`)
  if (!fs.existsSync(srcFile)) {
    console.error(`Source GeoJSON not found: ${srcFile}`)
    process.exit(1)
  }
  const gj = JSON.parse(fs.readFileSync(srcFile, 'utf-8'))
  const feats = Array.isArray(gj?.features) ? gj.features : []
  if (!feats.length) {
    console.error('No features in source GeoJSON')
    process.exit(1)
  }
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  for (let m = 1; m <= 6; m++) {
    const points = []
    for (const f of feats) {
      const v = Number(f?.properties?.[`m${m}`] ?? 0)
      if (!v) continue
      const c = centroidOfGeometry(f.geometry)
      if (!c) continue
      points.push({ lat: c[1], lon: c[0], v })
    }
    const file = path.join(outDir, `${period}-m${m}.json`)
    fs.writeFileSync(file, JSON.stringify({ period, month: m, points }))
    console.log(`Wrote ${file} with ${points.length} points`)
  }
}

if (require.main === module) {
  main().catch(err => { console.error(err?.message || err); process.exit(1) })
}

