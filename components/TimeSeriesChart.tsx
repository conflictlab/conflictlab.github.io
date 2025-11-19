'use client'

import { useState, useEffect } from 'react'

interface TimeSeriesChartProps {
  data: {
    historical: number[]
    forecast: number[]
    country: string
  }
}

export default function TimeSeriesChart({ data }: TimeSeriesChartProps) {
  const [animatedData, setAnimatedData] = useState<number[]>([])
  const { historical, forecast, country } = data
  
  const allData = [...historical, ...forecast]
  const maxValue = Math.max(...allData)
  const minValue = Math.min(...allData)
  const range = maxValue - minValue
  
  // Create months array for x-axis
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const totalPoints = historical.length + forecast.length
  
  useEffect(() => {
    // Animate the chart drawing
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < allData.length) {
        setAnimatedData(allData.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 100)
    
    return () => clearInterval(interval)
  }, [allData])
  
  // Convert data points to SVG coordinates
  const getY = (value: number) => {
    const normalized = (value - minValue) / range
    return 180 - (normalized * 140) // Flip Y axis and add padding
  }
  
  const getX = (index: number) => {
    return 40 + (index * (400 / (totalPoints - 1)))
  }
  
  // Create path for historical data
  const historicalPath = historical.map((value, index) => {
    const x = getX(index)
    const y = getY(value)
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
  
  // Create path for forecast data
  const forecastPath = forecast.map((value, index) => {
    const x = getX(historical.length + index)
    const y = getY(value)
    return index === 0 ? `M ${getX(historical.length - 1)} ${getY(historical[historical.length - 1])}` : `L ${x} ${y}`
  }).join(' ')
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-900 mb-4">
        Risk Forecast: {country}
      </h4>
      
      <svg width="480" height="220" className="w-full h-auto">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="480" height="220" fill="url(#grid)" />
        
        {/* Y-axis */}
        <line x1="40" y1="20" x2="40" y2="200" stroke="#e5e7eb" strokeWidth="1"/>
        
        {/* X-axis */}
        <line x1="40" y1="200" x2="440" y2="200" stroke="#e5e7eb" strokeWidth="1"/>
        
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = getY(value)
          return (
            <g key={value}>
              <line x1="35" y1={y} x2="40" y2={y} stroke="#9ca3af" strokeWidth="1"/>
              <text x="30" y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                {value}
              </text>
            </g>
          )
        })}
        
        {/* Forecast divider line */}
        <line 
          x1={getX(historical.length - 1)} 
          y1="20" 
          x2={getX(historical.length - 1)} 
          y2="200" 
          stroke="#fbbf24" 
          strokeWidth="2" 
          strokeDasharray="4,4"
          opacity="0.7"
        />
        
        {/* Historical data line */}
        <path
          d={historicalPath}
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2"
          className="transition-all duration-300"
        />

        {/* Forecast data line */}
        <path
          d={forecastPath}
          fill="none"
          stroke="#2d2d2d"
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.8"
          className="transition-all duration-300"
        />

        {/* Data points */}
        {animatedData.map((value, index) => {
          const x = getX(index)
          const y = getY(value)
          const isForecast = index >= historical.length

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={isForecast ? 3 : 4}
              fill="#4b5563"
              stroke="white"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all duration-200"
            >
              <title>{`${months[index % 12]}: ${value}`}</title>
            </circle>
          )
        })}
        
        {/* Legend */}
        <g transform="translate(300, 30)">
          <rect x="0" y="0" width="140" height="50" fill="white" stroke="#e5e7eb" rx="4"/>
          <line x1="10" y1="15" x2="30" y2="15" stroke="#2d2d2d" strokeWidth="2"/>
          <text x="35" y="19" className="text-xs fill-gray-700">Historical</text>
          <line x1="10" y1="35" x2="30" y2="35" stroke="#2d2d2d" strokeWidth="2" strokeDasharray="3,3"/>
          <text x="35" y="39" className="text-xs fill-gray-700">Forecast</text>
        </g>
        
        {/* Current/Forecast label */}
        <text x={getX(historical.length - 1)} y="15" textAnchor="middle" className="text-xs fill-orange-600 font-medium">
          Now
        </text>
      </svg>
      
      <div className="mt-2 text-xs text-gray-500 text-center">
        6-month historical trend and 5-month forecast
      </div>
    </div>
  )
}
