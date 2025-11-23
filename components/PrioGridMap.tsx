'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { RISK_THRESHOLDS, getGridRiskColor } from '@/lib/config'

interface Props {
  period: string
  activeView?: 'grid' | 'country'
  countryName?: string
  hideViewToggle?: boolean
}

export default function PrioGridMap({ period, activeView, countryName, hideViewToggle = false }: Props) {
  const pathname = usePathname()
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [data, setData] = useState<any | null>(null) // GeoJSON polygons (optional)
  const [points, setPoints] = useState<Array<{ lat: number; lon: number; m?: number[]; v?: number }> | null>(null)
  const [pointsFromApi, setPointsFromApi] = useState<boolean>(false)
  const [pointsFromStatic, setPointsFromStatic] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState<number>(1)
  const [countryMulti, setCountryMulti] = useState<Array<Array<Array<[number, number]>>> | null>(null)

  // Normalize name helper
  const norm = (s: string) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim()

  // Point in polygon (ray casting) for lon/lat vs polygon ring
  function pointInRing(lon: number, lat: number, ring: Array<[number, number]>): boolean {
    let inside = false
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1]
      const xj = ring[j][0], yj = ring[j][1]
      const intersect = ((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi)
      if (intersect) inside = !inside
    }
    return inside
  }
  function pointInPoly(lon: number, lat: number, poly: Array<Array<[number, number]>>): boolean {
    // poly is array of rings; first is outer, rest holes; we only test outer ring for simplicity
    if (!poly.length) return false
    return pointInRing(lon, lat, poly[0])
  }
  function pointInMultiPoly(lon: number, lat: number, multiPoly: Array<Array<Array<[number, number]>>>): boolean {
    for (const poly of multiPoly) {
      if (pointInPoly(lon, lat, poly)) return true
    }
    return false
  }

  useEffect(() => {
    let cancelled = false
    async function loadCountryMask() {
      if (!countryName) { setCountryMulti(null); return }
      try {
        const res = await fetch(`${base}/data/world.geojson`)
        if (!res.ok) return
        const gj = await res.json()
        const target = norm(countryName)
        let found: any = null
        for (const f of (gj?.features || [])) {
          const nm = norm(f?.properties?.name || '')
          if (nm === target) { found = f; break }
        }
        if (found) {
          const geom = found.geometry || {}
          let multi: Array<Array<Array<[number, number]>>> = []
          if (geom.type === 'Polygon') multi = [ (geom.coordinates || []) as Array<Array<[number, number]>> ]
          else if (geom.type === 'MultiPolygon') multi = (geom.coordinates || []) as Array<Array<Array<[number, number]>>>
          if (!cancelled) setCountryMulti(multi)
        }
      } catch {}
    }
    loadCountryMask()
    return () => { cancelled = true }
  }, [countryName, base])

  // Build a mask GeoJSON (world polygon with country hole) to hard-mask outside area
  const maskGeoJson = useMemo(() => {
    if (!countryMulti || !countryMulti.length) return null
    const world: Array<[number, number]> = [
      [-179.9999, -89.9999],
      [179.9999, -89.9999],
      [179.9999, 89.9999],
      [-179.9999, 89.9999],
      [-179.9999, -89.9999],
    ]
    const holes: Array<Array<[number, number]>> = []
    for (const poly of countryMulti) { if (poly && poly.length) holes.push(poly[0]) }
    const coords = [world, ...holes]
    return { type: 'FeatureCollection', features: [ { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: coords } } ] } as any
  }, [countryMulti])

  function preferRemoteSource() {
    if (typeof window === 'undefined') return false
    const p = new URLSearchParams(window.location.search)
    const src = (p.get('source') || p.get('src') || '').toLowerCase()
    if (p.get('live') === '1') return true
    if (src === 'remote' || src === 'github') return true
    if (src === 'local' || src === 'geojson') return false
    return false
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      setError(null)
      setData(null)
      setPoints(null)
      const tryRemote = async () => {
        const csvUrl = 'https://raw.githubusercontent.com/ThomasSchinca/Live_3D_forecast/main/df_output.csv'
        const ac = new AbortController()
        const timer = setTimeout(() => ac.abort(), 2500) // keep this snappy
        try {
          const csvRes = await fetch(csvUrl, { signal: ac.signal })
          clearTimeout(timer)
          if (!csvRes.ok) return false
          const text = await csvRes.text()
          // Attempt lat/lon CSV first
          let pts = parseCsvToPoints(text)
          if (!pts || pts.length === 0) {
            // If not lat/lon, try wide matrix (IDs as columns; 1..6 rows as horizons)
            const wm = parseWideMatrix(text)
            if (wm && wm.ids.length > 0) {
              try {
                const centroidsRes = await fetch(`${base}/data/grid/centroids.csv`)
                if (centroidsRes.ok) {
                  const cText = await centroidsRes.text()
                  const cMap = parseCentroidsCsv(cText)
                  if (cMap) {
                    const out: Array<{ lat: number; lon: number; m: number[] }> = []
                    for (const id of wm.ids) {
                      const c = cMap[id]
                      const m = wm.values.get(id) || []
                      if (c && m.length) out.push({ lat: c.lat, lon: c.lon, m: [m[0]||0,m[1]||0,m[2]||0,m[3]||0,m[4]||0,m[5]||0] })
                    }
                    pts = out
                  }
                }
              } catch {}
            }
          }
          if (pts && pts.length) { if (!cancelled) setPoints(pts); return true }
          return false
        } catch {
          clearTimeout(timer)
          return false
        }
      }
      const tryLocal = async () => {
        // 1) Try pre-generated per-country file first (if countryName is set)
        if (countryName) {
          try {
            const countryId = countryName.toUpperCase().replace(/\s+/g, '_')
            const res = await fetch(`${base}/data/grid/country/${countryId}-m${month}.json`)
            if (res.ok) {
              const json = await res.json()
              const pts = (json?.points || []) as Array<{ lat: number; lon: number; v: number }>
              if (pts && pts.length) {
                if (!cancelled) { setPoints(pts); setPointsFromStatic(true); setPointsFromApi(false) }
                return true
              }
            }
          } catch {}
        }
        // 2) Try pre-generated monthly static points
        try {
          const res = await fetch(`${base}/data/grid/${period}-m${month}.json`)
          if (res.ok) {
            const json = await res.json()
            let pts = (json?.points || []) as Array<{ lat: number; lon: number; v: number }>
            if (pts && pts.length && countryMulti) {
              // Filter to country polygons
              pts = pts.filter(p => pointInMultiPoly(p.lon, p.lat, countryMulti))
            }
            if (pts && pts.length) {
              if (!cancelled) { setPoints(pts); setPointsFromStatic(true); setPointsFromApi(false) }
              return true
            }
          }
        } catch {}
        // 2) Try API points endpoint (server computes centroids)
        try {
          // Prefer lightweight point endpoint to avoid loading large polygon GeoJSON
          const res = await fetch(`${base}/api/v1/grid/${period}/points?month=${month}`)
          if (res.ok) {
            const json = await res.json()
            let pts = json?.points as Array<{ lat: number; lon: number; m?: number[]; v?: number }>
            if (pts && pts.length && countryMulti) {
              pts = pts.filter(p => pointInMultiPoly(p.lon, p.lat, countryMulti))
            }
            if (pts && pts.length) {
              if (!cancelled) { setPoints(pts); setPointsFromApi(true); setPointsFromStatic(false) }
              return true
            }
          }
        } catch {}
        // Fallback to static GeoJSON if API not available (static export)
        try {
          const res = await fetch(`${base}/data/grid/${period}.geo.json`)
          if (res.ok) {
            const json = await res.json()
            if (countryMulti) {
              // Optionally could clip polygons, but for performance, fallback to points methods above
              // Just set data for full world if no points source available
            }
            if (!cancelled) { setData(json); setPointsFromApi(false); setPointsFromStatic(false) }
            return true
          }
        } catch {}
        return false
      }

      try {
        const remoteFirst = preferRemoteSource()
        if (remoteFirst) {
          const ok = await tryRemote()
          if (ok) return
          const okLocal = await tryLocal()
          if (okLocal) return
        } else {
          const okLocal = await tryLocal()
          if (okLocal) return
          const ok = await tryRemote()
          if (ok) return
        }
        if (!cancelled) setError('No grid file or CSV found')
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load grid file')
      }
    }
    load()
    return () => { cancelled = true }
  }, [period, base, month, countryMulti])

  // If we are using the API or static-month points source, refetch when month changes for a smaller payload
  useEffect(() => {
    let cancelled = false
    async function refetchForMonth() {
      if (!pointsFromApi && !pointsFromStatic) return
      try {
        if (pointsFromStatic) {
          // Try country-specific file first
          if (countryName) {
            const countryId = countryName.toUpperCase().replace(/\s+/g, '_')
            const cr = await fetch(`${base}/data/grid/country/${countryId}-m${month}.json`)
            if (cr.ok) {
              const cj = await cr.json()
              const cpts = (cj?.points || []) as Array<{ lat: number; lon: number; v: number }>
              if (!cancelled && cpts && cpts.length) { setPoints(cpts); return }
            }
          }
          const r = await fetch(`${base}/data/grid/${period}-m${month}.json`)
          if (r.ok) {
            const j = await r.json()
            const pts = (j?.points || []) as Array<{ lat: number; lon: number; v: number }>
            if (!cancelled && pts && pts.length) setPoints(pts)
          }
        } else if (pointsFromApi) {
          const res = await fetch(`${base}/api/v1/grid/${period}/points?month=${month}`)
          if (res.ok) {
            const json = await res.json()
            const pts = json?.points as Array<{ lat: number; lon: number; m?: number[]; v?: number }>
            if (!cancelled && pts && pts.length) setPoints(pts)
          }
        }
      } catch {}
    }
    refetchForMonth()
    return () => { cancelled = true }
  }, [month, period, base, pointsFromApi, pointsFromStatic])

  // Compute dynamic color scale for current month
  const { thresholds, vmin, vmax } = useMemo(() => {
    const vals: number[] = []
    if (data?.features?.length) {
      for (const feat of data.features) {
        const v = Number(feat?.properties?.[`m${month}`] ?? 0)
        if (Number.isFinite(v)) vals.push(v)
      }
    } else if (points?.length) {
      for (const p of points) {
        const v = Number((p.m ? p.m[month - 1] : p.v) ?? 0)
        if (Number.isFinite(v)) vals.push(v)
      }
    }
    const sorted = vals.length ? vals.slice().sort((a,b) => a-b) : [0,1]
    const mn = sorted[0]
    const mx = sorted[sorted.length - 1]
    // Fixed bins for grid view
    const t = [...RISK_THRESHOLDS.GRID_LEVELS]
    return { thresholds: t, vmin: mn, vmax: mx }
  }, [data, points, month])

  const style = (f: any) => {
    const p = f.properties || {}
    const val = Number(p[`m${month}`] ?? 0)
    const color = getGridRiskColor(val)
    return {
      // Thinner borders to avoid heavy/coarse country edge
      weight: val === 0 ? 0.1 : 0.2,
      color: val === 0 ? '#e5e5e5' : '#ffffff',
      fillColor: color,
      fillOpacity: val === 0 ? 0.35 : 0.75,
    }
  }

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

  const bounds = useMemo(() => {
    // For country pages with points, compute exact bounding box from points
    if (countryName && points && points.length) {
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
      for (const p of points) {
        if (p.lat < minLat) minLat = p.lat
        if (p.lat > maxLat) maxLat = p.lat
        if (p.lon < minLon) minLon = p.lon
        if (p.lon > maxLon) maxLon = p.lon
      }
      // Small padding for cell size (0.25° half-cell)
      const pad = 0.3
      return [[minLat - pad, minLon - pad], [maxLat + pad, maxLon + pad]] as any
    }
    if (countryMulti && countryMulti.length) {
      // derive bounds from polygon
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
      for (const poly of countryMulti) {
        for (const ring of poly) {
          for (const [lon,lat] of ring) {
            if (lat < minLat) minLat = lat
            if (lat > maxLat) maxLat = lat
            if (lon < minLon) minLon = lon
            if (lon > maxLon) maxLon = lon
          }
        }
      }
      if (minLat < maxLat && minLon < maxLon) return shrinkBounds([[minLat, minLon], [maxLat, maxLon]], 1.15) as any
    }
    if (points && points.length) {
      const nz = points.filter(p => ((p.m ? (p.m[month - 1] || 0) : (p.v || 0)) > 0))
      const src = nz.length ? nz : points
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
      for (const p of src) {
        if (p.lat < minLat) minLat = p.lat
        if (p.lat > maxLat) maxLat = p.lat
        if (p.lon < minLon) minLon = p.lon
        if (p.lon > maxLon) maxLon = p.lon
      }
      // tighter margin and shrink for a more zoomed‑in default view
      return shrinkBounds([[minLat - 0.3, minLon - 0.3], [maxLat + 0.3, maxLon + 0.3]]) as any
    }
    if (data?.features?.length) {
      const feats = data.features.filter((f: any) => Number(f?.properties?.[`m${month}`] ?? 0) > 0)
      const src = feats.length ? feats : data.features
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180
      for (const feat of src) {
        const geom = feat.geometry
        if (!geom) continue
        const coords = geom.type === 'Polygon' ? geom.coordinates : (geom.type === 'MultiPolygon' ? geom.coordinates.flat(1) : [])
        for (const ring of coords) {
          for (const [x,y] of ring) {
            if (y < minLat) minLat = y
            if (y > maxLat) maxLat = y
            if (x < minLon) minLon = x
            if (x > maxLon) maxLon = x
          }
        }
      }
      if (minLat <= maxLat && minLon <= maxLon) return shrinkBounds([[minLat - 0.5, minLon - 0.5], [maxLat + 0.5, maxLon + 0.5]]) as any
    }
    // fallback world view (noWrap prevents world duplication)
    return [[-60, -180], [80, 180]] as any
  }, [points, data, month, countryMulti])

  // Derive a center from bounds and start at a fixed zoom to match country view feel
  const center: [number, number] = useMemo(() => {
    const b = bounds as any
    if (Array.isArray(b) && Array.isArray(b[0]) && Array.isArray(b[1])) {
      const lat = (b[0][0] + b[1][0]) / 2
      const lon = (b[0][1] + b[1][1]) / 2
      return [lat, lon]
    }
    return [20, 0]
  }, [bounds])

  // Bias the initial view slightly north (only for world view, not country pages)
  const centerAdjusted: [number, number] = useMemo(() => {
    if (countryName) return center // No bias for country pages
    const northBiasDeg = 7
    return [center[0] + northBiasDeg, center[1]]
  }, [center, countryName])

  const loading = !error && !data && !points
  const [showZoomHint, setShowZoomHint] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setShowZoomHint(false), 7000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="rounded-lg p-0 bg-gray-50">
      <div className="h-[520px] rounded overflow-hidden relative">
        {/* View toggle overlay (hidden on entity page) */}
        {!(hideViewToggle || countryName) && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 transform z-[1000]">
            <div className="inline-flex rounded-xl border-2 border-pace-charcoal overflow-hidden bg-white/95 backdrop-blur shadow-lg">
              <Link
                href="/forecasts"
                className={`px-6 py-2 text-lg ${pathname?.startsWith('/forecasts-grid') ? 'text-pace-charcoal hover:bg-gray-50' : 'bg-pace-charcoal text-white'}`}
              >
                Country view
              </Link>
              <Link
                href="/forecasts-grid"
                className={`px-6 py-2 text-lg ${pathname?.startsWith('/forecasts-grid') ? 'bg-pace-charcoal text-white' : 'text-pace-charcoal hover:bg-gray-50'}`}
              >
                <span title="0.5° map squares (~55 km)">Sub‑national Areas</span>
              </Link>
            </div>
          </div>
        )}
        {/* Months ahead slider overlay (bottom-left) */}
        {!error && !loading && (
          <div className="absolute bottom-4 left-4 z-[1000]">
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md px-2.5 py-1.5 shadow-sm flex items-center gap-3 text-sm text-gray-700">
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
        {error && (
          <div className="h-full flex items-center justify-center text-sm text-gray-600">
            <div>
              <div className="font-medium text-gray-800 mb-1">No grid file found</div>
              <p>
                Place a GeoJSON at <code className="text-gray-900">/public/data/grid/{period}.geo.json</code>
                {' '}with features containing properties <code>m1..m6</code> (predicted fatalities for months 1–6),
                {' '}or ensure the remote CSV is reachable.
              </p>
            </div>
          </div>
        )}
        {loading && (
          <div className="h-full flex items-center justify-center text-sm text-gray-600">
            <div>Loading grid data…</div>
          </div>
        )}
        {!error && !loading && (
          <MapContainer
            center={centerAdjusted as any}
            zoom={3.0}
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
            {/* Fit view to computed bounds (country or data) */}
            {(() => {
              function FitToBounds({ b, isCountry }: { b: any; isCountry: boolean }) {
                const map = useMap()
                useEffect(() => {
                  // More padding at bottom for controls on country pages
                  const pad = isCountry ? { paddingTopLeft: [10, 10], paddingBottomRight: [10, 60] } : { padding: [24, 24] }
                  try { if (b) (map as any).fitBounds(b, pad) } catch {}
                }, [b, map, isCountry])
                return null
              }
              return <FitToBounds b={bounds as any} isCountry={!!countryName} />
            })()}
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
            {/* Mobile gesture handling: require two fingers to pan/zoom, allow page scroll with one finger */}
            {(() => {
              function TwoFingerTouchPan() {
                const map = useMap()
                useEffect(() => {
                  const container = map.getContainer()
                  try {
                    // Allow vertical page scroll through the map by default
                    container.style.touchAction = 'pan-y'
                  } catch {}
                  // Disable map drag/zoom by default; enable only on two-finger touches
                  map.dragging.disable()
                  map.touchZoom.disable()
                  const onTouchStart = (e: TouchEvent) => {
                    if (e.touches && e.touches.length > 1) {
                      map.dragging.enable()
                      map.touchZoom.enable()
                    } else {
                      map.dragging.disable()
                      map.touchZoom.disable()
                    }
                  }
                  const onTouchEnd = () => {
                    map.dragging.disable()
                    map.touchZoom.disable()
                  }
                  container.addEventListener('touchstart', onTouchStart, { passive: true })
                  container.addEventListener('touchend', onTouchEnd, { passive: true })
                  container.addEventListener('touchcancel', onTouchEnd, { passive: true })
                  return () => {
                    container.removeEventListener('touchstart', onTouchStart as any)
                    container.removeEventListener('touchend', onTouchEnd as any)
                    container.removeEventListener('touchcancel', onTouchEnd as any)
                  }
                }, [map])
                return null
              }
              return <TwoFingerTouchPan />
            })()}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              attribution="&copy; OpenStreetMap contributors &copy; CARTO"
              noWrap={true}
              detectRetina={true}
            />
            {/* Hard mask outside the selected country */}
            {maskGeoJson && (
              <GeoJSON
                data={maskGeoJson as any}
                // Disable stroke to avoid visible crude outline along mask edge
                style={{ fillColor: '#f9fafb', fillOpacity: 1.0, stroke: false } as any}
                interactive={false}
              />
            )}
            {/* Avoid rendering full-world polygons when masking to a country */}
            {data && !countryMulti && (
              <GeoJSON
                key={`poly-${month}`}
                data={filterGeojsonByMonth(data, month)}
                style={style as any}
                onEachFeature={(feature, layer) => {
                  const v = Number(feature?.properties?.[`m${month}`] ?? 0)
                  layer.bindTooltip(`m${month}: ${Number(v.toFixed(1))}` , { sticky: true })
                }}
              />
            )}
            {/* Render CSV/static points as square polygons aligned to PRIO‑GRID cells */}
            {points && points.length > 0 && (
              <GeoJSON
                key={`pts-${month}`}
                data={{ type: 'FeatureCollection', features: points
                  .filter(p => ((p.m ? (p.m[month - 1] || 0) : (p.v || 0)) > 0))
                  .map((p) => {
                    const v = (p.m ? (p.m[month - 1] || 0) : (p.v || 0))
                    return {
                      type: 'Feature',
                      properties: { [`m${month}`]: v },
                      geometry: squarePoly(p.lon, p.lat, 0.25), // 0.5° cells → half-size 0.25°
                    }
                  })
                } as any}
                style={style as any}
                onEachFeature={(feature, layer) => {
                  const v = Number(feature?.properties?.[`m${month}`] ?? 0)
                  layer.bindTooltip(`m${month}: ${Number(v.toFixed(1))}` , { sticky: true })
                }}
              />
            )}
          </MapContainer>
        )}
                {/* Compact legend overlay (bottom-right) */}
        {!error && !loading && (
          <div className="absolute bottom-4 right-2 z-[1000]">
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-md px-2.5 py-1.5 shadow-sm text-[11px] text-gray-800">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-4 h-3 rounded border border-gray-300" style={{ backgroundColor: '#f5f5f5' }} />
                  <span>0</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-4 h-3 rounded border border-gray-300" style={{ backgroundColor: '#fee8c8' }} />
                  <span>&lt;5</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-4 h-3 rounded border border-gray-300" style={{ backgroundColor: '#fdbb84' }} />
                  <span>5–10</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-4 h-3 rounded border border-gray-300" style={{ backgroundColor: '#ef6548' }} />
                  <span>10–50</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-4 h-3 rounded border border-gray-300" style={{ backgroundColor: '#d7301f' }} />
                  <span>50–100</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-4 h-3 rounded border border-gray-300" style={{ backgroundColor: '#b30000' }} />
                  <span>&gt;100</span>
                </div>
              </div>
            </div>
          </div>
        )}
        {showZoomHint && (
          <div className="absolute top-4 right-4 z-[1000]">
            <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-700 shadow-sm flex items-center gap-2">
              <span>Zoom: Double-click or hold Cmd (⌘)/Ctrl + scroll</span>
              <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowZoomHint(false)}>×</button>
            </div>
          </div>
        )}
      </div>
      {/* Map attribution below map */}
      {!error && (
        <p className="text-[10px] text-gray-500 text-right px-2 py-1">Map data © OpenStreetMap contributors, © CARTO</p>
      )}
    </div>
  )
}

