'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
// TopoJSON client for converting topology to GeoJSON (loaded only if used)
import { feature as topoFeature } from 'topojson-client'
import { RISK_THRESHOLDS, getRiskColor } from '@/lib/config'

type CountryValue = { id?: string; name: string; iso3?: string; value?: number; months?: number[] }

// Component to dynamically enable/disable map controls
function MapControlsToggler({ enabled }: { enabled: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (enabled) {
      map.dragging?.enable()
      map.touchZoom?.enable()
      map.doubleClickZoom?.enable()
    } else {
      map.dragging?.disable()
      map.touchZoom?.disable()
      map.doubleClickZoom?.disable()
    }
  }, [map, enabled])
  return null
}

// Component to add pulsing hotspot markers using HTML/CSS
function HotspotMarkers({ hotspots, onHotspotClick }: { hotspots: Array<{ name: string; lat: number; lon: number; value: number }>; onHotspotClick?: (name: string) => void }) {
  const map = useMap()

  useEffect(() => {
    const markers: L.Marker[] = []

    if (!hotspots || hotspots.length === 0) return () => {}

    const sorted = hotspots.slice().sort((a, b) => b.value - a.value).slice(0, 16)
    const values = sorted.map(s => s.value)
    const vmin = Math.min(...values), vmax = Math.max(...values)
    const scaleFor = (v: number) => {
      if (!isFinite(vmin) || !isFinite(vmax) || vmin === vmax) return 1
      const t = (v - vmin) / Math.max(1e-6, (vmax - vmin))
      return 0.9 + t * 0.5 // scale ~ 0.9 → 1.4
    }

    sorted.forEach((spot, idx) => {
      const tier = idx < 6 ? 'primary' : 'secondary'
      const sz = scaleFor(spot.value)
      const speed = tier === 'primary' ? '2.2s' : '2.6s'
      const pulseColor = tier === 'primary' ? 'rgba(220,38,38,0.4)' : 'rgba(17,24,39,0.35)'
      const strokeColor = tier === 'primary' ? '#dc2626' : '#374151'
      const icon = L.divIcon({
        className: 'hotspot-marker',
        html: `
          <div class="hotspot-container" data-tier="${tier}" style="--sz:${sz};--speed:${speed};--pulse:${pulseColor};--stroke:${strokeColor};">
            <div class="hotspot-pulse"></div>
            <div class="hotspot-core"></div>
          </div>
        `,
        iconSize: [80, 80],
        iconAnchor: [40, 40],
      })

      const marker = L.marker([spot.lat, spot.lon], { icon })
      // Ensure hotspot clicks route to the country/entity
      if (onHotspotClick) {
        marker.on('click', () => onHotspotClick(spot.name))
      }
      marker.addTo(map)
      markers.push(marker)
    })

    return () => {
      markers.forEach(m => map.removeLayer(m))
    }
  }, [map, hotspots, onHotspotClick])

  return null
}

interface Props {
  items: CountryValue[]
  onSelect?: (name: string) => void
  hideDownloadButton?: boolean
  mapHeight?: string
  initialZoom?: number
  hideControls?: boolean
  hideLegend?: boolean
  showHotspots?: boolean
  hideSearch?: boolean
  dimZoomControls?: boolean
  hideMonthSlider?: boolean
  hideZoomHint?: boolean
  lazyHotspots?: boolean
  mobileControlsButtonPosition?: 'top-right' | 'bottom-right'
}

