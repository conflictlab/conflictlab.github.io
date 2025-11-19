import SummaryCard from '@/components/SummaryCard'
import { getForecastsPageData, getEntityHorizonMonths } from '@/lib/forecasts'
import RiskIndexTable from '@/components/RiskIndexTable'
import Collapsible from '@/components/Collapsible'
import ThresholdHighlights from '@/components/ThresholdHighlights'
import dynamic from 'next/dynamic'
import FallbackCountryList from '@/components/FallbackCountryList'
import Link from 'next/link'
const ForecastFanChart = dynamic(() => import('@/components/ForecastFanChart'), { ssr: false })
import { AlertTriangle, Info } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Forecast Dashboard — PaCE',
  description: 'Six-month, country-level forecasts of conflict fatalities with month-over-month changes and hotspots.',
}

const CountryChoropleth = dynamic(() => import('@/components/CountryChoropleth'), { ssr: false })
import LazyVisible from '@/components/LazyVisible'

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
  const {
    snapshot,
    summaryStats,
    rows,
    countryMapItems,
    highlights,
    movers,
    keyTakeaways,
  } = await getForecastsPageData()

  const {
    total1mCurrent,
    deltaTotal,
    countriesCovered,
    highByThresholdCount,
    deltaHigh,
    HIGH_THRESHOLD,
  } = summaryStats

  const [year, month] = snapshot.period.split('-').map(Number);
  const forecastDate = new Date(year, month); // month is 1-based, becomes month+1
  const forecastMonth = forecastDate.toLocaleString('default', { month: 'long' });
  const forecastYear = forecastDate.getFullYear();
  const takeawaysDate = `${forecastMonth} ${forecastYear}`;

  return (
    <div className="bg-gray-50">
      {/* Hero summary */}
      <section className="pt-6 pb-6 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight flex items-center gap-2">
            Forecast Dashboard
            <span title="Predicted fatalities from state-based armed conflict; includes 1-, 3-, and 6‑month horizons with uncertainty."><Info className="text-gray-400" size={20} /></span>
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed mb-6">
            Six-month forecasts of <span className="word-emphasis">conflict fatalities</span> from state-based armed conflict.
            Predictions are updated monthly for countries and <span title="0.5° map squares (~55 km)">Sub‑national Areas</span> worldwide.
          </p>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
                { '@type': 'ListItem', position: 2, name: 'Forecasts', item: '/forecasts' },
              ],
            }) }}
          />

          <div className="bg-white rounded-lg p-4 mt-4 border border-gray-200">
            <div className="flex items-start">
              <div className="w-1/3 pr-4 border-r border-gray-300">
                <h3 className="text-lg font-semibold text-gray-800">Key Takeaways for {takeawaysDate}</h3>
              </div>
              <div className="w-2/3 pl-4">
                <ul className="space-y-1">
                  {keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-600">
                      <AlertTriangle className="w-4 h-4 text-pace-red mr-2 mt-1 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Country Choropleth (full-bleed) */}
      <section className="py-0">
        {/* Full-width (bleed) wrapper */}
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <LazyVisible minHeight="300px">
            <CountryChoropleth items={countryMapItems} />
          </LazyVisible>
        </div>
        {/* Summary cards below the map, constrained */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-6">
            <p className="text-gray-700 font-normal mb-3">
              Forecast period: {snapshot.period} to {endPeriodFrom(snapshot.period) || snapshot.period}
              <span className="text-gray-700"> · </span>
              Updated: {formatDMY(snapshot.generatedAt)}
            </p>
            <p className="text-gray-700 text-sm">All values represent predicted <span className="font-medium text-gray-900">conflict fatalities</span> (deaths from state-based armed conflict) over the next 6 months. The table shows 1‑month ahead predictions and month-over-month changes.</p>
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              title="Total predicted fatalities (1‑month)"
              value={Math.round(total1mCurrent)}
              subtitle="Sum of next‑month predictions across all countries"
              delta={deltaTotal}
              deltaLabel="Δ total vs previous month"
            />
            <SummaryCard
              title={`High‑risk countries (>${HIGH_THRESHOLD} next month)`}
              value={`${highByThresholdCount} (${countriesCovered > 0 ? Math.round((highByThresholdCount / countriesCovered) * 100) : 0}%)`}
              delta={deltaHigh}
              deltaLabel="Δ vs last month"
            />
            <ThresholdHighlights rows={rows as any} threshold={HIGH_THRESHOLD} />
          </div>
        </div>
      </section>

      {/* Non-map fallback list */}
      <FallbackCountryList
        movers={movers as any}
        rows={rows.map(r => ({ id: r.id, name: r.name, pred1m: r.pred1m })) as any}
      />

      {/* Movers + Highlights (3-column layout) */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {highlights.map((e) => {
              const months = getEntityHorizonMonths(snapshot.period, e.name)
              return (
                <LazyVisible key={e.id} minHeight="200px">
                  <Link href={`/forecasts/${e.id}`} className="block hover:opacity-80 transition-opacity">
                    <ForecastFanChart
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
                  </Link>
                </LazyVisible>
              )
            })}
          </div>
        </div>
      </section>

      {/* Risk Table */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-heading text-gray-900 mb-0">Predicted Fatalities (1, 3, 6‑month)</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">Table shows next‑month predicted fatalities per entity and Δ MoM versus the previous forecast file.</p>
          <Collapsible title="table" initiallyCollapsed={false}>
            <RiskIndexTable rows={rows} />
          </Collapsible>
        </div>
      </section>
    </div>
  )
}
