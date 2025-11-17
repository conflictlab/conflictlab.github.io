import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { readSnapshot, getEntitySeries, getAvailablePeriods } from '@/lib/forecasts'
import RiskIndexTable from '@/components/RiskIndexTable'
import Collapsible from '@/components/Collapsible'
import TopMovers from '@/components/TopMovers'
import ForecastFanChart from '@/components/ForecastFanChart'
import { getEntityHorizonMonths } from '@/lib/forecasts'
import RawCsvDownloader from '@/components/RawCsvDownloader'
import ReleaseNotes from '@/components/ReleaseNotes'
import ApiLink from '@/components/ApiLink'
import dynamic from 'next/dynamic'
const CountryScenarioPanel = dynamic(() => import('@/components/CountryScenarioPanel'), { ssr: false })

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

  // Pick top 3 movers by absolute MoM change for plots
  const highlights = [...snapshot.entities]
    .map((e) => {
      const prev = prevIndexMap.get(e.id) ?? prevIndexMap.get(e.iso3 || '') ?? prevIndexMap.get((e.name || '').toUpperCase())
      const deltaMoM = prev !== undefined ? Math.abs(Number((e.horizons['1m'].index - prev).toFixed(1))) : 0
      return { e, deltaMoM }
    })
    .sort((a, b) => b.deltaMoM - a.deltaMoM)
    .slice(0, 3)
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
  
  // Build list of downloadable CSVs (latest + recent periods)
  const allPeriods = getAvailablePeriods()
  const recent = allPeriods.slice(-12).reverse()
  const rawDir = path.join(process.cwd(), 'content', 'forecasts', 'csv')
  const downloads = recent.map((p) => ({
    period: p,
    hasRaw: fs.existsSync(path.join(rawDir, `${p}.csv`)),
  }))

  return (
    <div>
      {/* Hero summary */}
      <section className="py-16 hero-background-network-image">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Monthly Forecasts</h1>
          <p className="text-gray-700 font-light mb-2">
            Forecasts for the period {snapshot.period} to {endPeriodFrom(snapshot.period) || snapshot.period}
            <span className="text-gray-400"> · </span>
            Updated: {formatDMY(snapshot.generatedAt)}
          </p>
          <div className="mb-5">
          <div className="inline-flex rounded-lg border border-clairient-blue overflow-hidden shadow-sm">
            <span className="px-4 py-2 bg-clairient-blue text-white">Country-level forecasts</span>
            <Link href="/forecasts-grid" className="px-4 py-2 text-clairient-blue hover:bg-blue-50">Grid-level forecasts</Link>
          </div>
          </div>
          <p className="text-gray-600 text-sm mb-6">All values represent predicted fatalities over the next 6 months. The table shows 1‑month predictions and the change from the previous forecast.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Total predicted fatalities (1‑month)</div>
              <div className="text-3xl font-light text-gray-900">{Math.round(total1mCurrent)}</div>
              <div className="text-xs text-gray-500 mt-1">Sum of next‑month predictions across all countries</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Δ total vs previous month</div>
              <div className={`text-3xl font-light ${deltaTotal !== undefined ? (deltaTotal >= 0 ? 'text-emerald-700' : 'text-rose-700') : 'text-gray-900'}`}>
                {deltaTotal !== undefined ? (deltaTotal >= 0 ? `+${Math.round(deltaTotal)}` : `${Math.round(deltaTotal)}`) : '—'}
              </div>
              <div className="text-xs text-gray-500 mt-1">Change in total 1‑month predicted fatalities</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500">Countries covered</div>
              <div className="text-3xl font-light text-gray-900">{countriesCovered}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Country Choropleth + Scenario panel */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <CountryScenarioPanel items={countryMapItems} />
        </div>
      </section>

      {/* Movers + Highlights with left sidebar (CSV/API) */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left sidebar */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="text-lg font-light text-gray-900 mb-1">Download Raw CSVs</h3>
                <p className="text-xs text-gray-500 mb-3">Six‑month‑ahead predictions made in the selected month (original files)</p>
                <RawCsvDownloader items={downloads.filter(d => d.hasRaw).map(d => ({ period: d.period }))} />
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-white">
                <h3 className="text-lg font-light text-gray-900 mb-2">Direct URLs</h3>
                <p className="text-xs text-gray-500 mb-2">Use these links in curl, Excel, Google Sheets, or Power BI.</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li><ApiLink path="/data/csv/latest.csv" label="latest.csv" /></li>
                  <li><ApiLink path={`/data/csv/${snapshot.period}.csv`} label={`${snapshot.period}.csv`} /></li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Example: <code>curl -L [URL] -o file.csv</code></p>
              </div>
              {snapshot.releaseNotes && snapshot.releaseNotes.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <ReleaseNotes notes={snapshot.releaseNotes} />
                </div>
              )}
            </div>

            {/* Right grid: Top movers + 3 plots (2x2) */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopMovers movers={movers} height={240} />
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

      {/* Horizon Matrix removed */}
    </div>
  )
}
