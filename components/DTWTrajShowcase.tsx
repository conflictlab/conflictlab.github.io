'use client'

import React, { useEffect, useRef, useState } from 'react'

export default function DTWTrajShowcase({ width = 980, height = 420 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const raf = useRef<number>()
  const [playing, setPlaying] = useState(true)
  // Faster default animation speed
  const [speed, setSpeed] = useState(0.4)

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

    // Generate trajectories (Chris Tralie inspired)
    const N = 50
    const t1 = new Array(N).fill(0).map((_, i) => (i / (N - 1)) ** 2) // nonlinear time for A
    const t2 = t1.map((u) => Math.sqrt(u)) // linear time for B
    // Make A and B moderately dissimilar (closer than before)
    const X: Array<[number, number]> = t1.map((t) => [
      t,
      1.0 * Math.cos(4.0 * Math.PI * t) + 1.05 * t
    ])
    const Y: Array<[number, number]> = t2.map((t) => [
      t,
      1.05 * Math.cos(4.4 * Math.PI * t + 0.4) + 1.15 * t + 0.4 + (Math.random() - 0.5) * 0.2
    ])

    // Compute Euclidean CSM
    const C = getCSM(X, Y)
    const { path } = dtwCSM(C)

    // Layout: left trajectories, right CSM
    const left = { x: 20, y: 20, w: Math.floor(width * 0.6) - 40, h: height - 40 }
    const right = { x: Math.floor(width * 0.6), y: 20, w: Math.floor(width * 0.4) - 30, h: height - 40 }

    // Scales for trajectories
    const pts = [...X, ...Y]
    const minX = Math.min(...pts.map((p) => p[0]))
    const maxX = Math.max(...pts.map((p) => p[0]))
    const minY = Math.min(...pts.map((p) => p[1]))
    const maxY = Math.max(...pts.map((p) => p[1]))
    const sx = (x: number) => left.x + ((x - minX) / (maxX - minX)) * left.w
    const sy = (y: number) => left.y + left.h - ((y - minY) / (maxY - minY)) * left.h

    // Pre-render cost heatmap image
    // Build heatmap at device‑pixel resolution because putImageData ignores transforms
    const iw = Math.max(1, Math.floor(right.w * dpr))
    const ih = Math.max(1, Math.floor(right.h * dpr))
    const heat = ctx.createImageData(iw, ih)
    let p = 0
    for (let yy = 0; yy < ih; yy++) {
      const i = Math.floor((yy / (ih - 1)) * (C.length - 1)) // rows → vertical
      for (let xx = 0; xx < iw; xx++) {
        const j = Math.floor((xx / (iw - 1)) * (C[0].length - 1)) // cols → horizontal
        const v = Math.min(1, C[i][j] / 1.5) // normalize for display
        const [r, g, b] = afmhot(v)
        heat.data[p++] = r
        heat.data[p++] = g
        heat.data[p++] = b
        // Increase transparency of the heatmap for better layering
        heat.data[p++] = 70
      }
    }

    let k = 0
    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      // Flat white background (no outer frame)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Left: trajectories
      ctx.save()
      // No inner frames/backgrounds for a cleaner look
      // Paths
      drawPolyline(ctx, X, sx, sy, '#111827')
      drawPolyline(ctx, Y, sx, sy, '#111827')
      // Scatter
      scatter(ctx, X, sx, sy, 'reds')
      scatter(ctx, Y, sx, sy, 'blues')

      // Draw correspondences up to k
      for (let idx = 0; idx <= k; idx++) {
        const [i, j] = path[idx]
        const x1 = sx(X[i][0]), y1 = sy(X[i][1])
        const x2 = sx(Y[j][0]), y2 = sy(Y[j][1])
        ctx.strokeStyle = idx === k ? '#ef4444' : '#111827'
        ctx.lineWidth = idx === k ? 3 : 1
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      }
      ctx.restore()

      // Right: heatmap (putImageData ignores transform; draw in device pixels)
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.putImageData(heat, Math.floor(right.x * dpr), Math.floor(right.y * dpr))
      ctx.restore()
      // No border rectangle on heatmap
      // Overlay path (match matrix orientation: i=row→y, j=col→x)
      ctx.save()
      ctx.strokeStyle = '#0f172a'
      // Thicker line on the right-hand side panel
      ctx.lineWidth = 5
      ctx.beginPath()
      const kInt = Math.floor(k)
      for (let idx = 0; idx <= kInt; idx++) {
        const [i, j] = path[idx]
        const x = right.x + (j / (C[0].length - 1)) * right.w
        const y = right.y + (i / (C.length - 1)) * right.h
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.restore()

      if (playing) {
        k = k + speed
        if (k >= path.length - 1) k = 0
      }
      raf.current = requestAnimationFrame(draw)
    }
    draw()
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [width, height, playing, speed])

  return (
    <div className="bg-white">
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  )
}

