'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type CountryValue = { name: string; iso3?: string; value?: number; months?: number[] }

interface Props {
  items: CountryValue[]
}

export default function CountryChoropleth({ items }: Props) {
  const [world, setWorld] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState<number>(1)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      try {
        // Lightweight world GeoJSON with name property
        const res = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        if (!res.ok) throw new Error('Failed to load world GeoJSON')
        const json = await res.json()
        if (!cancelled) setWorld(json)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load world GeoJSON')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const valueByName = useMemo(() => {
    const m = new Map<string, number>()
    for (const it of items) {
      if (!it) continue
      const v = Number((it.months ? it.months[month - 1] : it.value) ?? 0)
      if (it.name) m.set(normalizeName(it.name), v)
      // Optionally store common aliases
      const alias = aliasFor(it.name)
      if (alias) m.set(normalizeName(alias), v)
    }
    return m
  }, [items, month])

  const values = useMemo(() => items
    .map(i => Number((i.months ? i.months[month - 1] : i.value) ?? 0))
    .filter(v => Number.isFinite(v)), [items, month])
  const { thresholds, vmin, vmax } = useMemo(() => {
    if (!values.length) return { thresholds: [0,1], vmin: 0, vmax: 1 }
    const nz = values.filter(v => v > 0)
    const sorted = (nz.length >= 10 ? nz : values).slice().sort((a,b)=>a-b)
    const q = (p:number)=> sorted[Math.min(sorted.length-1, Math.max(0, Math.floor(p*(sorted.length-1))))]
    const t = [q(0.2), q(0.4), q(0.6), q(0.8), q(0.95)]
    const mn = sorted[0]
    const mx = sorted[sorted.length-1]
    for (let i=1;i<t.length;i++) if (t[i] <= t[i-1]) t[i] = t[i-1] + (mx - mn)/1000
    return { thresholds: t, vmin: mn, vmax: mx }
  }, [values])

  function colorFor(v: number) {
    if (!thresholds || thresholds.length === 0) return '#f5f5f5'
    if (v <= thresholds[0]) return '#fee8c8'
    if (v <= thresholds[1]) return '#fdbb84'
    if (v <= thresholds[2]) return '#ef6548'
    if (v <= thresholds[3]) return '#d7301f'
    if (v <= thresholds[4]) return '#b30000'
    return '#7f0000'
  }

  const style = (f: any) => {
    const name = normalizeName(f?.properties?.name || f?.properties?.NAME || '')
    const val = Number(valueByName.get(name) || 0)
    return {
      weight: val === 0 ? 0.3 : 0.6,
      color: val === 0 ? '#dddddd' : '#ffffff',
      fillColor: colorFor(val),
      fillOpacity: val === 0 ? 0.35 : 0.8,
    }
  }

  // Build a filtered GeoJSON with only non-zero countries for rendering and fitting
  const filtered = useMemo(() => {
    if (!world?.features?.length) return null
    const feats = [] as any[]
    for (const f of world.features) {
      const name = normalizeName(f?.properties?.name || f?.properties?.NAME || '')
      const v = Number(valueByName.get(name) || 0)
      if (v > 0) feats.push(f)
    }
    if (feats.length === 0) return null
    return { type: 'FeatureCollection', features: feats }
  }, [world, valueByName])

  // Compute dynamic bounds similar to the grid view
  // Match grid-view zoom behavior by shrinking computed bounds
  function shrinkBounds(b: any, factor = 0.35) {
    const [[minLat, minLon], [maxLat, maxLon]] = b
    let dLat = (maxLat - minLat) * 0.5
    let dLon = (maxLon - minLon) * 0.5
    const cLat = (maxLat + minLat) * 0.5
    const cLon = (maxLon + minLon) * 0.5
    dLat = Math.max(dLat * factor, 0.05)
    dLon = Math.max(dLon * factor, 0.05)
    return [[cLat - dLat, cLon - dLon], [cLat + dLat, cLon + dLon]]
  }

  const bounds: any = useMemo(() => {
    const src = filtered?.features?.length ? filtered.features : world?.features || []
    if (!src.length) return [[-60, -180], [80, 180]] as any
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
    for (const feat of src) {
      const geom = feat.geometry
      if (!geom) continue
      const polys = geom.type === 'Polygon' ? [geom.coordinates] : (geom.type === 'MultiPolygon' ? geom.coordinates : [])
      for (const poly of polys) {
        for (const ring of poly) {
          for (const [x, y] of ring) {
            if (y < minLat) minLat = y
            if (y > maxLat) maxLat = y
            if (x < minLon) minLon = x
            if (x > maxLon) maxLon = x
          }
        }
      }
    }
    // Add a small margin, then shrink similar to grid view
    if (minLat <= maxLat && minLon <= maxLon) return shrinkBounds([[minLat - 0.5, minLon - 0.5], [maxLat + 0.5, maxLon + 0.5]], 0.35) as any
    return [[-60, -180], [80, 180]] as any
  }, [world, filtered])

  // Derive a center from bounds and start at a fixed zoom to match grid feel
  const center: [number, number] = useMemo(() => {
    const b = bounds as any
    if (Array.isArray(b) && Array.isArray(b[0]) && Array.isArray(b[1])) {
      const lat = (b[0][0] + b[1][0]) / 2
      const lon = (b[0][1] + b[1][1]) / 2
      return [lat, lon]
    }
    return [20, 0]
  }, [bounds])

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-700">Country map — Predicted fatalities</div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 hidden sm:block">min {isFinite(vmin) ? vmin.toFixed(1) : '—'} → max {isFinite(vmax) ? vmax.toFixed(1) : '—'}</div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="whitespace-nowrap">Months ahead:</span>
              <div className="w-56 md:w-72">
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="range"
                  style={{ accentColor: '#1e40af' }}
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                  {[1,2,3,4,5,6].map(n => (
                    <span key={n}>{n}m</span>
                  ))}
                </div>
              </div>
              <span className="w-6 text-right font-medium">{month}</span>
            </div>
          </div>
        </div>
      <div className="h-[420px] md:h-[520px] rounded overflow-hidden">
        {error && (
          <div className="h-full flex items-center justify-center text-sm text-gray-600">{error}</div>
        )}
        {!error && (
          <MapContainer
            center={center as any}
            zoom={3}
            scrollWheelZoom={true}
            worldCopyJump={true}
            minZoom={1}
            maxBounds={[[-85, -180], [85, 180]] as any}
            maxBoundsViscosity={1.0}
            preferCanvas={true}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              noWrap={true}
            />
            {(filtered || world) && (
              <GeoJSON
                data={filtered || world}
                style={style as any}
                onEachFeature={(feature, layer) => {
                  const name = feature?.properties?.name || feature?.properties?.NAME || ''
                  const val = Number(valueByName.get(normalizeName(name)) || 0)
                  layer.bindTooltip(`${name}: ${val}`, { sticky: true })
                }}
              />
            )}
          </MapContainer>
        )}
      </div>
      <CountryLegend thresholds={thresholds} vmin={vmin} vmax={vmax} />
      <div className="mt-1 text-[10px] text-gray-400">Map data © OpenStreetMap contributors, © CARTO</div>
    </div>
  )
}

