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
 * Get scenario data for a specific country
 * @param countryName - Name of the country
 * @returns Scenario data or null if not available
 */
export function getCountryScenarios(countryName: string): CountryScenarios | null {
  const scenariosData = loadScenariosData()
  const data = (scenariosData as Record<string, CountryScenarios | null>)[countryName]

  if (!data || !data.clusters || !data.temporal) {
    return null
  }

  return data
}

/**
 * Get list of all countries with scenario data
 * @returns Array of country names
 */
export function getCountriesWithScenarios(): string[] {
  const countries: string[] = []
  const data = loadScenariosData() as Record<string, CountryScenarios | null>

  for (const [country, countryData] of Object.entries(data)) {
    if (countryData && countryData.clusters && countryData.temporal) {
      countries.push(country)
    }
  }

  return countries.sort()
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
