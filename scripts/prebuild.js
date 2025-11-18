#!/usr/bin/env node
/**
 * Prebuild gate with optional skip.
 * - If env SKIP_PREBUILD is set, exits immediately.
 * - Otherwise runs the original prebuild steps in sequence.
 */

const { execSync } = require('child_process')

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

  console.log('Prebuild: building PRIO-GRID GeoJSON from live CSV…')
  run('node scripts/prio-csv-to-geojson.js --csv https://raw.githubusercontent.com/ThomasSchinca/Live_3D_forecast/main/df_output.csv')

  console.log('Prebuild: generating monthly point JSONs…')
  run('node scripts/geojson-to-month-points.js')

  console.log('Prebuild: exporting static API endpoints…')
  run('node scripts/export-static-api.js')
}

main().catch(err => { console.error(err?.message || err); process.exit(1) })
