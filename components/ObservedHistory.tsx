"use client"

import { useEffect, useMemo, useRef, useState } from "react"

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

export default function ObservedHistory({ countryName, height = 220 }: { countryName: string; height?: number }) {
  const [series, setSeries] = useState<Array<{ date: Date; value: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(900)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        // Prefer conf.csv (full monthly history); then hist_full.csv; then hist.csv
        let resp: Response | null = null
        const tryFiles = ['conf.csv', 'hist_full.csv', 'hist.csv']
        for (const f of tryFiles) {
          try {
            const r = await fetch(`${base}/data/${f}`)
            if (r.ok) { resp = r; break }
          } catch {}
        }
        if (!resp.ok) return
        const text = await resp.text()
        const { header, rows } = parseCSV(text)
        const sought = ALIASES[countryName] || countryName
        let col = header.findIndex(h => h === sought)
        if (col < 0) {
          const target = normalizeName(sought)
          col = header.findIndex(h => normalizeName(h) === target)
        }
        if (col < 0) return
        const out: Array<{ date: Date; value: number }> = []
        for (const r of rows) {
          const d = r[0]
          const v = Number(r[col])
          if (!d || !Number.isFinite(v)) continue
          // Expect YYYY-MM-DD
          const dt = new Date(d + 'T00:00:00Z')
          out.push({ date: dt, value: v })
        }
        if (!cancelled) setSeries(out)
      } catch {}
    }
    load()
    return () => { cancelled = true }
  }, [countryName])

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

  const last = useMemo(() => {
    if (!series.length) return [] as Array<{ date: Date; value: number }>
    return series.slice(-60)
  }, [series])

  const padding = { t: 16, r: 16, b: 28, l: 40 }
  const w = width - padding.l - padding.r
  const h = height - padding.t - padding.b
  const xDomain = last.length ? [last[0].date.getTime(), last[last.length - 1].date.getTime()] : [0, 1]
  const yVals = last.map(d => d.value)
  const yMin = 0
  const yMax = Math.max(1, Math.max(...yVals))
  const scaleX = (t: number) => padding.l + (w * ((t - xDomain[0]) / Math.max(1, xDomain[1] - xDomain[0])))
  const scaleY = (v: number) => padding.t + h - (h * ((v - yMin) / Math.max(1, yMax - yMin)))
  const path = last.length ? `M ${last.map((d, i) => `${scaleX(d.date.getTime())},${scaleY(d.value)}`).join(' L ')}` : ''

  // Build x ticks monthly (4-6 ticks)
  const xTicks: Array<{ x: number; label: string }> = []
  if (last.length) {
    const count = Math.min(6, Math.max(3, Math.floor(w / 120)))
    for (let i = 0; i < count; i++) {
      const idx = Math.floor((i / (count - 1)) * (last.length - 1))
      const d = last[idx]?.date
      if (!d) continue
      const x = scaleX(d.getTime())
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      xTicks.push({ x, label })
    }
  }

  const yTicks: number[] = []
  const yTickCount = 4
  for (let i = 0; i < yTickCount; i++) {
    const v = yMin + ((yMax - yMin) * i) / (yTickCount - 1)
    yTicks.push(v)
  }

  return (
    <div ref={containerRef} className="w-full">
      <svg role="img" aria-label={`Observed fatalities for ${countryName}`} viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        {/* axes */}
        <line x1={padding.l} y1={padding.t} x2={padding.l} y2={padding.t + h} stroke="#e5e7eb" />
        <line x1={padding.l} y1={padding.t + h} x2={padding.l + w} y2={padding.t + h} stroke="#e5e7eb" />
        {/* y ticks */}
        {yTicks.map((v, i) => {
          const y = scaleY(v)
          const label = Math.round(v).toString()
          return (
            <g key={i}>
              <line x1={padding.l - 4} y1={y} x2={padding.l} y2={y} stroke="#d1d5db" />
              <text x={padding.l - 8} y={y + 3} textAnchor="end" className="text-[10px]" fill="#6b7280">{label}</text>
            </g>
          )
        })}
        {/* x ticks */}
        {xTicks.map((t, i) => (
          <g key={i}>
            <line x1={t.x} y1={padding.t + h} x2={t.x} y2={padding.t + h + 4} stroke="#d1d5db" />
            <text x={t.x} y={padding.t + h + 16} textAnchor="middle" className="text-[10px]" fill="#6b7280">{t.label}</text>
          </g>
        ))}
        {/* line */}
        {path && <path d={path} fill="none" stroke="#111827" strokeWidth={2.5} />}
      </svg>
    </div>
  )
}
