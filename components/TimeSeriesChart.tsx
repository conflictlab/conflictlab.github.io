'use client'

import { useState, useEffect } from 'react'
import * as d3 from 'd3'

interface TimeSeriesChartProps {
  data: {
    historical: number[]
    forecast: number[]
    country: string
    histPeriods?: string[] // 'YYYY-MM'
    forecastPeriods?: string[] // 'YYYY-MM'
  }
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const [animatedData, setAnimatedData] = useState<number[]>([])
  const [tip, setTip] = useState<null | { x: number; y: number; text: string }>(null)
  const { historical, forecast, country, histPeriods = [], forecastPeriods = [] } = data
  
  const allData = [...historical, ...forecast]
  const maxValue = Math.max(...allData)
  const minValue = Math.min(...allData)
  const range = maxValue - minValue
  // Dimensions
  const svgWidth = 480
  const svgHeight = 360
  const yTop = 20
  const yBottom = svgHeight - 20
  // Dynamic ticks
  const tickCount = 4
  const ticks: number[] = (() => {
    if (!isFinite(range) || range === 0) return [minValue, minValue + 1, minValue + 2, minValue + 3]
    const arr: number[] = []
    for (let i = 0; i < tickCount; i++) arr.push(minValue + (range * i) / (tickCount - 1))
    return arr
  })()
  const fmtTick = (v: number) => (Math.abs(range) < 10 ? v.toFixed(1) : Math.round(v).toString())
  
  // Helpers for month labels
  const formatPeriod = (p: string) => {
    const [y, m] = p.split('-').map(Number)
    const d = new Date(Date.UTC(y || 1970, (m || 1) - 1, 1))
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' })
  }
  const totalPoints = historical.length + forecast.length
  // Time-based X scale (use end-of-month for better alignment)
  const toEOM = (p: string) => {
    const [yy, mm] = p.split('-').map(Number)
    const d0 = new Date(Date.UTC(yy || 1970, (mm || 1) - 1, 1))
    return d3.utcDay.offset(d3.utcMonth.offset(d0, 1), -1)
  }
  const histDates = histPeriods.length ? histPeriods.map(toEOM) : []
  const forecastDates = forecastPeriods.length ? forecastPeriods.map(toEOM) : []
  const allDates = [...histDates, ...forecastDates]
  const minDate = allDates[0] || new Date(Date.UTC(1970, 0, 31))
  const maxDate = allDates[allDates.length - 1] || new Date(Date.UTC(1970, 5, 30))
  const xScale = d3.scaleUtc().domain([minDate, maxDate]).range([40, 440])
  const nowDate = histDates.length ? histDates[histDates.length - 1] : minDate
  
  // Disable animation for clearer circle rendering of all points
  useEffect(() => { setAnimatedData(allData) }, [allData])
  
  // Convert data points to SVG coordinates
  const getY = (value: number) => {
    const normalized = (value - minValue) / (range || 1)
    return yBottom - (normalized * (yBottom - yTop))
  }
  
  const getXIdx = (index: number) => 40 + (index * (400 / (totalPoints - 1))) // fallback
  
