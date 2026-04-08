#!/usr/bin/env node
/**
 * Build content/forecasts/latest.json from forecasts_h6.csv and metadata.json
 *
 * This converter takes:
 * - public/data/forecasts/latest/forecasts_h6.csv (wide format: date + countries)
 * - public/data/forecasts/latest/metadata.json (period, generatedAt, etc)
 * - public/data/minmax.json (for min/max calculation)
 *
 * And produces content/forecasts/latest.json with the snapshot format.
 */

const fs = require('fs')
const path = require('path')

function parseCSVLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = false }
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') { out.push(cur); cur = '' }
      else if (ch === '"') { inQuotes = true }
      else { cur += ch }
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function toNumber(v) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function getBand(index) {
  if (index < 50) return 'low'
  if (index < 200) return 'medium'
  return 'high'
}

function main() {
  try {
    // Load inputs
    const forecastsPath = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'forecasts_h6.csv')
    const metadataPath = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'metadata.json')
    const minmaxPath = path.join(process.cwd(), 'public', 'data', 'minmax.json')

    if (!fs.existsSync(forecastsPath)) {
      console.error(`Missing: ${forecastsPath}`)
      process.exit(1)
    }
    if (!fs.existsSync(metadataPath)) {
      console.error(`Missing: ${metadataPath}`)
      process.exit(1)
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
    let minmax = {}
    try {
      minmax = JSON.parse(fs.readFileSync(minmaxPath, 'utf-8'))
    } catch {}

    // Parse forecasts CSV
    const forecastsText = fs.readFileSync(forecastsPath, 'utf-8')
    const lines = forecastsText.split(/\r?\n/).filter(l => l.trim())
    if (lines.length < 2) {
      console.error('Forecasts CSV too short')
      process.exit(1)
    }

    const header = parseCSVLine(lines[0])
    if (header[0].toLowerCase() !== 'date') {
      console.error('Expected first column to be "date"')
      process.exit(1)
    }

    const countries = header.slice(1)
    const forecastRow = parseCSVLine(lines[1])
    const forecastValues = forecastRow.slice(1).map(toNumber)

    // Build entities
    const entities = countries.map((name, idx) => {
      const countryId = name.toUpperCase()
      const index = forecastValues[idx] || 0
      const mmData = minmax[name] || {}

      return {
        id: countryId,
        name: name,
        entityType: 'country',
        index: index,
        band: getBand(index),
        confidence: 0.5, // placeholder
        deltaMoM: 0, // would need previous month to calculate
        deltaYoY: 0, // would need year-ago data to calculate
        horizons: {
          '1m': {
            index: 0,
            p10: mmData.min || 0,
            p50: index,
            p90: mmData.max || index * 2
          },
          '3m': {
            index: 0,
            p10: mmData.min || 0,
            p50: index,
            p90: mmData.max || index * 2
          },
          '6m': {
            index: 0,
            p10: mmData.min || 0,
            p50: index,
            p90: mmData.max || index * 2
          }
        },
        drivers: []
      }
    })

    const snapshot = {
      version: '1.0',
      generatedAt: metadata.generatedAt || new Date().toISOString(),
      period: metadata.forecast_start_date || metadata.data_end_date || 'latest',
      entities: entities
    }

    // Validate snapshot sanity before writing
    const placeholderCount = entities.filter(e => e.index === 0 || e.index > 9000).length
    if (placeholderCount > entities.length * 0.5) {
      console.error(`⚠️  WARNING: ${placeholderCount}/${entities.length} entities have suspicious values (0 or >9000)`)
      console.error('This suggests the forecast CSV may be corrupted or incomplete.')
      console.error('Aborting snapshot write to prevent stale data.')
      process.exit(1)
    }

    // Compare with previous snapshot to detect silent failures
    const outputDir = path.join(process.cwd(), 'content', 'forecasts')
    fs.mkdirSync(outputDir, { recursive: true })
    const outputPath = path.join(outputDir, 'latest.json')
    const prevSnapshot = (() => {
      try {
        return JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      } catch {
        return null
      }
    })()

    // Check if snapshot actually changed (not just metadata)
    const prevEntities = prevSnapshot?.entities || []
    if (prevEntities.length === entities.length) {
      const allSame = entities.every((e, i) => prevEntities[i]?.index === e.index)
      if (allSame) {
        console.warn(`⚠️  Snapshot unchanged from previous build (all ${entities.length} entities have identical values)`)
      }
    }

    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2))

    console.log(`✓ Built snapshot: ${outputPath}`)
    console.log(`  Period: ${snapshot.period}`)
    console.log(`  Entities: ${entities.length}`)
    console.log(`  Non-zero entities: ${entities.filter(e => e.index > 0).length}`)
  } catch (err) {
    console.error('Error building snapshot:', err.message)
    process.exit(1)
  }
}

main()
