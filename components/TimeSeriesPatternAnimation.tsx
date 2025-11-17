'use client'

import React, { useEffect, useRef, useState } from 'react'

interface TimeSeries {
  id: number
  data: number[]
  x: number
  y: number
  targetX: number
  targetY: number
  color: string
  pattern: 'upward' | 'volatile' | 'declining' | 'cyclical'
  opacity: number
  clustered: boolean
}

const TimeSeriesPatternAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>()
  const [phase, setPhase] = useState(0) // 0: chaos, 1: analyzing, 2: clustering, 3: patterns revealed

  const CANVAS_WIDTH = 900
  const CANVAS_HEIGHT = 700
  const SERIES_LENGTH = 60
  const SERIES_COUNT = 24

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    let phaseTimer = 0
    let timeSeries: TimeSeries[] = []

    // Generate time series with different patterns
    const generateTimeSeries = () => {
      const patterns: Array<'upward' | 'volatile' | 'declining' | 'cyclical'> = 
        ['upward', 'volatile', 'declining', 'cyclical']
      
      timeSeries = []
      
      for (let i = 0; i < SERIES_COUNT; i++) {
        const pattern = patterns[Math.floor(Math.random() * patterns.length)]
        const data: number[] = []
        
        let baseValue = 50 + Math.random() * 40
        
        for (let j = 0; j < SERIES_LENGTH; j++) {
          let value = baseValue
          
          switch (pattern) {
            case 'upward':
              value += j * 0.8 + Math.sin(j * 0.3) * 5 + (Math.random() - 0.5) * 8
              break
            case 'volatile':
              value += Math.sin(j * 0.5) * 20 + (Math.random() - 0.5) * 15
              break
            case 'declining':
              value -= j * 0.6 + Math.cos(j * 0.2) * 4 + (Math.random() - 0.5) * 6
              break
            case 'cyclical':
              value += Math.sin(j * 0.4) * 15 + Math.cos(j * 0.8) * 8 + (Math.random() - 0.5) * 4
              break
          }
          
          data.push(Math.max(10, Math.min(90, value)))
        }

        const series: TimeSeries = {
          id: i,
          data,
          x: Math.random() * (CANVAS_WIDTH - 200) + 100,
          y: Math.random() * (CANVAS_HEIGHT - 200) + 100,
          targetX: Math.random() * (CANVAS_WIDTH - 200) + 100,
          targetY: Math.random() * (CANVAS_HEIGHT - 200) + 100,
          color: `hsl(${Math.random() * 360}, 70%, 60%)`,
          pattern,
          opacity: 0.6 + Math.random() * 0.4,
          clustered: false
        }
        
        timeSeries.push(series)
      }
    }

    // Cluster series by pattern
    const clusterByPattern = () => {
      const clusters = {
        upward: { x: 200, y: 150, series: [] as TimeSeries[] },
        volatile: { x: 700, y: 150, series: [] as TimeSeries[] },
        declining: { x: 200, y: 550, series: [] as TimeSeries[] },
        cyclical: { x: 700, y: 550, series: [] as TimeSeries[] }
      }

      timeSeries.forEach(series => {
        const cluster = clusters[series.pattern]
        cluster.series.push(series)
        
        // Position in cluster with some spread
        const spread = 120
        const angle = (cluster.series.length - 1) * (Math.PI * 2 / 8)
        series.targetX = cluster.x + Math.cos(angle) * spread
        series.targetY = cluster.y + Math.sin(angle) * spread
        series.clustered = true
      })
    }

    // Draw single time series
    const drawTimeSeries = (series: TimeSeries, scale: number = 1) => {
      const width = 120 * scale
      const height = 60 * scale
      
      ctx.save()
      ctx.translate(series.x - width/2, series.y - height/2)
      
      // Background
      ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * series.opacity})`
      ctx.fillRect(0, 0, width, height)
      
      // Draw line
      ctx.strokeStyle = series.color.replace('60%', `${Math.floor(series.opacity * 100)}%`)
      ctx.lineWidth = 2 * scale
      ctx.beginPath()
      
      for (let i = 0; i < series.data.length; i++) {
        const x = (i / (series.data.length - 1)) * width
        const y = height - (series.data[i] / 100) * height
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
      
      // Highlight pattern in clustering phase
      if (phase >= 2 && series.clustered) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.lineWidth = 1
        ctx.strokeRect(-5, -5, width + 10, height + 10)
      }
      
      ctx.restore()
    }

    // Draw pattern analysis overlay
    const drawPatternAnalysis = () => {
      if (phase < 2) return
      
      const patterns = ['upward', 'volatile', 'declining', 'cyclical'] as const
      const positions = [
        { x: 200, y: 150, label: 'Growth Trends' },
        { x: 700, y: 150, label: 'Volatility Patterns' },
        { x: 200, y: 550, label: 'Decline Signals' },
        { x: 700, y: 550, label: 'Cyclical Behavior' }
      ]

      positions.forEach((pos, i) => {
        const pattern = patterns[i]
        const seriesInCluster = timeSeries.filter(s => s.pattern === pattern)
        
        if (seriesInCluster.length === 0) return
        
        // Cluster circle
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 140, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        
        // Label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = 'bold 16px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(pos.label, pos.x, pos.y - 160)
        
        // Pattern characteristics
        ctx.font = '12px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.fillText(`${seriesInCluster.length} series detected`, pos.x, pos.y + 160)
      })
    }

    // Draw insights in revelation phase
    const drawInsights = () => {
      if (phase < 3) return
      
      // Central insight area
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)'
      ctx.fillRect(350, 280, 200, 140)
      
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.lineWidth = 2
      ctx.strokeRect(350, 280, 200, 140)
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('PATTERN INSIGHTS', 450, 310)
      
      ctx.font = '14px Arial'
      ctx.fillText('• 4 distinct patterns identified', 450, 335)
      ctx.fillText('• Market cycles detected', 450, 355)
      ctx.fillText('• Risk clusters isolated', 450, 375)
      ctx.fillText('• Predictive signals found', 450, 395)
      
      // Connecting lines to clusters
      const clusterPositions = [
        { x: 200, y: 150 }, { x: 700, y: 150 },
        { x: 200, y: 550 }, { x: 700, y: 550 }
      ]
      
      clusterPositions.forEach(pos => {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(pos.x, pos.y)
        ctx.lineTo(450, 350)
        ctx.stroke()
      })
    }

    // Update positions and states
    const update = () => {
      timeSeries.forEach(series => {
        // Move toward target
        const dx = series.targetX - series.x
        const dy = series.targetY - series.y
        series.x += dx * 0.05
        series.y += dy * 0.05
      })
    }

    // Render everything
    const render = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      
      // Draw grid
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.1)'
      ctx.lineWidth = 1
      for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_WIDTH, y)
        ctx.stroke()
      }
      
      // Draw time series
      const scale = phase >= 2 ? 0.8 : 1
      timeSeries.forEach(series => {
        drawTimeSeries(series, scale)
      })
      
      // Draw overlays based on phase
      if (phase >= 2) {
        drawPatternAnalysis()
      }
      
      if (phase >= 3) {
        drawInsights()
      }
      
      // Phase indicator
      const phaseNames = [
        'Raw Time Series Data',
        'AI Pattern Analysis in Progress',
        'Clustering Similar Patterns',
        'Patterns Revealed - Insights Generated'
      ]
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(phaseNames[phase], 30, 40)
      
      // Progress bar
      const progress = phaseTimer / (phase === 0 ? 180 : phase === 1 ? 240 : phase === 2 ? 180 : 300)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fillRect(30, 55, 300, 8)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.8)'
      ctx.fillRect(30, 55, 300 * Math.min(1, progress), 8)
    }

    // Animation loop
    const animate = () => {
      time += 1
      phaseTimer += 1

      // Phase transitions
      if (phaseTimer > 180 && phase === 0) { // Raw data (3 seconds)
        setPhase(1)
        phaseTimer = 0
      } else if (phaseTimer > 240 && phase === 1) { // Analysis (4 seconds)
        setPhase(2)
        phaseTimer = 0
        clusterByPattern()
      } else if (phaseTimer > 180 && phase === 2) { // Clustering (3 seconds)
        setPhase(3)
        phaseTimer = 0
      } else if (phaseTimer > 300 && phase === 3) { // Insights (5 seconds)
        setPhase(0)
        phaseTimer = 0
        generateTimeSeries() // Reset with new data
      }

      update()
      render()

      animationIdRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    generateTimeSeries()
    animate()

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [phase])

  return (
    <div className="w-full flex justify-center items-center bg-slate-900 p-8 rounded-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-600 rounded-lg shadow-2xl bg-slate-800"
      />
    </div>
  )
}

export default TimeSeriesPatternAnimation