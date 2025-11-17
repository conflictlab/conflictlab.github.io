'use client'

import React from 'react'

type Point = { x: number; y: number }

interface FanChartProps {
  title: string
  horizons?: { [k in '1m' | '3m' | '6m']: { p10: number; p50: number; p90: number } }
  months?: number[]
  width?: number
  height?: number
}

export default function ForecastFanChart({ title, horizons, months, width = 360, height = 240 }: FanChartProps) {
  // Inner chart margins to keep lines within bounds and make room for y-axis labels
  const mLeft = 44, mRight = 24, mTop = 8, mBottom = 24
  const innerW = Math.max(1, width - mLeft - mRight)
  const innerH = Math.max(1, height - mTop - mBottom)
  const xScale = (label: '1m' | '3m' | '6m') => mLeft + ({ '1m': 0, '3m': 0.5, '6m': 1 }[label]) * innerW
  const allVals = months && months.length === 6
    ? months
    : horizons
      ? [horizons['1m'].p10, horizons['1m'].p90, horizons['3m'].p10, horizons['3m'].p90, horizons['6m'].p10, horizons['6m'].p90]
      : [0, 1]
  const min = Math.min(...allVals)
  const max = Math.max(...allVals)
  const yScale = (v: number) => mTop + (1 - (v - min) / (max - min || 1)) * innerH

  // Simple tick generator for y-axis
  const tickCount = 4
  const ticks: number[] = (() => {
    const range = max - min
    if (!isFinite(range) || range === 0) return [min, min + 1, min + 2, min + 3]
    const arr: number[] = []
    for (let i = 0; i < tickCount; i++) arr.push(min + (range * i) / (tickCount - 1))
    return arr
  })()
  const fmt = (v: number) => {
    const range = max - min
    if (Math.abs(range) < 10) return v.toFixed(1)
    return Math.round(v).toString()
  }

  // Prepare either a 6‑month line or a 1/3/6 fan
  let areaPath = ''
  let linePath = ''
  let areaUnderPath = ''
  let monthPoints: Point[] = []
  let p50Points: Point[] = []
  if (months && months.length === 6) {
    const step = innerW / 5
    monthPoints = months.map((v, i) => ({ x: mLeft + i * step, y: yScale(v) }))
    linePath = `M ${monthPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
    if (monthPoints.length) {
      const baseY = yScale(min)
      areaUnderPath = `M ${monthPoints.map((p) => `${p.x},${p.y}`).join(' L ')} L ${monthPoints[monthPoints.length - 1].x},${baseY} L ${monthPoints[0].x},${baseY} Z`
    }
  } else if (horizons) {
    const p10: Point[] = ['1m', '3m', '6m'].map((h) => ({ x: xScale(h as any), y: yScale(horizons[h as '1m'].p10) }))
    const p90: Point[] = ['6m', '3m', '1m'].map((h) => ({ x: xScale(h as any), y: yScale(horizons[h as '1m'].p90) }))
    p50Points = ['1m', '3m', '6m'].map((h) => ({ x: xScale(h as any), y: yScale(horizons[h as '1m'].p50) }))
    areaPath = `M ${p10.map((p) => `${p.x},${p.y}`).join(' L ')} L ${p90.map((p) => `${p.x},${p.y}`).join(' L ')} Z`
    linePath = `M ${p50Points.map((p) => `${p.x},${p.y}`).join(' L ')}`
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white overflow-hidden" style={{ height }}>
      <div className="text-sm text-gray-700 mb-2">{title}</div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        role="img"
        aria-label={`Forecast fan chart for ${title}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="fan-clip">
            <rect x="0" y="0" width={width} height={height} rx="2" ry="2" />
          </clipPath>
        </defs>
        {/* Gridlines */}
        <g clipPath="url(#fan-clip)">
          {ticks.map((t, i) => {
            const y = yScale(t)
            return (
              <line key={i} x1={mLeft} y1={y} x2={mLeft + innerW} y2={y} stroke="#f1f5f9" />
            )
          })}
        </g>
        {/* Plot */}
        <g clipPath="url(#fan-clip)">
          {areaPath && <path d={areaPath} fill="#3b82f622" stroke="#3b82f633" />}
          {areaUnderPath && <path d={areaUnderPath} fill="#1e40af11" stroke="none" />}
          {linePath && <path d={linePath} fill="none" stroke="#1e40af" strokeWidth={2} />}
          {monthPoints.length > 0 && monthPoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e40af" stroke="#ffffff" strokeWidth={1} />
          ))}
          {p50Points.length > 0 && p50Points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={4} fill="#1e40af" stroke="#ffffff" strokeWidth={1} />
          ))}
        </g>
        {/* Y Axis */}
        <g>
          <line x1={mLeft} y1={mTop} x2={mLeft} y2={mTop + innerH} stroke="#e5e7eb" />
          {ticks.map((t, i) => {
            const y = yScale(t)
            return (
              <g key={i}>
                <line x1={mLeft - 4} y1={y} x2={mLeft} y2={y} stroke="#9ca3af" />
                <text x={mLeft - 8} y={y + 3} textAnchor="end" className="text-[10px]" fill="#6b7280">{fmt(t)}</text>
              </g>
            )
          })}
        </g>
        {/* Axes labels */}
        {months && months.length === 6 ? (
          <>
            {[1,2,3,4,5,6].map((m, i) => (
              <text key={i} x={mLeft + (innerW / 5) * i - 6} y={height - 6} className="text-[10px]" fill="#6b7280">{m}m</text>
            ))}
          </>
        ) : (
          <>
            <text x={mLeft - 10} y={height - 6} className="text-[10px]" fill="#6b7280">1m</text>
            <text x={mLeft + innerW / 2 - 10} y={height - 6} className="text-[10px]" fill="#6b7280">3m</text>
            <text x={mLeft + innerW - 10} y={height - 6} className="text-[10px]" fill="#6b7280">6m</text>
          </>
        )}
      </svg>
    </div>
  )
}
