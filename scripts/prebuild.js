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
  run('node scripts/sync-forecasts-from-github.js --repo ThomasSchinca/Pace-map-risk --dir Historical_Predictions --branch main --latestOnly --saveCsv')

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
}

main().catch(err => { console.error(err?.message || err); process.exit(1) })
