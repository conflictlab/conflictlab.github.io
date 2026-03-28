import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import fs from 'fs'
import path from 'path'
import MultiFileDownloader from '@/components/MultiFileDownloader'
import ArchiveTable from '@/components/ArchiveTable'

const SITE_BASE = 'https://forecastlab.org'
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
  const latest = latestPeriod()
  const periods = listArchive()

  // Pre-compute all file availability
  const archiveData = periods.map(period => {
    const hasFile = (file: string) => {
      try {
        return fs.existsSync(path.join(process.cwd(), 'public', 'data', 'forecasts', 'archive', period, file))
      } catch {
        return false
      }
    }

    return {
      period,
      files: {
        bundle: true,
        hist: hasFile('Hist.csv'),
        metadata: hasFile('metadata.json'),
        h6_mean: hasFile('forecasts_h6.csv'),
        h6_min: hasFile('forecasts_h6_min.csv'),
        h6_max: hasFile('forecasts_h6_max.csv'),
        h12_mean: hasFile('forecasts_h12.csv'),
        h12_min: hasFile('forecasts_h12_min.csv'),
        h12_max: hasFile('forecasts_h12_max.csv'),
      }
    }
  })

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]">
          <Breadcrumbs />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Data API
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Programmatic access to <span className="word-emphasis">PaCE forecast data</span>.
            Updated automatically on the 1st of each month.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contents Navigation */}
          <div className="mb-10 text-sm text-gray-700">
            <div className="font-medium text-gray-900 mb-2">Contents</div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link href="#endpoints" className="text-link">Endpoints</Link>
              <Link href="#examples" className="text-link">Examples</Link>
              <Link href="#archive" className="text-link">Archive</Link>
              <Link href="#grid-downloads" className="text-link">Downloads</Link>
              <Link href="#formats" className="text-link">Formats</Link>
              <Link href="#errors" className="text-link">Errors</Link>
              <Link href="#usage" className="text-link">Usage</Link>
            </div>
          </div>

          {/* Endpoints */}
          <div id="endpoints" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-3">API Endpoints</h2>
            <p className="text-sm text-gray-600 mb-6">
              All URLs are stable and permanent. Only data content updates monthly.
            </p>

            <div className="space-y-6">
              {/* Country Forecasts */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Country Forecasts</h3>
                <p className="text-sm text-gray-600 mb-3">
                  6-month and 12-month ahead forecasts, updated monthly on the 1st.
                </p>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`GET ${SITE_BASE}/data/forecasts/latest/forecasts_h6.csv
GET ${SITE_BASE}/data/forecasts/latest/forecasts_h12.csv
GET ${SITE_BASE}/data/forecasts/latest/Hist.csv
GET ${SITE_BASE}/data/forecasts/latest/metadata.json`}</pre>
              </div>

              {/* Grid Forecasts */}
              <div id="grid">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Grid Forecasts (PRIO-GRID)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Spatial forecasts by month. Replace <code className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded">{'{period}'}</code> with YYYY-MM (e.g., {latest || '2026-03'}).
                  For bulk downloads, see <Link href="#grid-downloads" className="text-link">Grid Downloads</Link> below.
                </p>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`GET ${SITE_BASE}/api/v1/grid/{period}/points-m1.json
GET ${SITE_BASE}/api/v1/grid/{period}/points-m2.json
GET ${SITE_BASE}/api/v1/grid/{period}/points-m3.json
GET ${SITE_BASE}/api/v1/grid/{period}/points-m4.json
GET ${SITE_BASE}/api/v1/grid/{period}/points-m5.json
GET ${SITE_BASE}/api/v1/grid/{period}/points-m6.json`}</pre>
              </div>

              {/* Archive Pattern */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historical Archive</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Access any historical forecast period. Replace <code className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded">YYYY-MM</code> with the desired period.
                </p>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`GET ${SITE_BASE}/data/forecasts/archive/YYYY-MM/forecasts_h6.csv
GET ${SITE_BASE}/data/forecasts/archive/YYYY-MM/forecasts_h12.csv
GET ${SITE_BASE}/data/forecasts/archive/YYYY-MM/Hist.csv
GET ${SITE_BASE}/data/forecasts/archive/YYYY-MM/metadata.json
GET ${SITE_BASE}/data/forecasts/archive/YYYY-MM/forecasts-YYYY-MM.zip`}</pre>
              </div>
            </div>
          </div>

          {/* Code Examples */}
          <div id="examples" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Code Examples</h2>

            <div className="space-y-6">
              {/* Python */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Python</h3>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`import pandas as pd

# Load latest 6-month forecasts
url = "${SITE_BASE}/data/forecasts/latest/forecasts_h6.csv"
df = pd.read_csv(url, index_col=0)

# Load metadata to understand forecast periods
metadata_url = "${SITE_BASE}/data/forecasts/latest/metadata.json"
metadata = pd.read_json(metadata_url, typ='series')
print(f"Forecast start: {metadata['forecast_start_date']}")

# Get forecasts for a specific country
afghanistan_forecast = df["Afghanistan"]
print(afghanistan_forecast)`}</pre>
              </div>

              {/* R */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">R</h3>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`library(readr)
library(jsonlite)

# Load latest 12-month forecasts
url <- "${SITE_BASE}/data/forecasts/latest/forecasts_h12.csv"
forecasts <- read_csv(url)

# Load metadata
metadata_url <- "${SITE_BASE}/data/forecasts/latest/metadata.json"
metadata <- fromJSON(metadata_url)
cat("Forecast start:", metadata$forecast_start_date, "\\n")

# Extract specific country
syria_forecast <- forecasts$Syria`}</pre>
              </div>

              {/* curl */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">curl / wget</h3>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`# Download latest forecasts
curl -O ${SITE_BASE}/data/forecasts/latest/forecasts_h6.csv

# Download complete bundle for specific period
curl -O ${SITE_BASE}/data/forecasts/archive/2026-03/forecasts-2026-03.zip

# Download grid forecast for month 1
curl "${SITE_BASE}/api/v1/grid/2026-03/points-m1.json" > grid_m1.json`}</pre>
              </div>

              {/* JavaScript */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">JavaScript / Node.js</h3>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`// Fetch grid forecast data
const response = await fetch(
  '${SITE_BASE}/api/v1/grid/${latest || '2026-03'}/points-m1.json'
);
const gridData = await response.json();

// Fetch metadata
const metaResponse = await fetch(
  '${SITE_BASE}/data/forecasts/latest/metadata.json'
);
const metadata = await metaResponse.json();
console.log('Forecast period:', metadata.forecast_start_date);`}</pre>
              </div>
            </div>
          </div>

          {/* Archive */}
          <div id="archive" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Historical Archive</h2>
            <p className="text-sm text-gray-600 mb-4">
              Complete archive of monthly forecasts from 1989-01 to present. Each period includes all forecast files, historical data, and metadata.
            </p>
            <div className="bg-white border border-gray-200 rounded p-4">
              <ArchiveTable archiveData={archiveData} />
            </div>
          </div>

          {/* Data Formats */}
          <div id="formats" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Data Formats</h2>

            <div className="space-y-6">
              {/* Metadata */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Metadata (JSON)</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Contains forecast period information and data coverage details.
                </p>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`{
  "run_date": "2026-03-01T01:15:43.123456",
  "data_end_date": "2026-02",
  "forecast_start_date": "2026-03",
  "h6_end_date": "2026-08",
  "h12_end_date": "2027-02",
  "training_window_months": 24,
  "historical_start_date": "1989-01",
  "total_historical_months": 445
}`}</pre>
              </div>

              {/* Forecast CSVs */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Forecast CSVs</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Country-level forecasts with rows as forecast months and columns as countries.
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                  <li><strong>Rows:</strong> 0-5 (h6) or 0-11 (h12), starting from <code className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded">forecast_start_date</code></li>
                  <li><strong>Columns:</strong> Country names</li>
                  <li><strong>Values:</strong> Predicted monthly fatalities</li>
                  <li><strong>Variants:</strong> mean (default), min, max</li>
                </ul>
              </div>

              {/* Historical CSV */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Historical CSV</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Observed fatality data from UCDP, 1989-present.
                </p>
                <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                  <li><strong>First column:</strong> Date (YYYY-MM-DD format)</li>
                  <li><strong>Other columns:</strong> Country names</li>
                  <li><strong>Values:</strong> Observed monthly fatalities</li>
                </ul>
              </div>

              {/* Grid JSON */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Grid JSON</h3>
                <p className="text-sm text-gray-600 mb-3">
                  GeoJSON FeatureCollection with point geometries for each grid cell.
                </p>
                <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">{`{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [lon, lat]},
      "properties": {"value": 2.34}
    }
  ]
}`}</pre>
              </div>
            </div>
          </div>

          {/* Error Responses */}
          <div id="errors" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Error Responses</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-gray-400 pl-4">
                <div className="font-mono text-sm text-gray-900 mb-1">404 Not Found</div>
                <p className="text-sm text-gray-600">
                  Requested period or file does not exist. Check available periods in the archive table.
                </p>
              </div>
              <div className="border-l-4 border-yellow-400 pl-4">
                <div className="font-mono text-sm text-gray-900 mb-1">429 Too Many Requests</div>
                <p className="text-sm text-gray-600">
                  Rate limit exceeded. Cache responses locally. Data updates monthly only.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <div className="font-mono text-sm text-gray-900 mb-1">503 Service Unavailable</div>
                <p className="text-sm text-gray-600">
                  Temporary server issue. Retry after a few minutes. Use GitHub fallback if persistent.
                </p>
              </div>
            </div>
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-gray-700">
                <strong>GitHub Fallback:</strong> If website endpoints are unavailable, use raw GitHub URLs:
              </p>
              <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto mt-2">{`${GITHUB_BASE}/forecasts_h6.csv
