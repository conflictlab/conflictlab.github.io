#!/usr/bin/env node
/**
 * Generate a newsletter-friendly top-4 countries CSV (best.csv-like)
 * from the site snapshot at content/forecasts/latest.json.
 *
 * Usage:
 *   node scripts/generate-newsletter-best.js [--out Pace-map-risk/best.from_site.csv]
 */

const fs = require('fs')
const path = require('path')

function main() {
  const args = Object.fromEntries(process.argv.slice(2)
    .map(a => a.startsWith('--') ? a.slice(2) : null)
    .filter(Boolean)
    .map(kv => kv.split('='))
  )

  const latestPath = path.join(process.cwd(), 'content', 'forecasts', 'latest.json')
  if (!fs.existsSync(latestPath)) {
    console.error('Missing content/forecasts/latest.json')
    process.exit(1)
  }
  const latest = JSON.parse(fs.readFileSync(latestPath, 'utf-8'))

  // Sort by 1m p50 (predicted fatalities) descending
  const entities = (latest.entities || [])
    .filter(e => (e.entityType || 'country') === 'country' && (e.name || '').toUpperCase() !== 'UNNAMED: 0')
    .map(e => ({
      name: e.name,
      p50_1m: Number(e?.horizons?.['1m']?.p50 ?? e.index) || 0
    }))
    .sort((a, b) => b.p50_1m - a.p50_1m)

  // top4 in descending order
  const top4 = entities.slice(0, 4)
  // Newsletter expects last row to be top-1; write in ascending rank order [4th,3rd,2nd,1st]
  const ordered = top4.slice().reverse()
  const out = [',name,find']
  ordered.forEach((row, i) => { out.push(`${i},${row.name},0`) })

  const outPath = path.join(process.cwd(), args.out || path.join('Pace-map-risk', 'best.from_site.csv'))
  fs.writeFileSync(outPath, out.join('\n'))
  console.log(`Wrote ${outPath}`)
  console.log('Top 4 by 1m p50:')
  top4.forEach((r, i) => console.log(`  ${i+1}. ${r.name} (${r.p50_1m.toFixed(1)})`))
}

if (require.main === module) main()
