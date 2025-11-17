#!/usr/bin/env node
/**
 * Compute per-country per-series min/max from a historical CSV.
 * Attempts to map columns to scenario indices s1..sN by the order of numeric columns in the CSV.
 * If --seriesFrom is provided (path to scenarios.json), will limit series count per country to the
 * number of series detected in scenarios (time-object columns) to better align indices.
 *
 * Usage:
 *   node scripts/compute-minmax.js \
 *     --src tmp/hist.csv \
 *     --out public/data/minmax.json \
 *     [--seriesFrom public/data/scenarios.json]
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

function splitCSVLine(line) {
  const out = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else { inQ = false }
      } else cur += ch
    } else {
      if (ch === ',') { out.push(cur); cur = '' }
      else if (ch === '"') inQ = true
      else cur += ch
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function normalizeName(s) { return String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim() }

function loadSeriesCountsFromScenarios(p) {
  try {
    const txt = fs.readFileSync(p, 'utf-8')
    const d = JSON.parse(txt)
    const counts = {}
    function addCount(key, obj) {
      if (!obj || typeof obj !== 'object') return
      const ks = Object.keys(obj)
      const dateKs = ks.filter(k => /\d{4}-\d{2}-\d{2}/.test(k)).sort()
      if (!dateKs.length) return
      const first = obj[dateKs[0]]
      const cols = Array.isArray(first) ? first.length : 1
      counts[key] = Math.max(counts[key] || 0, cols)
    }
    for (const [country, val] of Object.entries(d)) {
      if (Array.isArray(val)) {
        for (const el of val) addCount(country, el)
      } else addCount(country, val)
    }
    return counts
  } catch { return {} }
}

function main() {
  const args = parseArgs(process.argv)
  const src = args.src
  const outPath = path.resolve(args.out || path.join('public','data','minmax.json'))
  if (!src || !fs.existsSync(src)) {
    console.error('Missing --src path to hist.csv')
    process.exit(1)
  }
  const seriesCounts = args.seriesFrom ? loadSeriesCountsFromScenarios(args.seriesFrom) : {}

  const text = fs.readFileSync(src, 'utf-8')
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) { console.error('Empty CSV'); process.exit(1) }
  const header = splitCSVLine(lines[0])
  const idx = Object.fromEntries(header.map((h, i) => [h, i]))
  // identify country column
  const countryKey = ['country','name','entity','iso3','id','Country','Name','ISO3','ID'].find(k => header.includes(k)) || header[1]
  // identify likely date column(s) to ignore in numeric list
  const dateCols = new Set(header.filter(h => /date|time/i.test(h)))
  // Identify numeric columns: scan a few rows
  const numericCols = []
  for (let i = 0; i < header.length; i++) {
    const h = header[i]
    if (h === countryKey || dateCols.has(h)) continue
    let numericCount = 0
    for (let r = 1; r < Math.min(lines.length, 25); r++) {
      const cols = splitCSVLine(lines[r])
      const v = Number(cols[i])
      if (Number.isFinite(v)) numericCount++
    }
    if (numericCount >= 5) numericCols.push(i)
  }
  // Per-country min/max per numeric column index order
  const stats = {}
  for (let r = 1; r < lines.length; r++) {
    const cols = splitCSVLine(lines[r])
    const cname = cols[idx[countryKey]] || ''
    const country = String(cname)
    if (!country) continue
    const key = country
    stats[key] = stats[key] || {}
    const limit = seriesCounts[key] || numericCols.length
    for (let j = 0; j < Math.min(numericCols.length, limit); j++) {
      const ci = numericCols[j]
      const v = Number(cols[ci])
      if (!Number.isFinite(v)) continue
      const lbl = `s${j + 1}`
      const cur = stats[key][lbl] || { min: v, max: v }
      if (v < cur.min) cur.min = v
      if (v > cur.max) cur.max = v
      stats[key][lbl] = cur
    }
  }
  // Ensure output dir
  const outDir = path.dirname(outPath)
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(stats, null, 2))
  console.log(`Wrote ${outPath} with ${Object.keys(stats).length} countries; first=${Object.keys(stats)[0]}`)
}

if (require.main === module) {
  main()
}

