#!/usr/bin/env node
/**
 * Check if content/forecasts/csv/*.csv files match public/data/forecasts/latest/forecasts_h6.csv
 *
 * The map reads from content/forecasts/csv/ for trend data. This script ensures those files
 * are up-to-date with the latest forecasts.
 *
 * Exits with code 1 if out of sync, code 0 if in sync.
 * Usage: node scripts/check-map-csv-sync.js
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
  // Read source CSV
  const sourcePath = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'forecasts_h6.csv')
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source CSV not found: ${sourcePath}`)
    process.exit(1)
  }

  const sourceText = fs.readFileSync(sourcePath, 'utf-8')
  const sourceLines = sourceText.split(/\r?\n/).filter(l => l.trim())

  if (sourceLines.length < 2) {
    console.error('❌ Source CSV has no data rows')
    process.exit(1)
  }

  // Get period from metadata
  const metadataPath = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'metadata.json')
  let period = '2026-03'
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
    period = metadata.forecast_start_date || metadata.data_end_date || period
  } catch {}

  // Check the two files that should exist: period-specific and latest
  const filesToCheck = [
    { path: path.join(process.cwd(), 'content', 'forecasts', 'csv', `${period}.csv`), name: `${period}.csv` },
    { path: path.join(process.cwd(), 'content', 'forecasts', 'csv', 'latest.csv'), name: 'latest.csv' }
  ]

  const sourceHeader = parseCSVLine(sourceLines[0])
  const sourceFirstRow = parseCSVLine(sourceLines[1])

  const testCountries = ['Brazil', 'Ukraine', 'Mexico', 'Syria', 'Pakistan', 'Nigeria']
  const mismatches = []

  for (const fileToCheck of filesToCheck) {
    if (!fs.existsSync(fileToCheck.path)) {
      console.error(`❌ Map CSV not found: ${fileToCheck.path}`)
      process.exit(1)
    }

    const mapText = fs.readFileSync(fileToCheck.path, 'utf-8')
    const mapLines = mapText.split(/\r?\n/).filter(l => l.trim())

    if (mapLines.length < 2) {
      console.error(`❌ Map CSV ${fileToCheck.name} has no data rows`)
      process.exit(1)
    }

    const mapHeader = parseCSVLine(mapLines[0])
    const mapFirstRow = parseCSVLine(mapLines[1])

    // Compare first row values for key countries
    for (const country of testCountries) {
      const sourceCol = sourceHeader.findIndex(h => h === country)
      const mapCol = mapHeader.findIndex(h => h === country)

      if (sourceCol < 0 || mapCol < 0) continue

      const sourceValue = toNumber(sourceFirstRow[sourceCol])
      const mapValue = toNumber(mapFirstRow[mapCol])

      if (Math.abs(sourceValue - mapValue) > 0.01) {
        mismatches.push({
          file: fileToCheck.name,
          country,
          sourceValue: sourceValue.toFixed(2),
          mapValue: mapValue.toFixed(2),
          diff: (sourceValue - mapValue).toFixed(2)
        })
      }
    }
  }

  if (mismatches.length > 0) {
    console.error('❌ Map CSV files are OUT OF SYNC with source:')
    console.error('')
    mismatches.forEach(m => {
      console.error(`  ${m.file} - ${m.country}:`)
      console.error(`    Source value: ${m.sourceValue}`)
      console.error(`    Map value:    ${m.mapValue}`)
      console.error(`    Difference:   ${m.diff}`)
    })
    console.error('')
    console.error('Run: npm run csv:sync:github or manually copy latest CSV to content/forecasts/csv/')
    process.exit(1)
  }

  console.log('✅ Map CSV files are in sync with source')
  process.exit(0)

} catch (err) {
  console.error('❌ Error checking map CSV sync:', err.message)
  process.exit(1)
}
