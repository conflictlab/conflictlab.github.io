'use client'

import React, { useMemo } from 'react'

type PlotProps = {
  data: number[]
  width?: number
  height?: number
}

function niceTicks(min: number, max: number, count = 5) {
  if (!isFinite(min) || !isFinite(max) || min === max) return [] as number[]
  const span = max - min
  const step = Math.pow(10, Math.floor(Math.log10(span / count)))
  const err = (count * step) / span
  const factor = err <= 0.15 ? 10 : err <= 0.35 ? 5 : err <= 0.75 ? 2 : 1
  const niceStep = step * factor
  const start = Math.ceil(min / niceStep) * niceStep
  const ticks: number[] = []
  for (let v = start; v <= max + 1e-9; v += niceStep) ticks.push(Number(v.toFixed(6)))
  return ticks
}

function formatTick(v: number) {
  if (Math.abs(v) >= 1000) return Math.round(v).toString()
  if (Math.abs(v) >= 100) return v.toFixed(0)
  if (Math.abs(v) >= 10) return v.toFixed(0)
  if (Math.abs(v) >= 1) return v.toFixed(1)
  return v.toFixed(2)
}

function gaussianKernel(u: number) {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
}

function computeKDE(xs: number[], data: number[], bandwidth: number) {
  const n = data.length
  const out: number[] = []
  for (const x of xs) {
    let s = 0
    for (let i = 0; i < n; i++) s += gaussianKernel((x - data[i]) / bandwidth)
    out.push(s / (n * bandwidth))
  }
  return out
}

export function HistogramWithDensity({ data, width = 640, height = 200 }: PlotProps) {
  const margin = { top: 8, right: 8, bottom: 28, left: 44 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const { bins, min, max, counts, xs, kde, maxCount } = useMemo(() => {
    const vals = data.filter(v => Number.isFinite(v) && v >= 0)
    if (vals.length === 0) return { bins: [] as number[], min: 0, max: 1, counts: [] as number[], xs: [0,1], kde: [0,0], maxCount: 1 }
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const n = Math.ceil(Math.sqrt(vals.length))
    const bins = Array.from({ length: Math.max(4, Math.min(40, n)) + 1 }, (_, i) => min + (i * (max - min)) / Math.max(1, Math.max(4, Math.min(40, n))))
    const counts = new Array(bins.length - 1).fill(0)
    for (const v of vals) {
      let idx = Math.floor(((v - min) / (max - min + 1e-12)) * (bins.length - 1))
      if (idx < 0) idx = 0
      if (idx >= counts.length) idx = counts.length - 1
      counts[idx]++
    }
    const variance = vals.reduce((s,v)=>s+Math.pow(v - (min+max)/2,2),0)/vals.length
    const sigma = Math.sqrt(Math.max(variance, 1e-12))
    const bw = 1.06 * sigma * Math.pow(vals.length, -1/5)
    const xs = Array.from({ length: 120 }, (_, i) => min + (i * (max - min)) / 119)
    const kde = computeKDE(xs, vals, bw || (max-min)/20 || 1)
    const maxCount = Math.max(...counts, 1)
    return { bins, min, max, counts, xs, kde, maxCount }
  }, [data])

  const maxDensity = useMemo(() => Math.max(...kde, 1e-12), [kde])
  const densityScale = maxCount / maxDensity

  const xScale = (v: number) => margin.left + ((v - min) / (max - min || 1)) * innerW
  const yCount = (c: number) => margin.top + innerH - (c / (maxCount || 1)) * innerH
  const yDensity = (d: number) => margin.top + innerH - (d * densityScale / (maxCount || 1)) * innerH

  const xTicks = niceTicks(min, max)
  const yTicks = niceTicks(0, maxCount, 3)

  const densityPath = useMemo(() => {
    if (!xs.length) return ''
    let d = `M ${xScale(xs[0])} ${yDensity(kde[0])}`
    for (let i = 1; i < xs.length; i++) d += ` L ${xScale(xs[i])} ${yDensity(kde[i])}`
    return d
  }, [xs, kde])

  return (
    <svg width={width} height={height} className="w-full h-auto">
      {/* axes */}
      {xTicks.map((t) => (
        <g key={`xt-${t}`}>
          <line x1={xScale(t)} y1={margin.top} x2={xScale(t)} y2={margin.top+innerH} className="stroke-gray-200" />
          <text x={xScale(t)} y={margin.top+innerH+16} className="fill-gray-600 text-[10px]" textAnchor="middle">{formatTick(t)}</text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`yt-${t}`}>
          <line x1={margin.left} y1={yCount(t)} x2={margin.left+innerW} y2={yCount(t)} className="stroke-gray-100" />
          <text x={margin.left-6} y={yCount(t)+3} className="fill-gray-600 text-[10px]" textAnchor="end">{formatTick(t)}</text>
        </g>
      ))}
      {/* histogram */}
      {counts.map((c, i) => {
        const x0 = bins[i]
        const x1 = bins[i+1]
        const x = xScale(x0)
        const w = Math.max(0, xScale(x1) - x - 1)
        const y = yCount(c)
        return <rect key={i} x={x} y={y} width={w} height={margin.top + innerH - y} className="fill-blue-500/35 stroke-blue-500/60" />
      })}
      {/* density */}
      <path d={densityPath} className="stroke-blue-700 fill-none" strokeWidth={2} />
    </svg>
  )
}

