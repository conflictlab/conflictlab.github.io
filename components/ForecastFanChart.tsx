'use client'

import React, { useEffect, useState } from 'react'
import * as d3 from 'd3'

type Point = { x: number; y: number }

interface FanChartProps {
  title: string
  horizons?: { [k in '1m' | '3m' | '6m']: { p10: number; p50: number; p90: number } }
  months?: number[]
  countryName?: string
  width?: number
  height?: number
}

export default function ForecastFanChart({ title, horizons, months, countryName, width = 360, height = 360 }: FanChartProps) {
  const [pastVals, setPastVals] = useState<Array<{ date: Date; value: number }>>([])
  const [tip, setTip] = useState<null | { x: number; y: number; text: string }>(null)
  // Load historical raw fatalities (wide CSV) similar to ScenariosChart
  useEffect(() => {
    let cancelled = false
    async function loadHist() {
      if (!countryName) return
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/data/hist.csv`)
        if (!res.ok) return
        const text = await res.text()
        const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
        if (!lines.length) return
        const split = (line: string) => {
          const out: string[] = []
          let cur = ''
          let inQ = false
          for (let i = 0; i < line.length; i++) {
            const ch = line[i]
            if (inQ) { if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++ } else { inQ = false } } else cur += ch }
            else { if (ch === ',') { out.push(cur); cur = '' } else if (ch === '"') inQ = true; else cur += ch }
          }
          out.push(cur)
          return out
        }
        const header = split(lines[0])
        const norm = (s: string) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g,'').trim()
        let colIdx = header.findIndex(h => h === countryName)
        if (colIdx < 0) { const target = norm(countryName); colIdx = header.findIndex(h => norm(h) === target) }
        if (colIdx < 0) return
        const parseD = d3.utcParse('%Y-%m-%d')
        const out: Array<{ date: Date; value: number }> = []
        for (let i = 1; i < lines.length; i++) {
          const cols = split(lines[i])
          const dstr = cols[0]
          const v = Number(cols[colIdx])
          if (!dstr || !Number.isFinite(v)) continue
          const dt = parseD(dstr) || new Date(dstr)
          out.push({ date: dt as Date, value: v })
        }
        if (!cancelled) setPastVals(out)
      } catch {}
    }
    loadHist()
    return () => { cancelled = true }
  }, [countryName])
  // Inner chart margins to keep lines within bounds and make room for y-axis labels
  const mLeft = 44, mRight = 24, mTop = 8, mBottom = 24
  const innerW = Math.max(1, width - mLeft - mRight)
  const innerH = Math.max(1, height - mTop - mBottom)
  const allVals = [
    ...(months && months.length === 6 ? months : horizons ? [horizons['1m'].p10, horizons['1m'].p90, horizons['3m'].p10, horizons['3m'].p90, horizons['6m'].p10, horizons['6m'].p90] : []),
    ...pastVals.map(p => p.value)
  ]
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
  const fmt = (v: number) => (Math.abs(max - min) < 10 ? v.toFixed(1) : Math.round(v).toString())

  // Prepare either a 6‑month line or a 1/3/6 fan
  let areaPath = ''
  let linePath = ''
  let areaUnderPath = ''
  let monthPoints: Point[] = []
  let p50Points: Point[] = []
  // Build time scale across past + future (fixed window: -10..+6 relative to first forecast EOM)
  const parseMonthAdd = (d: Date, n: number) => d3.utcMonth.offset(d, n)
  const endOfMonth = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0))
  const monthStart = (y: number, m: number) => new Date(Date.UTC(y, m, 1))
  const lastPastDate = pastVals.length ? pastVals[pastVals.length - 1].date : new Date()
  const lastPastMonthStart = d3.utcMonth.floor(lastPastDate)
  const firstFutureMonthStart = parseMonthAdd(lastPastMonthStart, 1)
  const firstFutureDate = endOfMonth(firstFutureMonthStart)
  let futureDates: Date[] = []
  if (months && months.length === 6) {
    futureDates = Array.from({ length: 6 }, (_, i) => endOfMonth(parseMonthAdd(firstFutureMonthStart, i)))
  } else if (horizons) {
    // Positions at 1m, 3m, 6m ahead (EOM)
    futureDates = [0, 2, 5].map(n => endOfMonth(parseMonthAdd(firstFutureMonthStart, n)))
  }
  const minDate = endOfMonth(parseMonthAdd(firstFutureMonthStart, -10))
  const maxDate = endOfMonth(parseMonthAdd(firstFutureMonthStart, 6))
  const xScaleTime = d3.scaleUtc().domain([minDate, maxDate]).range([mLeft, mLeft + innerW])

  if (months && months.length === 6) {
    monthPoints = months.map((v, i) => ({ x: xScaleTime(futureDates[i]), y: yScale(v) }))
    linePath = `M ${monthPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`
    if (monthPoints.length) {
      const baseY = yScale(min)
      areaUnderPath = `M ${monthPoints.map((p) => `${p.x},${p.y}`).join(' L ')} L ${monthPoints[monthPoints.length - 1].x},${baseY} L ${monthPoints[0].x},${baseY} Z`
    }
  } else if (horizons) {
    const p10: Point[] = [horizons['1m'].p10, horizons['3m'].p10, horizons['6m'].p10].map((v, i) => ({ x: xScaleTime(futureDates[i]), y: yScale(v) }))
    const p90: Point[] = [horizons['6m'].p90, horizons['3m'].p90, horizons['1m'].p90].map((v, i) => ({ x: xScaleTime(futureDates[[2,1,0][i]]), y: yScale(v) }))
    p50Points = [horizons['1m'].p50, horizons['3m'].p50, horizons['6m'].p50].map((v, i) => ({ x: xScaleTime(futureDates[i]), y: yScale(v) }))
    areaPath = `M ${p10.map((p) => `${p.x},${p.y}`).join(' L ')} L ${p90.map((p) => `${p.x},${p.y}`).join(' L ')} Z`
    linePath = `M ${p50Points.map((p) => `${p.x},${p.y}`).join(' L ')}`
  }

  // Build past points using time scale within plotting area (only within the fixed window)
  const pastWindow = pastVals.filter(p => p.date >= minDate && p.date < firstFutureDate)
  const pastXs: Point[] = pastWindow.map(p => ({ x: xScaleTime(p.date), y: yScale(p.value) }))

  return (
    <div style={{ height }}>
      <div className="text-sm text-gray-700 mb-2">{title}</div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        role="img"
        aria-label={`Forecast fan chart for ${title}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Minimal axes (Tufte-style: no background grid) */}
        {/* Plot */}
        <g>
          {/* Past (historical) line and circles in dark gray */}
          {pastXs.length > 1 && (
            <>
              <path d={`M ${pastXs.map(p => `${p.x},${p.y}`).join(' L ')}`} fill="none" stroke="#374151" strokeWidth={3} />
              {pastXs.map((p, i) => (
                <circle
                  key={`past-${i}`}
                  cx={p.x}
                  cy={p.y}
                  r={5}
                  fill="#374151"
                  stroke="#fff"
                  strokeWidth={1.5}
                  onMouseEnter={() => setTip({ x: p.x, y: p.y, text: `${d3.utcFormat('%b %Y')(pastWindow[i].date)}: ${Math.abs(max - min) < 10 ? pastWindow[i].value.toFixed(1) : Math.round(pastWindow[i].value)}` })}
                  onMouseMove={() => setTip({ x: p.x, y: p.y, text: `${d3.utcFormat('%b %Y')(pastWindow[i].date)}: ${Math.abs(max - min) < 10 ? pastWindow[i].value.toFixed(1) : Math.round(pastWindow[i].value)}` })}
                  onMouseLeave={() => setTip(null)}
                />
              ))}
            </>
          )}
          {/* Connector from last past to first forecast median */}
          {pastXs.length > 0 && ((monthPoints && monthPoints.length > 0) || (p50Points && p50Points.length > 0)) && (
            (() => {
              const lastPast = pastXs[pastXs.length - 1]
              const firstFuture = (monthPoints && monthPoints.length > 0) ? monthPoints[0] : p50Points[0]
              return <path d={`M ${lastPast.x},${lastPast.y} L ${firstFuture.x},${firstFuture.y}`} fill="none" stroke="#374151" strokeWidth={3} />
            })()
          )}
          {areaPath && <path d={areaPath} fill="#ef44441a" stroke="#ef444430" />}
          {areaUnderPath && <path d={areaUnderPath} fill="#ef444408" stroke="none" />}
          {linePath && <path d={linePath} fill="none" stroke="#B91C1C" strokeWidth={3} strokeDasharray="5,4" />}
          {monthPoints.length > 0 && monthPoints.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={5}
              fill="#B91C1C"
              stroke="#ffffff"
              strokeWidth={1.5}
              onMouseEnter={() => setTip({ x: p.x, y: p.y, text: `${d3.utcFormat('%b %Y')(futureDates[i])}: ${Math.abs(max - min) < 10 ? months![i].toFixed(1) : Math.round(months![i])}` })}
              onMouseMove={() => setTip({ x: p.x, y: p.y, text: `${d3.utcFormat('%b %Y')(futureDates[i])}: ${Math.abs(max - min) < 10 ? months![i].toFixed(1) : Math.round(months![i])}` })}
              onMouseLeave={() => setTip(null)}
            />
          ))}
          {p50Points.length > 0 && p50Points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={5}
              fill="#B91C1C"
              stroke="#ffffff"
              strokeWidth={1.5}
              onMouseEnter={() => {
                const v = i === 0 ? horizons!['1m'].p50 : i === 1 ? horizons!['3m'].p50 : horizons!['6m'].p50
                setTip({ x: p.x, y: p.y, text: `${d3.utcFormat('%b %Y')(futureDates[i])}: ${Math.abs(max - min) < 10 ? v.toFixed(1) : Math.round(v)}` })
              }}
              onMouseMove={() => {
                const v = i === 0 ? horizons!['1m'].p50 : i === 1 ? horizons!['3m'].p50 : horizons!['6m'].p50
                setTip({ x: p.x, y: p.y, text: `${d3.utcFormat('%b %Y')(futureDates[i])}: ${Math.abs(max - min) < 10 ? v.toFixed(1) : Math.round(v)}` })
              }}
              onMouseLeave={() => setTip(null)}
            />
          ))}
        </g>
        {/* X Axis with relative month ticks (-10..+6) */}
        <g>
          <line x1={mLeft} y1={mTop + innerH} x2={mLeft + innerW} y2={mTop + innerH} stroke="#e5e7eb" />
          {Array.from({ length: 17 }, (_, i) => i - 10).map((rel) => {
            const d = parseMonthAdd(firstFutureDate, rel)
            if (d < minDate || d > maxDate) return null
            const x = xScaleTime(d)
            const label = rel === 0 ? '0' : (rel > 0 ? `+${rel}` : `${rel}`)
            return (
              <g key={rel}>
                <line x1={x} y1={mTop + innerH} x2={x} y2={mTop + innerH + 4} stroke="#d1d5db" />
                <text x={x} y={mTop + innerH + 14} textAnchor="middle" className="text-[10px]" fill="#6b7280">{label}</text>
              </g>
            )
          })}
        </g>
        {/* Separator between past and future */}
        <line x1={xScaleTime(firstFutureDate)} y1={mTop} x2={xScaleTime(firstFutureDate)} y2={mTop + innerH} stroke="#9ca3af" strokeDasharray="4,4" strokeWidth={1.5} opacity={0.8} />
        {/* Now label */}
        <text x={xScaleTime(firstFutureDate)} y={mTop + 12} textAnchor="middle" className="text-xs" fill="#6b7280">Now</text>
        {/* Y Axis */}
        <g>
          <line x1={mLeft} y1={mTop} x2={mLeft} y2={mTop + innerH} stroke="#e5e7eb" />
          {ticks.map((t, i) => {
            const y = yScale(t)
            return (
              <g key={i}>
                <line x1={mLeft - 4} y1={y} x2={mLeft} y2={y} stroke="#d1d5db" />
                <text x={mLeft - 8} y={y + 3} textAnchor="end" className="text-[10px]" fill="#6b7280">{fmt(t)}</text>
              </g>
            )
          })}
        </g>
        
        {/* Tooltip */}
        {tip && (
          <g transform={`translate(${tip.x + 10}, ${tip.y - 12})`}>
            <rect x={-6} y={-16} width={Math.max(40, tip.text.length * 7)} height={18} rx={4} fill="#ffffff" stroke="#d1d5db" />
            <text x={2} y={-4} className="text-[11px]" fill="#111827">{tip.text}</text>
          </g>
        )}
      </svg>
      <div className="mt-1 text-[11px] text-gray-500">
        X‑axis shows months relative to forecast start (0). Past spans −10 to −1; future spans +1 to +6.
      </div>
    </div>
  )
}
