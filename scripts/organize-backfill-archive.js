#!/usr/bin/env node
/**
 * Organize backfill forecasts from Historical_Predictions into archive structure.
 *
 * Reads files like 2018-01_h6.csv, 2018-01_h12.csv, 2018-01_h6_min.csv, etc. and organizes them into:
 *   public/data/forecasts/archive/2018-01/
 *     ├── forecasts_h6.csv
 *     ├── forecasts_h6_min.csv
 *     ├── forecasts_h6_max.csv
 *     ├── forecasts_h12.csv
 *     ├── forecasts_h12_min.csv
 *     ├── forecasts_h12_max.csv
 *     ├── Hist.csv
 *     └── metadata.json
 */

const fs = require('fs')
const path = require('path')

const BACKFILL_DIR = path.join(process.cwd(), 'Pace-map-risk', 'Historical_Predictions')
const ARCHIVE_DIR = path.join(process.cwd(), 'public', 'data', 'forecasts', 'archive')

function getPeriods() {
  try {
    const files = fs.readdirSync(BACKFILL_DIR)
    const periods = new Set()

    files.forEach(file => {
      // Match any file pattern: YYYY-MM_h6, YYYY-MM_h6_min, YYYY-MM_Hist, etc.
      const match = file.match(/^(\d{4}-\d{2})_/)
      if (match) {
        periods.add(match[1])
      }
    })

    return Array.from(periods).sort()
  } catch (e) {
    console.error(`Error reading backfill directory: ${e.message}`)
    return []
  }
}

function organizeBackfillForPeriod(period) {
  const archiveDir = path.join(ARCHIVE_DIR, period)

  try {
    fs.mkdirSync(archiveDir, { recursive: true })

    // Copy forecast files (h6, h12, and their min/max variants)
    const files = ['h6', 'h6_min', 'h6_max', 'h12', 'h12_min', 'h12_max', 'Hist']
    let filesFound = 0

    for (const fileBase of files) {
      const source = path.join(BACKFILL_DIR, `${period}_${fileBase}.csv`)
      if (fs.existsSync(source)) {
        const dest = path.join(archiveDir, fileBase === 'Hist' ? 'Hist.csv' : `forecasts_${fileBase}.csv`)
        fs.copyFileSync(source, dest)
        filesFound++
      }
    }

    // Create minimal metadata.json
    const metadata = {
      period: period,
      data_end_date: period,
      forecast_start_date: period,
      backfill: true
    }
    fs.writeFileSync(
      path.join(archiveDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    )

    if (filesFound === 0) {
      console.warn(`  ⚠ No forecast files found for ${period}`)
    } else if (filesFound < 7) {
      console.log(`  ✓ ${period} (${filesFound}/7 files)`)
    } else {
      console.log(`  ✓ ${period} (complete)`)
    }
  } catch (e) {
    console.error(`  ✗ Error organizing ${period}: ${e.message}`)
  }
}

function main() {
  if (!fs.existsSync(BACKFILL_DIR)) {
    console.error(`Backfill directory not found: ${BACKFILL_DIR}`)
    process.exit(1)
  }

  console.log(`Organizing backfill forecasts from ${BACKFILL_DIR}\n`)

  const periods = getPeriods()
  if (periods.length === 0) {
    console.log('No backfill forecasts found.')
    return
  }

  console.log(`Found ${periods.length} period(s): ${periods.join(', ')}\n`)

  periods.forEach(period => {
    organizeBackfillForPeriod(period)
  })

  console.log('\n✓ Backfill archive organization complete')
}

main()
