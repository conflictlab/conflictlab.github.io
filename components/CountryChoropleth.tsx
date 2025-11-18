'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type CountryValue = { name: string; iso3?: string; value?: number; months?: number[] }

interface Props {
  items: CountryValue[]
  onSelect?: (name: string) => void
  hideDownloadButton?: boolean
  mapHeight?: string
  initialZoom?: number
  hideControls?: boolean
  hideLegend?: boolean
  showHotspots?: boolean
}

export default function CountryChoropleth({ items, onSelect, hideDownloadButton = false, mapHeight = '560px', initialZoom = 2.7, hideControls = false, hideLegend = false, showHotspots = false }: Props) {
  const pathname = usePathname()
  const [world, setWorld] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState<number>(1)
  const [showZoomHint, setShowZoomHint] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      try {
        // Load local world GeoJSON
        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        const res = await fetch(`${base}/data/world.geojson`)
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

  useEffect(() => {
    const t = setTimeout(() => setShowZoomHint(false), 7000)
    return () => clearTimeout(t)
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
  const thresholds = useMemo(() => [10, 50, 100, 1000], [])
  const { vmin, vmax } = useMemo(() => {
    if (!values.length) return { vmin: 0, vmax: 1 }
    const sorted = values.slice().sort((a,b)=>a-b)
    return { vmin: sorted[0], vmax: sorted[sorted.length-1] }
  }, [values])

  function colorFor(v: number) {
    if (!thresholds || thresholds.length === 0) return '#f5f5f5'
    if (v <= thresholds[0]) return '#fee8c8'
    if (v <= thresholds[1]) return '#fdbb84'
    if (v <= thresholds[2]) return '#ef6548'
    if (v <= thresholds[3]) return '#d7301f'
    return '#b30000'
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

  // Bias the initial view slightly north to show more of the northern hemisphere
  const centerAdjusted: [number, number] = useMemo(() => {
    const northBiasDeg = 7
    return [center[0] + northBiasDeg, center[1]]
  }, [center])

  // Calculate hotspots for high-risk countries (for animated pulsing circles)
  const hotspots = useMemo(() => {
    if (!showHotspots || !world?.features?.length) return []
    const spots: Array<{ name: string; lat: number; lon: number; value: number }> = []
    const threshold = 100 // Only show hotspots for countries with risk > 100

    for (const f of world.features) {
      const name = normalizeName(f?.properties?.name || f?.properties?.NAME || '')
      const val = Number(valueByName.get(name) || 0)

      if (val > threshold) {
        const centroid = calculateCentroid(f.geometry)
        if (centroid) {
          spots.push({ name: f?.properties?.name || f?.properties?.NAME || '', lat: centroid[1], lon: centroid[0], value: val })
        }
      }
    }
    return spots
  }, [world, valueByName, showHotspots])

  return (
    <div className="border border-gray-200 rounded-lg p-0 bg-white">
      <div className={`rounded overflow-hidden relative`} style={{ height: mapHeight }}>
        {/* View toggle overlay (center-bottom, larger) */}
        {!hideControls && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform z-[1000]">
            <div className="inline-flex rounded-xl border-2 border-clairient-blue overflow-hidden bg-white/95 backdrop-blur shadow-lg">
              <Link
                href="/forecasts"
                className={`px-6 py-2 text-lg ${pathname?.startsWith('/forecasts-grid') ? 'text-clairient-blue hover:bg-blue-50' : 'bg-clairient-blue text-white'}`}
              >
                Country view
              </Link>
              <Link
                href="/forecasts-grid"
                className={`px-6 py-2 text-lg ${pathname?.startsWith('/forecasts-grid') ? 'bg-clairient-blue text-white' : 'text-clairient-blue hover:bg-blue-50'}`}
              >
                Grid view
              </Link>
            </div>
          </div>
        )}
        {error && (
          <div className="h-full flex items-center justify-center text-sm text-gray-600">{error}</div>
        )}
        {!error && (
          <MapContainer
            center={centerAdjusted as any}
            zoom={initialZoom}
            zoomSnap={0.5}
            zoomDelta={0.5}
            scrollWheelZoom={false}
            worldCopyJump={true}
            minZoom={1}
            wheelPxPerZoomLevel={40}
            doubleClickZoom={true}
            zoomAnimation={true}
            maxBounds={[[-85, -180], [85, 180]] as any}
            maxBoundsViscosity={1.0}
            preferCanvas={true}
            attributionControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Require Cmd/Ctrl + scroll to zoom */}
            {(() => {
              function CtrlScrollZoom() {
                const map = useMap()
                useEffect(() => {
                  map.scrollWheelZoom.disable()
                  let timeoutId: any = null
                  const onWheel = (e: WheelEvent) => {
                    if (e.ctrlKey || e.metaKey) {
                      map.scrollWheelZoom.enable()
                      if (timeoutId) clearTimeout(timeoutId)
                      timeoutId = setTimeout(() => {
                        map.scrollWheelZoom.disable()
                        timeoutId = null
                      }, 1500)
                      }
                  }
                  const container = map.getContainer()
                  container.addEventListener('wheel', onWheel, { passive: true })
                  return () => {
                    container.removeEventListener('wheel', onWheel as any)
                    if (timeoutId) clearTimeout(timeoutId)
                  }
                }, [map])
                return null
              }
              return <CtrlScrollZoom />
            })()}
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
                  layer.bindTooltip(`${name}: ${Number(val.toFixed(1))}`, { sticky: true })
                  layer.on('click', () => {
                    if (name) onSelect?.(String(name))
                  })
                }}
              />
            )}
            {/* Animated pulsing hotspots for high-risk countries */}
            {showHotspots && hotspots.map((spot, idx) => (
              <React.Fragment key={`${spot.name}-${idx}`}>
                {/* Outer pulse ring */}
                <CircleMarker
                  center={[spot.lat, spot.lon] as any}
                  radius={12}
                  pathOptions={{
                    fillColor: '#dc2626',
                    fillOpacity: 0.1,
                    color: '#dc2626',
                    weight: 2,
                    opacity: 0.7,
                  }}
                  className="pulse-ring"
                />
                {/* Inner solid circle */}
                <CircleMarker
                  center={[spot.lat, spot.lon] as any}
                  radius={5}
                  pathOptions={{
                    fillColor: '#dc2626',
                    fillOpacity: 0.9,
                    color: '#ffffff',
                    weight: 2,
                    opacity: 1,
                  }}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        )}
        {showZoomHint && (
          <div className="absolute bottom-4 right-4 z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 shadow-sm flex items-center gap-2">
              <span>Zoom: Double-click or hold Cmd (⌘)/Ctrl + scroll</span>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowZoomHint(false)}>×</button>
            </div>
          </div>
        )}
        {/* CSS for pulsing animation */}
        {showHotspots && (
          <style jsx global>{`
            @keyframes pulse {
              0% {
                transform: scale(1);
                opacity: 0.6;
              }
              50% {
                transform: scale(2);
                opacity: 0.3;
              }
              100% {
                transform: scale(3);
                opacity: 0;
              }
            }
            .pulse-ring {
              animation: pulse 2.5s ease-out infinite;
              transform-origin: center center;
            }
          `}</style>
        )}
      </div>
      {/* Controls moved below map */}
      {!hideLegend && (
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">min {isFinite(vmin) ? vmin.toFixed(1) : '—'} → max {isFinite(vmax) ? vmax.toFixed(1) : '—'}</div>
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
          <CountryLegend thresholds={thresholds} />
          {!hideDownloadButton && (
            <div className="mt-4 text-center">
              <Link href="/downloads" className="btn-primary inline-flex items-center justify-center">
                Data downloads
              </Link>
            </div>
          )}
          <div className="mt-1 text-[10px] text-gray-400">Map data © OpenStreetMap contributors, © CARTO</div>
        </div>
      )}
    </div>
  )
}

function normalizeName(s: string) { return s.toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim() }

// Calculate centroid of a geometry (approximate for visualization)
function calculateCentroid(geometry: any): [number, number] | null {
  if (!geometry) return null

  const coords: number[][] = []

  if (geometry.type === 'Polygon') {
    coords.push(...geometry.coordinates[0])
  } else if (geometry.type === 'MultiPolygon') {
    for (const poly of geometry.coordinates) {
      coords.push(...poly[0])
    }
  }

  if (coords.length === 0) return null

  let sumLon = 0, sumLat = 0
  for (const [lon, lat] of coords) {
    sumLon += lon
    sumLat += lat
  }

  return [sumLon / coords.length, sumLat / coords.length]
}

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

function CountryLegend({ thresholds }: any) {
  const colors = ['#fee8c8','#fdbb84','#ef6548','#d7301f','#b30000']
  const labels = [
    '< 10',
    '10–50',
    '50–100',
    '100–1000',
    '> 1000',
  ]
  return (
    <div className="mt-4 text-sm text-gray-700">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {colors.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-8 h-5 rounded" style={{ backgroundColor: c }} />
            <span className="text-gray-800">{labels[i]}</span>
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
