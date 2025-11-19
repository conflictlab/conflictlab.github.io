"use client"

import React, { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
const CountryChoropleth = dynamic(() => import('./CountryChoropleth'), { ssr: false })

type CountryValue = { name: string; iso3?: string; value?: number; months?: number[] }

interface Props {
  items: CountryValue[]
}

type ScenariosMap = Record<string, any>

export default function CountryScenarioPanel({ items }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [scenarios, setScenarios] = useState<ScenariosMap | null>(null)
  const [minmax, setMinmax] = useState<any | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    // Preselect first item with data
    if (!selected && items && items.length) setSelected(items[0].name)
  }, [items, selected])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setErr(null)
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/scenarios.json`)
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setScenarios(json)
        // Try minmax alongside scenarios
        try {
          const mm = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/minmax.json`)
          if (mm.ok) { const m = await mm.json(); if (!cancelled) setMinmax(m) }
        } catch {}
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load scenarios')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const seriesMap = useMemo(() => {
    // Returns label->series[] for the selected country, or null
    if (!scenarios || !selected) return null as null | Record<string, number[]>
    const key = normalizeName(selected)
    const iso3 = (items.find(it => normalizeName(it.name) === key)?.iso3 || '').toUpperCase()
    const fuzzyGet = (container: any, name: string) => {
      if (!container || typeof container !== 'object') return undefined
      if (container[name] !== undefined) return container[name]
      const normName = normalizeName(name)
      let bestKey: string | null = null
      for (const k of Object.keys(container)) {
        const nk = normalizeName(String(k))
        if (nk === normName) { bestKey = k; break }
        if (!bestKey && (nk.startsWith(normName) || normName.startsWith(nk))) bestKey = k
      }
      return bestKey ? container[bestKey] : undefined
    }

    const candidates = [
      fuzzyGet(scenarios, selected), fuzzyGet(scenarios, key), iso3 ? fuzzyGet(scenarios, iso3) : undefined,
      fuzzyGet(scenarios?.countries, selected), fuzzyGet(scenarios?.countries, key), iso3 ? fuzzyGet(scenarios?.countries, iso3) : undefined,
      fuzzyGet(scenarios?.sce_dictionary, selected), fuzzyGet(scenarios?.sce_dictionary, key), iso3 ? fuzzyGet(scenarios?.sce_dictionary, iso3) : undefined,
    ]

    const out: Record<string, number[]> = {}
    const denorm = (label: string, arr: number[]): number[] => {
      if (!minmax) return arr
      const get = (container: any, name: string) => {
        if (!container || typeof container !== 'object') return undefined
        if (container[name] !== undefined) return container[name]
        const normName = normalizeName(name)
        let bestKey: string | null = null
        for (const k of Object.keys(container)) {
          const nk = normalizeName(String(k))
          if (nk === normName) { bestKey = k; break }
          if (!bestKey && (nk.startsWith(normName) || normName.startsWith(nk))) bestKey = k
        }
        return bestKey ? container[bestKey] : undefined
      }
      const countryMM = get(minmax, selected!) || get(minmax, iso3)
      const mm = countryMM?.[label]
      if (!mm || typeof mm.min !== 'number' || typeof mm.max !== 'number') return arr
      const min = mm.min, max = mm.max
      const span = max - min
      if (!Number.isFinite(span) || span === 0) return arr
      return arr.map(v => (Number(v) * span) + min)
    }
    const addSeries = (label: string, arr: any) => {
      if (Array.isArray(arr) && arr.every((x) => typeof x === 'number')) {
        out[label] = denorm(label, arr as number[])
      }
    }
    const scanObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return
      // Common fields
      const common = ['baseline','base','median','p50','mean','central','values','series','months','upper','lower','p10','p90']
      for (const k of Object.keys(obj)) {
        const v = (obj as any)[k]
        if (Array.isArray(v) && v.every((x: any) => typeof x === 'number')) addSeries(String(k), v)
        else if (typeof v === 'object') {
          for (const c of common) {
            const vv = (v as any)[c]
            if (Array.isArray(vv) && vv.every((x: any) => typeof x === 'number')) addSeries(`${k}:${c}`, vv)
          }
        }
      }
      // Direct common fields at root
      for (const c of common) {
        const vv = (obj as any)[c]
        if (Array.isArray(vv) && vv.every((x: any) => typeof x === 'number')) addSeries(c, vv)
      }
    }

    const parseTimeSeriesObject = (obj: any) => {
      if (!obj || typeof obj !== 'object') return false
      const ks = Object.keys(obj)
      const dateKeys = ks.filter(k => /\d{4}-\d{2}-\d{2}/.test(k))
      if (dateKeys.length === 0) return false
      // Sort by date key ascending
      dateKeys.sort()
      const first = obj[dateKeys[0]]
      if (Array.isArray(first)) {
        // Multiple parallel series (columns)
        const cols = first.length
        for (let c = 0; c < cols; c++) {
          const series: number[] = []
          for (const dk of dateKeys) {
            const v = obj[dk]
            const n = Array.isArray(v) ? Number(v[c] ?? 0) : Number(v ?? 0)
            series.push(Number.isFinite(n) ? n : 0)
          }
          addSeries(`s${c + 1}`, series)
        }
      } else {
        // Single scalar per date key
        const series: number[] = []
        for (const dk of dateKeys) {
          const v = obj[dk]
          const n = Array.isArray(v) ? Number(v[0] ?? 0) : Number(v ?? 0)
          series.push(Number.isFinite(n) ? n : 0)
        }
        addSeries('scenario', series)
      }
      return true
    }

    for (const cand of candidates) {
      if (!cand) continue
      if (Array.isArray(cand)) {
        if (cand.every((x: any) => typeof x === 'number')) {
          addSeries('scenario', cand)
        } else {
          // Look for time-series object inside the array
          let parsed = false
          for (const el of cand) {
            if (typeof el === 'object') { parsed = parseTimeSeriesObject(el) || parsed }
          }
          if (!parsed) {
            // Fallback: scan objects for common fields
            for (const el of cand) { if (typeof el === 'object') scanObject(el) }
          }
        }
      } else if (typeof cand === 'object') {
        if (!parseTimeSeriesObject(cand)) scanObject(cand)
      }
      if (Object.keys(out).length) break
    }
    return Object.keys(out).length ? out : null
  }, [scenarios, selected, items, minmax])

  return (
    <div>
      <CountryChoropleth items={items} onSelect={setSelected} />

      <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700">
            Scenarios for: <span className="font-medium text-gray-900">{selected || '—'}</span>
          </div>
          {err && <div className="text-xs text-rose-600">{err}</div>}
        </div>
        {!scenarios && (
          <div className="text-sm text-gray-500">Place scenarios at <code>/public/data/scenarios.json</code> to enable this panel.</div>
        )}
        {scenarios && !seriesMap && (
          <div className="text-sm text-gray-500">No scenario found for <span className="font-medium">{selected}</span>.</div>
        )}
        {scenarios && seriesMap && (
          <ScenarioMultiChart seriesMap={seriesMap} />
        )}
      </div>
    </div>
  )
}

