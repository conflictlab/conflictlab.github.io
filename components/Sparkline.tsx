'use client'

import React from 'react'

interface SparklineProps {
  values: number[]
  width?: number
  height?: number
  stroke?: string
}

export default function Sparkline({ values, width = 100, height = 28, stroke = '#6b7280' }: SparklineProps) {
  if (!values || values.length === 0) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = width / (values.length - 1 || 1)
  const points = values.map((v, i) => {
    const x = i * stepX
    const y = height - ((v - min) / range) * height
    return `${x},${y}`
  })
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="trend sparkline">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.join(' ')}
      />
    </svg>
  )
}
