import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import fs from 'fs'
import path from 'path'
import MultiFileDownloader from '@/components/MultiFileDownloader'
import ArchiveTable from '@/components/ArchiveTable'
import TabbedCodeExamples from '@/components/TabbedCodeExamples'

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

function listGridPeriods(): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'data', 'grid')
    const files = fs.readdirSync(dir)
    const periods = Array.from(new Set(
      files
        .map(f => { const m = f.match(/^(\d{4}-\d{2})[-.]/) ; return m ? m[1] : null })
        .filter((p): p is string => !!p)
    )).sort()
    return periods
  } catch { return [] }
}



export default function DataApiPage() {
  const latest = latestPeriod()
  const periods = listArchive()
  const gridPeriods = listGridPeriods()

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

  // Code examples for tabbed interface
  const quickStartExamples = [
    {
      label: 'Python',
      language: 'python',
      code: `import pandas as pd
import requests

# Fetch latest 12-month forecasts
forecasts = pd.read_csv("${SITE_BASE}/data/forecasts/latest/forecasts_h12.csv")
metadata = requests.get("${SITE_BASE}/data/forecasts/latest/metadata.json").json()

print(f"Forecast period: {metadata['forecast_start_date']}")
print(forecasts["Ukraine"].head())  # First 5 months for Ukraine`
    },
    {
      label: 'R',
      language: 'r',
      code: `library(readr)
library(httr)
library(jsonlite)

# Fetch latest 12-month forecasts
forecasts <- read_csv("${SITE_BASE}/data/forecasts/latest/forecasts_h12.csv")
metadata <- GET("${SITE_BASE}/data/forecasts/latest/metadata.json") %>%
  content("text") %>% fromJSON()

cat("Forecast period:", metadata$forecast_start_date, "\\n")
head(forecasts$Ukraine)  # First 5 months for Ukraine`
    },
    {
      label: 'JavaScript',
      language: 'javascript',
      code: `// Fetch latest forecasts
const response = await fetch(
  '${SITE_BASE}/data/forecasts/latest/forecasts_h12.csv'
);
const csvText = await response.text();

// Fetch metadata
const meta = await fetch(
  '${SITE_BASE}/data/forecasts/latest/metadata.json'
).then(r => r.json());

console.log('Forecast period:', meta.forecast_start_date);`
    },
    {
      label: 'curl',
      language: 'bash',
      code: `# Download latest forecasts
curl -O ${SITE_BASE}/data/forecasts/latest/forecasts_h12.csv
curl -O ${SITE_BASE}/data/forecasts/latest/Hist.csv
curl -O ${SITE_BASE}/data/forecasts/latest/metadata.json

# Download complete archive bundle
curl -O ${SITE_BASE}/data/forecasts/archive/2026-03/forecasts-2026-03.zip`
    }
  ]

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
              <Link href="#quick-start" className="text-link">Quick Start</Link>
              <Link href="#data-api" className="text-link">Data Download and API</Link>
              <Link href="#documentation" className="text-link">Documentation</Link>
              <Link href="#archive" className="text-link">Archive</Link>
              <Link href="#usage" className="text-link">Usage</Link>
            </div>
          </div>

          {/* Quick Start with Tabbed Examples */}
          <div id="quick-start" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-3">Quick Start</h2>
            <p className="text-sm text-gray-600 mb-6">
              Fetch the latest forecasts in your preferred language. All endpoints are stable and updated monthly on the 1st.
            </p>
            <TabbedCodeExamples examples={quickStartExamples} />
          </div>

          {/* Data Download and API */}
          <div id="data-api" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Data Download and API</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Latest Forecasts */}
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Latest Forecasts</h3>
                  <div className="text-xs space-y-1 font-mono text-gray-700">
                    <div>/data/forecasts/latest/forecasts_h6.csv</div>
                    <div>/data/forecasts/latest/forecasts_h12.csv</div>
                    <div>/data/forecasts/latest/Hist.csv</div>
                    <div>/data/forecasts/latest/metadata.json</div>
                  </div>
                </div>

                {/* Archive */}
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Historical Archive</h3>
                  <div className="text-xs space-y-1 font-mono text-gray-700">
                    <div>/data/forecasts/archive/<span className="text-blue-600">YYYY-MM</span>/forecasts_h6.csv</div>
                    <div>/data/forecasts/archive/<span className="text-blue-600">YYYY-MM</span>/forecasts_h12.csv</div>
                    <div>/data/forecasts/archive/<span className="text-blue-600">YYYY-MM</span>/Hist.csv</div>
                    <div>/data/forecasts/archive/<span className="text-blue-600">YYYY-MM</span>/metadata.json</div>
                  </div>
                  {periods.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Available from <span className="font-medium">{periods[periods.length - 1]}</span> to <span className="font-medium">{periods[0]}</span>.
                    </p>
                  )}
                </div>

                {/* Grid Forecasts */}
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Grid Forecasts (PRIO-GRID)</h3>
                  <div className="text-xs space-y-1 font-mono text-gray-700">
                    <div>/api/v1/grid/<span className="text-blue-600">{'{period}'}</span>/points-m1.json</div>
                    <div>/api/v1/grid/<span className="text-blue-600">{'{period}'}</span>/points-m2.json</div>
                    <div className="text-gray-500">... through m6.json</div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    <span className="font-medium">period</span> is the forecast start date in YYYY-MM format.
                  </p>
                  {gridPeriods.length > 0 && (
                    <p className="text-xs text-gray-600 mt-1">
                      Available periods: <span className="font-mono">{gridPeriods.join(', ')}</span>.
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1">
                    Bulk downloads available below.
                  </p>
                </div>

                {/* Data Formats */}
                <div className="border border-gray-200 rounded p-4">
                  <h3 className="font-medium text-gray-900 mb-2">Data Formats</h3>
                  <div className="text-xs space-y-2 text-gray-700">
                    <div><span className="font-medium">CSV:</span> Country forecasts (rows=months, cols=countries)</div>
                    <div><span className="font-medium">JSON:</span> Metadata, grid data (GeoJSON)</div>
                    <div><span className="font-medium">ZIP:</span> Complete period bundles</div>
                  </div>
                </div>
              </div>

              {/* Prediction Bounds */}
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium text-gray-900">Prediction Bounds:</span> Add <code className="px-1.5 py-0.5 bg-white text-gray-800 rounded text-xs">_min</code> or <code className="px-1.5 py-0.5 bg-white text-gray-800 rounded text-xs">_max</code> to forecast filenames:
                    <div className="mt-1 text-xs font-mono text-gray-700">
                      forecasts_h12<span className="text-blue-600">_min</span>.csv, forecasts_h12<span className="text-blue-600">_max</span>.csv
                    </div>
                  </div>
                  <div className="text-xs text-gray-700 border-t border-blue-200 pt-2 mt-2">
                    <span className="font-medium">What they represent:</span> Empirical bounds derived from historical analogues. The model identifies past conflict trajectories similar to the present situation, then uses the range of those outcomes to estimate lower and upper prediction bounds. Not statistical confidence intervals, but scenario-based uncertainty estimates.
                  </div>
                </div>
              </div>

              {/* Grid Bulk Downloads */}
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
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Grid Bulk Downloads</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download all spatial forecasts for period <span className="font-mono font-medium">{gridPeriod}</span>.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded p-4">
                        <h4 className="font-medium text-gray-900 mb-3">CSV Files</h4>
                        <MultiFileDownloader items={gridCsvItems} zipName={`PaCE-grid-${gridPeriod}-csv`} />
                      </div>
                      <div className="border border-gray-200 rounded p-4">
                        <h4 className="font-medium text-gray-900 mb-3">GeoJSON Files</h4>
                        <MultiFileDownloader items={gridGeoJsonItems} zipName={`PaCE-grid-${gridPeriod}-json`} />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Documentation */}
          <div id="documentation" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Documentation & Examples</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <a
                href="https://github.com/conflictlab/conflictlab.github.io/blob/main/docs/QUICK_START.md"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 mb-1">Quick Start Guide</div>
                <div className="text-xs text-gray-600">5-minute introduction with simple examples</div>
              </a>
              <a
                href="https://github.com/conflictlab/conflictlab.github.io/blob/main/docs/DATA_API.md"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 mb-1">Complete API Reference</div>
                <div className="text-xs text-gray-600">Full specification and integration patterns</div>
              </a>
              <a
                href="https://github.com/conflictlab/conflictlab.github.io/tree/main/examples"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-sm font-medium text-gray-900 mb-1">Example Scripts</div>
                <div className="text-xs text-gray-600">Production-ready Python & R clients</div>
              </a>
            </div>
          </div>

          {/* Archive */}
          <div id="archive" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Historical Archive</h2>
            <p className="text-sm text-gray-600 mb-4">
              Access any historical forecast period{periods.length > 0 ? ` from ${periods[periods.length - 1]} to ${periods[0]}` : ' from 1989-01 to present'}.
            </p>
            <div className="bg-white border border-gray-200 rounded p-4">
              <ArchiveTable archiveData={archiveData} />
            </div>
          </div>

          {/* Usage & License */}
          <div id="usage" className="mb-12 border border-gray-200 rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Usage & License</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">License</h3>
                <p className="text-sm text-gray-700">
                  <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-link">CC BY-NC 4.0</a>. For commercial use, <Link href="/contact" className="text-link">contact us</Link>.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Update Schedule</h3>
                <p className="text-sm text-gray-700">
                  Forecasts generated on the 1st at 01:00 UTC. Data available by 03:00 UTC.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Rate Limits</h3>
                <p className="text-sm text-gray-700">
                  Cache responses locally. Data updates monthly only. Excessive requests may be rate-limited.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Citation</h3>
                <p className="text-sm text-gray-700">
                  Schincariol, T., Frank, H., & Chadefaux, T. (2025). JPR. <a href="https://doi.org/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">DOI</a>
                </p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
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
                <a
                  href={`${GITHUB_BASE}/forecasts_h12.csv`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm rounded transition-colors"
                >
                  GitHub Fallback URLs
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
