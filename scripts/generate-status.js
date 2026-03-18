#!/usr/bin/env node
/**
 * Generate a public/status.json with site+API health info.
 * - Summarizes latest forecast period, grid API availability, and data freshness
 * - Intended to be run by CI after data sync/build steps
 */
const fs = require('fs')
const path = require('path')

function exists(p) {
  try { return fs.existsSync(p) } catch { return false }
}

function loadJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return null }
}

function mtimeISO(p) {
  try { return fs.statSync(p).mtime.toISOString() } catch { return null }
}

function daysSince(iso) {
  if (!iso) return null
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return null
  const now = Date.now()
  return Math.floor((now - then) / (1000*60*60*24))
}

function findLatestGridPeriod(gridDir) {
  if (!exists(gridDir)) return null
  const files = fs.readdirSync(gridDir)
  const periods = Array.from(new Set(
    files.map(f => {
      const m = f.match(/(\d{4}-\d{2})(?:\.(?:geo\.json|csv)|-m[1-6]\.json)$/)
      return m ? m[1] : null
    }).filter(Boolean)
  )).sort()
  return periods.length ? periods[periods.length - 1] : null
}

function main() {
  const cwd = process.cwd()
  const outPath = path.join(cwd, 'public', 'status.json')

  const latestPath = path.join(cwd, 'content', 'forecasts', 'latest.json')
  const minmaxPath = path.join(cwd, 'public', 'data', 'minmax.json')
  const scenariosPath = path.join(cwd, 'public', 'data', 'scenarios.json')
  const scenariosDenormPath = path.join(cwd, 'public', 'data', 'scenarios.denorm.json')
  const matchesPath = path.join(cwd, 'public', 'data', 'matches.json')
  const gridDir = path.join(cwd, 'public', 'data', 'grid')

  const latest = loadJsonSafe(latestPath)
  const minmax = loadJsonSafe(minmaxPath)
  const scenarios = loadJsonSafe(scenariosPath)
  const scenariosDenorm = loadJsonSafe(scenariosDenormPath)
  const matches = loadJsonSafe(matchesPath)

  const latestPeriod = latest?.period || findLatestGridPeriod(gridDir)
  const status = {
    generatedAt: new Date().toISOString(),
    ok: true,
    summary: {
      latestPeriod: latestPeriod || null,
      snapshotGeneratedAt: latest?.generatedAt || null,
      snapshotAgeDays: latest?.generatedAt ? daysSince(latest.generatedAt) : null,
      minmaxCountries: minmax ? Object.keys(minmax).length : 0,
      minmaxUpdatedAt: mtimeISO(minmaxPath),
      scenariosUpdatedAt: mtimeISO(scenariosPath),
      scenariosDenormUpdatedAt: mtimeISO(scenariosDenormPath),
      matchesUpdatedAt: mtimeISO(matchesPath),
      gridLatestPeriod: findLatestGridPeriod(gridDir),
      staticApiCandidate: latestPeriod ? `/api/v1/grid/${latestPeriod}/points-m1.json` : null
    },
    warnings: [],
    errors: []
  }

  // Validate presence and freshness
  if (!latest) {
    status.ok = false
    status.errors.push('Missing content/forecasts/latest.json')
  }
  if (!minmax) {
    status.warnings.push('Missing public/data/minmax.json')
  }
  if (latest?.generatedAt) {
    const age = daysSince(latest.generatedAt)
    if (age !== null && age > 45) {
      status.warnings.push(`Latest snapshot is ${age} days old (>45) [${latest.generatedAt}]`)
    }
  }

  if (status.summary.staticApiCandidate) {
    const apiPath = path.join(cwd, 'public', status.summary.staticApiCandidate)
    if (!exists(apiPath)) {
      status.ok = false
      status.errors.push(`Missing static API file: ${status.summary.staticApiCandidate}`)
    }
  } else {
    status.warnings.push('Could not determine latest period for static API check')
  }

  // Ensure output dir exists
  const outDir = path.dirname(outPath)
  if (!exists(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(status, null, 2))
  console.log(`Wrote ${outPath}. ok=${status.ok} warnings=${status.warnings.length} errors=${status.errors.length}`)
  if (!status.ok) process.exitCode = 1
}

if (require.main === module) main()

