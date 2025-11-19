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

function analyzeHistoricalTrend(series: Array<{ period: string; index: number; confidence: number }>): string {
  if (series.length < 3) return ''

  const recent = series.slice(-6) // Last 6 months
  const values = recent.map(s => s.index)

  // Calculate trend
  const firstHalf = values.slice(0, Math.ceil(values.length / 2))
  const secondHalf = values.slice(Math.ceil(values.length / 2))
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
  const trendChange = secondAvg - firstAvg

  // Calculate volatility
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)
  const volatility = stdDev / avg

  // Find peaks
  const maxValue = Math.max(...values)
  const maxIndex = values.indexOf(maxValue)
  const isPeakRecent = maxIndex >= values.length - 2

  // Generate description
  if (Math.abs(trendChange) < 5) {
    if (volatility > 0.3) {
      return 'Risk levels have been volatile but stable on average over recent months.'
    }
    return 'Risk has remained relatively stable over the past several months.'
  } else if (trendChange > 15) {
    return 'Risk has been on a sharp upward trajectory in recent months.'
  } else if (trendChange > 5) {
    if (isPeakRecent) {
      return 'Risk has been gradually increasing and may be approaching a peak.'
    }
    return 'Risk has been trending upward over recent months.'
  } else if (trendChange < -15) {
    return 'Risk has declined significantly in recent months, showing substantial improvement.'
  } else {
    if (volatility > 0.3) {
      return 'Risk has been declining but with notable volatility.'
    }
    return 'Risk has been on a downward trend recently.'
  }
}

export function generateEntityNarrative(
  entity: ForecastEntity,
  historicalSeries: Array<{ period: string; index: number; confidence: number }>,
  snapshot: ForecastSnapshot
): string {
  const paragraphs: string[] = []

  // 1. Current Status
  let statusLine = ''
  if (entity.band === 'high') {
    statusLine = `${entity.name} is currently in a **high-risk** state with a risk index of **${entity.index.toFixed(1)}**.`
  } else if (entity.band === 'medium') {
    statusLine = `${entity.name} shows **moderate** conflict risk levels with an index of **${entity.index.toFixed(1)}**.`
  } else {
    statusLine = `${entity.name} maintains **relatively low** conflict risk with an index of **${entity.index.toFixed(1)}**.`
  }
  paragraphs.push(statusLine)

  // 2. Recent Change
  if (Math.abs(entity.deltaMoM) > 0.5) {
    let changeLine = ''
    if (entity.deltaMoM > 20) {
      changeLine = `Risk has **surged dramatically** by ${entity.deltaMoM.toFixed(1)} points since last month, representing a significant escalation.`
    } else if (entity.deltaMoM > 10) {
      changeLine = `Risk has **increased substantially** by ${entity.deltaMoM.toFixed(1)} points since last month.`
    } else if (entity.deltaMoM > 5) {
      changeLine = `Risk has **risen moderately** by ${entity.deltaMoM.toFixed(1)} points since last month.`
    } else if (entity.deltaMoM > 0) {
      changeLine = `Risk has **increased slightly** by ${entity.deltaMoM.toFixed(1)} points from the previous month.`
    } else if (entity.deltaMoM < -20) {
      changeLine = `Risk has **dropped sharply** by ${Math.abs(entity.deltaMoM).toFixed(1)} points, showing major improvement.`
    } else if (entity.deltaMoM < -10) {
      changeLine = `Risk has **declined significantly** by ${Math.abs(entity.deltaMoM).toFixed(1)} points since last month.`
    } else if (entity.deltaMoM < -5) {
      changeLine = `Risk has **decreased moderately** by ${Math.abs(entity.deltaMoM).toFixed(1)} points.`
    } else {
      changeLine = `Risk has **edged down** slightly by ${Math.abs(entity.deltaMoM).toFixed(1)} points.`
    }
    paragraphs.push(changeLine)
  }

  // 3. Historical Trend Context
  if (historicalSeries.length >= 3) {
    const trendDescription = analyzeHistoricalTrend(historicalSeries)
    if (trendDescription) {
      paragraphs.push(trendDescription)
    }
  }

  // 4. Year-over-Year if available
  if (Math.abs(entity.deltaYoY) > 0.5) {
    if (entity.deltaYoY > 0) {
      paragraphs.push(`Compared to one year ago, risk is **${entity.deltaYoY.toFixed(1)} points higher**.`)
    } else {
      paragraphs.push(`Compared to one year ago, risk is **${Math.abs(entity.deltaYoY).toFixed(1)} points lower**.`)
    }
  }

  // 5. Drivers
  if (entity.drivers && entity.drivers.length > 0) {
    const sortedDrivers = [...entity.drivers].sort((a, b) => b.impact - a.impact)
    const topDriver = sortedDrivers[0]

    if (sortedDrivers.length === 1) {
      paragraphs.push(`The primary risk driver is **${topDriver.category}**.`)
    } else if (sortedDrivers.length === 2) {
      paragraphs.push(`Key risk drivers include **${topDriver.category}** and **${sortedDrivers[1].category}**.`)
    } else {
      const top3 = sortedDrivers.slice(0, 3).map(d => d.category)
      paragraphs.push(`Key risk drivers include **${top3[0]}**, **${top3[1]}**, and **${top3[2]}**.`)
    }
  }

  // 6. Outlook
  const outlook1m = entity.horizons['1m'].p50
  const outlook6m = entity.horizons['6m'].p50
  const outlookChange = outlook6m - outlook1m

  if (Math.abs(outlookChange) > 10) {
    if (outlookChange > 20) {
      paragraphs.push(`The 6-month outlook suggests **sharply increasing risk**, with forecasts rising to ${outlook6m.toFixed(1)}.`)
    } else if (outlookChange > 10) {
      paragraphs.push(`The outlook indicates **moderately increasing risk** over the next six months, forecasting ${outlook6m.toFixed(1)}.`)
    } else if (outlookChange < -20) {
      paragraphs.push(`Forecasts indicate **substantially improving conditions** ahead, with risk expected to decline to ${outlook6m.toFixed(1)}.`)
    } else {
      paragraphs.push(`The outlook suggests **gradual improvement**, with risk forecast to decrease to ${outlook6m.toFixed(1)}.`)
    }
  } else if (Math.abs(outlookChange) > 5) {
    if (outlookChange > 0) {
      paragraphs.push(`Risk is expected to **edge higher** over the next six months.`)
    } else {
      paragraphs.push(`Risk is expected to **decline modestly** over the next six months.`)
    }
  } else {
    paragraphs.push(`Risk levels are forecast to **remain relatively stable** over the next six months.`)
  }

  // 7. Confidence note
  if (entity.confidence < 0.5) {
    paragraphs.push(`⚠️ Note: Forecast confidence is relatively low (${(entity.confidence * 100).toFixed(0)}%), suggesting higher uncertainty.`)
  } else if (entity.confidence > 0.8) {
    paragraphs.push(`Forecast confidence is high (${(entity.confidence * 100).toFixed(0)}%).`)
  }

  return paragraphs.join(' ')
}