  // Create path for historical data
  const historicalPath = historical.map((value, index) => {
    const x = histDates[index] ? xScale(histDates[index]) : getXIdx(index)
    const y = getY(value)
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
  
  // Create path for forecast data
  const forecastPath = forecast.map((value, index) => {
    const x = forecastDates[index] ? xScale(forecastDates[index]) : getXIdx(historical.length + index)
    const y = getY(value)
    const x0 = histDates.length ? xScale(histDates[histDates.length - 1]) : getXIdx(historical.length - 1)
    const y0 = getY(historical[historical.length - 1])
    return index === 0 ? `M ${x0} ${y0} L ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
  
  return (
    <div>
      <svg width={svgWidth} height={svgHeight} className="w-full h-auto">
        
        {/* Y-axis (minimal) */}
        <line x1="40" y1={yTop} x2="40" y2={yBottom} stroke="#e5e7eb" strokeWidth="1"/>
        {ticks.map((t, i) => {
          const y = getY(t)
          return (
            <g key={i}>
              <line x1="36" y1={y} x2="40" y2={y} stroke="#d1d5db" />
              <text x="32" y={y + 3} textAnchor="end" className="text-[10px]" fill="#6b7280">{fmtTick(t)}</text>
            </g>
          )
        })}
        
        {/* X-axis with month ticks (vertical, short labels) */}
        <line x1={40} y1={yBottom} x2={440} y2={yBottom} stroke="#e5e7eb" strokeWidth={1}/>
        {(() => {
          const start = d3.utcMonth.floor(minDate)
          const end = d3.utcMonth.ceil(maxDate)
          const months = d3.utcMonth.range(start, d3.utcMonth.offset(end, 1))
          const fmtMon = d3.utcFormat('%b')
          const fmtYr = d3.utcFormat('%y')
          return months.map((m, i) => {
            const eom = d3.utcDay.offset(d3.utcMonth.offset(m, 1), -1)
            const x = xScale(eom)
            const label = `${fmtMon(eom)}. ${fmtYr(eom)}`.toLowerCase()
            return (
              <g key={i}>
                <line x1={x} y1={yBottom} x2={x} y2={yBottom + 4} stroke="#d1d5db" />
                <g transform={`translate(${x}, ${yBottom + 16}) rotate(-90)`}>
                  <text x={0} y={0} textAnchor="end" className="text-[9px]" fill="#6b7280">{label}</text>
                </g>
              </g>
            )
          })
        })()}
        
        
        {/* Forecast divider line */}
        <line 
          x1={xScale(nowDate)} 
          y1={yTop} 
          x2={xScale(nowDate)} 
          y2={yBottom} 
          stroke="#9ca3af" 
          strokeWidth="1.5" 
          strokeDasharray="4,4"
          opacity="0.8"
        />
        
        {/* Historical data line */}
        <path
          d={historicalPath}
          fill="none"
          stroke="#374151"
          strokeWidth="3"
          className="transition-all duration-300"
        />

        {/* Forecast data line */}
        <path
          d={forecastPath}
          fill="none"
          stroke="#B91C1C"
          strokeWidth="3"
          strokeDasharray="5,4"
          opacity="0.9"
          className="transition-all duration-300"
        />

        {/* Data points (all visible) */}
        {Array.from({ length: totalPoints }).map((_, index) => {
          const isForecast = index >= historical.length
          const v = isForecast ? forecast[index - historical.length] : historical[index]
          const x = isForecast
            ? (forecastDates[index - historical.length] ? xScale(forecastDates[index - historical.length]) : getXIdx(index))
            : (histDates[index] ? xScale(histDates[index]) : getXIdx(index))
          const y = getY(v)
          const valLabel = Math.abs(range) < 10 ? v.toFixed(1) : Math.round(v).toString()
          const dateLabel = !isForecast
            ? (histPeriods[index] ? formatPeriod(histPeriods[index]) : '')
            : (forecastPeriods[index - historical.length] ? formatPeriod(forecastPeriods[index - historical.length]) : '')
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={6}
              fill={isForecast ? '#B91C1C' : '#374151'}
              stroke="white"
              strokeWidth="1.5"
              className="cursor-pointer hover:r-7 transition-all duration-200"
              onMouseEnter={() => setTip({ x, y, text: `${dateLabel ? dateLabel + ': ' : ''}${valLabel}` })}
              onMouseMove={() => setTip({ x, y, text: `${dateLabel ? dateLabel + ': ' : ''}${valLabel}` })}
              onMouseLeave={() => setTip(null)}
            />
          )
        })}
        
        {/* Legend (top-left inside plot area) */}
        <g transform="translate(48, 26)">
          <rect x="0" y="0" width="176" height="52" fill="white" stroke="#e5e7eb" rx="6"/>
          <line x1="10" y1="16" x2="30" y2="16" stroke="#374151" strokeWidth="3"/>
          <text x="35" y="20" className="text-xs fill-gray-700">Historical (monthly)</text>
          <line x1="10" y1="36" x2="30" y2="36" stroke="#B91C1C" strokeWidth="3" strokeDasharray="5,4"/>
          <text x="35" y="40" className="text-xs fill-gray-700">Forecast (months 1–6)</text>
        </g>
        
        {/* Current/Forecast label */}
        <text x={xScale(nowDate)} y="16" textAnchor="middle" className="text-xs fill-gray-600 font-medium">Now</text>
        {/* Tooltip */}
        {tip && (
          <g transform={`translate(${tip.x + 10}, ${tip.y - 12})`}>
            <rect x={-6} y={-16} width={Math.max(40, tip.text.length * 7)} height={18} rx={4} fill="#ffffff" stroke="#d1d5db" />
            <text x={2} y={-4} className="text-[11px]" fill="#111827">{tip.text}</text>
          </g>
        )}
      </svg>
      
      
    </div>
  )
}
