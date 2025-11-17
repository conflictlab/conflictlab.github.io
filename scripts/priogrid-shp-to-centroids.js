#!/usr/bin/env node
/**
 * Build PRIO‑GRID centroids CSV from a shapefile directory.
 *
 * Usage:
 *   node scripts/priogrid-shp-to-centroids.js \
 *     [--dir content/priogrid_cellshp] [--out public/data/grid/centroids.csv]
 *
 * Notes:
 *  - Requires the `shapefile` package (installed via devDependencies / CI).
 *  - Attempts to detect an ID field among common candidates: gid, cell, cell_id, prio_id, id.
 */

const fs = require('fs')
const path = require('path')

async function main() {
  const args = parseArgs(process.argv)
  const shpDir = path.resolve(args.dir || path.join('content', 'priogrid_cellshp'))
  const outFile = path.resolve(args.out || path.join('public', 'data', 'grid', 'centroids.csv'))

  const shpPath = findShapefile(shpDir)
  if (!shpPath) {
    console.error(`No .shp file found under ${shpDir}`)
    process.exit(1)
  }

  // Ensure output dir exists
  const outDir = path.dirname(outFile)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  let shapefile
  try {
    shapefile = require('shapefile')
  } catch (e) {
    console.error('The "shapefile" package is required. Add it to devDependencies and run npm install.')
    process.exit(1)
  }

  const source = await shapefile.open(shpPath)
  const rows = []
  let idKey = null

  for (;;) {
    const { done, value } = await source.read()
    if (done) break
    const feat = value
    if (!idKey) idKey = detectIdKey(feat.properties)
    const id = feat.properties[idKey]
    if (id === undefined || id === null) continue
    const c = centroidOfGeometry(feat.geometry)
    if (!c) continue
    rows.push({ id, lat: c[1], lon: c[0] })
  }

  if (!rows.length) {
    console.error('No centroids generated. Check shapefile and ID field.')
    process.exit(1)
  }

  const header = 'id,lat,lon\n'
  const body = rows.map(r => `${r.id},${r.lat},${r.lon}`).join('\n') + '\n'
  fs.writeFileSync(outFile, header + body)
  console.log(`Wrote ${outFile} with ${rows.length} centroids (id,lat,lon) using id field "${idKey}"`)
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
  // Fallback: first integer-like property
  for (const k of keys) {
    const v = props[k]
    if (Number.isInteger(v)) return k
  }
  return keys[0]
}

function centroidOfGeometry(geom) {
  if (!geom) return null
  if (geom.type === 'Polygon') return centroidOfPolygon(geom.coordinates)
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
  // For other types, try bbox center if present
  const b = geom.bbox
  if (b && b.length === 4) return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]
  return null
}

function centroidOfPolygon(coords) {
  const c = centroidAccum(coords)
  if (!c || c.A2 === 0) return null
  return [c.Sx / (3 * c.A2), c.Sy / (3 * c.A2)]
}

function centroidAccum(coords) {
  // Use only the outer ring for centroid
  const ring = coords[0]
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

if (require.main === module) {
  main().catch(err => { console.error(err?.message || err); process.exit(1) })
}
