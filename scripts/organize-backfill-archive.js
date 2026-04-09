#!/usr/bin/env node
/**
 * Organize backfill forecasts from Historical_Predictions into archive structure.
 *
 * Reads files like 2018-01_h6.csv and 2018-01_h12.csv and organizes them into:
 *   public/data/forecasts/archive/2018-01/
 *     ├── forecasts_h6.csv
 *     ├── forecasts_h12.csv
 *     ├── metadata.json
 *     └── (other files as available)
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
      const match = file.match(/^(\d{4}-\d{2})_h[0-9]+\.csv$/)
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

  // Skip if already exists
  if (fs.existsSync(archiveDir)) {
    console.log(`  ⊘ ${period} already exists, skipping`)
    return
  }

  try {
    fs.mkdirSync(archiveDir, { recursive: true })

    // Copy h6 and h12 files
    const h6Source = path.join(BACKFILL_DIR, `${period}_h6.csv`)
    const h12Source = path.join(BACKFILL_DIR, `${period}_h12.csv`)

    if (fs.existsSync(h6Source)) {
      fs.copyFileSync(h6Source, path.join(archiveDir, 'forecasts_h6.csv'))
    } else {
      console.warn(`  ⚠ Missing h6 for ${period}`)
    }

    if (fs.existsSync(h12Source)) {
      fs.copyFileSync(h12Source, path.join(archiveDir, 'forecasts_h12.csv'))
    } else {
      console.warn(`  ⚠ Missing h12 for ${period}`)
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

    console.log(`  ✓ ${period}`)
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