// -------- CSV parsing helpers ---------
function parseCsvToPoints(text: string): Array<{ lat: number; lon: number; m: number[] }> | null {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return null
  const header = splitCsv(lines[0])
  const latKey = findKey(header, ['lat','latitude','y','Lat','Latitude','Y'])
  const lonKey = findKey(header, ['lon','lng','longitude','x','Lon','Lng','Longitude','X'])
  if (!latKey || !lonKey) return null
  const monthKeys: string[] = []
  for (let i = 1; i <= 6; i++) {
    const k = findKey(header, [`m${i}`, `month${i}`, `${i}m`, `pred${i}`, `p${i}`, `h${i}`, `m_${i}`, `value_${i}`])
    if (k) monthKeys.push(k)
  }
  if (monthKeys.length < 1) return null
  const keyIndex = Object.fromEntries(header.map((h, i) => [h, i])) as Record<string, number>
  const out: Array<{ lat: number; lon: number; m: number[] }> = []
  for (let li = 1; li < lines.length; li++) {
    const cols = splitCsv(lines[li])
    if (!cols.length) continue
    const lat = Number(cols[keyIndex[latKey]] || 'NaN')
    const lon = Number(cols[keyIndex[lonKey]] || 'NaN')
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue
    const mVals: number[] = []
    for (let i = 0; i < 6; i++) {
      const k = monthKeys[i]
      const v = k ? Number(cols[keyIndex[k]] || '0') : 0
      mVals.push(Number.isFinite(v) ? v : 0)
    }
    out.push({ lat, lon, m: mVals })
  }
  return out
}

