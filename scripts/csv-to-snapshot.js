#!/usr/bin/env node
/*
 Simple CSV -> JSON snapshot converter for Luscint forecasts.
 Usage:
   node scripts/csv-to-snapshot.js --csv path/to/file.csv --period 2025-11 \
     --generatedAt 2025-11-01T00:00:00Z --version 1.0 \
     --releaseNote "Note 1" --releaseNote "Note 2"

 CSV format (no header comments):
   id,name,entityType,iso3,index,band,confidence,deltaMoM,deltaYoY,
   1m_index,1m_p10,1m_p50,1m_p90,
   3m_index,3m_p10,3m_p50,3m_p90,
   6m_index,6m_p10,6m_p50,6m_p90,
   drivers,notes

 - drivers: pipe-separated pairs category:impact (e.g., "policy:0.9|macro:0.5")
*/

const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const out = { releaseNote: [] }
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (arg.startsWith('--')) {
      const [k, v] = arg.split('=')
      const key = k.replace(/^--/, '')
      if (v !== undefined) {
        if (key === 'releaseNote') out.releaseNote.push(v)
        else out[key] = v
      } else {
        const next = argv[i + 1]
        if (!next || next.startsWith('--')) {
          out[key] = true
        } else {
          if (key === 'releaseNote') out.releaseNote.push(next)
          else out[key] = next
          i++
        }
      }
    }
  }
  return out
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  // remove optional meta line starting with '#'
  const startIdx = lines[0]?.startsWith('#') ? 1 : 0
  const header = splitCSVLine(lines[startIdx])
  const rows = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('#')) continue
    const cols = splitCSVLine(lines[i])
    if (cols.length === 0) continue
    const obj = {}
    header.forEach((h, idx) => {
      obj[h] = cols[idx]
    })
    rows.push(obj)
  }
  return { header, rows }
}

function splitCSVLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = false }
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') { out.push(cur); cur = '' }
      else if (ch === '"') { inQuotes = true }
      else { cur += ch }
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function toNumber(v) { const n = Number(v); return Number.isFinite(n) ? n : 0 }

function buildSnapshot(rows, meta) {
  const entities = rows.map(r => ({
    id: r.id,
    name: r.name,
    entityType: r.entityType,
    iso3: r.iso3 || undefined,
    index: toNumber(r.index),
    band: r.band,
    confidence: toNumber(r.confidence),
    deltaMoM: toNumber(r.deltaMoM),
    deltaYoY: toNumber(r.deltaYoY),
    horizons: {
      '1m': { index: toNumber(r['1m_index']), p10: toNumber(r['1m_p10']), p50: toNumber(r['1m_p50']), p90: toNumber(r['1m_p90']) },
      '3m': { index: toNumber(r['3m_index']), p10: toNumber(r['3m_p10']), p50: toNumber(r['3m_p50']), p90: toNumber(r['3m_p90']) },
      '6m': { index: toNumber(r['6m_index']), p10: toNumber(r['6m_p10']), p50: toNumber(r['6m_p50']), p90: toNumber(r['6m_p90']) }
    },
    drivers: String(r.drivers || '').split('|').filter(Boolean).map(pair => {
      const [category, impact] = pair.split(':')
      return { category, impact: toNumber(impact) }
    }),
    notes: r.notes || undefined,
  }))
  return {
    version: meta.version || '1.0',
    generatedAt: meta.generatedAt || new Date().toISOString(),
    period: meta.period,
    releaseNotes: meta.releaseNote && Array.isArray(meta.releaseNote) && meta.releaseNote.length ? meta.releaseNote : undefined,
    entities
  }
}

function main() {
  const args = parseArgs(process.argv)
  if (!args.csv || !args.period) {
    console.error('Usage: node scripts/csv-to-snapshot.js --csv path.csv --period YYYY-MM [--generatedAt ISO] [--version 1.0] [--releaseNote "..."]')
    process.exit(1)
  }
  const csvPath = path.resolve(args.csv)
  const text = fs.readFileSync(csvPath, 'utf-8')
  const { rows } = parseCSV(text)
  const snapshot = buildSnapshot(rows, args)
  const outDir = path.join(process.cwd(), 'content', 'forecasts')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, `${args.period}.json`)
  fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2))
  const latestFile = path.join(outDir, 'latest.json')
  fs.writeFileSync(latestFile, JSON.stringify(snapshot, null, 2))
  console.log(`Wrote ${outFile} and updated latest.json`)
}

if (require.main === module) {
  main()
}

