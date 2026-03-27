import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import fs from 'fs'
import path from 'path'
import MultiFileDownloader from '@/components/MultiFileDownloader'

const GITHUB_BASE = 'https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main'

function latestPeriod(): string | null {
  try {
    const p = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest', 'metadata.json')
    const j = JSON.parse(fs.readFileSync(p, 'utf-8'))
    return j?.forecast_start_date || j?.data_end_date || null
  } catch { return null }
}

function listArchive(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'data', 'forecasts', 'archive')
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory() && /^\d{4}-\d{2}$/.test(d.name))
      .map(d => d.name)
      .sort()
      .reverse()
  } catch { return [] }
}



export default function DataApiPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]">
          <Breadcrumbs />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Data API Access
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed mb-4">
            Programmatic access to <span className="word-emphasis">PACE forecast data</span> via stable,
            scrapable URLs. Updated automatically on the 1st of each month.
          </p>
          <p className="text-sm text-gray-500 font-light">
            These URLs remain constant - only the data updates monthly.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-sm text-gray-700">
            <div className="font-medium text-gray-900 mb-2">Contents</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="#overview" className="text-link">Overview</Link>
              <Link href="#latest" className="text-link">Latest Endpoints</Link>
              <Link href="#archive" className="text-link">Archive</Link>
              <Link href="#grid" className="text-link">Grid API</Link>
              <Link href="#formats" className="text-link">Formats</Link>
              <Link href="#usage" className="text-link">Usage</Link>
              <Link href="#support" className="text-link">Support</Link>
            </div>
          </div>

          <div id="overview" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Overview & Base URLs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <div className="font-medium text-gray-800 mb-1">Website (public)</div>
                <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">{`${SITE_BASE.replace(/\/$/, '')}/data/forecasts/latest/forecasts_h6.csv
${SITE_BASE.replace(/\/$/, '')}/data/forecasts/latest/forecasts_h12.csv
${SITE_BASE.replace(/\/$/, '')}/data/forecasts/latest/metadata.json
${SITE_BASE.replace(/\/$/, '')}/api/v1/grid/{period}/points-m{1..6}.json`}</pre>
              </div>
              <div>
                <div className="font-medium text-gray-800 mb-1">GitHub raw (fallback)</div>
                <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">{`${GITHUB_BASE}/forecasts_h6.csv
${GITHUB_BASE}/forecasts_h12.csv
${GITHUB_BASE}/Hist.csv
${GITHUB_BASE}/forecast_metadata.json`}</pre>
              </div>
            </div>
          </div>

          <div id="latest" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Latest Endpoints</h2>
            {(() => {
              const latest = latestPeriod()
              return (
                <div className="text-xs space-y-3">
                  <div>
                    <div className="font-medium text-gray-800">Country forecasts (CSV)</div>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">{`${SITE_BASE.replace(/\/$/, '')}/data/forecasts/latest/forecasts_h6.csv
${SITE_BASE.replace(/\/$/, '')}/data/forecasts/latest/forecasts_h12.csv
${SITE_BASE.replace(/\/$/, '')}/data/forecasts/latest/metadata.json`}</pre>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Grid API (JSON)</div>
                    <pre className="bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">{`${SITE_BASE.replace(/\/$/, '')}/api/v1/grid/${latest || '{period}'}/points-m1.json
