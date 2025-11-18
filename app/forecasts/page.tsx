import { readSnapshot, getAvailablePeriods } from '@/lib/forecasts'
import RiskIndexTable from '@/components/RiskIndexTable'
import Collapsible from '@/components/Collapsible'
import TopMovers from '@/components/TopMovers'
import ForecastFanChart from '@/components/ForecastFanChart'
import { getEntityHorizonMonths } from '@/lib/forecasts'
// Release notes and inline API links removed from this page
import dynamic from 'next/dynamic'
const CountryChoropleth = dynamic(() => import('@/components/CountryChoropleth'), { ssr: false })

function bandFromIndex(idx: number): 'low' | 'medium' | 'high' {
  if (idx < 33) return 'low'
  if (idx < 66) return 'medium'
  return 'high'
}

function endPeriodFrom(start: string): string | null {
  const parts = start.split('-')
  if (parts.length !== 2) return null
  const y = Number(parts[0])
  const m = Number(parts[1])
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null
  const d = new Date(Date.UTC(y, (m - 1), 1))
  d.setUTCMonth(d.getUTCMonth() + 5) // 6-month horizon: 1..6
  const ey = d.getUTCFullYear()
  const em = String(d.getUTCMonth() + 1).padStart(2, '0')
  return `${ey}-${em}`
}

