import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
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
    { path: `/data/grid/centroids.csv`, label: `centroids.csv (Sub‑national Area centers)` },
  ]

  // Inline previews (first ~5 rows) for each dataset
  // Simple CSV splitter handling quotes (for preview rendering)
  function splitCsvLine(line: string): string[] {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQuotes) {
        if (ch === '"') {
          if (line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = false }
        } else {
          cur += ch
        }
      } else {
        if (ch === ',') { out.push(cur); cur = '' }
        else if (ch === '"') { inQuotes = true }
        else { cur += ch }
      }
    }
    out.push(cur)
    return out
  }

  let countryPreview: string | null = null
  try {
    const latestWithRaw = countryDownloads.find(d => d.hasRaw)
    if (latestWithRaw) {
      const p = path.join(rawDir, `${latestWithRaw.period}.csv`)
      if (fs.existsSync(p)) {
        const text = fs.readFileSync(p, 'utf-8')
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
        const meta = lines[0]?.startsWith('#') ? [lines[0]] : []
        const headerIdx = meta.length
        const header = lines[headerIdx] || ''
        const headerCols = splitCsvLine(header)
        const limitedHeader = headerCols.slice(0, 5).join(',')
        const dataLines = lines.slice(headerIdx + 1, headerIdx + 1 + 5)
        const limitedRows = dataLines.map(l => splitCsvLine(l).slice(0, 5).join(','))
        countryPreview = [...meta, limitedHeader, ...limitedRows].join('\n')
      }
    }
  } catch {}

  let gridPreview: string | null = null
  try {
    const monthlyCsv = path.join(process.cwd(), 'public', 'data', 'grid', `${gridPeriod}-m1.csv`)
    const combinedCsv = path.join(process.cwd(), 'public', 'data', 'grid', `${gridPeriod}.csv`)
    const src = fs.existsSync(monthlyCsv) ? monthlyCsv : (fs.existsSync(combinedCsv) ? combinedCsv : null)
    if (src) {
      const text = fs.readFileSync(src, 'utf-8')
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
      const header = lines[0] || ''
      const headerCols = splitCsvLine(header)
      const limitedHeader = headerCols.slice(0, 5).join(',')
      const rows = lines.slice(1, 1 + 5)
      const limitedRows = rows.map(l => splitCsvLine(l).slice(0, 5).join(','))
      gridPreview = [limitedHeader, ...limitedRows].join('\n')
    }
  } catch {}

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Downloads
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Access our <span className="word-emphasis">conflict forecasts</span> as raw data.
            Country-level and grid-level predictions available in CSV and GeoJSON formats.
          </p>
          {/* Moved acknowledgements link to footer for consistency */}
          <p className="text-lg text-gray-600 font-light mt-4">
            Latest update: {formatDMY(snapshot.generatedAt)}
          </p>
          <Breadcrumbs />
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-sm text-gray-600 mb-8">
            <Link href="/forecasts" className="text-link">Visualize these forecasts on the dashboard</Link>
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
                {countryPreview && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-700 mb-1">Preview (first 5 rows and columns)</div>
                    <pre className="text-xs bg-gray-50 p-3 border border-gray-200 rounded overflow-auto max-h-48 whitespace-pre-wrap">{countryPreview}</pre>
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
                  zipName={`PaCE-grid-${gridPeriod}`}
                    items={[
                      ...gridCsvLinks.map(l => ({ path: l.path, label: l.label })),
                      gridCombinedCsv,
                      ...gridGeoJsonLinks,
                    ]}
                  />
                </div>
                {/* Format description */}
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="font-medium text-gray-700">Format</div>
                  <div>
                    - Monthly points CSVs: <span className="font-mono">lat,lon,v</span>
                  </div>
                  <div>
                    - Combined CSV: <span className="font-mono">lat,lon,m1,m2,m3,m4,m5,m6</span>
                  </div>
                  <div>
                    - GeoJSON features with <span className="font-mono">properties.m1..m6</span>
                  </div>
                </div>
                {gridPreview && (
                  <div className="mt-3">
                    <div className="text-sm text-gray-700 mb-1">Preview (first 5 rows and columns)</div>
                    <pre className="text-xs bg-gray-50 p-3 border border-gray-200 rounded overflow-auto max-h-48 whitespace-pre-wrap">{gridPreview}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Data Rights & Use (CC BY-NC 4.0) */}
          <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-white">
            <h2 className="text-lg font-light text-gray-900 mb-1">Data Rights &amp; Use</h2>
            <p className="text-sm text-gray-700 mb-2">
              Unless stated otherwise, datasets on this page are licensed under <a href="https://creativecommons.org/licenses/by-nc/4.0/" target="_blank" rel="noopener noreferrer" className="text-link">CC BY‑NC 4.0</a> (Attribution‑NonCommercial).
              You may share and adapt for non‑commercial use with attribution. For commercial use, please <Link href="/contact" className="text-link">contact us</Link>.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Attribution example:</span>
                <code className="ml-2 px-1 py-0.5 bg-gray-50 border border-gray-200 rounded">PaCE (2025). Monthly Conflict Forecasts.</code>
              </div>
              <div><span className="font-medium">Disclaimer:</span> Provided “as is”, without warranty; not for safety‑critical decisions.</div>
              <div><span className="font-medium">Acceptable use:</span> Do not use to target, harass, or cause harm; comply with applicable laws.</div>
            </div>
          </div>

          {/* How to Cite */}
          <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-white">
            <h2 id="cite" className="text-lg font-light text-gray-900 mb-2">How to Cite PaCE</h2>
            <p className="text-sm text-gray-700 mb-3">If you use these data or figures, please cite the dataset and a core methods paper.</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Dataset</h3>
                <p className="text-sm text-gray-700">
                  PaCE Conflict Research Lab (2025). Monthly Conflict Forecasts. Available at <a href="/downloads" className="text-link">/downloads</a>.
                </p>
                <pre className="text-[11px] bg-gray-50 p-3 border border-gray-200 rounded overflow-auto mt-2">
{`@misc{pace-forecasts,
  author = {PaCE Conflict Research Lab},
  title = {Monthly Conflict Forecasts},
  year = {2025},
  url = {https://forecastlab.org/downloads}
}`}                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">Methods (select one)</h3>
                <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
                  <li>
                    Chadefaux, T. (2023). An automated pattern recognition system for conflict. <em>Journal of Computational Science</em>.
                    {' '}<a href="https://www.sciencedirect.com/science/article/pii/S1877750323001345" target="_blank" rel="noopener noreferrer" className="text-link">Link</a>
                  </li>
                  <li>
                    EPJ Data Science (2025). Endogenous conflict and the limits of predictive optimization.
                    {' '}<a href="https://doi.org/10.1140/epjds/s13688-025-00599-x" target="_blank" rel="noopener noreferrer" className="text-link">DOI</a>
                  </li>
                  <li>
                    Journal of Peace Research (2025). Accounting for variability in conflict dynamics.
                    {' '}<a href="https://journals.sagepub.com/doi/10.1177/00223433251330790" target="_blank" rel="noopener noreferrer" className="text-link">DOI</a>
                  </li>
                </ul>
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

          {/* Acknowledgements footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-600">
              <Link href="/acknowledgements" className="text-link">View full acknowledgements</Link>
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
