'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  period: string
}

export default function PrioGridMap({ period }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const [data, setData] = useState<any | null>(null) // GeoJSON polygons (optional)
  const [points, setPoints] = useState<Array<{ lat: number; lon: number; m?: number[]; v?: number }> | null>(null)
  const [pointsFromApi, setPointsFromApi] = useState<boolean>(false)
  const [pointsFromStatic, setPointsFromStatic] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [month, setMonth] = useState<number>(1)

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
        // 1) Try pre-generated monthly static points first
        try {
          const res = await fetch(`${base}/data/grid/${period}-m${month}.json`)
          if (res.ok) {
            const json = await res.json()
            const pts = (json?.points || []) as Array<{ lat: number; lon: number; v: number }>
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
            const pts = json?.points as Array<{ lat: number; lon: number; m?: number[]; v?: number }>
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
  }, [period])

  // If we are using the API or static-month points source, refetch when month changes for a smaller payload
  useEffect(() => {
    let cancelled = false
    async function refetchForMonth() {
      if (!pointsFromApi && !pointsFromStatic) return
      try {
        if (pointsFromStatic) {
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
  }, [month, period, pointsFromApi, pointsFromStatic])

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
    if (!vals.length) return { thresholds: [0,1], vmin: 0, vmax: 1 }
    // Exclude zeros for binning if we have enough non-zero cells
    const nz = vals.filter(v => v > 0)
    const sorted = (nz.length >= 20 ? nz : vals).slice().sort((a,b) => a-b)
    const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(p * (sorted.length - 1))))]
    const t = [q(0.2), q(0.4), q(0.6), q(0.8), q(0.95)]
    const mn = sorted[0]
    const mx = sorted[sorted.length - 1]
    // ensure thresholds are strictly increasing
    for (let i=1;i<t.length;i++) if (t[i] <= t[i-1]) t[i] = t[i-1] + (mx - mn) / 1000
    return { thresholds: t, vmin: mn, vmax: mx }
  }, [data, points, month])

  const style = (f: any) => {
    const p = f.properties || {}
    const val = Number(p[`m${month}`] ?? 0)
    const color = colorFor(val, thresholds)
    return {
      weight: val === 0 ? 0.3 : 0.5,
      color: val === 0 ? '#dddddd' : '#ffffff',
      fillColor: color,
      fillOpacity: val === 0 ? 0.35 : 0.75,
    }
  }

  function colorFor(v: number, th: number[]) {
    if (!th || th.length === 0) return '#f5f5f5'
    if (v <= th[0]) return '#fee8c8'
    if (v <= th[1]) return '#fdbb84'
    if (v <= th[2]) return '#ef6548'
    if (v <= th[3]) return '#d7301f'
    if (v <= th[4]) return '#b30000'
    return '#7f0000'
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
  }, [points, data, month])

  const loading = !error && !data && !points

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-700">PRIO‑GRID map — Predicted fatalities</div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500 hidden sm:block">min {isFinite(vmin) ? vmin.toFixed(1) : '—'} → max {isFinite(vmax) ? vmax.toFixed(1) : '—'}</div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>Months ahead:</span>
            <input type="range" min={1} max={6} value={month} onChange={(e) => setMonth(Number(e.target.value))} />
            <span className="w-8 text-right">{month}</span>
          </div>
        </div>
      </div>
      <div className="h-[420px] md:h-[520px] rounded overflow-hidden">
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
            bounds={bounds}
            boundsOptions={{ padding: [0, 0] }}
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
            {data && (
              <GeoJSON
                key={`poly-${month}`}
                data={filterGeojsonByMonth(data, month)}
                style={style as any}
                onEachFeature={(feature, layer) => {
                  const v = Number(feature?.properties?.[`m${month}`] ?? 0)
                  layer.bindTooltip(`m${month}: ${v}`, { sticky: true })
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
                  layer.bindTooltip(`m${month}: ${v}`, { sticky: true })
                }}
              />
            )}
          </MapContainer>
        )}
      </div>
      <Legend thresholds={thresholds} vmin={vmin} vmax={vmax} data={data} points={points} month={month} />
      <div className="mt-1 text-[10px] text-gray-400">Map data © OpenStreetMap contributors, © CARTO</div>
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

// -------- Legend component (stats + color scale) --------
function Legend({ thresholds, vmin, vmax, data, points, month }: any) {
  let total = 0, zeros = 0
  if (data?.features?.length) {
    total = data.features.length
    for (const f of data.features) {
      const v = Number(f?.properties?.[`m${month}`] ?? 0)
      if (!v) zeros++
    }
  } else if (points?.length) {
    total = points.length
    for (const p of points) {
      const v = Number(((p as any).m ? (p as any).m[month - 1] : (p as any).v) ?? 0)
      if (!v) zeros++
    }
  }
  const nz = total - zeros
  return (
    <div className="mt-3 text-xs text-gray-600">
      <div className="flex items-center gap-2">
        <span>Color scale (predicted fatalities):</span>
        <span className="text-gray-500">min {isFinite(vmin) ? vmin.toFixed(1) : '—'} → max {isFinite(vmax) ? vmax.toFixed(1) : '—'}</span>
      </div>
      <div className="mt-1 grid grid-cols-3 sm:grid-cols-6 gap-2">
        {['#fee8c8','#fdbb84','#ef6548','#d7301f','#b30000','#7f0000'].map((c,i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-4 h-3 rounded" style={{backgroundColor: c}} />
            <span className="text-gray-700">{legendLabelForIndex(i, thresholds)}</span>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="mt-1 text-gray-500">
          Cells: {total} · Non‑zero: {nz} ({((nz/total)*100).toFixed(1)}%) · Zeros: {zeros}
        </div>
      )}
    </div>
  )
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

function legendLabelForIndex(i: number, t: number[]) {
  const fmt = (v: number) => Number.isFinite(v) ? (v >= 100 ? v.toFixed(0) : v.toFixed(1)) : '—'
  if (!Array.isArray(t) || t.length < 5) return ''
  if (i === 0) return `≤ ${fmt(t[0])}`
  if (i === 1) return `${fmt(t[0])}–${fmt(t[1])}`
  if (i === 2) return `${fmt(t[1])}–${fmt(t[2])}`
  if (i === 3) return `${fmt(t[2])}–${fmt(t[3])}`
  if (i === 4) return `${fmt(t[3])}–${fmt(t[4])}`
  return `> ${fmt(t[4])}`
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
