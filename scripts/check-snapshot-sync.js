#!/usr/bin/env node
/**
 * Check if content/forecasts/latest.json is in sync with public/data/forecasts/latest/forecasts_h6.csv
 *
 * Exits with code 1 if out of sync, code 0 if in sync.
 * Usage: node scripts/check-snapshot-sync.js
 */

const fs = require('fs')
const path = require('path')

function parseCSVLine(line) {
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

function toNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

try {
  // Read CSV
  const csvPath = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'forecasts_h6.csv')
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV not found: ${csvPath}`)
    process.exit(1)
  }

  const csvText = fs.readFileSync(csvPath, 'utf-8')
  const lines = csvText.split(/\r?\n/).filter(l => l.trim())

  if (lines.length < 2) {
    console.error('❌ CSV has no data rows')
    process.exit(1)
  }

  const header = parseCSVLine(lines[0])
  const firstDataRow = parseCSVLine(lines[1])

  // Read snapshot
  const snapshotPath = path.join(process.cwd(), 'content', 'forecasts', 'latest.json')
  if (!fs.existsSync(snapshotPath)) {
    console.error(`❌ Snapshot not found: ${snapshotPath}`)
    process.exit(1)
  }

  const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'))

  // Compare a sample of countries across both sources
  const sampleCountries = ['Ukraine', 'Mexico', 'Bangladesh', 'Russia', 'Syria', 'Afghanistan']
  const mismatches = []

  for (const country of sampleCountries) {
    const csvCol = header.findIndex(h => h === country)
    if (csvCol < 0) continue

    const csvValue = toNumber(firstDataRow[csvCol])
    const snapshotEntity = snapshot.entities.find(e => e.name === country)
    const snapshotValue = snapshotEntity?.index || 0

    // Allow small floating point differences
    if (Math.abs(csvValue - snapshotValue) > 0.01) {
      mismatches.push({
        country,
        csvValue: csvValue.toFixed(2),
        snapshotValue: snapshotValue.toFixed(2),
        diff: (csvValue - snapshotValue).toFixed(2)
      })
    }
  }

  if (mismatches.length > 0) {
    console.error('❌ Snapshot is OUT OF SYNC with CSV:')
    console.error('')
    mismatches.forEach(m => {
      console.error(`  ${m.country}:`)
      console.error(`    CSV value:      ${m.csvValue}`)
      console.error(`    Snapshot value: ${m.snapshotValue}`)
      console.error(`    Difference:     ${m.diff}`)
    })
    console.error('')
    console.error('Run: node scripts/build-snapshot-from-forecasts.js')
    process.exit(1)
  }

  console.log('✅ Snapshot is in sync with CSV')
  process.exit(0)

} catch (err) {
  console.error('❌ Error checking sync:', err.message)
  process.exit(1)
}