function ScenarioMultiChart({ seriesMap, width = 720, height = 220 }: { seriesMap: Record<string, number[]>; width?: number; height?: number }) {
  const entries = Object.entries(seriesMap)
  if (!entries.length) return null
  const allVals = entries.flatMap(([_, arr]) => arr)
  const min = Math.min(...allVals)
  const max = Math.max(...allVals)
  const range = max - min || 1
  const colors = ['#1e40af','#059669','#b91c1c','#d97706','#7c3aed','#0e7490']
  const paths = entries.map(([label, values], idx) => {
    const stepX = width / (values.length - 1 || 1)
    const points = values.map((v, i) => {
      const x = i * stepX
      const y = height - ((v - min) / range) * height
      return `${x},${y}`
    })
    return { label, color: colors[idx % colors.length], d: `M ${points.join(' L ')}` }
  })
  const ticks = 4
  const yTicks = Array.from({ length: ticks }, (_, i) => min + (range * i) / (ticks - 1))
  const fmt = (v: number) => (Math.abs(range) < 10 ? v.toFixed(1) : Math.round(v).toString())
  const maxLen = Math.max(...entries.map(([_, arr]) => arr.length))
  // Compute last-point distribution as simple proportions (not calibrated probabilities)
  const lastDist = (() => {
    const lastVals = entries.map(([label, arr]) => ({ label, v: arr[arr.length - 1] ?? 0 }))
    const total = lastVals.reduce((s, x) => s + Math.max(0, Number(x.v) || 0), 0)
    return lastVals.map(x => ({ label: x.label, pct: total > 0 ? (Math.max(0, Number(x.v) || 0) / total) * 100 : 0 }))
  })()

  return (
    <div>
      <svg role="img" aria-label="Country scenarios" viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
        {/* grid */}
        {yTicks.map((t, i) => {
          const y = height - ((t - min) / range) * height
          return <line key={i} x1={0} y1={y} x2={width} y2={y} stroke="#f1f5f9" />
        })}
        {/* lines */}
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill="none" stroke={p.color} strokeWidth={2} />
        ))}
        {/* y labels */}
        {yTicks.map((t, i) => {
          const y = height - ((t - min) / range) * height
          return <text key={i} x={0} y={y - 2} className="text-[10px]" fill="#6b7280">{fmt(t)}</text>
        })}
        {/* x ticks: months 1..N */}
        {Array.from({ length: maxLen }, (_, i) => {
          const x = maxLen > 1 ? (i * (width / (maxLen - 1))) : 0
          return <text key={`m-${i}`} x={x - 6} y={height - 6} className="text-[10px]" fill="#6b7280">{i + 1}m</text>
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-700">
        {paths.map((p, i) => {
          const display = (label: string) => {
            const m = /^s(\d+)$/i.exec(label)
            return m ? `Scenario ${m[1]}` : label
          }
          const pct = lastDist.find(x => x.label === p.label)?.pct ?? 0
          return (
            <span key={i} className="inline-flex items-center gap-1">
              <span className="inline-block w-3 h-2 rounded" style={{ backgroundColor: p.color }} />
              <span>{display(p.label)} {pct ? `(${pct.toFixed(0)}%)` : ''}</span>
            </span>
          )
        })}
      </div>
      <div className="text-xs text-gray-500 mt-1">Shows the scenario series extracted for the selected country.</div>
    </div>
  )
}

function normalizeName(s: string) { return s.toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim() }
