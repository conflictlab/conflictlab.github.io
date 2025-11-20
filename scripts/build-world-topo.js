#!/usr/bin/env node
// Build a simplified TopoJSON from public/data/world.geojson
// Usage: node scripts/build-world-topo.js [--in public/data/world.geojson] [--out public/data/world.topo.json]

const fs = require('fs')
const path = require('path')
const { topology } = require('topojson-server')
const simplify = require('topojson-simplify')

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')) }

function main() {
  const args = process.argv.slice(2)
  const inArg = args.indexOf('--in') >= 0 ? args[args.indexOf('--in') + 1] : 'public/data/world.geojson'
  const outArg = args.indexOf('--out') >= 0 ? args[args.indexOf('--out') + 1] : 'public/data/world.topo.json'
  const inPath = path.resolve(inArg)
  const outPath = path.resolve(outArg)
  if (!fs.existsSync(inPath)) {
    console.error('Input GeoJSON not found:', inPath)
    process.exit(1)
  }
  const geo = readJson(inPath)
  // Wrap in object to name the collection for later extraction
  const topo = topology({ countries: geo })
  // Pre-simplify using effective area
  const pre = simplify.presimplify(topo)
  // Choose a conservative threshold to keep shapes (tune if needed)
  const simplified = simplify.simplify(pre, 0.00002)
  fs.writeFileSync(outPath, JSON.stringify(simplified))
  console.log('Wrote simplified TopoJSON:', outPath)
}

main()
