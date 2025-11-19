'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'

type Preset = 'growth-spike-decline' | 'volatile' | 'cyclical'

export default function DTWShowcase({
  width = 980,
  height = 560,
  preset: initialPreset = 'growth-spike-decline',
}: { width?: number; height?: number; preset?: Preset }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>()
  const [playing, setPlaying] = useState(true)
  const [preset, setPreset] = useState<Preset>(initialPreset)
  const [speed, setSpeed] = useState(5)

  // Layout: top series A (h=120), center cost matrix (h=240), bottom series B (h=120)
  const layout = useMemo(() => ({
    pad: 12,
    top: { x: 60, y: 24, w: width - 100, h: 110 },
    mid: { x: 60, y: 154, w: width - 100, h: 240 },
    bot: { x: 60, y: 410, w: width - 100, h: 110 },
  }), [width])

  // Generate two time series: A (reference) and B (warped/noisy variant)
  const { a, b } = useMemo(() => {
    const N = 140
    const genBase = (): number[] => {
      const out: number[] = []
      let base = 45
      for (let i = 0; i < N; i++) {
        let v = base
        if (preset === 'growth-spike-decline' || preset === 'volatile') {
          if (i >= 10 && i < 40) v += (i - 10) * 0.8 + Math.sin(i * 0.25) * 2
          if (preset === 'volatile' && i >= 50 && i < 100) v += Math.sin(i * 0.7) * 12
          if (i >= 90 && i < 120) v -= (i - 90) * 0.8
        }
        if (preset === 'cyclical') v += Math.sin(i * 0.25) * 10 + Math.cos(i * 0.07) * 6
        v += (Math.random() - 0.5) * 4
        if (i > 0) v = out[i - 1] * 0.75 + v * 0.25
        out.push(Math.max(5, Math.min(95, v)))
        base = v
      }
      return out
    }
    const A = genBase()
    // Create warped version B: compress and stretch segments + small lag
    const warp = (src: number[]): number[] => {
      const out: number[] = []
      const N = src.length
      for (let i = 0; i < N; i++) {
        let j = i
        if (i >= 15 && i < 40) j = 15 + (i - 15) * 0.7 // compress
        if (i >= 60 && i < 90) j = 60 + (i - 60) * 1.2 // stretch
        if (i >= 100 && i < 120) j = 100 + (i - 100) * 0.85
        const v = lerp(src, Math.min(N - 1, Math.max(0, j + 2))) // add small lag
        out.push(Math.max(5, Math.min(95, v + (Math.random() - 0.5) * 3)))
      }
      return out
    }
    const B = warp(A)
    return { a: A, b: B }
  }, [preset])

  // DTW cost matrix and optimal path
  const { cost, path } = useMemo(() => buildDTW(a, b), [a, b])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let t = 0 // animation time
    const draw = () => {
      // background card
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)
      ctx.strokeStyle = '#e5e7eb'
      ctx.strokeRect(0.5, 0.5, width - 1, height - 1)

      // titles
      ctx.fillStyle = '#374151'
      ctx.font = '12px Inter, system-ui, Arial'
      ctx.fillText('Series A (reference)', layout.top.x, layout.top.y - 6)
      ctx.fillText('Cost matrix (|A-B|)', layout.mid.x, layout.mid.y - 6)
      ctx.fillText('Series B (warped)', layout.bot.x, layout.bot.y - 6)

      drawSeries(ctx, a, layout.top, '#2563eb')
      drawSeries(ctx, b, layout.bot, '#059669')
      drawCostAndPath(ctx, cost, path, layout.mid, t)

      // alignment lines along the revealed portion of path
      const reveal = Math.floor((path.length - 1) * easeInOut(Math.min(1, t / 60)))
      ctx.save()
      ctx.globalAlpha = 0.25
      ctx.strokeStyle = '#6b7280'
      ctx.lineWidth = 1
      for (let k = 0; k <= reveal; k += 4) {
        const [i, j] = path[k]
        const xTop = layout.top.x + (i / (a.length - 1)) * layout.top.w
        const yTop = layout.top.y + layout.top.h - (a[i] / 100) * layout.top.h
        const xBot = layout.bot.x + (j / (b.length - 1)) * layout.bot.w
        const yBot = layout.bot.y + layout.bot.h - (b[j] / 100) * layout.bot.h
        ctx.beginPath()
        ctx.moveTo(xTop, yTop)
        ctx.lineTo(xBot, yBot)
        ctx.stroke()
      }
      ctx.restore()

      if (playing) t += speed
      rafRef.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [a, b, cost, path, width, height, layout, playing, speed])

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-700">Dynamic Time Warping — alignment and cost path</div>
        <div className="flex items-center gap-3 text-sm">
          <label className="text-gray-600">Preset:</label>
          <select value={preset} onChange={(e) => setPreset(e.target.value as Preset)} className="border border-gray-300 rounded px-2 py-1 text-sm">
            <option value="growth-spike-decline">Growth → Spike → Decline</option>
            <option value="volatile">Volatile</option>
            <option value="cyclical">Cyclical</option>
          </select>
          <button onClick={() => setPlaying(p => !p)} className="border border-gray-300 rounded px-2 py-1">
            {playing ? 'Pause' : 'Play'}
          </button>
          <label className="text-gray-600">Speed</label>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="range"
            style={{ accentColor: '#1e40af', width: 160 }}
          />
        </div>
      </div>
      <canvas ref={canvasRef} width={width} height={height} />
      <div className="mt-2 text-xs text-gray-500">Path reveals the optimal alignment through the cost matrix; faint lines show aligned points between A and B.</div>
    </div>
  )
}

