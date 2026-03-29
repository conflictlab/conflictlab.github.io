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
  const histCsvPath = path.join(cwd, 'public', 'data', 'hist.csv')

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
      staticApiCandidate: latestPeriod ? `/api/v1/grid/${latestPeriod}/points-m1.json` : null,
      missingActiveCount: 0
    },
    warnings: [],
    errors: [],
    missingActiveEntities: []
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

  // Detect "active" countries missing from snapshot (e.g., Russia)
  try {
    if (exists(histCsvPath) && latest && Array.isArray(latest.entities)) {
      const histText = fs.readFileSync(histCsvPath, 'utf-8')
      const lines = histText.split(/\r?\n/).filter(Boolean)
      if (lines.length > 2) {
        const header = lines[0].split(',').slice(1)
        const last12 = lines.slice(Math.max(1, lines.length - 13)) // header + last 12 rows
        const sums = new Array(header.length).fill(0)
        for (let i = 1; i < last12.length; i++) {
          const cols = last12[i].split(',')
          for (let c = 1; c < cols.length; c++) {
            const v = Number(cols[c])
            if (Number.isFinite(v)) sums[c - 1] += v
          }
        }
        const snapshotNames = new Set(latest.entities.map(e => e.name))
        const activeMissing = []
        for (let i = 0; i < header.length; i++) {
          const name = header[i]
          if (!name || /Unnamed/i.test(name)) continue
          if (sums[i] > 0 && !snapshotNames.has(name)) activeMissing.push(name)
        }
        if (activeMissing.length) {
          status.summary.missingActiveCount = activeMissing.length
          status.missingActiveEntities = activeMissing
          const sample = activeMissing.slice(0, 5).join(', ')
          status.warnings.push(`Missing active countries in snapshot: ${sample}${activeMissing.length > 5 ? '…' : ''}`)
          if (activeMissing.includes('Russia')) {
            status.warnings.push('Missing forecast for Russia in latest snapshot')
          }
        }
      }
    }
  } catch (e) {
    status.warnings.push(`Active-country check failed: ${e?.message || e}`)
  }

  // Ensure output dir exists
  const outDir = path.dirname(outPath)
  if (!exists(outDir)) fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(status, null, 2))
  console.log(`Wrote ${outPath}. ok=${status.ok} warnings=${status.warnings.length} errors=${status.errors.length}`)
  if (!status.ok) process.exitCode = 1
}

if (require.main === module) main()
