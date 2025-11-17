#!/usr/bin/env node
/**
 * Convert monthly point JSONs (period-m1..m6.json) to per-month CSVs with lat,lon,v.
 *
 * Usage:
 *   node scripts/grid-month-points-to-csv.js [--period 2025-10] [--in public/data/grid] [--out public/data/grid]
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
  } catch { return null }
}

function toCsv(rows) {
  const header = 'lat,lon,v\n'
  const body = rows.map(r => `${r.lat},${r.lon},${r.v}`).join('\n') + '\n'
  return header + body
}

function main() {
  const args = parseArgs(process.argv)
  const period = args.period || readLatestPeriod()
  const inDir = path.resolve(args.in || path.join('public', 'data', 'grid'))
  const outDir = path.resolve(args.out || inDir)
  if (!period) { console.error('Missing --period and could not infer from content/forecasts/latest.json'); process.exit(1) }
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  let built = 0
  for (let m = 1; m <= 6; m++) {
    const src = path.join(inDir, `${period}-m${m}.json`)
    if (!fs.existsSync(src)) { continue }
    const j = JSON.parse(fs.readFileSync(src, 'utf-8'))
    const points = Array.isArray(j?.points) ? j.points : []
    const rows = points.map(p => ({ lat: Number(p.lat), lon: Number(p.lon), v: Number(p.v) }))
    const csv = toCsv(rows)
    const out = path.join(outDir, `${period}-m${m}.csv`)
    fs.writeFileSync(out, csv)
    built++
    console.log(`Wrote ${out} with ${rows.length} rows`)
  }
  if (!built) console.warn('No monthly JSONs found to convert')
}

if (require.main === module) {
  try { main() } catch (e) { console.error(e?.message || e); process.exit(1) }
}

