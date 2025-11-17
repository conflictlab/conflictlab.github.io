"use client"

import React, { useEffect, useMemo, useState } from 'react'

type Item = { name: string; iso3?: string }
interface Props { items: Item[] }

export default function ScenariosGrid({ items }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [data, setData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      try {
        const res = await fetch(`${base}/data/scenarios.json`)
        if (!res.ok) throw new Error(`Failed to load scenarios.json (${res.status})`)
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load scenarios.json')
      }
    }
    load()
    return () => { cancelled = true }
  }, [base])

  const list = useMemo(() => {
    const out: Array<{ name: string; iso3?: string; series: number[] | null }>= []
    for (const it of items) {
      const s = getSeries(data, it.name, it.iso3)
      out.push({ name: it.name, iso3: it.iso3, series: s })
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      return out.filter(x => x.name.toLowerCase().includes(q) || (x.iso3 || '').toLowerCase().includes(q))
    }
    return out
  }, [data, items, query])

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm text-gray-700">Country Scenarios</div>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter countries"
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        />
      </div>
      {error && <div className="text-sm text-rose-600">{error}</div>}
      {!error && !data && (
        <div className="text-sm text-gray-600">Loading scenarios…</div>
      )}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((c) => (
            <div key={c.name} className="border border-gray-200 rounded p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-800">{c.name}{c.iso3 ? ` (${c.iso3})` : ''}</div>
                {!c.series && <span className="text-[10px] text-gray-400">no data</span>}
              </div>
              {c.series && <ScenarioChart values={c.series} height={140} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function getSeries(scenarios: any, name?: string, iso3?: string): number[] | null {
  if (!scenarios) return null
  const unlog = (arr: number[]) => arr.map(v => {
    const n = Number(v)
    const out = Math.pow(10, n)
    return Number.isFinite(out) ? out : 0
  })
  const candidates: any[] = []
  const nm = (name || '').toString()
  const norm = normalizeName(nm)
  const codes = [iso3, (iso3 || '').toUpperCase()].filter(Boolean)
  // Try multiple likely shapes/keys
  if (nm) candidates.push(scenarios[nm], scenarios[norm])
  if (scenarios.sce_dictionary) candidates.push(scenarios.sce_dictionary[nm], scenarios.sce_dictionary[norm])
  if (scenarios.countries) candidates.push(scenarios.countries[nm], scenarios.countries[norm])
  for (const c of codes) {
    candidates.push(scenarios[c as any], scenarios.sce_dictionary?.[c as any], scenarios.countries?.[c as any])
  }
  const parseTS = (obj: any): number[] | null => {
    if (!obj || typeof obj !== 'object') return null
    const ks = Object.keys(obj)
    const dateKeys = ks.filter(k => /\d{4}-\d{2}-\d{2}/.test(k)).sort()
    if (!dateKeys.length) return null
    const first = obj[dateKeys[0]]
    if (Array.isArray(first)) {
      // Return the first scenario column as baseline
      return unlog(dateKeys.map(dk => {
        const v = obj[dk]
        const n = Array.isArray(v) ? Number(v[0] ?? 0) : Number(v ?? 0)
        return Number.isFinite(n) ? n : 0
      }))
    }
    return unlog(dateKeys.map(dk => {
      const n = Number(obj[dk] ?? 0)
      return Number.isFinite(n) ? n : 0
    }))
  }
  for (const cand of candidates) {
    if (!cand) continue
    if (Array.isArray(cand)) {
      if (cand.every((x) => typeof x === 'number')) return unlog(cand as number[])
      for (const el of cand) { const s = parseTS(el); if (s) return s }
      for (const el of cand) { if (Array.isArray(el?.values)) return unlog(el.values); if (Array.isArray(el?.series)) return unlog(el.series); if (Array.isArray(el?.months)) return unlog(el.months) }
    } else if (typeof cand === 'object') {
      const s = parseTS(cand); if (s) return s
      if (Array.isArray(cand?.values)) return unlog(cand.values)
      if (Array.isArray(cand?.series)) return unlog(cand.series)
      if (Array.isArray(cand?.months)) return unlog(cand.months)
    }
  }
  return null
}

function ScenarioChart({ values, width = 360, height = 160 }: { values: number[]; width?: number; height?: number }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = width / (values.length - 1 || 1)
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  })
  const ticks = 4
  const yTicks = Array.from({ length: ticks }, (_, i) => min + (range * i) / (ticks - 1))
  const fmt = (v: number) => (Math.abs(range) < 10 ? v.toFixed(1) : Math.round(v).toString())
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Scenario sparkline">
      {/* y grid */}
      {yTicks.map((t, i) => {
        const y = height - ((t - min) / range) * height
        return <line key={i} x1={0} y1={y} x2={width} y2={y} stroke="#f1f5f9" />
      })}
      {/* line */}
      <polyline fill="none" stroke="#1e40af" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={points.join(' ')} />
      {/* y labels */}
      {yTicks.map((t, i) => {
        const y = height - ((t - min) / range) * height
        return <text key={i} x={0} y={y - 2} className="text-[9px]" fill="#6b7280">{fmt(t)}</text>
      })}
      {/* x ticks: months 1..N */}
      {Array.from({ length: values.length }, (_, i) => {
        const x = i * stepX
        return <text key={`m-${i}`} x={x - 6} y={height - 6} className="text-[9px]" fill="#6b7280">{i + 1}m</text>
      })}
    </svg>
  )
}

function normalizeName(s: string) { return s.toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim() }
