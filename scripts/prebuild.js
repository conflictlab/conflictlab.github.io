#!/usr/bin/env node
/**
 * Prebuild gate with optional skip.
 * - If env SKIP_PREBUILD is set, exits immediately.
 * - Otherwise runs the original prebuild steps in sequence.
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

function run(cmd) {
  execSync(cmd, { stdio: 'inherit', env: process.env })
}

async function main() {
  if (process.env.SKIP_PREBUILD) {
    console.log('SKIP_PREBUILD=1 detected — skipping prebuild steps.')
    return
  }

  console.log('Prebuild: syncing forecasts from GitHub…')
  run('node scripts/sync-forecasts-from-github.js --repo conflictlab/Pace-map-risk --dir Historical_Predictions --branch main --latestOnly --saveCsv')

  // Ensure recent raw CSVs are mirrored to public for downloads
  console.log('Prebuild: mirroring full raw CSV history to public/data/csv …')
  // --limit 0 means copy all
  run('node scripts/mirror-raw-csvs.js --limit 0')

  // Update min/max from local hist.csv (if present) and denormalize scenarios
  try {
    console.log('Prebuild: computing per-country min/max from hist.csv…')
    run('node scripts/update-minmax-from-hist.js --noDownload')
  } catch (e) {
    console.warn('Prebuild: min/max update skipped or failed — proceeding.', e?.message || e)
  }
  try {
    console.log('Prebuild: denormalizing scenarios into public/data/scenarios.denorm.json…')
    run('node scripts/denorm-scenarios.js')
  } catch (e) {
    console.warn('Prebuild: scenario denormalization skipped or failed — proceeding.', e?.message || e)
  }

  // Determine current period from latest snapshot to allow caching checks
  let period = null
  try {
    const latest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', 'forecasts', 'latest.json'), 'utf-8'))
    period = latest?.period || null
  } catch {}

  // Skip heavy GeoJSON build if already present for current period
  const gridDir = path.join(process.cwd(), 'public', 'data', 'grid')
  const geoPath = period ? path.join(gridDir, `${period}.geo.json`) : null
  if (period && geoPath && fs.existsSync(geoPath)) {
    console.log(`Prebuild: found existing PRIO-GRID GeoJSON for ${period} — skipping`)
  } else {
    console.log('Prebuild: building PRIO-GRID GeoJSON from live CSV…')
    run('node scripts/prio-csv-to-geojson.js --csv https://raw.githubusercontent.com/ThomasSchinca/Live_3D_forecast/main/df_output.csv')
  }

  // Skip generating monthly points if they already exist for current period
  const m1Path = period ? path.join(gridDir, `${period}-m1.json`) : null
  if (period && m1Path && fs.existsSync(m1Path)) {
    console.log(`Prebuild: found existing monthly point JSONs for ${period} — skipping`)
  } else {
    console.log('Prebuild: generating monthly point JSONs…')
    run('node scripts/geojson-to-month-points.js')
  }

  console.log('Prebuild: exporting static API endpoints…')
  run('node scripts/export-static-api.js')

  // Regenerate snapshot and map CSVs to ensure they're always in sync with source data
  console.log('Prebuild: regenerating dashboard snapshot from forecasts…')
  run('node scripts/build-snapshot-from-forecasts.js')

  console.log('Prebuild: syncing map CSV files with latest forecasts…')
  const metadataPath = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'metadata.json')
  let periodFromMetadata = null
  try {
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
    periodFromMetadata = metadata.forecast_start_date || metadata.data_end_date || null
  } catch {}

  if (periodFromMetadata) {
    const sourceCsv = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'forecasts_h6.csv')
    const contentDir = path.join(process.cwd(), 'content', 'forecasts', 'csv')
    if (!fs.existsSync(contentDir)) fs.mkdirSync(contentDir, { recursive: true })
    fs.copyFileSync(sourceCsv, path.join(contentDir, `${periodFromMetadata}.csv`))
    fs.copyFileSync(sourceCsv, path.join(contentDir, 'latest.csv'))
    console.log(`Prebuild: updated content/forecasts/csv for period ${periodFromMetadata}`)
  }

  // Verify data sync
  console.log('Prebuild: verifying data sync…')
  run('node scripts/check-snapshot-sync.js')
  run('node scripts/check-map-csv-sync.js')
}

main().catch(err => { console.error(err?.message || err); process.exit(1) })