export function ECDFPlot({ data, width = 640, height = 200 }: PlotProps) {
  const margin = { top: 8, right: 8, bottom: 28, left: 44 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom
  const sorted = useMemo(() => data.filter(v => Number.isFinite(v) && v >= 0).sort((a,b)=>a-b), [data])
  const min = sorted.length ? sorted[0] : 0
  const max = sorted.length ? sorted[sorted.length-1] : 1
  const xScale = (v: number) => margin.left + ((v - min) / (max - min || 1)) * innerW
  const yScale = (p: number) => margin.top + innerH - p * innerH
  const xTicks = niceTicks(min, max)
  const yTicks = [0, 0.25, 0.5, 0.75, 1]
  const path = useMemo(() => {
    if (!sorted.length) return ''
    let d = `M ${xScale(sorted[0])} ${yScale(0)}`
    for (let i = 0; i < sorted.length; i++) {
      const p = (i + 1) / sorted.length
      d += ` L ${xScale(sorted[i])} ${yScale(p)}`
    }
    return d
  }, [sorted])
  return (
    <svg width={width} height={height} className="w-full h-auto">
      {xTicks.map((t) => (
        <g key={`xt-${t}`}>
          <line x1={xScale(t)} y1={margin.top} x2={xScale(t)} y2={margin.top+innerH} className="stroke-gray-200" />
          <text x={xScale(t)} y={margin.top+innerH+16} className="fill-gray-600 text-[10px]" textAnchor="middle">{formatTick(t)}</text>
        </g>
      ))}
      {yTicks.map((t) => (
        <g key={`yt-${t}`}>
          <line x1={margin.left} y1={yScale(t)} x2={margin.left+innerW} y2={yScale(t)} className="stroke-gray-100" />
          <text x={margin.left-6} y={yScale(t)+3} className="fill-gray-600 text-[10px]" textAnchor="end">{(t*100).toFixed(0)}%</text>
        </g>
      ))}
      <path d={path} className="stroke-emerald-600 fill-none" strokeWidth={2} />
    </svg>
  )
}

export function LorenzCurve({ data, width = 640, height = 200 }: PlotProps) {
  const margin = { top: 8, right: 8, bottom: 28, left: 44 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom
  const sorted = useMemo(() => data.filter(v => Number.isFinite(v) && v >= 0).sort((a,b)=>a-b), [data])
  const n = sorted.length
  const total = sorted.reduce((s,v)=>s+v,0) || 1
  const cum = useMemo(() => {
    const out: {x: number; y: number}[] = [{x:0, y:0}]
    let acc = 0
    for (let i=0;i<n;i++) { acc += sorted[i]; out.push({ x: (i+1)/n, y: acc/total }) }
    return out
  }, [sorted, n, total])
  const xScale = (p: number) => margin.left + p * innerW
  const yScale = (p: number) => margin.top + innerH - p * innerH
  const gini = useMemo(() => {
    // Numerical integration of Lorenz curve area
    let area = 0
    for (let i=1;i<cum.length;i++) {
      const x0 = cum[i-1].x, y0 = cum[i-1].y
      const x1 = cum[i].x, y1 = cum[i].y
      area += (y0 + y1) * (x1 - x0) / 2
    }
    return Math.max(0, Math.min(1, 1 - 2*area))
  }, [cum])
  const path = useMemo(() => {
    if (!cum.length) return ''
    let d = `M ${xScale(cum[0].x)} ${yScale(cum[0].y)}`
    for (let i=1;i<cum.length;i++) d += ` L ${xScale(cum[i].x)} ${yScale(cum[i].y)}`
    return d
  }, [cum])
  const ticks = [0, 0.25, 0.5, 0.75, 1]
  return (
    <svg width={width} height={height} className="w-full h-auto">
      {ticks.map((t) => (
        <g key={`xt-${t}`}>
          <line x1={xScale(t)} y1={margin.top} x2={xScale(t)} y2={margin.top+innerH} className="stroke-gray-200" />
          <text x={xScale(t)} y={margin.top+innerH+16} className="fill-gray-600 text-[10px]" textAnchor="middle">{(t*100).toFixed(0)}%</text>
        </g>
      ))}
      {ticks.map((t) => (
        <g key={`yt-${t}`}>
          <line x1={margin.left} y1={yScale(t)} x2={margin.left+innerW} y2={yScale(t)} className="stroke-gray-100" />
          <text x={margin.left-6} y={yScale(t)+3} className="fill-gray-600 text-[10px]" textAnchor="end">{(t*100).toFixed(0)}%</text>
        </g>
      ))}
      {/* 45-degree equality line */}
      <line x1={xScale(0)} y1={yScale(0)} x2={xScale(1)} y2={yScale(1)} className="stroke-gray-400" strokeDasharray="4 3" />
      {/* Lorenz curve */}
      <path d={path} className="stroke-rose-600 fill-none" strokeWidth={2} />
      <text x={xScale(1)} y={yScale(0)+14} className="fill-gray-700 text-[11px]" textAnchor="end">Gini ≈ {gini.toFixed(2)}</text>
    </svg>
  )
}

export default function DescriptivePlots({ data }: { data: number[] }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-700 mb-2">Distribution (1‑month predicted fatalities)</div>
        <HistogramWithDensity data={data} />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-700 mb-2">Cumulative distribution (ECDF)</div>
        <ECDFPlot data={data} />
      </div>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm text-gray-700 mb-2">Lorenz curve (inequality)</div>
        <LorenzCurve data={data} />
      </div>
    </div>
  )
}

