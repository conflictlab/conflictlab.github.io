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

function parseUTCDate(s?: string): Date | null {
  if (!s) return null
  const str = String(s)
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/)
  if (m) {
    const y = Number(m[1]); const mo = Number(m[2]) - 1; const d = Number(m[3])
    return new Date(Date.UTC(y, mo, d))
  }
  const d2 = new Date(str)
  return isFinite(d2.getTime()) ? d2 : null
}

function formatMonthYear(d: Date | null): string {
  if (!d) return ''
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
}

function formatFriendlyRange(start?: string, end?: string): string {
  const ds = parseUTCDate(start)
  const de = parseUTCDate(end)
  if (!ds && !de) return ''
  if (ds && de) {
    const ys = ds.getUTCFullYear(); const ye = de.getUTCFullYear()
    const ms = ds.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    const me = de.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    if (ys === ye) return `${ms} – ${me} ${ys}`
    return `${ms} ${ys} – ${me} ${ye}`
  }
  return formatMonthYear(ds || de)
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
  const sourceRef = useRef<HTMLDivElement>(null)
  const matchRefs = useRef<Array<HTMLDivElement | null>>([])
  const [arrows, setArrows] = useState<Array<{ x1: number, y1: number, x2: number, y2: number }>>([])

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

        // Identify columns of interest (use array to avoid downlevel iteration issues)
        const wantNames: string[] = [ALIASES[countryName] || countryName]
        top.forEach(m => {
          if (m.series?.name) {
            const nm = ALIASES[m.series.name] || m.series.name
            if (!wantNames.includes(nm)) wantNames.push(nm)
          }
        })
        const cols: Record<string, number[]> = {}
        for (let ci = 1; ci < header.length; ci++) {
          const name = header[ci]
          if (!name) continue
          if (!wantNames.some(nm => name === nm || normalizeName(name) === normalizeName(nm))) continue
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
            futureRange = formatFriendlyRange(frStart, frEnd)
          }
        }
      }
      return {
        match: m.series.values,
        distance: m.distance,
        name: nm,
        src,
        range: m.series.index && m.series.index.length > 1
          ? formatFriendlyRange(m.series.index[0], m.series.index[m.series.index.length - 1])
          : undefined,
        future,
        futureRange,
      }
    })
  }, [matches, histSeries, histColumns, histDates])

  // Compute connector arrows from source tile to each match tile (desktop only)
  useEffect(() => {
    const updateArrows = () => {
      if (!containerRef.current || !sourceRef.current) { setArrows([]); return }
      const contRect = containerRef.current.getBoundingClientRect()
      const srcRect = sourceRef.current.getBoundingClientRect()
      const srcX = srcRect.right - contRect.left
      const srcY = srcRect.top + srcRect.height / 2 - contRect.top
      const out: Array<{ x1: number, y1: number, x2: number, y2: number }> = []
      for (let i = 0; i < 4; i++) {
        const el = matchRefs.current[i]
        if (!el) continue
        const r = el.getBoundingClientRect()
        const dstX = r.left - contRect.left
        const dstY = r.top + r.height / 2 - contRect.top
        out.push({ x1: srcX, y1: srcY, x2: dstX, y2: dstY })
      }
      setArrows(out)
    }
    updateArrows()
    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      ro = new ResizeObserver(() => updateArrows())
      ro.observe(containerRef.current)
    } else {
      window.addEventListener('resize', updateArrows)
    }
    return () => {
      if (ro && containerRef.current) ro.unobserve(containerRef.current)
      window.removeEventListener('resize', updateArrows)
    }
  }, [width, items])

  if (error) {
    return <div className="text-sm text-gray-500">Failed to load matches: {error}</div>
  }
  if (!matches) {
    return <div className="text-sm text-gray-500">Loading matches…</div>
  }
  if (!items.length) {
    return <div className="text-sm text-gray-500">No matches available for this country.</div>
  }

  // Compute tile width based on responsive grid (1, 2, or 3 columns)
  const isDesktop = width >= 768
  const cols = isDesktop ? 3 : 1
  const gapPx = 16 // gap-4
  const tileW = Math.floor((width - (cols - 1) * gapPx) / cols)
  const matchTileH = isDesktop ? 140 : 170
  const sourceTileH = isDesktop ? 300 : 180
  const tileH = 170

  return (
    <div ref={containerRef} className="w-full relative">
      {/* Arrows overlay (desktop only) */}
      {width >= 768 && arrows.length > 0 && (
        <svg className="pointer-events-none absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${containerRef.current?.clientWidth || 0} ${containerRef.current?.clientHeight || 0}`}>
          <defs>
            <marker id="arrowhead" markerWidth="5" markerHeight="3" refX="5" refY="1.5" orient="auto">
              <polygon points="0 0, 5 1.5, 0 3" fill="#B91C1C" />
            </marker>
          </defs>
          {arrows.map((a, i) => (
            <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="#B91C1C" strokeWidth={1.5} markerEnd="url(#arrowhead)" opacity={0.7} vector-effect="non-scaling-stroke" />
          ))}
        </svg>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* Left column: source tile */}
        <div ref={sourceRef} className="md:self-center">
          {(() => {
            const first = items[0]
            const n = first?.match?.length || 10
            const srcOnly = histSeries.slice(-n)
            if (!srcOnly.length) return null
            const yMin = Math.min(...srcOnly)
            const yMax = Math.max(...srcOnly)
            const sH = sourceTileH
            const pathSrc = buildSegmentPathWithDomain(srcOnly, n, 0, tileW, sH, yMin, yMax)
            // Marker helpers
            const x0 = 12
            const x1 = tileW - 12
            const y0 = 16
            const y1 = sH - 18
            const w = Math.max(1, x1 - x0)
            const h = Math.max(1, y1 - y0)
            const rng = (yMax - yMin) || 1
            const sx = (i: number) => x0 + (i / Math.max(1, (n - 1))) * w
            const sy = (v: number) => y1 - ((v - yMin) / rng) * h

            return (
              <div key="source-tile" className="bg-white border-2 border-pace-red rounded-lg p-3 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">{countryName}</div>
                  <div className="text-xs text-pace-red font-medium">Source</div>
                </div>
                <div className="text-xs text-gray-500 mb-2">Last {n} months</div>
                <svg role="img" aria-label={`Source current window`} viewBox={`0 0 ${tileW} ${sH}`} width="100%" height={sH}>
                  <line x1="12" y1="16" x2="12" y2={sH - 18} stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="12" y1={sH - 18} x2={tileW - 12} y2={sH - 18} stroke="#e5e7eb" strokeWidth="1" />
                  <path d={pathSrc} fill="none" stroke="#111827" strokeWidth="2.25" strokeDasharray="4,3" />
                  {srcOnly.map((v, i) => (
                    <circle key={`src-${i}`} cx={sx(i)} cy={sy(v)} r={3} fill="#111827" stroke="#ffffff" strokeWidth={1} />
                  ))}
                </svg>
              </div>
            )
          })()}
        </div>

        {/* Middle column: arrow gutter (layout only) */}
        <div className="hidden md:block" />

        {/* Right column: 4 matches stacked vertically */}
        <div className="grid grid-cols-1 gap-4">
        {items.slice(0, 4).map((it, idx) => {
          const n = it.match.length
          const f = it.future?.length || 0
          const total = Math.max(2, n + f)
          // Use a shared y-domain based on raw values of match+future only
          const vals = f && it.future ? [...it.match, ...(it.future as number[])] : [...it.match]
          const domMin = Math.min(...vals)
          const domMax = Math.max(...vals)
          const mH = matchTileH
          const matchPath = buildSegmentPathWithDomain(it.match, total, 0, tileW, mH, domMin, domMax)
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
          const srcPath = buildSegmentPathWithDomain(srcScaled, total, 0, tileW, mH, domMin, domMax)
          const futurePath = f && it.future ? buildSegmentPathWithDomain(it.future as number[], total, n, tileW, mH, domMin, domMax) : ''
          const joinPath = f && it.future ? connectorWithDomain(it.match, it.future as number[], total, n, tileW, mH, domMin, domMax) : ''
          // Compute vertical 'now' divider (at the joint between match and future)
          const x0 = 12
          const x1 = tileW - 12
          const w = Math.max(1, x1 - x0)
          const xNow = x0 + ((Math.max(0, n - 1)) / Math.max(1, total - 1)) * w
          // Helpers to plot point markers
          const y0 = 16
          const y1 = mH - 18
          const h = Math.max(1, y1 - y0)
          const denom = (domMax - domMin) || 1
          const sx = (i: number) => x0 + ((i) / Math.max(1, total - 1)) * w
          const sy = (v: number) => y1 - ((v - domMin) / denom) * h
          return (
            <div key={idx} ref={(el) => { matchRefs.current[idx] = el }} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-900">{it.name ? `${it.name}` : `Match ${idx + 1}`}</div>
                <div className="text-xs text-gray-500">distance {Number(it.distance).toFixed(4)}</div>
              </div>
              <div className="text-xs text-gray-500 mb-2">{it.range || ''}</div>
              <svg role="img" aria-label={`Match ${idx + 1}`} viewBox={`0 0 ${tileW} ${mH}`} width="100%" height={mH}>
                {/* axes (subtle) */}
                <line x1="12" y1="16" x2="12" y2={tileH - 18} stroke="#e5e7eb" strokeWidth="1" />
                <line x1="12" y1={mH - 18} x2={tileW - 12} y2={mH - 18} stroke="#e5e7eb" strokeWidth="1" />
                {/* 'Now' divider */}
                <line x1={xNow} y1={16} x2={xNow} y2={mH - 18} stroke="#9ca3af" strokeWidth={2.25} strokeDasharray="4,4" opacity={0.85} />
                {/* matched window */}
                <path d={matchPath.replaceAll(`${tileH}`, `${mH}`)} fill="none" stroke="#6b7280" strokeWidth="2.5" />
                {/* matched markers */}
                {it.match.map((v, i) => (
                  <circle key={`m-${i}`} cx={sx(i)} cy={sy(v)} r={3.5} fill="#6b7280" stroke="#ffffff" strokeWidth={1} />
                ))}
                {/* source window (min-max to matched past domain) */}
                <path d={srcPath.replaceAll(`${tileH}`, `${mH}`)} fill="none" stroke="#111827" strokeWidth="2.25" strokeDasharray="4,3" />
                {/* source markers */}
                {srcScaled.map((v, i) => (
                  <circle key={`s-${i}`} cx={sx(i)} cy={sy(v)} r={3} fill="#111827" stroke="#ffffff" strokeWidth={1} />
                ))}
                {/* connector between match and future (visual link only) */}
                {joinPath && <path d={joinPath.replaceAll(`${tileH}`, `${mH}`)} fill="none" stroke="#dc2626" strokeWidth={2.25} />}
                {/* matched future (next 6 months) */}
                {futurePath && <path d={futurePath.replaceAll(`${tileH}`, `${mH}`)} fill="none" stroke="#dc2626" strokeWidth="2.25" />}
                {/* future markers */}
                {(it.future || []).map((v, i) => (
                  <circle key={`f-${i}`} cx={sx(n + i)} cy={sy(v as number)} r={3.5} fill="#dc2626" stroke="#ffffff" strokeWidth={1} />
                ))}
              </svg>
              
            </div>
          )
        })}
        </div>
      </div>

      {/* Single shared legend below */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-3">
        <div className="inline-flex items-center gap-2">
          <svg width="32" height="8" aria-hidden="true"><line x1="0" y1="4" x2="32" y2="4" stroke="#6b7280" strokeWidth="2.5" /></svg>
          <span>Match (past)</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <svg width="32" height="8" aria-hidden="true"><line x1="0" y1="4" x2="32" y2="4" stroke="#dc2626" strokeWidth="2.5" /></svg>
          <span>Future</span>
        </div>
        <div className="inline-flex items-center gap-2">
          <svg width="32" height="8" aria-hidden="true"><line x1="0" y1="4" x2="32" y2="4" stroke="#111827" strokeWidth="2.25" strokeDasharray="4,3" /></svg>
          <span>Source (current)</span>
        </div>
      </div>
    </div>
  )
}
