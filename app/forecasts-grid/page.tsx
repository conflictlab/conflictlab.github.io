import dynamic from 'next/dynamic'
const PrioGridMap = dynamic(() => import('@/components/PrioGridMap'), { ssr: false })
import { getForecastsPageData } from '@/lib/forecasts'
import { AlertTriangle } from 'lucide-react'
// Inline download cards removed; use /data page via map button

function endPeriodFrom(start: string): string | null {
  const parts = start.split('-')
  if (parts.length !== 2) return null
  const y = Number(parts[0])
  const m = Number(parts[1])
  if (!Number.isFinite(y) || !Number.isFinite(m)) return null
  const d = new Date(Date.UTC(y, (m - 1), 1))
  d.setUTCMonth(d.getUTCMonth() + 5)
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

export default async function ForecastsGridPage() {
  const { snapshot: snap, summaryStats, keyTakeaways } = await getForecastsPageData()
  const end = endPeriodFrom(snap.period) || snap.period
  const { total1mCurrent, deltaTotal } = summaryStats
  // Total number of PRIO‑GRID 0.5° cells (pre‑computed): 720 x 360 = 259,200
  const GRID_TOTAL_CELLS = 259200
  // Removed inline grid download list in favor of centralized data page
  return (
    <div>
      {/* Shared hero banner with Forecasts page */}
      <section className="pt-6 pb-6 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight flex items-center gap-2">
            Forecast Dashboard
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed mb-6">
            Six-month forecasts of <span className="word-emphasis">conflict fatalities</span> from state-based armed conflict.
            Predictions are updated monthly for countries and <span title="0.5° map squares (~55 km)">Sub‑national Areas</span> worldwide.
          </p>
          {/* Key Takeaways (same placement and style as country dashboard) */}
          {(() => {
            const [year, month] = snap.period.split('-').map(Number)
            const forecastDate = new Date(year, month)
            const forecastMonth = forecastDate.toLocaleString('default', { month: 'long' })
            const forecastYear = forecastDate.getFullYear()
            const takeawaysDate = `${forecastMonth} ${forecastYear}`
            return (
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
            )
          })()}
        </div>
      </section>

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <PrioGridMap period={snap.period} />
      </div>

      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">Monthly Conflict Forecasts</h1>
          <p className="text-gray-700 font-light mb-4">
            Forecasts for the period {snap.period} to {end}
            <span className="text-gray-400"> · </span>
            Updated: {formatDMY(snap.generatedAt)}
          </p>
          {/* Removed secondary view toggle below the map */}
          <p className="text-gray-600 text-sm mb-4">All values represent predicted fatalities over the next 6 months. The table shows 1‑month predictions and the change from the previous forecast.</p>
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
              <div className="text-sm text-gray-500"><span title="0.5° map squares (~55 km)">Sub‑national Areas</span> covered</div>
              <div className="text-3xl font-light text-gray-900">{GRID_TOTAL_CELLS.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Inline download cards removed; use the centered Data button under the map */}
    </div>
  )
}