export default function CountryChoropleth({ items, onSelect, hideDownloadButton = false, mapHeight = '590px', initialZoom = 3.0, hideControls = false, hideLegend = false, showHotspots = false, hideSearch = false, dimZoomControls = false, hideMonthSlider = false, hideZoomHint = false, lazyHotspots = true, mobileControlsButtonPosition = 'bottom-right' }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [world, setWorld] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState<number>(1)
  const [showZoomHint, setShowZoomHint] = useState(!hideZoomHint)
  const [mapRef, setMapRef] = useState<L.Map | null>(null)
  const [query, setQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [showSearch, setShowSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [hotspotsReady, setHotspotsReady] = useState(!lazyHotspots)
  const [isMobile, setIsMobile] = useState(false)
  const [mapControlsEnabled, setMapControlsEnabled] = useState(false)

  // Detect if device is mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || (window.innerWidth <= 768)
      setIsMobile(mobile)
      // On desktop, enable controls by default
      if (!mobile) setMapControlsEnabled(true)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      try {
        // Prefer simplified TopoJSON if available, fallback to GeoJSON
        const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
        // Try TopoJSON first
        let json: any | null = null
        try {
          const topoRes = await fetch(`${base}/data/world.topo.json`)
          if (topoRes.ok) {
            const topology = await topoRes.json()
            const objName = Object.keys(topology.objects || {})[0]
            if (objName) {
              const geo = topoFeature(topology, topology.objects[objName] as any)
              json = geo
            }
          }
        } catch (_) {
          // ignore and fallback below
        }
        if (!json) {
          const res = await fetch(`${base}/data/world.geojson`)
          if (!res.ok) throw new Error('Failed to load world geometry')
          json = await res.json()
        }
        if (!cancelled) setWorld(json)
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load world geometry')
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (hideZoomHint) return
    const t = setTimeout(() => setShowZoomHint(false), 7000)
    return () => clearTimeout(t)
  }, [hideZoomHint])

  useEffect(() => {
    if (!lazyHotspots) return
    const t = setTimeout(() => setHotspotsReady(true), 300)
    return () => clearTimeout(t)
  }, [lazyHotspots])

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

  const nameToEntity = useMemo(() => {
    const m = new Map<string, { id?: string; original: string }>()
    for (const it of items) {
      const key = normalizeName(it.name)
      m.set(key, { id: it.id, original: it.name })
    }
    return m
  }, [items])

  const values = useMemo(() => items
    .map(i => Number((i.months ? i.months[month - 1] : i.value) ?? 0))
    .filter(v => Number.isFinite(v)), [items, month])
  const thresholds = useMemo(() => RISK_THRESHOLDS.LEVELS, [])
  const { vmin, vmax } = useMemo(() => {
    if (!values.length) return { vmin: 0, vmax: 1 }
    const sorted = values.slice().sort((a,b)=>a-b)
    return { vmin: sorted[0], vmax: sorted[sorted.length-1] }
  }, [values])

  const style = (f: any) => {
    const name = normalizeName(f?.properties?.name || f?.properties?.NAME || '')
    const val = Number(valueByName.get(name) || 0)
    return {
      weight: val === 0 ? 0.3 : 0.6,
      color: val === 0 ? '#dddddd' : '#ffffff',
      fillColor: getRiskColor(val),
      fillOpacity: val === 0 ? 0.35 : 0.8,
      cursor: 'pointer',
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
    const threshold = RISK_THRESHOLDS.HOTSPOT_MIN

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

  const searchMatches = useMemo(() => {
    const q = normalizeName(query)
    if (!q) return [] as Array<{ name: string; id?: string }>
    const all = items.map(i => ({ name: i.name, id: i.id }))
    return all.filter(x => normalizeName(x.name).includes(q)).slice(0, 8)
  }, [items, query])

  function featureByName(n: string): any | null {
    if (!world?.features?.length) return null
    const key = normalizeName(n)
    return world.features.find((f: any) => normalizeName(f?.properties?.name || f?.properties?.NAME || '') === key) || null
  }

  function fitToFeature(n: string) {
    const feat = featureByName(n)
    if (!feat || !mapRef) return
    const geom = feat.geometry
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : (geom.type === 'MultiPolygon' ? geom.coordinates : [])
    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
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
    if (minLat <= maxLat && minLon <= maxLon) {
      const pad = 0.5
      const b: any = [[minLat - pad, minLon - pad], [maxLat + pad, maxLon + pad]]
      mapRef.fitBounds(b, { padding: [20, 20] as any })
    }
  }

  function goToEntity(n: string) {
    const info = nameToEntity.get(normalizeName(n))
    if (info?.id) router.push(`/forecasts/${info.id}`)
    else fitToFeature(n)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-0 bg-white">
      <div
        className={`rounded overflow-hidden relative ${dimZoomControls ? 'map-dim-controls' : ''}`}
        style={{ height: mapHeight }}
        role="region"
        aria-label="World choropleth of predicted fatalities"
      >
        {/* Enable/Disable map controls button - only show on mobile, dimmed */}
        {isMobile && !mapControlsEnabled && (
          <div className={`absolute z-[1000] pointer-events-auto ${mobileControlsButtonPosition === 'top-right' ? 'top-4 right-4' : 'bottom-20 right-2'}`}>
            <button
              onClick={() => setMapControlsEnabled(true)}
              className="px-3 py-1.5 bg-white/50 backdrop-blur border border-gray-300/60 rounded shadow-sm text-xs font-medium text-gray-600 hover:bg-white/65 focus:outline-none opacity-65"
              aria-label="Enable map controls"
            >
              Enable map controls
            </button>
          </div>
        )}
        {isMobile && mapControlsEnabled && (
          <div className={`absolute z-[1000] pointer-events-auto ${mobileControlsButtonPosition === 'top-right' ? 'top-4 right-4' : 'bottom-20 right-2'}`}>
            <button
              onClick={() => setMapControlsEnabled(false)}
              className="px-3 py-1.5 bg-pace-red/50 backdrop-blur border border-pace-red/60 rounded shadow-sm text-xs font-medium text-white hover:bg-pace-red/65 focus:outline-none opacity-65"
              aria-label="Disable map controls"
            >
              Disable map controls
            </button>
          </div>
        )}
        {/* Search overlay */}
        {!hideSearch && mapControlsEnabled && (
          <div className={`absolute z-[1100] ${mobileControlsButtonPosition === 'top-right' && isMobile ? 'top-16 right-4' : 'top-4 right-4'}`}>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSearch(true); setFocusedIndex(-1) }}
                onFocus={() => setShowSearch(true)}
                onKeyDown={(e) => {
                  if (!showSearch) return
                  if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIndex(i => Math.min(i + 1, searchMatches.length - 1)) }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedIndex(i => Math.max(i - 1, 0)) }
                  else if (e.key === 'Enter') {
                    e.preventDefault()
                    const choice = focusedIndex >= 0 ? searchMatches[focusedIndex] : searchMatches[0]
                    if (choice) { goToEntity(choice.name); setShowSearch(false) }
                  } else if (e.key === 'Escape') {
                    setShowSearch(false)
                  }
                }}
                placeholder="Search country…"
                className="w-64 px-3 py-2 rounded-md border border-gray-300 bg-white/95 backdrop-blur text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-pace-red"
                aria-label="Search country"
              />
              {showSearch && query && searchMatches.length > 0 && (
                <ul className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto" role="listbox">
                  {searchMatches.map((m, idx) => (
                    <li
                      key={m.name}
                      className={`px-3 py-2 text-sm cursor-pointer ${idx === focusedIndex ? 'bg-red-50 text-pace-red' : 'hover:bg-gray-50'}`}
                      onMouseDown={(e) => { e.preventDefault(); goToEntity(m.name); setShowSearch(false) }}
                      role="option"
                      aria-selected={idx === focusedIndex}
                    >
                      {m.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        {/* View toggle overlay (center-bottom, larger) */}
        {!hideControls && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform z-[1000] pointer-events-auto">
            <div className="inline-flex rounded-xl border-2 border-pace-charcoal overflow-hidden bg-white/95 backdrop-blur shadow-lg">
              <Link
                href="/forecasts"
                className={`px-6 py-2 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-charcoal ${pathname?.startsWith('/forecasts-grid') ? 'text-pace-charcoal hover:bg-gray-50' : 'bg-pace-charcoal text-white'}`}
              >
                Country view
              </Link>
              <Link
                href="/forecasts-grid"
                className={`px-6 py-2 text-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-charcoal ${pathname?.startsWith('/forecasts-grid') ? 'bg-pace-charcoal text-white' : 'text-pace-charcoal hover:bg-gray-50'}`}
              >
                <span title="0.5° map squares (~55 km)">Sub‑national Areas</span>
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
            doubleClickZoom={false}
            dragging={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
            zoomAnimation={false}
            fadeAnimation={false}
            maxBounds={[[-85, -180], [85, 180]] as any}
            maxBoundsViscosity={1.0}
            preferCanvas={true}
            attributionControl={false}
            style={{
              height: '100%',
              width: '100%',
              touchAction: mapControlsEnabled ? 'none' : 'pan-y'
            }}
          >
            {/* Map reference setter */}
            {(() => {
              function MapRefSetter() {
                const map = useMap()
                useEffect(() => {
                  setMapRef(map)
                }, [map])
                return null
              }
              return <MapRefSetter />
            })()}
            <MapControlsToggler enabled={mapControlsEnabled} />
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
              detectRetina={false}
            />
            {(filtered || world) && (
              <GeoJSON
                data={filtered || world}
                style={(f: any) => ({ ...style(f), smoothFactor: 1.2 }) as any}
                onEachFeature={(feature, layer) => {
                  const name = feature?.properties?.name || feature?.properties?.NAME || ''
                  const val = Number(valueByName.get(normalizeName(name)) || 0)
                  const periodText = month === 1 ? 'next month' : `in ${month} months`

                  // Determine risk level and color
                  const getRiskLevel = (v: number) => {
                    if (v === 0) return { label: 'No Risk', color: '#6b7280', bgColor: '#f3f4f6' }
                    if (v < 10) return { label: 'Very Low', color: '#92400e', bgColor: '#fef3c7' }
                    if (v < 50) return { label: 'Low', color: '#c2410c', bgColor: '#fed7aa' }
                    if (v < 100) return { label: 'Medium', color: '#dc2626', bgColor: '#fecaca' }
                    if (v < 500) return { label: 'High', color: '#b91c1c', bgColor: '#fca5a5' }
                    return { label: 'Extreme', color: '#7f1d1d', bgColor: '#f87171' }
                  }

                  const risk = getRiskLevel(val)

                  // Get trend if months data available
                  const entity = items.find(it => normalizeName(it.name) === normalizeName(name))
                  let trendHTML = ''
                  if (entity?.months && entity.months.length >= month && month < 6) {
                    const currentVal = entity.months[month - 1]
                    const nextVal = entity.months[month]
                    if (nextVal > currentVal * 1.1) {
                      trendHTML = '<span style="color: #dc2626; font-size: 11px;">↗ Rising</span>'
                    } else if (nextVal < currentVal * 0.9) {
                      trendHTML = '<span style="color: #059669; font-size: 11px;">↘ Declining</span>'
                    } else {
                      trendHTML = '<span style="color: #6b7280; font-size: 11px;">→ Stable</span>'
                    }
                  }

                  // Generate sparkline SVG if we have months data
                  let sparklineHTML = ''
                  if (entity?.months && entity.months.length >= 6) {
                    const values = entity.months.slice(0, 6)
                    const min = Math.min(...values)
                    const max = Math.max(...values)
                    const range = max - min || 1
                    const width = 80
                    const height = 20
                    const stepX = width / (values.length - 1 || 1)
                    const points = values.map((v, i) => {
                      const x = i * stepX
                      const y = height - ((v - min) / range) * height
                      return `${x},${y}`
                    }).join(' ')

                    sparklineHTML = `
                      <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #e5e7eb;">
                        <div style="font-size: 10px; color: #6b7280; margin-bottom: 3px;">6-month trend</div>
                        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="display: block;">
                          <polyline
                            fill="none"
                            stroke="${risk.color}"
                            stroke-width="1.5"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            points="${points}"
                          />
                        </svg>
                      </div>
                    `
                  }

                  const tooltipHTML = `
                    <div style="min-width: 180px;">
                      <div style="font-weight: 600; font-size: 14px; color: #111827; margin-bottom: 6px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px;">
                        ${name}
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 11px; color: #6b7280;">Predicted ${periodText}:</span>
                        <span style="font-weight: 700; font-size: 15px; color: ${risk.color};">${val.toFixed(1)}</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 6px; margin-top: 6px;">
                        <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 500; background: ${risk.bgColor}; color: ${risk.color};">
                          ${risk.label}
                        </span>
                        ${trendHTML}
                      </div>
                      ${sparklineHTML}
                    </div>
                  `

                  layer.bindTooltip(tooltipHTML, {
                    sticky: true,
                    className: 'custom-country-tooltip',
                    direction: 'top',
                    offset: [0, -10]
                  })
                  layer.on('click', () => {
                    const entity = items.find(it => normalizeName(it.name) === normalizeName(name))
                    if (entity && entity.id) {
                      router.push(`/forecasts/${entity.id}`)
                    } else if (onSelect) {
                      onSelect(String(name))
                    }
                  })
                }}
              />
            )}
            {/* Animated pulsing hotspots for high-risk countries (optionally deferred) */}
            {showHotspots && hotspotsReady && (
              <HotspotMarkers
                hotspots={hotspots}
                onHotspotClick={(name) => goToEntity(name)}
              />
            )}
          </MapContainer>
        )}
        {/* Compact legend overlay (bottom-right) */}
        {!hideLegend && !error && (
          <div className={`absolute bottom-6 right-2 z-[1000] pointer-events-auto ${dimZoomControls ? 'opacity-40' : ''}`}>
            <div className={`rounded-md px-2.5 py-2 text-[12px] ${dimZoomControls ? 'bg-transparent border-transparent text-gray-500' : 'backdrop-blur-sm bg-white/80 border border-gray-200 shadow-sm text-gray-800'}`}>
              <div className={`mb-1 text-[11px] ${dimZoomControls ? 'text-gray-500' : 'text-gray-700'}`}>min {isFinite(vmin) ? Math.round(vmin) : '—'} → max {isFinite(vmax) ? Math.round(vmax) : '—'}</div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-7 h-5 rounded border border-gray-300" style={{ backgroundColor: '#f5f5f5' }} />
                  <span>{'0'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-7 h-5 rounded border border-gray-300" style={{ backgroundColor: '#fee8c8' }} />
                  <span>{'< 10'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-7 h-5 rounded border border-gray-300" style={{ backgroundColor: '#fdbb84' }} />
                  <span>{'10–50'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-7 h-5 rounded border border-gray-300" style={{ backgroundColor: '#ef6548' }} />
                  <span>{'50–100'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-7 h-5 rounded border border-gray-300" style={{ backgroundColor: '#d7301f' }} />
                  <span>{'100–500'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-7 h-5 rounded border border-gray-300" style={{ backgroundColor: '#b30000' }} />
                  <span>{'> 500'}</span>
                </div>
              </div>
              {showHotspots && (
                <div className={`mt-2 pt-2 ${dimZoomControls ? 'border-t border-gray-300/50' : 'border-t border-gray-300'}`}>
                  <div className={`text-[11px] mb-1.5 ${dimZoomControls ? 'text-gray-600' : 'text-gray-700'}`}>Hotspots (&gt;100 fatalities):</div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <div className="legend-hotspot-pulse-primary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-red-600 border border-white shadow-sm" />
                        </div>
                      </div>
                      <span className="text-[11px]">Top 6 countries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative w-5 h-5">
                        <div className="legend-hotspot-pulse-secondary" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-gray-700 border border-white shadow-sm" />
                        </div>
                      </div>
                      <span className="text-[11px]">Next 10 countries</span>
                    </div>
                    <div className={`text-[10px] italic mt-1 ${dimZoomControls ? 'text-gray-500' : 'text-gray-600'}`}>Size proportional to risk</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
                {!hideZoomHint && showZoomHint && mapControlsEnabled && (
          <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
            <div className={`backdrop-blur-sm border border-gray-200 rounded-md px-3 py-2 text-xs shadow-sm flex items-center gap-2 ${dimZoomControls ? 'bg-white/60 text-gray-600' : 'bg-white/90 text-gray-700'}`}>
              <span>Zoom: Double-click or hold Cmd (⌘)/Ctrl + scroll</span>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowZoomHint(false)}>×</button>
            </div>
          </div>
        )}
        {/* Months ahead slider overlay (bottom-left) */}
        {!error && !hideMonthSlider && (
          <div className="absolute bottom-4 left-4 z-[1000] pointer-events-auto">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-md px-2.5 py-1.5 shadow-sm flex items-center gap-3 text-sm text-gray-700">
              <span className="whitespace-nowrap font-medium text-gray-900">Months ahead:</span>
              <div className="w-48">
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="range"
                  style={{ accentColor: '#1e40af' }}
                  aria-label="Months ahead"
                  aria-valuemin={1}
                  aria-valuemax={6}
                  aria-valuenow={month}
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  {[1,2,3,4,5,6].map(n => (
                    <span key={n}>{n}m</span>
                  ))}
                </div>
              </div>
              <span className="w-6 text-right font-medium">{month}</span>
            </div>
          </div>
        )}

      </div>
      {/* Map attribution below map */}
      {!error && (
        <p className="text-[10px] text-gray-500 text-right px-2 py-1">Map data © OpenStreetMap contributors, © CARTO</p>
      )}
      {/* Controls moved below map */}
      {!hideLegend && (
        <div className="px-4 py-2">
          {/* Legend moved onto the map (bottom-right overlay), slider moved onto map (bottom-left) */}
          {!hideDownloadButton && (
            <div className="mt-4 text-center">
              <Link href="/downloads" className="bg-pace-charcoal text-white px-8 py-3 hover:bg-pace-charcoal-light transition-all duration-200 font-normal rounded-lg inline-flex items-center justify-center shadow-sm hover:shadow-md">
                Data downloads
              </Link>
            </div>
          )}
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
            <div className="w-12 h-8 rounded border border-gray-300" style={{ backgroundColor: c }} />
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
