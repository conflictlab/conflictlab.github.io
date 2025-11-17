import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(req: Request, { params }: { params: { period: string } }) {
  try {
    const { period } = params
    const { searchParams } = new URL(req.url)
    const month = clampMonth(searchParams.get('month'))

    const file = path.join(process.cwd(), 'public', 'data', 'grid', `${period}.geo.json`)
    if (!fs.existsSync(file)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
    const feats: any[] = raw?.features || []
    const points: Array<{ lat: number; lon: number; m: number[] }> = []
    for (const f of feats) {
      const m = [1,2,3,4,5,6].map(i => Number(f?.properties?.[`m${i}`] ?? 0))
      const include = month ? (m[month - 1] > 0) : (m.some(x => x > 0))
      if (!include) continue
      const c = centroidOfGeometry(f?.geometry)
      if (!c) continue
      points.push({ lat: c[1], lon: c[0], m })
    }
    return NextResponse.json({ period, points }, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}

function clampMonth(m: string | null): number | null {
  if (!m) return null
  const n = Number(m)
  if (!Number.isFinite(n)) return null
  return Math.min(6, Math.max(1, Math.floor(n)))
}

// Geometry centroid helpers (outer ring centroid)
function centroidOfGeometry(geom: any): [number, number] | null {
  if (!geom) return null
  if (geom.type === 'Polygon') return centroidOfPolygon(geom.coordinates)
  if (geom.type === 'MultiPolygon') {
    let A2 = 0, Sx = 0, Sy = 0
    for (const poly of geom.coordinates) {
      const c = centroidAccum(poly)
      if (!c) continue
      A2 += c.A2
      Sx += c.Sx
      Sy += c.Sy
    }
    if (A2 === 0) return null
    return [Sx / (3 * A2), Sy / (3 * A2)]
  }
  const b = geom.bbox
  if (b && b.length === 4) return [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]
  return null
}

function centroidOfPolygon(coords: any): [number, number] | null {
  const c = centroidAccum(coords)
  if (!c || c.A2 === 0) return null
  return [c.Sx / (3 * c.A2), c.Sy / (3 * c.A2)]
}

// Returns accumulators for the centroid formula using A2 = sum(x_i*y_{i+1} - x_{i+1}*y_i)
function centroidAccum(coords: any): { A2: number; Sx: number; Sy: number } | null {
  const ring = coords?.[0]
  if (!ring || ring.length < 3) return null
  let A2 = 0, Sx = 0, Sy = 0
  for (let i = 0; i < ring.length - 1; i++) {
    const [x0, y0] = ring[i]
    const [x1, y1] = ring[i + 1]
    const cross = x0 * y1 - x1 * y0
    A2 += cross
    Sx += (x0 + x1) * cross
    Sy += (y0 + y1) * cross
  }
  if (A2 === 0) return null
  return { A2, Sx, Sy }
}
