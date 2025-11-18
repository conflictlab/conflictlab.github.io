import Link from 'next/link'
import fs from 'fs'
import path from 'path'
import { readSnapshot, getAvailablePeriods } from '@/lib/forecasts'
import RawCsvDownloader from '@/components/RawCsvDownloader'
import MultiFileDownloader from '@/components/MultiFileDownloader'

function formatDMY(iso: string): string {
  const dt = new Date(iso)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

export default async function DataPage() {
  const snapshot = readSnapshot('latest')

  // Country-level: list recent raw CSVs (if present in content/forecasts/csv)
  const allPeriods = getAvailablePeriods()
  const recent = allPeriods.slice(-12).reverse()
  const rawDir = path.join(process.cwd(), 'content', 'forecasts', 'csv')
  const countryDownloads = recent.map((p) => ({
    period: p,
    hasRaw: fs.existsSync(path.join(rawDir, `${p}.csv`)),
  }))

  // Grid-level: detect latest grid period available in public/data/grid
  let gridPeriod = snapshot.period
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

  const gridCsvLinks = [
    { path: `/data/grid/${gridPeriod}-m1.csv`, label: `${gridPeriod}-m1.csv (month 1 points)` },
    { path: `/data/grid/${gridPeriod}-m2.csv`, label: `${gridPeriod}-m2.csv (month 2 points)` },
    { path: `/data/grid/${gridPeriod}-m3.csv`, label: `${gridPeriod}-m3.csv (month 3 points)` },
    { path: `/data/grid/${gridPeriod}-m4.csv`, label: `${gridPeriod}-m4.csv (month 4 points)` },
    { path: `/data/grid/${gridPeriod}-m5.csv`, label: `${gridPeriod}-m5.csv (month 5 points)` },
    { path: `/data/grid/${gridPeriod}-m6.csv`, label: `${gridPeriod}-m6.csv (month 6 points)` },
  ]
  const gridCombinedCsv = { path: `/data/grid/${gridPeriod}.csv`, label: `${gridPeriod}.csv (all months as columns)` }
  const gridGeoJsonLinks = [
    { path: `/data/grid/${gridPeriod}.geo.json`, label: `${gridPeriod}.geo.json (polygons)` },
    { path: `/data/grid/${gridPeriod}-m1.json`, label: `${gridPeriod}-m1.json (month 1 points)` },
    { path: `/data/grid/${gridPeriod}-m2.json`, label: `${gridPeriod}-m2.json (month 2 points)` },
    { path: `/data/grid/${gridPeriod}-m3.json`, label: `${gridPeriod}-m3.json (month 3 points)` },
    { path: `/data/grid/${gridPeriod}-m4.json`, label: `${gridPeriod}-m4.json (month 4 points)` },
    { path: `/data/grid/${gridPeriod}-m5.json`, label: `${gridPeriod}-m5.json (month 5 points)` },
    { path: `/data/grid/${gridPeriod}-m6.json`, label: `${gridPeriod}-m6.json (month 6 points)` },
    { path: `/data/grid/centroids.csv`, label: `centroids.csv (grid cell centers)` },
  ]

  return (
    <div>
      <section className="py-0 hero-background-network-image" />

      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2">Data Downloads</h1>
          <p className="text-gray-700 font-light mb-6">
            Latest update: {formatDMY(snapshot.generatedAt)}
          </p>

          {/* Data Rights & Use (CC BY-NC 4.0) */}
          <div className="mb-8 border border-gray-200 rounded-lg p-4 bg-white">
            <h2 className="text-lg font-light text-gray-900 mb-1">Data Rights &amp; Use</h2>
            <p className="text-sm text-gray-700 mb-2">
              Unless stated otherwise, datasets on this page are licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-link">CC BY‑NC 4.0</a> (Attribution‑NonCommercial).
              You may share and adapt for non‑commercial use with attribution. For commercial use, please <Link href="/contact" className="text-link">contact us</Link>.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Attribution example:</span>
                <code className="ml-2 px-1 py-0.5 bg-gray-50 border border-gray-200 rounded">Luscint (2025). Monthly Conflict Forecasts. https://luscint.com/data</code>
              </div>
              <div><span className="font-medium">Disclaimer:</span> Provided “as is”, without warranty; not for safety‑critical decisions.</div>
              <div><span className="font-medium">Acceptable use:</span> Do not use to target, harass, or cause harm; comply with applicable laws.</div>
            </div>
          </div>

          {/* Country-level and Grid-level (equal width) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-white h-full min-h-[420px] flex flex-col">
                <h2 className="text-xl font-light text-gray-900 mb-1">Country-level Forecasts (CSV)</h2>
                <p className="text-xs text-gray-500 mb-3">Six‑month‑ahead predictions made in each month.</p>
                {countryDownloads.some(d => d.hasRaw) && (
                  <div>
                    <div className="text-sm text-gray-700 mb-1">Bulk download (recent periods)</div>
                    <RawCsvDownloader items={countryDownloads.filter(d => d.hasRaw).map(d => ({ period: d.period }))} />
                  </div>
                )}
              </div>
            </div>

            {/* Grid-level */}
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4 bg-white h-full min-h-[420px] flex flex-col">
                <h2 className="text-xl font-light text-gray-900 mb-1">Grid-level Forecasts</h2>
                <p className="text-xs text-gray-500 mb-3">Pre‑computed monthly centroid points and GeoJSON polygons for PRIO‑GRID 0.5° cells.</p>
                <div className="mb-4">
                  <div className="text-sm text-gray-700 mb-1">Bulk download (latest period assets)</div>
                  <MultiFileDownloader
                    zipName={`Luscint-grid-${gridPeriod}`}
                    items={[
                      ...gridCsvLinks.map(l => ({ path: l.path, label: l.label })),
                      gridCombinedCsv,
                      ...gridGeoJsonLinks,
                    ]}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick links to forecast pages */}
          <div className="mt-10 text-sm text-gray-600">
            <span className="mr-2">See also:</span>
            <Link href="/forecasts" className="text-link">Country-level forecasts</Link>
            <span className="mx-2">·</span>
            <Link href="/forecasts-grid" className="text-link">Grid-level forecasts</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