function getCSM(X: Array<[number, number]>, Y: Array<[number, number]>) {
  const M = X.length, N = Y.length
  const C: number[][] = Array.from({ length: M }, () => Array(N).fill(0))
  for (let i = 0; i < M; i++) {
    for (let j = 0; j < N; j++) {
      const dx = X[i][0] - Y[j][0]
      const dy = X[i][1] - Y[j][1]
      C[i][j] = Math.hypot(dx, dy)
    }
  }
  return C
}

function dtwCSM(C: number[][]) {
  const M = C.length, N = C[0].length
  const D: number[][] = Array.from({ length: M + 1 }, () => Array(N + 1).fill(0))
  for (let i = 1; i <= M; i++) D[i][0] = Infinity
  for (let j = 1; j <= N; j++) D[0][j] = Infinity
  const B: number[][] = Array.from({ length: M + 1 }, () => Array(N + 1).fill(3)) // 3 as stop
  const ptrs: Array<[number, number]> = [[-1, 0], [0, -1], [-1, -1]]
  for (let i = 1; i <= M; i++) {
    for (let j = 1; j <= N; j++) {
      const d = C[i - 1][j - 1]
      const d1 = D[i - 1][j] + d
      const d2 = D[i][j - 1] + d
      const d3 = D[i - 1][j - 1] + d
      const arr = [d1, d2, d3]
      let minIdx = 0
      if (arr[1] < arr[minIdx]) minIdx = 1
      if (arr[2] < arr[minIdx]) minIdx = 2
      D[i][j] = arr[minIdx]
      B[i][j] = minIdx
    }
  }
  const path: Array<[number, number]> = []
  let i = M, j = N
  path.push([i - 1, j - 1])
  while (B[i][j] < 3) {
    const p = ptrs[B[i][j]]
    i += p[0]; j += p[1]
    if (i < 1 || j < 1) break
    path.push([i - 1, j - 1])
  }
  path.reverse()
  return { path }
}

function drawPolyline(ctx: CanvasRenderingContext2D, s: Array<[number, number]>, sx: (x: number) => number, sy: (y: number) => number, stroke: string) {
  ctx.save()
  ctx.strokeStyle = stroke
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i < s.length; i++) {
    const x = sx(s[i][0]); const y = sy(s[i][1])
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
  }
  ctx.stroke()
  ctx.restore()
}

function scatter(ctx: CanvasRenderingContext2D, s: Array<[number, number]>, sx: (x: number) => number, sy: (y: number) => number, palette: 'reds' | 'blues') {
  for (let i = 0; i < s.length; i++) {
    const x = sx(s[i][0]); const y = sy(s[i][1])
    const t = i / (s.length - 1)
    const col = palette === 'reds' ? lerpColor([254, 202, 202], [127, 29, 29], t) : lerpColor([191, 219, 254], [30, 58, 138], t)
    ctx.fillStyle = `rgb(${col[0]},${col[1]},${col[2]})`
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill()
  }
}

function lerpColor(a: number[], b: number[], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function afmhot(v: number): [number, number, number] {
  // Approximate afmhot colormap (black->red->yellow->white)
  if (v < 0.33) {
    const t = v / 0.33; return [Math.round(255 * t), 0, 0]
  } else if (v < 0.66) {
    const t = (v - 0.33) / 0.33; return [255, Math.round(128 * t), 0]
  } else {
    const t = (v - 0.66) / 0.34; return [255, 128 + Math.round(127 * t), Math.round(128 * t)]
  }
}