function drawSeries(ctx: CanvasRenderingContext2D, s: number[], box: { x: number; y: number; w: number; h: number }, color: string) {
  // background grid
  ctx.save()
  ctx.strokeStyle = 'rgba(107,114,128,0.15)'
  ctx.lineWidth = 1
  for (let i = 1; i < 4; i++) {
    const gy = box.y + (box.h / 4) * i
    ctx.beginPath(); ctx.moveTo(box.x, gy); ctx.lineTo(box.x + box.w, gy); ctx.stroke()
  }
  // series line
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let i = 0; i < s.length; i++) {
    const x = box.x + (i / (s.length - 1)) * box.w
    const y = box.y + box.h - (s[i] / 100) * box.h
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

function drawCostAndPath(
  ctx: CanvasRenderingContext2D,
  cost: number[][],
  path: Array<[number, number]>,
  box: { x: number; y: number; w: number; h: number },
  t: number,
) {
  const n = cost.length
  const m = cost[0].length
  // heatmap
  const img = ctx.createImageData(box.w, box.h)
  let p = 0
  for (let yy = 0; yy < box.h; yy++) {
    const j = Math.floor((yy / (box.h - 1)) * (m - 1))
    for (let xx = 0; xx < box.w; xx++) {
      const i = Math.floor((xx / (box.w - 1)) * (n - 1))
      const v = Math.min(1, cost[i][j] / 50) // normalize
      const col = heatColor(v)
      img.data[p++] = col[0]
      img.data[p++] = col[1]
      img.data[p++] = col[2]
      img.data[p++] = 200
    }
  }
  ctx.putImageData(img, box.x, box.y)
  ctx.strokeStyle = '#ffffff'
  ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1)

  // reveal optimal path
      const reveal = Math.floor((path.length - 1) * easeInOut(Math.min(1, t / 150)))
  ctx.save()
  ctx.strokeStyle = '#111827'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (let k = 0; k <= reveal; k++) {
    const [i, j] = path[k]
    const x = box.x + (i / (n - 1)) * box.w
    const y = box.y + (j / (m - 1)) * box.h
    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

function buildDTW(a: number[], b: number[]) {
  const n = a.length, m = b.length
  const cost: number[][] = Array.from({ length: n }, () => Array(m).fill(0))
  const acc: number[][] = Array.from({ length: n }, () => Array(m).fill(Infinity))
  const prev: Array<Array<[number, number] | null>> = Array.from({ length: n }, () => Array(m).fill(null))
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) cost[i][j] = Math.abs(a[i] - b[j])
  acc[0][0] = cost[0][0]
  for (let i = 1; i < n; i++) { acc[i][0] = cost[i][0] + acc[i - 1][0]; prev[i][0] = [i - 1, 0] }
  for (let j = 1; j < m; j++) { acc[0][j] = cost[0][j] + acc[0][j - 1]; prev[0][j] = [0, j - 1] }
  for (let i = 1; i < n; i++) {
    for (let j = 1; j < m; j++) {
      const options: Array<[number, number]> = [[i - 1, j], [i, j - 1], [i - 1, j - 1]]
      let best = options[0]
      if (acc[options[1][0]][options[1][1]] < acc[best[0]][best[1]]) best = options[1]
      if (acc[options[2][0]][options[2][1]] < acc[best[0]][best[1]]) best = options[2]
      acc[i][j] = cost[i][j] + acc[best[0]][best[1]]
      prev[i][j] = best
    }
  }
  // backtrack path
  const path: Array<[number, number]> = []
  let i = n - 1, j = m - 1
  path.push([i, j])
  while (i !== 0 || j !== 0) {
    const p = prev[i][j]
    if (!p) break
    ;[i, j] = p
    path.push([i, j])
  }
  path.reverse()
  return { cost, path }
}

function lerp(arr: number[], idx: number) {
  const i0 = Math.floor(idx)
  const i1 = Math.min(arr.length - 1, i0 + 1)
  const t = idx - i0
  return arr[i0] * (1 - t) + arr[i1] * t
}

function heatColor(v: number): [number, number, number] {
  // map 0..1 → light yellow → orange → deep red
  const r = Math.round(255 * Math.min(1, v * 1.4))
  const g = Math.round(200 * (1 - v))
  const b = Math.round(80 * (1 - v))
  return [r, Math.max(0, g), Math.max(0, b)]
}

function easeInOut(x: number) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2
}
