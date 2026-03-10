import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

const GITHUB_BASE = 'https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main'

const API_ENDPOINTS = [
  {
    category: '12-Month Forecasts',
    description: 'Forecasts 12 months ahead (mean, min, max)',
    endpoints: [
      { url: `${GITHUB_BASE}/forecasts_h12.csv`, label: 'forecasts_h12.csv', desc: 'Mean 12-month forecast' },
      { url: `${GITHUB_BASE}/forecasts_h12_min.csv`, label: 'forecasts_h12_min.csv', desc: 'Lower bound (minimum scenario)' },
      { url: `${GITHUB_BASE}/forecasts_h12_max.csv`, label: 'forecasts_h12_max.csv', desc: 'Upper bound (maximum scenario)' },
    ]
  },
  {
    category: '6-Month Forecasts',
    description: 'Forecasts 6 months ahead (mean, min, max)',
    endpoints: [
      { url: `${GITHUB_BASE}/forecasts_h6.csv`, label: 'forecasts_h6.csv', desc: 'Mean 6-month forecast' },
      { url: `${GITHUB_BASE}/forecasts_h6_min.csv`, label: 'forecasts_h6_min.csv', desc: 'Lower bound (minimum scenario)' },
      { url: `${GITHUB_BASE}/forecasts_h6_max.csv`, label: 'forecasts_h6_max.csv', desc: 'Upper bound (maximum scenario)' },
    ]
  },
  {
    category: 'Historical Data',
    description: 'Complete historical time series',
    endpoints: [
      { url: `${GITHUB_BASE}/Hist.csv`, label: 'Hist.csv', desc: 'Full historical time series (all available UCDP data)' },
    ]
  },
  {
    category: 'Metadata',
    description: 'Information about the forecast run',
    endpoints: [
      { url: `${GITHUB_BASE}/forecast_metadata.json`, label: 'forecast_metadata.json', desc: 'Run date, data ranges, configuration' },
    ]
  }
]

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

          {/* Quick Start */}
          <div className="mb-12 border border-gray-200 rounded-lg p-6 bg-gray-50">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Quick Start</h2>
            <p className="text-sm text-gray-700 mb-4">
              All datasets are available as direct downloads via stable URLs.
              Use these URLs in your scripts, notebooks, or automated pipelines.
            </p>
            <div className="bg-white border border-gray-200 rounded p-4">
              <p className="text-xs text-gray-600 mb-2 font-mono">Example: Fetch 12-month forecasts</p>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{`# Python
import pandas as pd
df = pd.read_csv('${GITHUB_BASE}/forecasts_h12.csv')

# R
df <- read.csv('${GITHUB_BASE}/forecasts_h12.csv')

# curl
curl -O ${GITHUB_BASE}/forecasts_h12.csv

# wget
wget ${GITHUB_BASE}/forecasts_h12.csv`}
              </pre>
            </div>
          </div>

          {/* Update Schedule */}
          <div className="mb-12 border border-blue-200 bg-blue-50 rounded-lg p-6">
            <h2 className="text-xl font-light text-gray-900 mb-3">📅 Update Schedule</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start">
                <span className="font-medium mr-2">Forecast Generation:</span>
                <span>1st of each month at 01:00 UTC</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">Data Available:</span>
                <span>Within 2 hours of generation (typically by 03:00 UTC)</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">URL Stability:</span>
                <span>URLs never change, only content updates</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium mr-2">Next Update:</span>
                <span>April 1, 2026 (automated)</span>
              </div>
            </div>
          </div>

          {/* Endpoints by Category */}
          <div className="space-y-8">
            {API_ENDPOINTS.map((category, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-xl font-light text-gray-900 mb-2">{category.category}</h2>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <div className="space-y-3">
                  {category.endpoints.map((endpoint, endIdx) => (
                    <div key={endIdx} className="bg-gray-50 border border-gray-200 rounded p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 mb-1">{endpoint.label}</p>
                          <p className="text-xs text-gray-600">{endpoint.desc}</p>
                        </div>
                        <a
                          href={endpoint.url}
                          download
                          className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                        >
                          Download
                        </a>
                      </div>
                      <div className="mt-2">
                        <input
                          type="text"
                          readOnly
                          value={endpoint.url}
                          className="w-full px-2 py-1 text-xs font-mono bg-white border border-gray-300 rounded"
                          onClick={(e) => e.currentTarget.select()}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
              <div>
                <p className="font-medium mb-1">Forecast CSVs (forecasts_h6.csv, forecasts_h12.csv):</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li>Rows: Forecast months (6 or 12 rows)</li>
                  <li>Columns: Countries</li>
                  <li>Values: Predicted fatalities</li>
                  <li>Index: Date (YYYY-MM-DD format)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Historical CSV (Hist.csv):</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-gray-600">
                  <li>Rows: All available months from UCDP data inception</li>
                  <li>Columns: Countries</li>
                  <li>Values: Observed fatalities</li>
                  <li>Index: Date (YYYY-MM-DD format)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Terms */}
          <div className="mt-8 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-xl font-light text-gray-900 mb-3">Usage Terms</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <span className="font-medium">License:</span> <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-link">CC BY-NC 4.0</a> (Attribution-NonCommercial)
              </p>
              <p>
                <span className="font-medium">Attribution:</span> PaCE (2025). Monthly Conflict Forecasts.
                See <Link href="/downloads#cite" className="text-link">citation guidelines</Link>.
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
