import dynamic from 'next/dynamic'
import type { Metadata } from 'next'
const PrioGridMap = dynamic(() => import('@/components/PrioGridMap'), { ssr: false })
import { getForecastsPageData } from '@/lib/forecasts'
import Breadcrumbs from '@/components/Breadcrumbs'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
// Inline download cards removed; use /data page via map button

export const metadata: Metadata = {
  title: 'Forecast Dashboard — Sub‑national Areas',
  description: 'Six‑month, sub‑national forecasts of conflict fatalities with month‑over‑month changes and hotspots.',
  alternates: { canonical: '/forecasts-grid' },
}

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
      {/* Hero */}
      <section className="pt-6 pb-6 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight">Forecasts</h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed mb-4 max-w-3xl">
            Six‑month forecasts of conflict fatalities at the country and sub‑national level.
          </p>
          <p className="text-xs text-gray-500"><Link href="/acknowledgements" className="text-link">Acknowledgements</Link></p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/forecasts#dashboard" className="btn-secondary inline-flex items-center gap-1">Dashboard</Link>
            <Link href="/reports" className="btn-secondary inline-flex items-center gap-1">Reports</Link>
            <Link href="/downloads" className="btn-secondary inline-flex items-center gap-1">Downloads</Link>
          </div>
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
