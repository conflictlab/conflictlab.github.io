import fs from 'fs'
import path from 'path'

export type DriverCategory = 'election' | 'unrest' | 'macro' | 'security' | 'policy'

export type HorizonKey = '1m' | '3m' | '6m'

export interface HorizonForecast {
  index: number
  p10: number
  p50: number
  p90: number
}

export interface Driver {
  category: DriverCategory | string
  impact: number
  note?: string
}

export interface ForecastEntity {
  id: string
  name: string
  entityType: 'country' | 'region' | 'sector'
  iso3?: string
  index: number
  band: 'low' | 'medium' | 'high'
  confidence: number
  deltaMoM: number
  deltaYoY: number
  horizons: Record<HorizonKey, HorizonForecast>
  drivers: Driver[]
  notes?: string
}

export interface ForecastSnapshot {
  version: string
  generatedAt: string
  period: string // YYYY-MM
  releaseNotes?: string[]
  entities: ForecastEntity[]
}

const dataRoot = path.join(process.cwd(), 'content', 'forecasts')

export function getAvailablePeriods(): string[] {
  let files: string[] = []
  try {
    files = fs.readdirSync(dataRoot)
  } catch {
    return []
  }
  const periods = files
    .filter((f) => /\d{4}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
  return periods
}

export function readSnapshot(period?: string): ForecastSnapshot {
  // If a specific period is requested (not 'latest'), read directly
  if (period && period !== 'latest') {
    const p = path.join(dataRoot, `${period}.json`)
    const raw = fs.readFileSync(p, 'utf-8')
    return JSON.parse(raw) as ForecastSnapshot
  }

  // Try latest.json first
  try {
    const latestRaw = fs.readFileSync(path.join(dataRoot, 'latest.json'), 'utf-8')
    const latest: ForecastSnapshot = JSON.parse(latestRaw)
    if (latest && Array.isArray(latest.entities) && latest.entities.length > 0) {
      // If snapshot appears valid (at least one non-zero index), use it
      const anyNonZero = latest.entities.some(e => Number(e.index) > 0)
      if (anyNonZero) return latest
    }
  } catch {}

  // Fallback to most recent valid period
  const periods = getAvailablePeriods()
  for (let i = periods.length - 1; i >= 0; i--) {
    try {
      const snapRaw = fs.readFileSync(path.join(dataRoot, `${periods[i]}.json`), 'utf-8')
      const snap: ForecastSnapshot = JSON.parse(snapRaw)
      if (snap && Array.isArray(snap.entities) && snap.entities.length > 0) {
        const anyNonZero = snap.entities.some(e => Number(e.index) > 0)
        if (anyNonZero) return snap
      }
    } catch {}
  }

  // Last resort: return an empty snapshot
  return { version: '1.0', generatedAt: new Date().toISOString(), period: 'latest', entities: [] }
}

export function readAllSnapshots(): ForecastSnapshot[] {
  const periods = getAvailablePeriods()
  return periods.map((p) => readSnapshot(p))
}

export function getEntitySeries(entityId: string): Array<{ period: string; index: number; confidence: number }> {
  const snaps = readAllSnapshots()
  const series: Array<{ period: string; index: number; confidence: number }> = []
  for (const s of snaps) {
    const e = s.entities.find((x) => x.id === entityId || x.iso3 === entityId)
    if (e) series.push({ period: s.period, index: e.index, confidence: e.confidence })
  }
  return series
}

export function getTopMovers(snapshot: ForecastSnapshot, limit = 5) {
  const movers = [...snapshot.entities]
    .map((e) => ({ id: e.id, name: e.name, entityType: e.entityType, deltaMoM: e.deltaMoM, band: e.band }))
    .sort((a, b) => Math.abs(b.deltaMoM) - Math.abs(a.deltaMoM))
    .slice(0, limit)
  return movers
}

export function getMeta() {
  const periods = getAvailablePeriods()
  const latest = readSnapshot('latest')
  const entities = latest.entities.map((e) => ({ id: e.id, name: e.name, entityType: e.entityType }))
  return { periods, entities }
}

export function computeGlobalSummary(snapshot: ForecastSnapshot) {
  if (!snapshot.entities.length) return { avgIndex: 0, avgConfidence: 0 }
  const avgIndex = snapshot.entities.reduce((s, e) => s + e.index, 0) / snapshot.entities.length
  const avgConfidence = snapshot.entities.reduce((s, e) => s + e.confidence, 0) / snapshot.entities.length
  return { avgIndex: Number(avgIndex.toFixed(1)), avgConfidence: Number(avgConfidence.toFixed(2)) }
}

// Read six-month horizon values (p50) from saved raw CSV for a given period
export function getEntityHorizonMonths(period: string, entityName: string): number[] | null {
  try {
    const csvPath = path.join(process.cwd(), 'content', 'forecasts', 'csv', `${period}.csv`)
    if (!fs.existsSync(csvPath)) return null
    const text = fs.readFileSync(csvPath, 'utf-8')
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
    if (lines.length < 2) return null
    const header = splitCSVLine(lines[0])
    const colIdx = header.findIndex(h => h === entityName)
    if (colIdx < 0) return null
    // Take the first 6 data rows as months 1..6
    const months = [] as number[]
    for (let i = 1; i <= 6 && i < lines.length; i++) {
      const cols = splitCSVLine(lines[i])
      const v = Number(cols[colIdx] || '0')
      months.push(Number.isFinite(v) ? v : 0)
    }
    return months.length === 6 ? months : null
  } catch {
    return null
  }
}

function splitCSVLine(line: string): string[] {
  const out: string[] = []
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

export function buildCSV(snapshot: ForecastSnapshot): string {
  const header = [
    'id','name','entityType','iso3','index','band','confidence','deltaMoM','deltaYoY',
    '1m_index','1m_p10','1m_p50','1m_p90',
    '3m_index','3m_p10','3m_p50','3m_p90',
    '6m_index','6m_p10','6m_p50','6m_p90',
    'drivers','notes'
  ]
  const rows = snapshot.entities.map((e) => {
    const drivers = (e.drivers || []).map(d => `${d.category}:${d.impact}`).join('|')
    const vals: (string | number)[] = [
      e.id,
      e.name,
      e.entityType,
      e.iso3 || '',
      e.index,
      e.band,
      e.confidence,
      e.deltaMoM,
      e.deltaYoY,
      e.horizons['1m'].index,
      e.horizons['1m'].p10,
      e.horizons['1m'].p50,
      e.horizons['1m'].p90,
      e.horizons['3m'].index,
      e.horizons['3m'].p10,
      e.horizons['3m'].p50,
      e.horizons['3m'].p90,
      e.horizons['6m'].index,
      e.horizons['6m'].p10,
      e.horizons['6m'].p50,
      e.horizons['6m'].p90,
      drivers,
      e.notes || ''
    ]
    return vals.map(csvEscape).join(',')
  })
  const meta = `# period=${snapshot.period}; generatedAt=${snapshot.generatedAt}; version=${snapshot.version}`
  return [meta, header.join(','), ...rows].join('\n') + '\n'
}

function csvEscape(v: string | number): string {
  const s = String(v)
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}
