#!/usr/bin/env node
/**
 * Mirror recent raw country-level CSVs from content into public for downloads.
 *
 * Defaults:
 *   - source: content/forecasts/csv
 *   - dest:   public/data/csv
 *   - limit:  12 (most recent months)
 *
 * Usage:
 *   node scripts/mirror-raw-csvs.js [--src dir] [--dest dir] [--limit 12]
 */

const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const [k, v] = arg.split('=')
    const key = k.replace(/^--/, '')
    if (v !== undefined) out[key] = v
    else {
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) out[key] = true
      else { out[key] = next; i++ }
    }
  }
  return out
}

function main() {
  const args = parseArgs(process.argv)
  const src = path.join(process.cwd(), args.src || 'content/forecasts/csv')
  const dest = path.join(process.cwd(), args.dest || 'public/data/csv')
  const limit = Number(args.limit || 12)

  if (!fs.existsSync(src)) {
    console.warn(`[mirror-raw-csvs] Source not found: ${src}`)
    process.exit(0)
  }
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true })

  const files = fs.readdirSync(src)
  const monthFiles = files
    .filter(f => /(\d{4})-(\d{2})\.csv$/.test(f))
    .sort((a, b) => {
      const ma = a.match(/(\d{4})-(\d{2})/)
      const mb = b.match(/(\d{4})-(\d{2})/)
      if (!ma || !mb) return a.localeCompare(b)
      const ya = Number(ma[1]); const maNum = Number(ma[2])
      const yb = Number(mb[1]); const mbNum = Number(mb[2])
      if (ya !== yb) return ya - yb
      return maNum - mbNum
    })

  const toCopy = limit > 0 ? monthFiles.slice(-limit) : monthFiles
  let copied = 0
  for (const f of toCopy) {
    const srcFile = path.join(src, f)
    const dstFile = path.join(dest, f)
    try {
      fs.copyFileSync(srcFile, dstFile)
      copied++
    } catch (e) {
      console.warn(`[mirror-raw-csvs] Failed to copy ${f}: ${e?.message || e}`)
    }
  }

  // Also mirror latest.csv if present
  if (files.includes('latest.csv')) {
    try {
      fs.copyFileSync(path.join(src, 'latest.csv'), path.join(dest, 'latest.csv'))
    } catch (e) {
      console.warn(`[mirror-raw-csvs] Failed to copy latest.csv: ${e?.message || e}`)
    }
  }

  console.log(`[mirror-raw-csvs] Mirrored ${copied} month file(s) from ${src} to ${dest}`)
}

if (require.main === module) {
  try { main() } catch (e) { console.error(e?.message || e); process.exit(1) }
}

