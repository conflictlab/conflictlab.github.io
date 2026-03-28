#!/usr/bin/env node
/**
 * Denormalize scenarios.json using per-country min/max (from update-minmax-from-hist.js).
 *
 * Reads:
 *   - public/data/scenarios.json
 *   - public/data/minmax.json
 * Writes:
 *   - public/data/scenarios.denorm.json
 *
 * Supports both legacy object shape { clusters, temporal } and the
 * newer array shape [clustersTable, temporalTable] where tables are
 * pandas-style text tables. The output uses the object shape.
 *
 * For each country with min/max available, if the scenario temporal values look
 * normalized, convert with: x' = x * (max - min) + min. If values look already
 * absolute (very large), keep them as-is.
 */
const fs = require('fs')
const path = require('path')

function loadJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'))
}

// Parse a pandas-style temporal table string into { date -> { rowKey -> value } }
function parseTemporalTable(maybeStr) {
  if (typeof maybeStr !== 'string' || !maybeStr.trim()) return null
  const lines = maybeStr.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0)
  if (!lines.length) return null
  const filtered = lines.filter(l => !/^\[\d+\s+rows\s+x\s+\d+\s+columns\]$/.test(l.trim()) && !/^\.+$/.test(l.trim()))
  if (!filtered.length) return null
  const header = filtered[0].trim()
  const dates = header.split(/\s+/).filter(Boolean)
  if (!dates.length) return null
  const temporal = {}
  for (const d of dates) temporal[d] = {}
  for (let i = 1; i < filtered.length; i++) {
    const row = filtered[i].trim()
    if (!row) continue
    const parts = row.split(/\s+/).filter(Boolean)
    if (parts.length < dates.length + 1) continue
    const rowKey = parts[0]
    for (let j = 0; j < dates.length; j++) {
      const v = Number(parts[j + 1])
      if (!Number.isFinite(v)) continue
      temporal[dates[j]][rowKey] = v
    }
  }
  const hasAny = Object.values(temporal).some(obj => Object.keys(obj).length > 0)
  return hasAny ? temporal : null
}

function adaptArrayCountryEntry(entry) {
  if (!Array.isArray(entry) || entry.length < 2) return null
  const [, temporalRaw] = entry
  const temporal = parseTemporalTable(temporalRaw)
  if (!temporal) return null
  const firstDate = Object.keys(temporal)[0]
  const rowKeys = Object.keys(temporal[firstDate] || {})
  const clusters = {}
  rowKeys.forEach((rowKey, idx) => {
    const id = String(idx + 1)
    const weight = Number(rowKey)
    clusters[id] = {
      scenarios: [],
      count: 0,
      weight: Number.isFinite(weight) ? weight : 0,
    }
  })
  return { clusters, temporal }
}

function looksNormalized(temporal) {
  // Heuristic: if all values are small (<= 10) and non-negative, treat as normalized.
  let min = Infinity, max = -Infinity
  for (const date of Object.keys(temporal)) {
    const row = temporal[date]
    for (const k of Object.keys(row)) {
      const v = Number(row[k])
      if (!Number.isFinite(v)) continue
      if (v < min) min = v
      if (v > max) max = v
    }
  }
  if (min === Infinity) return false
  return min >= -1e-6 && max <= 10
}

function denormTemporal(temporal, mm) {
  const span = (mm.max - mm.min)
  if (!Number.isFinite(span) || span <= 0) return temporal
  const out = {}
  for (const date of Object.keys(temporal)) {
    const row = temporal[date]
    const outRow = {}
    for (const k of Object.keys(row)) {
      const v = Number(row[k])
      outRow[k] = Number.isFinite(v) ? (v * span + mm.min) : v
    }
    out[date] = outRow
  }
  return out
}

function shiftDates(temporal, yearShift) {
  // Shift all date keys in temporal object by yearShift years
  if (!temporal || typeof temporal !== 'object') return temporal
  const out = {}
  for (const [date, values] of Object.entries(temporal)) {
    // Check if date looks like YYYY-MM-DD format
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (match) {
      const year = parseInt(match[1], 10) + yearShift
      const newDate = `${year}-${match[2]}-${match[3]}`
      out[newDate] = values
    } else {
      out[date] = values
    }
  }
  return out
}

function normalizeCountryEntry(entry, mm) {
  // Normalize entry into object shape; optionally denormalize values.
  let obj = null
  if (entry && typeof entry === 'object' && !Array.isArray(entry) && entry.clusters && entry.temporal) {
    obj = entry
  } else if (Array.isArray(entry)) {
    obj = adaptArrayCountryEntry(entry)
  }
  if (!obj) return entry // unknown shape — return as-is

  // Date shifting disabled - PKL files now contain correct forecast dates
  // obj.temporal = shiftDates(obj.temporal, 1)

  if (!mm) return obj
  if (looksNormalized(obj.temporal)) {
    return { clusters: obj.clusters, temporal: denormTemporal(obj.temporal, mm) }
  }
  return obj
}

function main() {
  const scenariosPath = path.join(process.cwd(), 'public', 'data', 'scenarios.json')
  const minmaxPath = path.join(process.cwd(), 'public', 'data', 'minmax.json')
  const outPath = path.join(process.cwd(), 'public', 'data', 'scenarios.denorm.json')
  if (!fs.existsSync(scenariosPath)) {
    console.error('Missing public/data/scenarios.json')
    process.exit(1)
  }
  if (!fs.existsSync(minmaxPath)) {
    console.error('Missing public/data/minmax.json — run update-minmax-from-hist.js first')
    process.exit(1)
  }
  const scenarios = loadJSON(scenariosPath)
  const minmax = loadJSON(minmaxPath)

  const out = {}
  for (const [country, entry] of Object.entries(scenarios)) {
    const mm = minmax[country]
    out[country] = normalizeCountryEntry(entry, mm)
  }
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${outPath}`)
}

if (require.main === module) main()