function formatDMY(iso: string): string {
  const dt = new Date(iso)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export default async function ForecastsPage() {
  const snapshot = readSnapshot('latest')
  // Compute deltas vs previous period
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

  // Global totals and Δ MoM (totals)
  const total1mCurrent = snapshot.entities.reduce((s, e) => s + (e.horizons?.['1m']?.index ?? e.index), 0)
  const total1mPrev = prevSnap ? prevSnap.entities.reduce((s, e) => s + (e.horizons?.['1m']?.index ?? e.index), 0) : undefined
  const deltaTotal = total1mPrev !== undefined ? Number((total1mCurrent - total1mPrev).toFixed(1)) : undefined
  const countriesCovered = snapshot.entities.filter((e) => (e.entityType || 'country') === 'country').length

  // Prepare table rows with 1–6 month predictions as the inline sparkline
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
      return { name: e.name, iso3: e.iso3, months }
    })

  // Horizon matrix removed

  // Pick top 5 movers by absolute MoM change for plots
  const highlights = [...snapshot.entities]
    .map((e) => {
      const prev = prevIndexMap.get(e.id) ?? prevIndexMap.get(e.iso3 || '') ?? prevIndexMap.get((e.name || '').toUpperCase())
      const deltaMoM = prev !== undefined ? Math.abs(Number((e.horizons['1m'].index - prev).toFixed(1))) : 0
      return { e, deltaMoM }
    })
    .sort((a, b) => b.deltaMoM - a.deltaMoM)
    .slice(0, 6)
    .map(x => x.e)

  // Build top movers list (absolute MoM)
  const movers = [...snapshot.entities]
    .map((e) => {
      const prev = prevIndexMap.get(e.id) ?? prevIndexMap.get(e.iso3 || '') ?? prevIndexMap.get((e.name || '').toUpperCase())
      const deltaMoM = prev !== undefined ? Number((e.horizons['1m'].index - prev).toFixed(1)) : 0
      return { id: e.id, name: e.name, entityType: e.entityType, deltaMoM, band: e.band }
    })
    .sort((a, b) => Math.abs(b.deltaMoM) - Math.abs(a.deltaMoM))
    .slice(0, 6)
  
  // High‑risk share metrics (threshold based)
  const HIGH_THRESHOLD = 100
  const countryEntities = snapshot.entities.filter((e) => (e.entityType || 'country') === 'country')
  const highByThresholdCount = countryEntities.filter((e) => Number(e.horizons['1m'].p50) > HIGH_THRESHOLD).length
  const prevHighByThresholdCount = (() => {
    if (!prevSnap) return undefined as number | undefined
    const prevCountries = prevSnap.entities.filter((e) => (e.entityType || 'country') === 'country')
    return prevCountries.filter((e) => Number(e.horizons['1m'].p50) > HIGH_THRESHOLD).length
  })()
  const deltaHigh = (prevHighByThresholdCount === undefined) ? undefined : (highByThresholdCount - prevHighByThresholdCount)
  
  // Removed raw CSV sidebar downloads in favor of centralized data page
  
  // Removed distribution plot data

  return (
    <div>
      {/* Hero summary */}
      <section className="py-0 hero-background-network-image" />

      {/* Country Choropleth (full-bleed) */}
      <section className="py-0 bg-white">
        {/* Full-width (bleed) wrapper */}
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          {/* Full-bleed map without side padding */}
          <CountryChoropleth items={countryMapItems} />
        </div>
        {/* Summary cards below the map, constrained */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page heading and context moved below the map */}
          <div className="mt-6">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">Forecast Dashboard</h1>
            <p className="text-gray-700 font-light mb-3">
              Forecasts for the period {snapshot.period} to {endPeriodFrom(snapshot.period) || snapshot.period}
              <span className="text-gray-400"> · </span>
              Updated: {formatDMY(snapshot.generatedAt)}
            </p>
            {/* Removed secondary view toggle below the map */}
            <p className="text-gray-600 text-sm">All values represent predicted fatalities over the next 6 months. The table shows 1‑month predictions and the change from the previous forecast.</p>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Total predicted fatalities (1‑month)</div>
              <div className="text-3xl font-light text-gray-900">{Math.round(total1mCurrent)}</div>
              <div className="text-xs text-gray-500 mt-1">Sum of next‑month predictions across all countries</div>
              <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="text-sm text-gray-500">Δ total vs previous month</div>
                <div className={`text-3xl font-light ${deltaTotal !== undefined ? (deltaTotal >= 0 ? 'text-emerald-700' : 'text-rose-700') : 'text-gray-900'}`}>
                  {deltaTotal !== undefined ? (deltaTotal >= 0 ? `+${Math.round(deltaTotal)}` : `${Math.round(deltaTotal)}`) : '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">Change in total 1‑month predicted fatalities</div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">High‑risk countries (&gt;{HIGH_THRESHOLD} next month)</div>
              <div className="mt-1">
                <div className="text-3xl font-light text-gray-900">
                  {highByThresholdCount}
                  <span className="ml-2 align-middle text-base text-gray-500">({countriesCovered > 0 ? Math.round((highByThresholdCount / countriesCovered) * 100) : 0}%)</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Δ vs last month: {deltaHigh === undefined ? '—' : (deltaHigh >= 0 ? `+${deltaHigh}` : `${deltaHigh}`)}
                </div>
              </div>
            </div>
            <TopMovers movers={movers} height={240} />
          </div>
        </div>
      </section>

      {/* Movers + Highlights (3-column layout) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((e) => {
              const months = getEntityHorizonMonths(snapshot.period, e.name)
              return (
                <ForecastFanChart
                  key={e.id}
                  title={`${e.name} — Predicted fatalities`}
                  months={months || [
                    e.horizons['1m'].p50,
                    Number(((e.horizons['1m'].p50 + e.horizons['3m'].p50) / 2).toFixed(1)),
                    e.horizons['3m'].p50,
                    Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) / 3).toFixed(1)),
                    Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) * 2 / 3).toFixed(1)),
                    e.horizons['6m'].p50,
                  ]}
                />
              )
            })}
          </div>
        </div>
      </section>

      {/* Risk Table */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-heading mb-0">Predicted Fatalities (1, 3, 6‑month)</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Table shows next‑month predicted fatalities per entity and Δ MoM versus the previous forecast file.</p>
          <Collapsible title="table" initiallyCollapsed={false}>
            <RiskIndexTable rows={rows} />
          </Collapsible>
        </div>
      </section>

      {/* Distributions removed */}

      {/* Horizon Matrix removed */}
    </div>
  )
}