${SITE_BASE.replace(/\/$/, '')}/api/v1/grid/${latest || '{period}'}/points-m2.json
... m3 .. m6`}</pre>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Archive */}
          <div id="archive" className="mb-12 border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Archive</h2>
            {(() => {
              const periods = listArchive()
              const hasFile = (period: string, file: string) => {
                try { return fs.existsSync(path.join(process.cwd(), 'public', 'data', 'forecasts', 'archive', period, file)) } catch { return false }
              }
              return (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded p-4">
                    {periods.length ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-2">Period</th>
                            <th className="py-2">Bundle</th>
                            <th className="py-2">Hist.csv</th>
                            <th className="py-2">metadata.json</th>
                            <th className="py-2">h6 files</th>
                            <th className="py-2">h12 files</th>
                          </tr>
                        </thead>
                        <tbody>
                          {periods.map(p => (
                            <tr key={p} className="border-t border-gray-100 align-top">
                              <td className="py-2 font-mono">{p}</td>
                              <td className="py-2"><Link href={`/data/forecasts/archive/${p}/forecasts-${p}.zip`} className="text-link">forecasts-{p}.zip</Link></td>
                              <td className="py-2"><Link href={`/data/forecasts/archive/${p}/Hist.csv`} className="text-link">Hist.csv</Link></td>
                              <td className="py-2"><Link href={`/data/forecasts/archive/${p}/metadata.json`} className="text-link">metadata.json</Link></td>
                              <td className="py-2">
                                <div className="flex flex-wrap gap-2">
                                  {hasFile(p, 'forecasts_h6.csv') && (<Link href={`/data/forecasts/archive/${p}/forecasts_h6.csv`} className="text-link">mean</Link>)}
                                  {hasFile(p, 'forecasts_h6_min.csv') && (<Link href={`/data/forecasts/archive/${p}/forecasts_h6_min.csv`} className="text-link">min</Link>)}
                                  {hasFile(p, 'forecasts_h6_max.csv') && (<Link href={`/data/forecasts/archive/${p}/forecasts_h6_max.csv`} className="text-link">max</Link>)}
                                  {!hasFile(p, 'forecasts_h6.csv') && (<span className="text-gray-400">n/a</span>)}
                                </div>
                              </td>
                              <td className="py-2">
                                <div className="flex flex-wrap gap-2">
                                  {hasFile(p, 'forecasts_h12.csv') && (<Link href={`/data/forecasts/archive/${p}/forecasts_h12.csv`} className="text-link">mean</Link>)}
                                  {hasFile(p, 'forecasts_h12_min.csv') && (<Link href={`/data/forecasts/archive/${p}/forecasts_h12_min.csv`} className="text-link">min</Link>)}
                                  {hasFile(p, 'forecasts_h12_max.csv') && (<Link href={`/data/forecasts/archive/${p}/forecasts_h12_max.csv`} className="text-link">max</Link>)}
                                  {!hasFile(p, 'forecasts_h12.csv') && (<span className="text-gray-400">n/a</span>)}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-xs text-gray-600">No archive found.</div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Update Schedule */}
          <div className="mb-12 border border-blue-200 bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-light text-gray-900 mb-3">📅 Update Schedule</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="font-medium mr-2">Forecast Generation:</span>
                <span>24th and 1st at 01:00 UTC</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">Data Available:</span>
                <span>After website refresh by 03:00 UTC (24th and 1st)</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">URL Stability:</span>
                <span>URLs never change, only content updates</span>
              </div>
              
            </div>
      </div>

      {/* Simplified endpoints presented above. Advanced/raw links are below. */}

          {/* Archive Pattern */}
          <div className="mt-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Archive Pattern</h2>
            <p className="text-sm text-gray-700 mb-2">
              Monthly archives (site-hosted) are available by forecast period (YYYY-MM):
            </p>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/forecasts_h12.csv
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/forecasts_h12_min.csv
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/forecasts_h12_max.csv
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/forecasts_h6.csv
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/forecasts_h6_min.csv
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/forecasts_h6_max.csv
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/Hist.csv
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/metadata.json
https://conflictlab.github.io/data/forecasts/archive/YYYY-MM/forecasts-YYYY-MM.zip`}
            </pre>
          </div>

          {/* Metadata Format */}
          <div id="formats" className="mt-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Metadata Format</h2>
            <p className="text-sm text-gray-700 mb-4">
              The <code className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-xs">forecast_metadata.json</code> file contains:
            </p>
            <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{`{
  "run_date": "2026-03-01T01:15:43.123456",
  "data_end_date": "2026-02",
  "forecast_start_date": "2026-03",
  "h6_end_date": "2026-08",
  "h12_end_date": "2027-02",
  "training_window_months": 24,
  "historical_start_date": "1989-01",
  "historical_end_date": "2026-02",
  "total_historical_months": 445
}`}
            </pre>
          </div>

          {/* Data Format & Structure */}
          <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Data Format</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                <p className="font-medium text-gray-900 mb-2">📅 Understanding Forecast Periods</p>
                <p className="text-gray-700 mb-2">
                  Check <code className="px-1 py-0.5 bg-white border border-gray-300 rounded text-xs">forecast_metadata.json</code> to see exactly what months are being forecast:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600 text-xs">
                  <li><code>data_end_date</code>: Last month of historical data used (e.g., "2026-02")</li>
                  <li><code>forecast_start_date</code>: First month being forecast (e.g., "2026-03")</li>
                  <li><code>h6_end_date</code> / <code>h12_end_date</code>: Final forecast month</li>
                </ul>
              </div>

              <div>
                <p className="font-medium mb-1">Forecast CSVs (forecasts_h6.csv, forecasts_h12.csv):</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li><strong>Rows:</strong> Numbered 0 through 5 (h=6) or 0 through 11 (h=12)</li>
                  <li><strong>Row 0 =</strong> First forecast month (see <code>forecast_start_date</code> in metadata)</li>
                  <li><strong>Row 1 =</strong> Second forecast month, etc.</li>
                  <li><strong>Columns:</strong> Countries (e.g., "Afghanistan", "Algeria", etc.)</li>
                  <li><strong>Values:</strong> Predicted fatalities for that month</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Example:</strong> If <code>forecast_start_date</code> is "2026-03", then row 0 = March 2026, row 1 = April 2026, etc.
                </p>
              </div>
              <div>
                <p className="font-medium mb-1">Historical CSV (Hist.csv):</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li><strong>Rows:</strong> All available months from UCDP data (1989-01-31 onwards)</li>
                  <li><strong>First column:</strong> Date index (YYYY-MM-DD format)</li>
                  <li><strong>Other columns:</strong> Countries</li>
                  <li><strong>Values:</strong> Observed fatalities for that month</li>
                  <li><strong>Coverage:</strong> From 1989 through <code>data_end_date</code> (see metadata)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Grid-level Forecasts */}
          {(() => {
            // Detect latest available grid period from public assets
            let gridPeriod: string | null = null
            try {
              const gridDir = path.join(process.cwd(), 'public', 'data', 'grid')
              const files = fs.readdirSync(gridDir)
              const periods = files
                .map((f) => {
                  const m = f.match(/(\d{4}-\d{2})(?:\.geo\.json|\-m[1-6]\.json|\-m[1-6]\.csv|\.csv)$/)
                  return m ? m[1] : null
                })
                .filter((p): p is string => !!p)
                .sort()
              if (periods.length) gridPeriod = periods[periods.length - 1]
            } catch {}

            if (!gridPeriod) return null

            const gridCsvItems = [
              { path: `/data/grid/${gridPeriod}-m1.csv`, label: `${gridPeriod}-m1.csv (month 1 points)` },
              { path: `/data/grid/${gridPeriod}-m2.csv`, label: `${gridPeriod}-m2.csv (month 2 points)` },
              { path: `/data/grid/${gridPeriod}-m3.csv`, label: `${gridPeriod}-m3.csv (month 3 points)` },
              { path: `/data/grid/${gridPeriod}-m4.csv`, label: `${gridPeriod}-m4.csv (month 4 points)` },
              { path: `/data/grid/${gridPeriod}-m5.csv`, label: `${gridPeriod}-m5.csv (month 5 points)` },
              { path: `/data/grid/${gridPeriod}-m6.csv`, label: `${gridPeriod}-m6.csv (month 6 points)` },
              { path: `/data/grid/${gridPeriod}.csv`, label: `${gridPeriod}.csv (all months as columns)` },
            ]
            const gridGeoJsonItems = [
              { path: `/data/grid/${gridPeriod}.geo.json`, label: `${gridPeriod}.geo.json (polygons)` },
              { path: `/data/grid/${gridPeriod}-m1.json`, label: `${gridPeriod}-m1.json (month 1 points)` },
              { path: `/data/grid/${gridPeriod}-m2.json`, label: `${gridPeriod}-m2.json (month 2 points)` },
              { path: `/data/grid/${gridPeriod}-m3.json`, label: `${gridPeriod}-m3.json (month 3 points)` },
              { path: `/data/grid/${gridPeriod}-m4.json`, label: `${gridPeriod}-m4.json (month 4 points)` },
              { path: `/data/grid/${gridPeriod}-m5.json`, label: `${gridPeriod}-m5.json (month 5 points)` },
              { path: `/data/grid/${gridPeriod}-m6.json`, label: `${gridPeriod}-m6.json (month 6 points)` },
              { path: `/data/grid/centroids.csv`, label: `centroids.csv (Sub‑national Area centers)` },
            ]

            return (
              <div id="grid" className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-xl font-light text-gray-900 mb-3">Grid‑level Forecasts (PRIO‑GRID)</h2>
                <p className="text-sm text-gray-700 mb-4">
                  Latest grid period: <span className="font-mono">{gridPeriod}</span>. Downloads below are static files; programmatic access to grid JSON is also available under <span className="font-mono">/api/v1/grid/{gridPeriod}/points-mX.json</span>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg font-light text-gray-900 mb-2">CSV Assets</h3>
                    <MultiFileDownloader items={gridCsvItems} zipName={`PaCE-grid-${gridPeriod}-csv`} />
                    <div className="mt-3 text-xs text-gray-600">
                      <div className="font-medium text-gray-700 mb-1">Format</div>
                      <div>- Monthly points CSVs: <span className="font-mono">lat,lon,v</span></div>
                      <div>- Combined CSV: <span className="font-mono">lat,lon,m1..m6</span></div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg font-light text-gray-900 mb-2">GeoJSON / Points</h3>
                    <MultiFileDownloader items={gridGeoJsonItems} zipName={`PaCE-grid-${gridPeriod}-json`} />
                    <div className="mt-3 text-xs text-gray-600">
                      <div className="font-medium text-gray-700 mb-1">API (static JSON)</div>
                      <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">{`/api/v1/grid/${gridPeriod}/points-m1.json
/api/v1/grid/${gridPeriod}/points-m2.json
/api/v1/grid/${gridPeriod}/points-m3.json
/api/v1/grid/${gridPeriod}/points-m4.json
/api/v1/grid/${gridPeriod}/points-m5.json
/api/v1/grid/${gridPeriod}/points-m6.json`}</pre>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* How to Cite */}
          <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">How to Cite</h2>
            <p className="text-sm text-gray-700 mb-4">
              If you use these data or figures, please cite:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
              <p className="text-sm font-medium text-gray-900">
                Schincariol, T., Frank, H., &amp; Chadefaux, T. (2025). Accounting for variability in conflict dynamics: A pattern-based predictive model.
                <em> Journal of Peace Research</em>.{' '}
                <a
                  href="https://journals.sagepub.com/doi/10.1177/00223433251330790"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  https://doi.org/10.1177/00223433251330790
                </a>
              </p>
            </div>
            <p className="text-xs text-gray-600">
              See <Link href="/downloads#cite" className="text-link">full citation guidelines</Link> for additional details.
            </p>
          </div>

          {/* Usage Terms */}
          <div id="usage" className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Usage Terms</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <span className="font-medium">License:</span> <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-link">CC BY-NC 4.0</a> (Attribution-NonCommercial)
              </p>
              <p>
                <span className="font-medium">Commercial Use:</span> For commercial use, please <Link href="/contact" className="text-link">contact us</Link>.
              </p>
              <p>
                <span className="font-medium">Rate Limiting:</span> Please cache responses and avoid excessive requests.
                Data only updates monthly - fetching more frequently is unnecessary.
              </p>
            </div>
          </div>

          {/* Support & Questions */}
          <div id="support" className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Support & Questions</h2>
            <p className="text-sm text-gray-700 mb-4">
              For technical questions, data issues, or feature requests:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors text-center"
              >
                Contact Us
              </Link>
              <a
                href="https://github.com/conflictlab/Pace-map-risk/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded transition-colors text-center"
              >
                Report Issue on GitHub
              </a>
            </div>
          </div>

          {/* Related Pages */}
          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">See also:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/downloads" className="text-link">Interactive Downloads</Link>
              <span className="text-gray-400">·</span>
              <Link href="/forecasts" className="text-link">Forecast Dashboard</Link>
              <span className="text-gray-400">·</span>
              <Link href="/methodology" className="text-link">Methodology</Link>
              <span className="text-gray-400">·</span>
              <Link href="/faq" className="text-link">FAQ</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
