#!/usr/bin/env node
/**
 * Denormalize scenarios.json using per-country min/max (from update-minmax-from-hist.js).
 *
 * Reads:
 *   - public/data/scenarios.json
 *   - public/data/minmax.json
 * Writes:
 *   - public/data/scenarios.denorm.json
 *
 * For each country with min/max available, if the scenario temporal values look
 * normalized (max <= ~1.5), convert with: x' = x * (max - min) + min.
 * Otherwise, copy values as-is.
 */
const fs = require('fs')
const path = require('path')

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

function maybeDenormCountry(country, entry, mm) {
  if (!entry || !entry.temporal || !mm) return entry
  const span = (mm.max - mm.min)
  if (!Number.isFinite(span) || span <= 0) return entry

  const out = { clusters: entry.clusters, temporal: {} }
  for (const date of Object.keys(entry.temporal)) {
    const row = entry.temporal[date]
    const outRow = {}
    for (const k of Object.keys(row)) {
      const v = Number(row[k])
      outRow[k] = Number.isFinite(v) ? (v * span + mm.min) : v
    }
    out.temporal[date] = outRow
  }
  return out
}

function main() {
  const scenariosPath = path.join(process.cwd(), 'public', 'data', 'scenarios.json')
  const minmaxPath = path.join(process.cwd(), 'public', 'data', 'minmax.json')
  const outPath = path.join(process.cwd(), 'public', 'data', 'scenarios.denorm.json')
  if (!fs.existsSync(scenariosPath)) {
    console.error('Missing public/data/scenarios.json')
    process.exit(1)
  }
  if (!fs.existsSync(minmaxPath)) {
    console.error('Missing public/data/minmax.json — run update-minmax-from-hist.js first')
    process.exit(1)
  }
  const scenarios = loadJSON(scenariosPath)
  const minmax = loadJSON(minmaxPath)

  const out = {}
  for (const [country, entry] of Object.entries(scenarios)) {
    const mm = minmax[country]
    out[country] = maybeDenormCountry(country, entry, mm)
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${outPath}`)
}

if (require.main === module) main()