${GITHUB_BASE}/forecasts_h12.csv
${GITHUB_BASE}/Hist.csv
${GITHUB_BASE}/forecast_metadata.json`}</pre>
            </div>
          </div>

          {/* Grid Downloads */}
          {(() => {
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
              { path: `/data/grid/${gridPeriod}-m1.csv`, label: `${gridPeriod}-m1.csv` },
              { path: `/data/grid/${gridPeriod}-m2.csv`, label: `${gridPeriod}-m2.csv` },
              { path: `/data/grid/${gridPeriod}-m3.csv`, label: `${gridPeriod}-m3.csv` },
              { path: `/data/grid/${gridPeriod}-m4.csv`, label: `${gridPeriod}-m4.csv` },
              { path: `/data/grid/${gridPeriod}-m5.csv`, label: `${gridPeriod}-m5.csv` },
              { path: `/data/grid/${gridPeriod}-m6.csv`, label: `${gridPeriod}-m6.csv` },
              { path: `/data/grid/${gridPeriod}.csv`, label: `${gridPeriod}.csv (all months)` },
            ]
            const gridGeoJsonItems = [
              { path: `/data/grid/${gridPeriod}.geo.json`, label: `${gridPeriod}.geo.json (polygons)` },
              { path: `/data/grid/${gridPeriod}-m1.json`, label: `${gridPeriod}-m1.json` },
              { path: `/data/grid/${gridPeriod}-m2.json`, label: `${gridPeriod}-m2.json` },
              { path: `/data/grid/${gridPeriod}-m3.json`, label: `${gridPeriod}-m3.json` },
              { path: `/data/grid/${gridPeriod}-m4.json`, label: `${gridPeriod}-m4.json` },
              { path: `/data/grid/${gridPeriod}-m5.json`, label: `${gridPeriod}-m5.json` },
              { path: `/data/grid/${gridPeriod}-m6.json`, label: `${gridPeriod}-m6.json` },
              { path: `/data/grid/centroids.csv`, label: `centroids.csv` },
            ]

            return (
              <div id="grid-downloads" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
                <h2 className="text-2xl font-light text-gray-900 mb-4">Grid Downloads</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Bulk download options for grid forecasts (period <span className="font-mono font-medium">{gridPeriod}</span>).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">CSV Files</h3>
                    <MultiFileDownloader items={gridCsvItems} zipName={`PaCE-grid-${gridPeriod}-csv`} />
                    <div className="mt-3 text-xs text-gray-600">
                      <div className="font-medium text-gray-700 mb-1">Format</div>
                      <div>Monthly: <span className="font-mono">lat,lon,value</span></div>
                      <div>Combined: <span className="font-mono">lat,lon,m1,m2...m6</span></div>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded p-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">GeoJSON Files</h3>
                    <MultiFileDownloader items={gridGeoJsonItems} zipName={`PaCE-grid-${gridPeriod}-json`} />
                    <div className="mt-3 text-xs text-gray-600">
                      <div className="font-medium text-gray-700 mb-1">Format</div>
                      <div>Point geometries with forecast values</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Usage & License */}
          <div id="usage" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Usage & License</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">License</h3>
                <p className="text-sm text-gray-700">
                  <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-link">CC BY-NC 4.0</a> (Attribution-NonCommercial). For commercial use, <Link href="/contact" className="text-link">contact us</Link>.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Rate Limits</h3>
                <p className="text-sm text-gray-700">
                  Cache responses locally. Data updates monthly on the 1st only. Excessive requests may be rate-limited.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Update Schedule</h3>
                <p className="text-sm text-gray-700">
                  Forecasts generated on the 24th and 1st at 01:00 UTC. Data available by 03:00 UTC same day.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Citation</h3>
                <p className="text-sm text-gray-700">
                  Schincariol, T., Frank, H., & Chadefaux, T. (2025). Accounting for variability in conflict dynamics: A pattern-based predictive model. <em>Journal of Peace Research</em>. <a href="https://doi.org/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">DOI: 10.1177/00223433251330790</a>
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  See <Link href="/downloads#cite" className="text-link">full citation guidelines</Link>.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Support</h3>
                <p className="text-sm text-gray-700 mb-2">
                  Questions, issues, or feature requests:
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Contact Us
                  </Link>
                  <a
                    href="https://github.com/conflictlab/Pace-map-risk/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded transition-colors"
                  >
                    GitHub Issues
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
