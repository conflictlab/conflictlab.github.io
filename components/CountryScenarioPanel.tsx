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
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || 'Failed to load scenarios')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const data = useMemo(() => {
    if (!scenarios || !selected) return null
    const key = normalizeName(selected)
    // Accept several shapes: {country: [...]}, {countries: {country: [...] }}, {sce_dictionary: {...}}
    const tryKeys = [
      scenarios[key],
      scenarios[selected],
      scenarios?.countries?.[selected],
      scenarios?.countries?.[key],
      scenarios?.sce_dictionary?.[selected],
      scenarios?.sce_dictionary?.[key],
    ]
    for (const cand of tryKeys) {
      if (!cand) continue
      // If array is directly provided
      if (Array.isArray(cand) && cand.every((x: any) => typeof x === 'number')) return cand as number[]
      // If object contains a list under common keys
      if (Array.isArray((cand as any).values)) return (cand as any).values
      if (Array.isArray((cand as any).series)) return (cand as any).series
      if (Array.isArray((cand as any).months)) return (cand as any).months
    }
    return null
  }, [scenarios, selected])

  return (
    <div>
      <CountryChoropleth items={items} onSelect={setSelected} />

      <div className="mt-6 border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700">
            Scenario for: <span className="font-medium text-gray-900">{selected || '—'}</span>
          </div>
          {err && <div className="text-xs text-rose-600">{err}</div>}
        </div>
        {!scenarios && (
          <div className="text-sm text-gray-500">Place scenarios at <code>/public/data/scenarios.json</code> to enable this panel.</div>
        )}
        {scenarios && !data && (
          <div className="text-sm text-gray-500">No scenario found for <span className="font-medium">{selected}</span>.</div>
        )}
        {scenarios && data && (
          <ScenarioChart values={data} />
        )}
      </div>
    </div>
  )
}

function ScenarioChart({ values, width = 720, height = 220 }: { values: number[]; width?: number; height?: number }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = width / (values.length - 1 || 1)
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  })
  return (
    <div>
      <svg
        role="img"
        aria-label="Country scenario"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="220"
        preserveAspectRatio="xMidYMid meet"
      >
        <polyline fill="none" stroke="#1e40af" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" points={points.join(' ')} />
      </svg>
      <div className="text-xs text-gray-500 mt-1">Shows the scenario series from sce_dictionary for the selected country.</div>
    </div>
  )
}

function normalizeName(s: string) { return s.toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim() }

