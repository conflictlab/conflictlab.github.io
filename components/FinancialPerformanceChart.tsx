'use client'

import { useState, useEffect } from 'react'

// Mock data for financial performance
const performanceData = {
  clairientStrategy: {
    name: 'Clairient-Informed Strategy',
    returns: [100, 102, 105, 103, 108, 112, 115, 118, 114, 120, 125, 128],
    color: '#1e40af'
  },
  benchmark: {
    name: 'Market Benchmark (S&P 500)',
    returns: [100, 101, 103, 99, 102, 104, 106, 103, 101, 105, 108, 107],
    color: '#6b7280'
  },
  tradStrategy: {
    name: 'Traditional Strategy',
    returns: [100, 100.5, 102, 98, 101, 103, 104, 102, 99, 103, 106, 105],
    color: '#dc2626'
  }
}

interface FinancialPerformanceChartProps {
  height?: number
  showAnimation?: boolean
}

export default function FinancialPerformanceChart({ height = 300, showAnimation = true }: FinancialPerformanceChartProps) {
  const [animationProgress, setAnimationProgress] = useState(0)
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null)
  
  useEffect(() => {
    if (!showAnimation) {
      setAnimationProgress(100)
      return
    }
    
    const duration = 3000 // 3 seconds
    const steps = 60
    const stepTime = duration / steps
    
    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = (currentStep / steps) * 100
      setAnimationProgress(progress)
      
      if (currentStep >= steps) {
        clearInterval(interval)
      }
    }, stepTime)
    
    return () => clearInterval(interval)
  }, [showAnimation])
  
  const maxValue = 135
  const minValue = 95
  const range = maxValue - minValue
  const months = ['Jan 2024', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const getY = (value: number) => {
    const normalized = (value - minValue) / range
    return height - 40 - (normalized * (height - 80))
  }
  
  const getX = (index: number) => {
    return 60 + (index * (600 / (months.length - 1)))
  }
  
  const createPath = (data: number[]) => {
    const visiblePointCount = Math.floor((data.length * animationProgress) / 100)
    const visibleData = data.slice(0, Math.max(1, visiblePointCount))
    
    return visibleData.map((value, index) => {
      const x = getX(index)
      const y = getY(value)
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    }).join(' ')
  }
  
  const getLatestReturn = (data: number[]) => {
    const latest = data[data.length - 1]
    return ((latest - 100)).toFixed(1)
  }
  
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Investment Performance Comparison
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Portfolio returns using Clairient risk intelligence vs. traditional approaches
          </p>
        </div>
        
        {/* Performance Summary */}
        <div className="text-right">
          <div className="text-sm text-gray-500">12-Month Return</div>
          <div className="text-2xl font-bold text-clairient-blue">
            +{getLatestReturn(performanceData.clairientStrategy.returns)}%
          </div>
          <div className="text-sm text-green-600">
            +{(parseFloat(getLatestReturn(performanceData.clairientStrategy.returns)) - 
               parseFloat(getLatestReturn(performanceData.benchmark.returns))).toFixed(1)}% vs benchmark
          </div>
        </div>
      </div>
      
      <svg width="720" height={height} className="w-full">
        {/* Grid lines */}
        <defs>
          <pattern id="performanceGrid" width="60" height="20" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 20" fill="none" stroke="#f9fafb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="720" height={height} fill="url(#performanceGrid)" />
        
        {/* Axes */}
        <line x1="60" y1={height - 40} x2="660" y2={height - 40} stroke="#e5e7eb" strokeWidth="1"/>
        <line x1="60" y1="20" x2="60" y2={height - 40} stroke="#e5e7eb" strokeWidth="1"/>
        
        {/* Y-axis labels */}
        {[95, 100, 105, 110, 115, 120, 125, 130, 135].map((value) => {
          const y = getY(value)
          return (
            <g key={value}>
              <line x1="55" y1={y} x2="60" y2={y} stroke="#d1d5db" strokeWidth="1"/>
              <text x="50" y={y + 4} textAnchor="end" className="text-xs fill-gray-500">
                {value}
              </text>
            </g>
          )
        })}
        
        {/* X-axis labels */}
        {months.map((month, index) => {
          const x = getX(index)
          return (
            <text key={month} x={x} y={height - 20} textAnchor="middle" className="text-xs fill-gray-500">
              {index % 3 === 0 ? month : ''}
            </text>
          )
        })}
        
        {/* Performance lines */}
        {Object.entries(performanceData).map(([key, series]) => (
          <g key={key}>
            <path
              d={createPath(series.returns)}
              fill="none"
              stroke={series.color}
              strokeWidth={hoveredSeries === key ? 4 : 3}
              opacity={hoveredSeries && hoveredSeries !== key ? 0.3 : 1}
              className="transition-all duration-300"
            />
            
            {/* Data points */}
            {series.returns.slice(0, Math.floor((series.returns.length * animationProgress) / 100)).map((value, index) => (
              <circle
                key={index}
                cx={getX(index)}
                cy={getY(value)}
                r={hoveredSeries === key ? 5 : 3}
                fill={series.color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredSeries(key)}
                onMouseLeave={() => setHoveredSeries(null)}
              >
                <title>{`${months[index]}: ${value.toFixed(1)}`}</title>
              </circle>
            ))}
          </g>
        ))}
        
        {/* Legend */}
        <g transform="translate(400, 30)">
          <rect x="0" y="0" width="240" height="80" fill="white" stroke="#e5e7eb" rx="4"/>
          {Object.entries(performanceData).map(([key, series], index) => (
            <g key={key} transform={`translate(10, ${15 + index * 20})`}>
              <line x1="0" y1="0" x2="20" y2="0" stroke={series.color} strokeWidth="3"/>
              <text x="25" y="4" className="text-xs fill-gray-700">{series.name}</text>
            </g>
          ))}
        </g>
      </svg>
      
      {/* Key Metrics */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-clairient-blue">
            +{(parseFloat(getLatestReturn(performanceData.clairientStrategy.returns)) - 
               parseFloat(getLatestReturn(performanceData.benchmark.returns))).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Alpha vs Benchmark</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-green-600">
            {((performanceData.clairientStrategy.returns[performanceData.clairientStrategy.returns.length - 1] / 
               performanceData.benchmark.returns[performanceData.benchmark.returns.length - 1] - 1) * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">Outperformance</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="text-lg font-bold text-purple-600">1.45</div>
          <div className="text-sm text-gray-600">Sharpe Ratio</div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        *Performance data is simulated for demonstration purposes
      </div>
    </div>
  )
}