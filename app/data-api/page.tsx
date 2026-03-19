import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import fs from 'fs'
import path from 'path'

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

          {/* Simple Downloads */}
          <div className="mb-12 border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Latest & Archive</h2>
            {(() => {
              const latest = latestPeriod()
              const periods = listArchive()
              return (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded p-4">
                    <h3 className="text-lg font-light text-gray-900 mb-2">Latest bundle</h3>
                    <p className="text-sm text-gray-700 mb-3">Predictions (h6 + h12, mean/min/max) + Hist.csv + metadata.json</p>
                    {latest ? (
                      <div className="flex items-center gap-3">
                        <Link href={`/data/forecasts/archive/${latest}/forecasts-${latest}.zip`} className="btn-secondary">Download forecasts-{latest}.zip</Link>
                        <Link href={`/data/forecasts/latest/Hist.csv`} className="text-xs underline">Hist.csv</Link>
                        <Link href={`/data/forecasts/latest/metadata.json`} className="text-xs underline">metadata.json</Link>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-600">No latest bundle available yet.</div>
                    )}
                  </div>
                  <div className="bg-white border border-gray-200 rounded p-4">
                    <h3 className="text-lg font-light text-gray-900 mb-2">Archive</h3>
                    {periods.length ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="py-2">Period</th>
                            <th className="py-2">Bundle</th>
                            <th className="py-2">Hist.csv</th>
                            <th className="py-2">metadata.json</th>
                          </tr>
                        </thead>
                        <tbody>
                          {periods.map(p => (
                            <tr key={p} className="border-t border-gray-100">
                              <td className="py-2 font-mono">{p}</td>
                              <td className="py-2"><Link href={`/data/forecasts/archive/${p}/forecasts-${p}.zip`} className="text-blue-600 underline">forecasts-{p}.zip</Link></td>
                              <td className="py-2"><Link href={`/data/forecasts/archive/${p}/Hist.csv`} className="text-blue-600 underline">Hist.csv</Link></td>
                              <td className="py-2"><Link href={`/data/forecasts/archive/${p}/metadata.json`} className="text-blue-600 underline">metadata.json</Link></td>
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
          <div className="mt-12 border border-gray-200 rounded-lg p-6 bg-white">
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
          <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
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
          <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
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