export function getEntityComparativeStats(entity: ForecastEntity, snapshot: ForecastSnapshot) {
  const allEntities = snapshot.entities
  const sameTypeEntities = allEntities.filter(e => e.entityType === entity.entityType)

  // Calculate percentile (what % of entities have lower risk)
  const lowerRiskCount = sameTypeEntities.filter(e => e.index < entity.index).length
  const percentile = Math.round((lowerRiskCount / sameTypeEntities.length) * 100)

  // Calculate rank
  const sorted = [...sameTypeEntities].sort((a, b) => b.index - a.index)
  const rank = sorted.findIndex(e => e.id === entity.id) + 1

  // Global average
  const globalAvg = allEntities.reduce((sum, e) => sum + e.index, 0) / allEntities.length

  // Type-specific average
  const typeAvg = sameTypeEntities.reduce((sum, e) => sum + e.index, 0) / sameTypeEntities.length

  return {
    percentile,
    rank,
    totalInType: sameTypeEntities.length,
    globalAvg: Number(globalAvg.toFixed(1)),
    typeAvg: Number(typeAvg.toFixed(1)),
    aboveTypeAvg: entity.index > typeAvg,
  }
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

// ADDED_CODE_START
export async function getForecastsPageData() {
  const snapshot = readSnapshot('latest')
  const periods = getAvailablePeriods()
  const currentIdx = periods.indexOf(snapshot.period)
  const prevPeriod = currentIdx > 0 ? periods[currentIdx - 1] : undefined
  const prevSnap = prevPeriod ? readSnapshot(prevPeriod) : undefined

  const prevIndexMap = new Map<string, number>()
  if (prevSnap) {
    for (const e of prevSnap.entities) {
      prevIndexMap.set(e.id, e.horizons?.['1m']?.index ?? e.index)
      if (e.iso3) prevIndexMap.set(e.iso3, e.horizons?.['1m']?.index ?? e.index)
      prevIndexMap.set((e.name || '').toUpperCase(), e.horizons?.['1m']?.index ?? e.index)
    }
  }

  const total1mCurrent = snapshot.entities.reduce((s, e) => s + (e.horizons?.['1m']?.index ?? e.index), 0)
  const total1mPrev = prevSnap ? prevSnap.entities.reduce((s, e) => s + (e.horizons?.['1m']?.index ?? e.index), 0) : undefined
  const deltaTotal = total1mPrev !== undefined ? Number((total1mCurrent - total1mPrev).toFixed(1)) : undefined

  const countriesCovered = snapshot.entities.filter((e) => (e.entityType || 'country') === 'country').length

  const rows = snapshot.entities.map((e) => {
    const prev = prevIndexMap.get(e.id) ?? prevIndexMap.get(e.iso3 || '') ?? prevIndexMap.get((e.name || '').toUpperCase())
    const deltaMoM = prev !== undefined ? Number((e.horizons['1m'].index - prev).toFixed(1)) : 0
    const months = getEntityHorizonMonths(snapshot.period, e.name) || [
      e.horizons['1m'].p50,
      Number(((e.horizons['1m'].p50 + e.horizons['3m'].p50) / 2).toFixed(1)),
      e.horizons['3m'].p50,
      Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) / 3).toFixed(1)),
      Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) * 2 / 3).toFixed(1)),
      e.horizons['6m'].p50,
    ]
    return {
      id: e.id,
      name: e.name,
      entityType: e.entityType,
      pred1m: Number(e.horizons['1m'].p50.toFixed(1)),
      pred3m: Number(e.horizons['3m'].p50.toFixed(1)),
      pred6m: Number(e.horizons['6m'].p50.toFixed(1)),
      deltaMoM,
      trend: months,
    }
  })

  const countryMapItems = snapshot.entities
    .filter((e) => (e.entityType || 'country') === 'country')
    .map((e) => {
      const months = getEntityHorizonMonths(snapshot.period, e.name) || [
        e.horizons['1m'].p50,
        Number(((e.horizons['1m'].p50 + e.horizons['3m'].p50) / 2).toFixed(1)),
        e.horizons['3m'].p50,
        Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) / 3).toFixed(1)),
        Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) * 2 / 3).toFixed(1)),
        e.horizons['6m'].p50,
      ]
      return { id: e.id, name: e.name, iso3: e.iso3, months }
    })

  const highlights = [...snapshot.entities]
    .map((e) => {
      const prev = prevIndexMap.get(e.id) ?? prevIndexMap.get(e.iso3 || '') ?? prevIndexMap.get((e.name || '').toUpperCase())
      const deltaMoM = prev !== undefined ? Math.abs(Number((e.horizons['1m'].index - prev).toFixed(1))) : 0
      return { e, deltaMoM }
    })
    .sort((a, b) => b.deltaMoM - a.deltaMoM)
    .slice(0, 6)
    .map(x => x.e)

  const movers = [...snapshot.entities]
    .map((e) => {
      const prev = prevIndexMap.get(e.id) ?? prevIndexMap.get(e.iso3 || '') ?? prevIndexMap.get((e.name || '').toUpperCase())
      const deltaMoM = prev !== undefined ? Number((e.horizons['1m'].index - prev).toFixed(1)) : 0
      return { id: e.id, name: e.name, entityType: e.entityType, deltaMoM, band: e.band }
    })
    .sort((a, b) => Math.abs(b.deltaMoM) - Math.abs(a.deltaMoM))
    .slice(0, 6)

  const HIGH_THRESHOLD = 100
  const countryEntities = snapshot.entities.filter((e) => (e.entityType || 'country') === 'country')
  const highByThresholdCount = countryEntities.filter((e) => Number(e.horizons['1m'].p50) > HIGH_THRESHOLD).length
  const prevHighByThresholdCount = (() => {
    if (!prevSnap) return undefined as number | undefined
    const prevCountries = prevSnap.entities.filter((e) => (e.entityType || 'country') === 'country')
    return prevCountries.filter((e) => Number(e.horizons['1m'].p50) > HIGH_THRESHOLD).length
  })()
  const deltaHigh = (prevHighByThresholdCount === undefined) ? undefined : (highByThresholdCount - prevHighByThresholdCount)

  const topMover = movers.length > 0 ? movers[0] : null
  const keyTakeaways: string[] = []

  // First takeaway (global risk trend)
  keyTakeaways.push(
    `Global conflict risk ${deltaTotal && deltaTotal > 0 ? 'shows a slight increase' : 'remains stable or has decreased'} since last month.`
  )

  // Second takeaway (top mover, shortened)
  if (topMover) {
    keyTakeaways.push(
      `Top mover: ${topMover.name} (${topMover.deltaMoM >= 0 ? '+' : ''}${topMover.deltaMoM.toFixed(1)} pts).`
    )
  }


  return {
    snapshot,
    summaryStats: {
      total1mCurrent,
      deltaTotal,
      countriesCovered,
      highByThresholdCount,
      deltaHigh,
      HIGH_THRESHOLD,
    },
    rows,
    countryMapItems,
    highlights,
    movers,
    keyTakeaways,
  }
}
// ADDED_CODE_END

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