// Wide-matrix parser: header columns are cell IDs (column 0 can be blank), next 1..6 lines are horizons
function parseWideMatrix(text: string): { ids: string[]; values: Map<string, number[]> } | null {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return null
  const header = splitCsv(lines[0])
  if (header.length < 2) return null
  const ids = header.slice(1).map(String).filter(Boolean)
  if (!ids.length) return null
  const rows = Math.min(6, lines.length - 1)
  const values = new Map<string, number[]>()
  for (let ci = 0; ci < ids.length; ci++) {
    const id = ids[ci]
    const m: number[] = []
    for (let r = 1; r <= rows; r++) {
      const cols = splitCsv(lines[r])
      const v = Number(cols[ci + 1] || '0')
      m.push(Number.isFinite(v) ? v : 0)
    }
    while (m.length < 6) m.push(0)
    values.set(id, m)
  }
  return { ids, values }
}

// Centroids parser: expects columns id, lat, lon (case-insensitive, flexible)
function parseCentroidsCsv(text: string): Record<string, { lat: number; lon: number }> | null {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (!lines.length) return null
  const header = splitCsv(lines[0])
  const idKey = findKey(header, ['id','cell','cell_id','prio_id','gid','GID'])
  const latKey = findKey(header, ['lat','latitude','y','Lat','Latitude','Y'])
  const lonKey = findKey(header, ['lon','lng','longitude','x','Lon','Lng','Longitude','X'])
  if (!idKey || !latKey || !lonKey) return null
  const idx = Object.fromEntries(header.map((h, i) => [h, i])) as Record<string, number>
  const out: Record<string, { lat: number; lon: number }> = {}
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsv(lines[i])
    const id = cols[idx[idKey]]
    const lat = Number(cols[idx[latKey]] || 'NaN')
    const lon = Number(cols[idx[lonKey]] || 'NaN')
    if (id && Number.isFinite(lat) && Number.isFinite(lon)) out[id] = { lat, lon }
  }
  return out
}