function normalizeName(s: string) { return s.toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim() }
function aliasFor(name: string): string | null {
  const n = normalizeName(name)
  const map: Record<string,string> = {
    'united states': 'united states of america',
    'congo kinshasa': 'democratic republic of the congo',
    'congo brazzaville': 'republic of the congo',
    'ivory coast': 'cote divoire',
    'eswatini': 'swaziland',
    'burma': 'myanmar',
    'south korea': 'korea',
    'north korea': 'korea',
    'macedonia': 'north macedonia',
    'russia': 'russian federation',
    'bolivia': 'bolivia, plurinational state of',
    'iran': 'iran, islamic republic of',
    'moldova': 'moldova, republic of',
    'syria': 'syrian arab republic',
    'tanzania': 'tanzania, united republic of',
    'venezuela': 'venezuela, bolivarian republic of',
  }
  return map[n] || null
}

function CountryLegend({ thresholds, vmin, vmax }: any) {
  const colors = ['#fee8c8','#fdbb84','#ef6548','#d7301f','#b30000','#7f0000']
  const labels = [
    `≤ ${fmt(thresholds?.[0])}`,
    `${fmt(thresholds?.[0])}–${fmt(thresholds?.[1])}`,
    `${fmt(thresholds?.[1])}–${fmt(thresholds?.[2])}`,
    `${fmt(thresholds?.[2])}–${fmt(thresholds?.[3])}`,
    `${fmt(thresholds?.[3])}–${fmt(thresholds?.[4])}`,
    `> ${fmt(thresholds?.[4])}`,
  ]
  return (
    <div className="mt-3 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span>Color scale (predicted fatalities):</span>
        <span className="text-gray-500">min {isFinite(vmin) ? vmin.toFixed(1) : '—'} → max {isFinite(vmax) ? vmax.toFixed(1) : '—'}</span>
      </div>
      <div className="mt-1 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: c }} />
            <span className="text-gray-700">{labels[i]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function fmt(v: any) {
  const n = Number(v)
  return Number.isFinite(n) ? (n >= 100 ? n.toFixed(0) : n.toFixed(1)) : '—'
}
