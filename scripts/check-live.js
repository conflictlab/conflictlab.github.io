#!/usr/bin/env node
/**
 * Health-check the deployed Pages site.
 * Usage: node scripts/check-live.js --base https://owner.github.io/repo [--maxAgeDays 45]
 * - Fetches /status.json, evaluates ok + freshness
 * - Fetches a sample static API endpoint derived from status
 * - Writes health-report.md and exits non-zero on failure
 */
const https = require('https')
const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) continue
    const [k, v] = a.split('=')
    const key = k.replace(/^--/, '')
    if (v !== undefined) out[key] = v
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) { out[key] = argv[i + 1]; i++ }
    else out[key] = true
  }
  return out
}

function getJson(url, depth = 0) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Follow common redirects
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && depth < 5) {
        const nextUrl = new URL(res.headers.location, url).toString()
        res.resume()
        return resolve(getJson(nextUrl, depth + 1))
      }
      let data = ''
      res.on('data', d => { data += d })
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error(`GET ${url} -> ${res.statusCode}`))
        try { resolve(JSON.parse(data)) } catch (e) { reject(new Error(`Invalid JSON from ${url}: ${e.message}`)) }
      })
    }).on('error', reject)
  })
}

function daysSince(iso) {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return null
  const now = Date.now()
  return Math.floor((now - then) / (1000*60*60*24))
}

async function main() {
  const args = parseArgs(process.argv)
  const base = String(args.base || '').replace(/\/$/, '')
  const maxAgeDays = Number(args.maxAgeDays || 45)
  if (!base) {
    console.error('Missing --base URL')
    process.exit(2)
  }

  const report = []
  let ok = true

  report.push(`# Website Health Check\n`)
  report.push(`Base URL: ${base}`)

  // 1) status.json
  let status
  const statusUrl = `${base}/status.json`
  try {
    status = await getJson(statusUrl)
    report.push(`\n## status.json\n- fetched: OK`)
    report.push(`- generatedAt: ${status.generatedAt}`)
    report.push(`- overall ok: ${status.ok}`)
    if (!status.ok) { ok = false; report.push(`- ERROR: status.ok is false`) }
    if (status.summary?.snapshotGeneratedAt) {
      const age = daysSince(status.summary.snapshotGeneratedAt)
      report.push(`- snapshot age (days): ${age}`)
      if (age !== null && age > maxAgeDays) {
        ok = false
        report.push(`- ERROR: snapshot older than ${maxAgeDays} days`)
      }
    } else {
      ok = false
      report.push(`- ERROR: missing snapshotGeneratedAt in status.summary`)
    }
  } catch (e) {
    ok = false
    report.push(`\n## status.json\n- fetched: FAIL (${e.message})`)
  }

  // 2) Sample static API endpoint (if available)
  if (status?.summary?.latestPeriod) {
    const period = status.summary.latestPeriod
    const monthChecks = []
    for (let m = 1; m <= 6; m++) {
      const apiUrl = `${base}/api/v1/grid/${period}/points-m${m}.json`
      try {
        const api = await getJson(apiUrl)
        const count = Array.isArray(api.points) ? api.points.length : 0
        monthChecks.push(`m${m}: OK (${count} pts)`)        
        if (api.period !== period) {
          ok = false
          monthChecks.push(`m${m}: ERROR period mismatch (got ${api.period})`)
        }
      } catch (e) {
        ok = false
        monthChecks.push(`m${m}: FAIL (${e.message})`)
      }
    }
    report.push(`\n## Static API (grid points)\n- period: ${period}\n- ${monthChecks.join('\n- ')}`)
  } else {
    ok = false
    report.push(`\n## Static API\n- ERROR: No latestPeriod available from status.json`)
  }

  // 3) Remote CSV/metadata base (from app/data-api/page.tsx)
  try {
    const page = fs.readFileSync(path.join(process.cwd(), 'app', 'data-api', 'page.tsx'), 'utf-8')
    const m = page.match(/const\s+GITHUB_BASE\s*=\s*'([^']+)'/)
    if (m) {
      const baseCsv = m[1]
      const metaUrl = `${baseCsv}/forecast_metadata.json`
      const meta = await getJson(metaUrl)
      report.push(`\n## Remote Data Base\n- ${metaUrl} -> OK`)
      if (meta?.run_date) {
        const age = daysSince(meta.run_date)
        report.push(`- run_date: ${meta.run_date} (age ${age} days)`)        
        if (age !== null && age > maxAgeDays) {
          ok = false
          report.push(`- ERROR: remote run_date older than ${maxAgeDays} days`)
        }
      } else {
        ok = false
        report.push(`- ERROR: forecast_metadata.json missing run_date`)
      }

      // Check CSV endpoints are present and non-empty
      const csvEndpoints = [
        `${baseCsv}/forecasts_h6.csv`,
        `${baseCsv}/forecasts_h6_min.csv`,
        `${baseCsv}/forecasts_h6_max.csv`,
        `${baseCsv}/forecasts_h12.csv`,
        `${baseCsv}/forecasts_h12_min.csv`,
        `${baseCsv}/forecasts_h12_max.csv`,
        `${baseCsv}/Hist.csv`
      ]
      for (const url of csvEndpoints) {
        try {
          const text = await new Promise((resolve, reject) => {
            https.get(url, (res) => {
              if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location) {
                const next = new URL(res.headers.location, url).toString()
                res.resume()
                https.get(next, (res2) => {
                  let d = ''; res2.on('data', c=>d+=c); res2.on('end',()=> res2.statusCode===200 ? resolve(d) : reject(new Error(`GET ${next} -> ${res2.statusCode}`)))
                }).on('error', reject)
                return
              }
              let data = ''
              res.on('data', c => data += c)
              res.on('end', () => res.statusCode===200 ? resolve(data) : reject(new Error(`GET ${url} -> ${res.statusCode}`)))
            }).on('error', reject)
          })
          const lines = String(text).trim().split(/\r?\n/)
          if (lines.length < 2) {
            ok = false
            report.push(`- ${url} -> ERROR (too few rows: ${lines.length})`)
          } else {
            report.push(`- ${url} -> OK (${lines.length} lines)`)          
          }
        } catch (e) {
          ok = false
          report.push(`- ${url} -> FAIL (${e.message})`)
        }
      }
    } else {
      report.push(`\n## Remote Data Base\n- Could not detect GITHUB_BASE from app/data-api/page.tsx`)
    }
  } catch (e) {
    report.push(`\n## Remote Data Base\n- Skipped: ${e?.message || e}`)
  }

  const body = report.join('\n') + '\n'
  fs.writeFileSync(path.join(process.cwd(), 'health-report.md'), body)
  console.log(body)
  if (!ok) process.exit(1)
}

if (require.main === module) {
  main().catch((e) => { console.error(e?.message || e); process.exit(1) })
}
