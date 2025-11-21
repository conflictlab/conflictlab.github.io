"use client"

import { useEffect, useMemo, useRef, useState } from "react"

type MatchEntry = {
  series: { values: number[]; index?: string[]; name?: string }
  distance: number
}

type MatchesMap = Record<string, MatchEntry[]>

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  const split = (line: string) => {
    const out: string[] = []
    let cur = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (inQ) {
        if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else { inQ = false } }
        else cur += ch
      } else {
        if (ch === ',') { out.push(cur); cur = '' }
        else if (ch === '"') inQ = true
        else cur += ch
      }
    }
    out.push(cur)
    return out
  }
  const header = split(lines[0] || '')
  const rows = lines.slice(1).map(line => split(line))
  return { header, rows }
}

function normalizeName(s: string) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim()
}

const ALIASES: Record<string, string> = {
  'Bosnia-Herzegovina': 'Bosnia and Herz.',
  'Cambodia (Kampuchea)': 'Cambodia',
  'Central African Republic': 'Central African Rep.',
  'DR Congo (Zaire)': 'Dem. Rep. Congo',
  "Ivory Coast": "Côte d'Ivoire",
  'Kingdom of eSwatini (Swaziland)': 'eSwatini',
  'Macedonia, FYR': 'Macedonia',
  'Madagascar (Malagasy)': 'Madagascar',
  'Myanmar (Burma)': 'Myanmar',
  'Russia (Soviet Union)': 'Russia',
  'Serbia (Yugoslavia)': 'Serbia',
  'South Sudan': 'S. Sudan',
  'Yemen (North Yemen)': 'Yemen',
  'Zimbabwe (Rhodesia)': 'Zimbabwe',
  'Vietnam (North Vietnam)': 'Vietnam',
}

