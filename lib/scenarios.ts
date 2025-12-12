import fs from 'fs'
import path from 'path'

function loadScenariosData(): any {
  try {
    const denormPath = path.join(process.cwd(), 'public', 'data', 'scenarios.denorm.json')
    if (fs.existsSync(denormPath)) {
      const raw = fs.readFileSync(denormPath, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {}
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'scenarios.json')
    const raw = fs.readFileSync(p, 'utf-8')
    return JSON.parse(raw)
  } catch {}
  return {}
}

export interface Scenario {
  index: number
  region: string
  decade: string
  scale: string
}

export interface Cluster {
  scenarios: Scenario[]
  count: number
  weight: number  // Probability/weight of this cluster (0-1)
}

export interface ScenarioTemporal {
  [date: string]: Record<string, number>
}

export interface CountryScenarios {
  clusters: Record<string, Cluster>
  temporal: ScenarioTemporal
}

/**
 * Parse a pandas-style table string where the header row contains dates
 * and each subsequent row starts with a key (e.g., probability like "0.84")
 * followed by whitespace-separated numeric values per date.
 */
function parseTemporalTable(maybeStr: unknown): ScenarioTemporal | null {
  if (typeof maybeStr !== 'string' || !maybeStr.trim()) return null
  const lines = maybeStr.split(/\r?\n/).map(l => l.trimEnd()).filter(l => l.trim().length > 0)
  if (!lines.length) return null
  // Drop any pandas summary lines like "[91 rows x 4 columns]" or ellipsis placeholders
  const filtered = lines.filter(l => !/^\[\d+\s+rows\s+x\s+\d+\s+columns\]$/.test(l.trim()) && !/^\.+$/.test(l.trim()))
  if (!filtered.length) return null
  const header = filtered[0].trim()
  // Header is whitespace-separated list of dates (no leading key header)
  const dates = header.split(/\s+/).filter(Boolean)
  if (!dates.length) return null
  const temporal: ScenarioTemporal = {}
  // Initialize per-date maps
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
  // Ensure we have at least one value
  const hasAny = Object.values(temporal).some(obj => Object.keys(obj).length > 0)
  return hasAny ? temporal : null
}

/**
 * Some new data dumps encode each country as [clustersTable, temporalTable],
 * where clustersTable is a pandas-like text table and temporalTable contains
 * probabilities as row keys and dates as columns. This function adapts that
 * format into the expected { clusters, temporal } structure.
 */
function adaptArrayCountryEntry(entry: unknown): CountryScenarios | null {
  if (!Array.isArray(entry) || entry.length < 2) return null
  const [, temporalRaw] = entry as [unknown, unknown]
  const temporal = parseTemporalTable(temporalRaw)
  if (!temporal) return null
  // Build clusters from the temporal row keys in insertion order
  const firstDate = Object.keys(temporal)[0]
  const rowKeys = Object.keys(temporal[firstDate])
  if (!rowKeys.length) return null
  const clusters: Record<string, Cluster> = {}
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

/**
 * Get scenario data for a specific country
 * @param countryName - Name of the country
 * @returns Scenario data or null if not available
 */
export function getCountryScenarios(countryName: string): CountryScenarios | null {
  const scenariosData = loadScenariosData()
  const raw = (scenariosData as Record<string, any>)[countryName]
  if (!raw) return null

  // If already in the expected shape, return as-is
  if (raw && typeof raw === 'object' && !Array.isArray(raw) && raw.clusters && raw.temporal) {
    return raw as CountryScenarios
  }

  // Try to adapt from the new array form [clustersTable, temporalTable]
  const adapted = adaptArrayCountryEntry(raw)
  return adapted
}

/**
 * Get list of all countries with scenario data
 * @returns Array of country names
 */
export function getCountriesWithScenarios(): string[] {
  const out: string[] = []
  const data = loadScenariosData() as Record<string, any>
  for (const [country, entry] of Object.entries(data)) {
    if (!entry) continue
    if (entry && typeof entry === 'object' && !Array.isArray(entry) && entry.clusters && entry.temporal) {
      out.push(country)
      continue
    }
    const adapted = adaptArrayCountryEntry(entry)
    if (adapted) out.push(country)
  }
  return out.sort()
}

/**
 * Get number of scenarios for a country
 * @param countryName - Name of the country
 * @returns Number of scenarios or 0 if not available
 */
export function getScenarioCount(countryName: string): number {
  const scenarios = getCountryScenarios(countryName)
  if (!scenarios) return 0

  return Object.values(scenarios.clusters).reduce((sum, cluster) => sum + cluster.count, 0)
}
