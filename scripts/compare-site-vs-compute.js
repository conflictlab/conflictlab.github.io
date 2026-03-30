#!/usr/bin/env node
// Compare first-row predictions in two forecasts_h6.csv files (compute vs site)
// Usage: node scripts/compare-site-vs-compute.js /path/to/compute_h6.csv /path/to/site_h6.csv

const fs = require('fs')

function parseCSVFirstRow(p) {
  const text = fs.readFileSync(p, 'utf-8').trim().split(/\r?\n/)
  if (!text.length) throw new Error(`Empty CSV: ${p}`)
  const header = text[0].split(',')
  const row = text[1] ? text[1].split(',') : []
  if (!header.length || header[0].toLowerCase() !== 'date') {
    throw new Error(`CSV missing leading date column: ${p}`)
  }
  const out = {}
  for (let i = 1; i < header.length; i++) {
    const k = header[i]
    const v = Number(row[i] || '0')
    out[k] = Number.isFinite(v) ? v : 0
  }
  return out
}

function main() {
  const [,, computePath, sitePath] = process.argv
  if (!computePath || !sitePath) {
    console.error('Usage: node scripts/compare-site-vs-compute.js /tmp/compute_h6.csv public/data/forecasts/latest/forecasts_h6.csv')
    process.exit(2)
  }
  const comp = parseCSVFirstRow(computePath)
  const site = parseCSVFirstRow(sitePath)
  const compKeys = new Set(Object.keys(comp))
  const siteKeys = new Set(Object.keys(site))
  const missing = [...compKeys].filter(k => !siteKeys.has(k)).sort()
  const extra = [...siteKeys].filter(k => !compKeys.has(k)).sort()
  const diffs = []
  for (const k of [...compKeys].filter(k => siteKeys.has(k))) {
    const cv = comp[k]
    const sv = site[k]
    if (Math.abs(cv - sv) > 1e-6) diffs.push([k, sv, cv])
  }
  if (missing.length || extra.length || diffs.length) {
    if (missing.length) console.error('Missing in site:', missing.slice(0,20).join(', '))
    if (extra.length) console.error('Extra in site:', extra.slice(0,20).join(', '))
    if (diffs.length) {
      console.error('Value diffs (first 10):')
      for (const [k, sv, cv] of diffs.slice(0,10)) console.error(`  ${k}: site=${sv} compute=${cv}`)
    }
    process.exit(1)
  }
  console.log('Site vs compute forecasts_h6.csv match for first row (1m).')
}

if (require.main === module) main()