function formatDate(s?: string) {
  if (!s) return ''
  // accept YYYY-MM-DD HH:MM:SS or YYYY-MM-DD
  const d = new Date(s.replace(' ', 'T') + 'Z')
  if (!isFinite(d.getTime())) return s
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

function buildPath(values: number[], width: number, height: number, padding = { t: 16, r: 12, b: 18, l: 12 }) {
  const n = values.length
  if (!n) return ''
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  const x0 = padding.l
  const x1 = width - padding.r
  const y0 = padding.t
  const y1 = height - padding.b
  const w = Math.max(1, x1 - x0)
  const h = Math.max(1, y1 - y0)
  const rng = maxV - minV || 1
  const sx = (i: number) => x0 + (i / Math.max(1, n - 1)) * w
  const sy = (v: number) => y1 - ((v - minV) / rng) * h
  let d = `M ${sx(0)} ${sy(values[0])}`
  for (let i = 1; i < n; i++) d += ` L ${sx(i)} ${sy(values[i])}`
  return d
}

function buildSegmentPath(segment: number[], totalLen: number, offset: number, width: number, height: number, padding = { t: 16, r: 12, b: 18, l: 12 }) {
  const n = segment.length
  if (!n || totalLen < 2) return ''
  const minV = Math.min(...segment)
  const maxV = Math.max(...segment)
  const x0 = padding.l
  const x1 = width - padding.r
  const y0 = padding.t
  const y1 = height - padding.b
  const w = Math.max(1, x1 - x0)
  const h = Math.max(1, y1 - y0)
  const rng = maxV - minV || 1
  const sx = (i: number) => x0 + ((offset + i) / Math.max(1, totalLen - 1)) * w
  const sy = (v: number) => y1 - ((v - minV) / rng) * h
  let d = `M ${sx(0)} ${sy(segment[0])}`
  for (let i = 1; i < n; i++) d += ` L ${sx(i)} ${sy(segment[i])}`
  return d
}

function connectorForSegments(past: number[], future: number[], totalLen: number, offsetFuture: number, width: number, height: number, padding = { t: 16, r: 12, b: 18, l: 12 }) {
  if (!past.length || !future.length || totalLen < 2) return ''
  const minP = Math.min(...past), maxP = Math.max(...past)
  const minF = Math.min(...future), maxF = Math.max(...future)
  const x0 = padding.l
  const x1 = width - padding.r
  const y0 = padding.t
  const y1 = height - padding.b
  const w = Math.max(1, x1 - x0)
  const h = Math.max(1, y1 - y0)
  const rngP = (maxP - minP) || 1
  const rngF = (maxF - minF) || 1
  const sx = (i: number) => x0 + (i / Math.max(1, totalLen - 1)) * w
  const syP = (v: number) => y1 - ((v - minP) / rngP) * h
  const syF = (v: number) => y1 - ((v - minF) / rngF) * h
  const xPast = sx(past.length - 1)
  const yPast = syP(past[past.length - 1])
  const xFuture = sx(offsetFuture)
  const yFuture = syF(future[0])
  return `M ${xPast} ${yPast} L ${xFuture} ${yFuture}`
}

// Build using a shared y-domain (yMin..yMax) for both segments (used for match+future)
function buildSegmentPathWithDomain(segment: number[], totalLen: number, offset: number, width: number, height: number, yMin: number, yMax: number, padding = { t: 16, r: 12, b: 18, l: 12 }) {
  const n = segment.length
  if (!n || totalLen < 2) return ''
  const x0 = padding.l
  const x1 = width - padding.r
  const y0 = padding.t
  const y1 = height - padding.b
  const w = Math.max(1, x1 - x0)
  const h = Math.max(1, y1 - y0)
  const rng = (yMax - yMin) || 1
  const sx = (i: number) => x0 + ((offset + i) / Math.max(1, totalLen - 1)) * w
  const sy = (v: number) => y1 - ((v - yMin) / rng) * h
  let d = `M ${sx(0)} ${sy(segment[0])}`
  for (let i = 1; i < n; i++) d += ` L ${sx(i)} ${sy(segment[i])}`
  return d
}

function connectorWithDomain(past: number[], future: number[], totalLen: number, offsetFuture: number, width: number, height: number, yMin: number, yMax: number, padding = { t: 16, r: 12, b: 18, l: 12 }) {
  if (!past.length || !future.length || totalLen < 2) return ''
  const x0 = padding.l
  const x1 = width - padding.r
  const y0 = padding.t
  const y1 = height - padding.b
  const w = Math.max(1, x1 - x0)
  const h = Math.max(1, y1 - y0)
  const rng = (yMax - yMin) || 1
  const sx = (i: number) => x0 + (i / Math.max(1, totalLen - 1)) * w
  const sy = (v: number) => y1 - ((v - yMin) / rng) * h
  const xPast = sx(past.length - 1)
  const yPast = sy(past[past.length - 1])
  const xFuture = sx(offsetFuture)
  const yFuture = sy(future[0])
  return `M ${xPast} ${yPast} L ${xFuture} ${yFuture}`
}

export default function DTWMatches({ countryName }: { countryName: string }) {
  const [matches, setMatches] = useState<MatchEntry[] | null>(null)
  const [histSeries, setHistSeries] = useState<number[]>([])
  const [matchDates, setMatchDates] = useState<string[] | null>(null)
  const [histDates, setHistDates] = useState<string[]>([])
  const [histColumns, setHistColumns] = useState<Record<string, number[]>>({})
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)

  // Load matches.json and hist.csv
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        // Prefer conf.csv (full monthly history); then hist_full.csv; then hist.csv
        const [mj, cf, hf] = await Promise.all([
          fetch(`${base}/data/matches.json`),
          fetch(`${base}/data/conf.csv`).catch(() => null),
          fetch(`${base}/data/hist_full.csv`).catch(() => null),
        ])
        let hc: Response | null = (cf && (cf as any).ok) ? (cf as Response) : ((hf && (hf as any).ok) ? (hf as Response) : null)
        if (!hc) { hc = await fetch(`${base}/data/hist.csv`) }
        if (!mj.ok) throw new Error('matches.json not available')
        if (!hc || !hc.ok) throw new Error('hist.csv not available')
        const mjson = (await mj.json()) as MatchesMap
        const entries = mjson[countryName] || mjson[Object.keys(mjson).find(k => normalizeName(k) === normalizeName(countryName)) || '']
        if (!entries || !entries.length) { if (!cancelled) setMatches([]); return }
        // Take top 4 by distance (assuming ascending order in file)
        const top = [...entries].sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0)).slice(0, 4)
        if (!cancelled) setMatches(top)
        if (top[0]?.series?.index) setMatchDates(top[0].series.index)

        // Parse hist.csv (dates and columns for current + matched countries)
        const csv = await hc.text()
        const { header, rows } = parseCSV(csv)
        const dates = rows.map(r => r[0])
        if (!cancelled) setHistDates(dates)

        // Identify columns of interest
        const wantNames = new Set<string>([ALIASES[countryName] || countryName])
        top.forEach(m => { if (m.series?.name) wantNames.add(ALIASES[m.series.name] || m.series.name) })
        const cols: Record<string, number[]> = {}
        for (let ci = 1; ci < header.length; ci++) {
          const name = header[ci]
          if (!name) continue
          if (![...wantNames].some(nm => name === nm || normalizeName(name) === normalizeName(nm))) continue
          const arr: number[] = rows.map(r => {
            const v = Number(r[ci])
            return Number.isFinite(v) ? v : NaN
          })
          cols[name] = arr
        }
        // Resolve the current country's array
        const resolve = (nm: string): number[] | undefined => {
          if (cols[nm]) return cols[nm]
          const key = Object.keys(cols).find(k => normalizeName(k) === normalizeName(nm))
          return key ? cols[key] : undefined
        }
        const cur = resolve(ALIASES[countryName] || countryName)
        if (!cur) throw new Error(`Country column not found in hist.csv: ${countryName}`)
        if (!cancelled) {
          setHistSeries(cur.filter(v => Number.isFinite(v)) as number[])
          setHistColumns(cols)
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || String(e))
      }
    }
    loadAll()
    return () => { cancelled = true }
  }, [countryName])

  // Observe container width
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setWidth(Math.max(320, el.clientWidth || 900))
    update()
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined') { ro = new ResizeObserver(update); ro.observe(el) }
    else window.addEventListener('resize', update)
    return () => { if (ro && el) ro.unobserve(el); window.removeEventListener('resize', update) }
  }, [])

  const items = useMemo(() => {
    if (!matches || !histSeries.length || !histDates.length) return []
    const getCol = (nm?: string): number[] | undefined => {
      if (!nm) return undefined
      if (histColumns[nm]) return histColumns[nm]
      const k = Object.keys(histColumns).find(h => normalizeName(h) === normalizeName(nm))
      return k ? histColumns[k] : undefined
    }
    const H = 6
    return matches.map((m) => {
      const n = Math.max(1, m.series?.values?.length || 0)
      const src = histSeries.slice(-n)
      let future: number[] | undefined
      let futureRange: string | undefined
      const nm = m.series?.name
      const col = getCol(nm ? (ALIASES[nm] || nm) : undefined)
      if (col && m.series?.index && m.series.index.length) {
        const endDate = String(m.series.index[m.series.index.length - 1]).slice(0, 10)
        const pos = histDates.indexOf(endDate)
        if (pos >= 0) {
          const arr = col.slice(pos + 1, pos + 1 + H).filter(v => Number.isFinite(v)) as number[]
          if (arr.length) {
            future = arr
            const frStart = histDates[pos + 1]
            const frEnd = histDates[Math.min(histDates.length - 1, pos + arr.length)]
            futureRange = `${formatDate(frStart)} – ${formatDate(frEnd)}`
          }
        }
      }
      return {
        match: m.series.values,
        distance: m.distance,
        name: nm,
        src,
        range: m.series.index && m.series.index.length > 1
          ? `${formatDate(m.series.index[0])} – ${formatDate(m.series.index[m.series.index.length - 1])}`
          : undefined,
        future,
        futureRange,
      }
    })
  }, [matches, histSeries, histColumns, histDates])

  if (error) {
    return <div className="text-sm text-gray-500">Failed to load matches: {error}</div>
  }
  if (!matches) {
    return <div className="text-sm text-gray-500">Loading matches…</div>
  }
  if (!items.length) {
    return <div className="text-sm text-gray-500">No matches available for this country.</div>
  }

  const tileW = Math.floor((width - 16) / 2)
  const tileH = 170

  return (
    <div ref={containerRef} className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.slice(0, 4).map((it, idx) => {
          const n = it.match.length
          const f = it.future?.length || 0
          const total = Math.max(2, n + f)
          // Use a shared y-domain based on raw values of match+future only
          const vals = f && it.future ? [...it.match, ...(it.future as number[])] : [...it.match]
          const domMin = Math.min(...vals)
          const domMax = Math.max(...vals)
          const matchPath = buildSegmentPathWithDomain(it.match, total, 0, tileW, tileH, domMin, domMax)
          // Scale the source window via min-max onto the matched past domain
          const pastMin = Math.min(...it.match)
          const pastMax = Math.max(...it.match)
          const srcMin = Math.min(...it.src)
          const srcMax = Math.max(...it.src)
          const srcScaled = it.src.map(v => {
            const denom = (srcMax - srcMin) || 1
            const t = (v - srcMin) / denom
            return pastMin + t * (pastMax - pastMin)
          })
          const srcPath = buildSegmentPathWithDomain(srcScaled, total, 0, tileW, tileH, domMin, domMax)
          const futurePath = f && it.future ? buildSegmentPathWithDomain(it.future as number[], total, n, tileW, tileH, domMin, domMax) : ''
          const joinPath = f && it.future ? connectorWithDomain(it.match, it.future as number[], total, n, tileW, tileH, domMin, domMax) : ''
          return (
            <div key={idx} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-900">{it.name ? `${it.name}` : `Match ${idx + 1}`}</div>
                <div className="text-xs text-gray-500">distance {Number(it.distance).toFixed(4)}</div>
              </div>
              <div className="text-xs text-gray-500 mb-2">
                {it.range ? it.range : ''}
                {it.futureRange ? ` · future: ${it.futureRange}` : ''}
              </div>
              <svg role="img" aria-label={`Match ${idx + 1}`} viewBox={`0 0 ${tileW} ${tileH}`} width="100%" height={tileH}>
                {/* axes (subtle) */}
                <line x1="12" y1="16" x2="12" y2={tileH - 18} stroke="#e5e7eb" strokeWidth="1" />
                <line x1="12" y1={tileH - 18} x2={tileW - 12} y2={tileH - 18} stroke="#e5e7eb" strokeWidth="1" />
                {/* matched window */}
                <path d={matchPath} fill="none" stroke="#6b7280" strokeWidth="2.5" />
                {/* source window (min-max to matched past domain) */}
                <path d={srcPath} fill="none" stroke="#111827" strokeWidth="2.25" strokeDasharray="4,3" />
                {/* connector between match and future (visual link only) */}
                {joinPath && <path d={joinPath} fill="none" stroke="#dc2626" strokeWidth={1.5} strokeDasharray="3,3" />}
                {/* matched future (next 6 months) */}
                {futurePath && <path d={futurePath} fill="none" stroke="#dc2626" strokeWidth="2.25" />}
              </svg>
              <div className="mt-1 text-[11px] text-gray-500">Black dashed: current window (min-max to match past) · Gray: match · Red: future (6m)</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