function splitCsv(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQ) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else { inQ = false }
      } else cur += ch
    } else {
      if (ch === ',') { out.push(cur.trim()); cur = '' }
      else if (ch === '"') inQ = true
      else cur += ch
    }
  }
  out.push(cur.trim())
  return out
}

function findKey(header: string[], candidates: string[]): string | null {
  const lower = header.map(h => h.toLowerCase())
  for (const c of candidates) {
    const idx = lower.indexOf(c.toLowerCase())
    if (idx >= 0) return header[idx]
  }
  // contains
  for (const c of candidates) {
    const idx = lower.findIndex(h => h.includes(c.toLowerCase()))
    if (idx >= 0) return header[idx]
  }
  return null
}

function filterGeojsonByMonth(data: any, month: number) {
  if (!data?.features?.length) return data
  const feats = data.features.filter((f: any) => Number(f?.properties?.[`m${month}`] ?? 0) > 0)
  return { type: 'FeatureCollection', features: feats }
}

// Build a square polygon centered on (lon, lat) with given half-size in degrees
function squarePoly(lon: number, lat: number, half: number) {
  const ring = [
    [lon - half, lat - half],
    [lon + half, lat - half],
    [lon + half, lat + half],
    [lon - half, lat + half],
    [lon - half, lat - half],
  ]
  return { type: 'Polygon', coordinates: [ring] }
}
