import Link from 'next/link'
import dynamic from 'next/dynamic'
const PrioGridMap = dynamic(() => import('@/components/PrioGridMap'), { ssr: false })
import { readSnapshot, getAvailablePeriods } from '@/lib/forecasts'
import ApiLink from '@/components/ApiLink'
import fs from 'fs'
import path from 'path'

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
  const snap = readSnapshot('latest')
  const end = endPeriodFrom(snap.period) || snap.period
  // Determine latest available grid period present under public/data/grid
  let gridPeriod = snap.period
  try {
    const gridDir = path.join(process.cwd(), 'public', 'data', 'grid')
    const files = fs.readdirSync(gridDir)
    const periods = files
      .map((f) => {
        const m = f.match(/(\d{4}-\d{2})(?:\.geo\.json|\-m1\.json|\.csv)$/)
        return m ? m[1] : null
      })
      .filter((p): p is string => !!p)
      .sort()
    if (periods.length) gridPeriod = periods[periods.length - 1]
  } catch {}
  // Compute totals like the country page
  const periods = getAvailablePeriods()
  const currentIdx = periods.indexOf(snap.period)
  const prevPeriod = currentIdx > 0 ? periods[currentIdx - 1] : undefined
  const prevSnap = prevPeriod ? readSnapshot(prevPeriod) : undefined
  const total1mCurrent = snap.entities.reduce((s, e) => s + (e.horizons?.['1m']?.index ?? e.index), 0)
  const total1mPrev = prevSnap ? prevSnap.entities.reduce((s, e) => s + (e.horizons?.['1m']?.index ?? e.index), 0) : undefined
  const deltaTotal = total1mPrev !== undefined ? Number((total1mCurrent - total1mPrev).toFixed(1)) : undefined
  const countriesCovered = snap.entities.filter((e) => (e.entityType || 'country') === 'country').length
  // Total number of PRIO‑GRID 0.5° cells (pre‑computed): 720 x 360 = 259,200
  const GRID_TOTAL_CELLS = 259200
  // Build list of grid asset links (GeoJSON polygons + monthly points)
  const gridLinks = [
    { path: `/data/grid/${gridPeriod}-m1.csv`, label: `${gridPeriod}-m1.csv (month 1 points)` },
    { path: `/data/grid/${gridPeriod}-m2.csv`, label: `${gridPeriod}-m2.csv (month 2 points)` },
    { path: `/data/grid/${gridPeriod}-m3.csv`, label: `${gridPeriod}-m3.csv (month 3 points)` },
    { path: `/data/grid/${gridPeriod}-m4.csv`, label: `${gridPeriod}-m4.csv (month 4 points)` },
    { path: `/data/grid/${gridPeriod}-m5.csv`, label: `${gridPeriod}-m5.csv (month 5 points)` },
    { path: `/data/grid/${gridPeriod}-m6.csv`, label: `${gridPeriod}-m6.csv (month 6 points)` },
  ]
  const combinedCsv = { path: `/data/grid/${gridPeriod}.csv`, label: `${gridPeriod}.csv (all months as columns)` }
  return (
    <div>
      <section className="py-16 hero-background-network-image">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Monthly Forecasts</h1>
          <p className="text-gray-700 font-light mb-4">
            Forecasts for the period {snap.period} to {end}
            <span className="text-gray-400"> · </span>
            Updated: {formatDMY(snap.generatedAt)}
          </p>
          <div className="mb-5">
            <div className="inline-flex rounded-lg border border-clairient-blue overflow-hidden shadow-sm">
              <Link href="/forecasts" className="px-4 py-2 text-clairient-blue hover:bg-blue-50">Country-level forecasts</Link>
              <span className="px-4 py-2 bg-clairient-blue text-white">Grid-level forecasts</span>
            </div>
          </div>
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
              <div className="text-sm text-gray-500">Grid covered</div>
              <div className="text-3xl font-light text-gray-900">{GRID_TOTAL_CELLS.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <PrioGridMap period={snap.period} />

        {/* Downloads: Grid assets (polygons + monthly points) */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-light text-gray-900 mb-1">Download Grid Data</h3>
              <p className="text-xs text-gray-500 mb-3">Polygons and precomputed monthly centroid points for the current period.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                {gridLinks.map((l) => (
                  <li key={l.path}><ApiLink path={l.path} label={l.label} /></li>
                ))}
                <li className="mt-2 pt-2 border-t border-gray-100"><ApiLink path={combinedCsv.path} label={combinedCsv.label} /></li>
              </ul>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <h3 className="text-lg font-light text-gray-900 mb-2">Direct URLs</h3>
              <p className="text-xs text-gray-500 mb-2">Use these links in curl, scripts, or GIS tools.</p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li><ApiLink path={`/data/grid/${snap.period}.geo.json`} label={`${snap.period}.geo.json`} /></li>
                <li><ApiLink path={`/data/grid/${snap.period}-m1.json`} label={`${snap.period}-m1.json`} /></li>
                <li><ApiLink path={`/data/grid/${snap.period}-m2.json`} label={`${snap.period}-m2.json`} /></li>
                <li><ApiLink path={`/data/grid/${snap.period}-m3.json`} label={`${snap.period}-m3.json`} /></li>
                <li><ApiLink path={`/data/grid/${snap.period}-m4.json`} label={`${snap.period}-m4.json`} /></li>
                <li><ApiLink path={`/data/grid/${snap.period}-m5.json`} label={`${snap.period}-m5.json`} /></li>
                <li><ApiLink path={`/data/grid/${snap.period}-m6.json`} label={`${snap.period}-m6.json`} /></li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">Example: <code>curl -L [URL] -o file.json</code></p>
            </div>
          </div>
          <div className="lg:col-span-2" />
        </div>
      </div>
    </div>
  )
}
