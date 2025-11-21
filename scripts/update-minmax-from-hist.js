#!/usr/bin/env node
/**
 * Fetch monthly historical fatalities CSV and compute per‑country min/max over the last 10 months.
 *
 * - Downloads Hist.csv from GitHub (raw) unless --noDownload is set
 * - Stores a copy at public/data/hist.csv
 * - Parses the CSV (wide format expected: first column = date, others = country names)
 * - Computes per‑country {min,max} across the last 10 non-empty rows
 * - Writes public/data/minmax.json
 *
 * Usage:
 *   node scripts/update-minmax-from-hist.js \
 *     [--src https://raw.githubusercontent.com/ThomasSchinca/Pace-map-risk/main/Hist.csv] \
 *     [--histOut public/data/hist.csv] \
 *     [--out public/data/minmax.json] \
 *     [--noDownload]
 */
const fs = require('fs')
const path = require('path')
const https = require('https')

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

function download(url, outPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outPath)
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // Follow redirect
        res.resume()
        return resolve(download(res.headers.location, outPath))
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(resolve))
    }).on('error', (err) => {
      try { fs.unlinkSync(outPath) } catch {}
      reject(err)
    })
  })
}

function computeMinMax(histCsvPath) {
  const text = fs.readFileSync(histCsvPath, 'utf-8')
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 3) throw new Error('Hist.csv looks empty or malformed (need header + data rows)')
  const header = splitCSVLine(lines[0])

  // Expect first column to be a date-like label; countries are columns 1..N
  // Some CSVs have an empty first header cell; handle both cases
  const startCol = 1
  const countries = header.slice(startCol)

  // Parse data rows
  const rows = []
  for (let r = 1; r < lines.length; r++) {
    const cols = splitCSVLine(lines[r])
    if (cols.length < 2) continue
    const date = cols[0]
    const vals = cols.slice(startCol).map(v => {
      const n = Number(v)
      return Number.isFinite(n) ? n : null
    })
    rows.push({ date, vals })
  }
  if (!rows.length) throw new Error('No data rows parsed from Hist.csv')

  // Take the last 10 non-empty rows
  const lastRows = rows.slice(-20).filter(r => r.vals.some(v => v !== null)).slice(-10)
  if (!lastRows.length) throw new Error('No usable rows in last 10 months window')

  const minmax = {}
  for (let ci = 0; ci < countries.length; ci++) {
    const name = countries[ci]
    if (!name) continue
    let min = Infinity, max = -Infinity
    for (const r of lastRows) {
      const v = r.vals[ci]
      if (v === null) continue
      if (v < min) min = v
      if (v > max) max = v
    }
    if (min === Infinity || max === -Infinity) continue
    // Guard: ensure max >= min; if equal, widen slightly to avoid zero span
    if (max === min) { max = min + 1e-6 }
    minmax[name] = { min, max }
  }
  return minmax
}

async function main() {
  const args = parseArgs(process.argv)
  const src = args.src || 'https://raw.githubusercontent.com/ThomasSchinca/Pace-map-risk/main/Hist.csv'
  const histOut = path.resolve(args.histOut || path.join('public', 'data', 'hist.csv'))
  const outPath = path.resolve(args.out || path.join('public', 'data', 'minmax.json'))
  const ensureDir = (p) => { const d = path.dirname(p); if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }) }
  ensureDir(histOut)
  ensureDir(outPath)

  if (!args.noDownload) {
    console.log(`Downloading Hist.csv from ${src}`)
    await download(src, histOut)
    console.log(`Saved ${histOut}`)
  } else if (!fs.existsSync(histOut)) {
    console.error(`--noDownload set but ${histOut} does not exist`)
    process.exit(1)
  }

  const minmax = computeMinMax(histOut)
  fs.writeFileSync(outPath, JSON.stringify(minmax, null, 2))
  console.log(`Wrote ${outPath} with ${Object.keys(minmax).length} countries`)
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1) })
}

