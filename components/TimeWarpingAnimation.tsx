'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Pattern {
  id: number
  data: number[]
  x: number
  y: number
  targetX: number
  targetY: number
  scale: number
  opacity: number
  highlighted: boolean
  warpFactor: number
}

const TimeWarpingAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>()
  const [phase, setPhase] = useState(0) // 0: raw, 1: warping, 2: extracting, 3: patterns

  const CANVAS_WIDTH = 1000
  const CANVAS_HEIGHT = 700
  const MAIN_SERIES_LENGTH = 200

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    let phaseTimer = 0
    let mainSeries: number[] = []
    let warpedSeries: number[] = []
    let extractedPatterns: Pattern[] = []
    let warpProgress = 0

    // Generate main time series with embedded patterns
    const generateMainSeries = () => {
      mainSeries = []
      let baseValue = 50
      
      for (let i = 0; i < MAIN_SERIES_LENGTH; i++) {
        let value = baseValue
        
        // Add different pattern segments
        if (i >= 20 && i <= 40) {
          // Growth pattern
          value += (i - 20) * 1.5 + Math.sin((i - 20) * 0.3) * 3
        } else if (i >= 60 && i <= 80) {
          // Volatile spike pattern
          value += Math.sin((i - 60) * 0.8) * 15 + Math.cos((i - 60) * 1.2) * 8
        } else if (i >= 100 && i <= 130) {
          // Decline pattern
          value -= (i - 100) * 0.8 + Math.cos((i - 100) * 0.2) * 2
        } else if (i >= 150 && i <= 175) {
          // Cyclical pattern
          value += Math.sin((i - 150) * 0.5) * 12
        }
        
        // Add noise
        value += (Math.random() - 0.5) * 6
        
        // Smooth transitions
        if (i > 0) {
          value = mainSeries[i-1] * 0.7 + value * 0.3
        }
        
        mainSeries.push(Math.max(10, Math.min(90, value)))
        baseValue = value
      }
    }

    // Apply dynamic time warping effect
    const applyTimeWarping = (progress: number) => {
      warpedSeries = []
      
      for (let i = 0; i < mainSeries.length; i++) {
        // Create warping function - compress/stretch different segments
        let warpedIndex = i
        
        // Segment 1: Compress
        if (i >= 20 && i <= 40) {
          const localPos = (i - 20) / 20
          const compressed = localPos * 0.7 // Compress to 70%
          warpedIndex = 20 + compressed * 20
        }
        // Segment 2: Stretch  
        else if (i >= 60 && i <= 80) {
          const localPos = (i - 60) / 20
          const stretched = localPos * 1.3 // Stretch to 130%
          warpedIndex = 60 + Math.min(stretched * 20, 20)
        }
        // Segment 3: Slight compression
        else if (i >= 100 && i <= 130) {
          const localPos = (i - 100) / 30
          const compressed = localPos * 0.8
          warpedIndex = 100 + compressed * 30
        }
        
        // Interpolate based on progress
        const finalIndex = i * (1 - progress) + warpedIndex * progress
        const value = interpolateValue(mainSeries, finalIndex)
        warpedSeries.push(value)
      }
    }

    // Interpolate value at fractional index
    const interpolateValue = (series: number[], index: number): number => {
      const floor = Math.floor(index)
      const ceil = Math.ceil(index)
      
      if (floor === ceil || ceil >= series.length) {
        return series[Math.min(floor, series.length - 1)]
      }
      
      const fraction = index - floor
      return series[floor] * (1 - fraction) + series[ceil] * fraction
    }

    // Extract pattern subsequences
    const extractPatterns = () => {
      extractedPatterns = []
      
      const patternSegments = [
        { start: 20, end: 40, type: 'growth' },
        { start: 60, end: 80, type: 'volatility' },
        { start: 100, end: 130, type: 'decline' },
        { start: 150, end: 175, type: 'cyclical' }
      ]
      
      patternSegments.forEach((segment, index) => {
        const patternData = warpedSeries.slice(segment.start, segment.end + 1)
        
        const pattern: Pattern = {
          id: index,
          data: patternData,
          x: 100 + (segment.start / MAIN_SERIES_LENGTH) * 800,
          y: 200,
          targetX: 200 + index * 150,
          targetY: 500,
          scale: 1,
          opacity: 0,
          highlighted: false,
          warpFactor: 1
        }
        
        extractedPatterns.push(pattern)
      })
    }

    // Draw main time series
    const drawMainSeries = (series: number[], x: number, y: number, width: number, height: number, highlight: boolean = false) => {
      if (series.length === 0) return
      
      ctx.save()
      
      // Background
      ctx.fillStyle = highlight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255, 255, 255, 0.05)'
      ctx.fillRect(x, y, width, height)
      
      // Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
      ctx.lineWidth = 1
      for (let i = 1; i < 5; i++) {
        const gridY = y + (height / 5) * i
        ctx.beginPath()
        ctx.moveTo(x, gridY)
        ctx.lineTo(x + width, gridY)
        ctx.stroke()
      }
      
      // Main line
      ctx.strokeStyle = highlight ? 'rgba(59, 130, 246, 0.9)' : 'rgba(34, 197, 94, 0.8)'
      ctx.lineWidth = highlight ? 3 : 2
      ctx.beginPath()
      
      for (let i = 0; i < series.length; i++) {
        const plotX = x + (i / (series.length - 1)) * width
        const plotY = y + height - (series[i] / 100) * height
        
        if (i === 0) {
          ctx.moveTo(plotX, plotY)
        } else {
          ctx.lineTo(plotX, plotY)
        }
      }
      
      ctx.stroke()
      
      // Warping visualization
      if (phase === 1 && warpProgress > 0) {
        // Show warping distortion
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.6)'
        ctx.lineWidth = 1
        ctx.setLineDash([2, 2])
        
        const segments = [
          { start: 20, end: 40, factor: 0.7 },
          { start: 60, end: 80, factor: 1.3 },
          { start: 100, end: 130, factor: 0.8 }
        ]
        
        segments.forEach(segment => {
          const startX = x + (segment.start / series.length) * width
          const endX = x + (segment.end / series.length) * width
          const warpedWidth = (endX - startX) * segment.factor * warpProgress
          const warpedEndX = startX + warpedWidth
          
          ctx.beginPath()
          ctx.moveTo(startX, y + height + 10)
          ctx.lineTo(warpedEndX, y + height + 10)
          ctx.stroke()
        })
        
        ctx.setLineDash([])
      }
      
      ctx.restore()
    }

    // Draw extracted pattern
    const drawPattern = (pattern: Pattern) => {
      const width = 120 * pattern.scale
      const height = 80 * pattern.scale
      
      ctx.save()
      ctx.globalAlpha = pattern.opacity
      
      // Pattern background
      ctx.fillStyle = pattern.highlighted ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(pattern.x - width/2, pattern.y - height/2, width, height)
      
      // Pattern border
      if (pattern.highlighted) {
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)'
        ctx.lineWidth = 2
        ctx.strokeRect(pattern.x - width/2, pattern.y - height/2, width, height)
      }
      
      // Pattern line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let i = 0; i < pattern.data.length; i++) {
        const x = pattern.x - width/2 + (i / (pattern.data.length - 1)) * width
        const y = pattern.y + height/2 - (pattern.data[i] / 100) * height
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
      
      // Pattern label
      if (pattern.opacity > 0.5) {
        const labels = ['Growth', 'Volatility', 'Decline', 'Cyclical']
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '12px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(labels[pattern.id] || 'Pattern', pattern.x, pattern.y + height/2 + 20)
      }
      
      ctx.restore()
    }

    // Update animation
    const update = () => {
      if (phase === 1) {
        warpProgress = Math.min(1, warpProgress + 0.02)
        applyTimeWarping(warpProgress)
      }
      
      if (phase >= 2) {
        extractedPatterns.forEach(pattern => {
          // Move to target position
          const dx = pattern.targetX - pattern.x
          const dy = pattern.targetY - pattern.y
          pattern.x += dx * 0.08
          pattern.y += dy * 0.08
          
          // Fade in
          pattern.opacity = Math.min(1, pattern.opacity + 0.03)
          
          // Highlight sequence
          if (phase === 3) {
            const highlightIndex = Math.floor((time * 0.1) % extractedPatterns.length)
            pattern.highlighted = pattern.id === highlightIndex
            pattern.scale = pattern.highlighted ? 1.2 : 1
          }
        })
      }
    }

    // Render everything
    const render = () => {
      // Clear
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      
      // Draw main series
      const series = phase >= 1 ? warpedSeries : mainSeries
      drawMainSeries(series, 100, 50, 800, 120, phase >= 1)
      
      // Draw extracted patterns
      if (phase >= 2) {
        extractedPatterns.forEach(pattern => {
          drawPattern(pattern)
        })
        
        // Draw connection lines in phase 3
        if (phase === 3) {
          extractedPatterns.forEach(pattern => {
            if (pattern.opacity > 0.5) {
              ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
              ctx.lineWidth = 1
              ctx.setLineDash([2, 4])
              ctx.beginPath()
              ctx.moveTo(100 + ((20 + pattern.id * 30) / MAIN_SERIES_LENGTH) * 800, 170)
              ctx.lineTo(pattern.x, pattern.y - 40)
              ctx.stroke()
              ctx.setLineDash([])
            }
          })
        }
      }
      
      // Phase indicator
      const phaseNames = [
        'Raw Time Series Data',
        'Dynamic Time Warping Analysis',
        'Extracting Pattern Subsequences',
        'Identified Patterns & Insights'
      ]
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(phaseNames[phase], 30, 40)
      
      // Progress visualization
      if (phase === 1) {
        ctx.fillStyle = 'rgba(255, 165, 0, 0.7)'
        ctx.font = '14px Arial'
        ctx.fillText(`Warping Progress: ${Math.floor(warpProgress * 100)}%`, 30, 650)
      }
      
      if (phase >= 2) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        ctx.font = '14px Arial'
        ctx.fillText(`Patterns Extracted: ${extractedPatterns.filter(p => p.opacity > 0.5).length}/${extractedPatterns.length}`, 30, 650)
      }
    }

    // Animation loop
    const animate = () => {
      time += 1
      phaseTimer += 1

      // Phase transitions
      if (phaseTimer > 180 && phase === 0) { // Raw data (3 seconds)
        setPhase(1)
        phaseTimer = 0
        warpProgress = 0
      } else if (phaseTimer > 240 && phase === 1) { // Warping (4 seconds)
        setPhase(2)
        phaseTimer = 0
        extractPatterns()
      } else if (phaseTimer > 180 && phase === 2) { // Extracting (3 seconds)
        setPhase(3)
        phaseTimer = 0
      } else if (phaseTimer > 300 && phase === 3) { // Patterns (5 seconds)
        setPhase(0)
        phaseTimer = 0
        generateMainSeries() // Reset
        extractedPatterns = []
        warpProgress = 0
      }

      update()
      render()

      animationIdRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    generateMainSeries()
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

export default TimeWarpingAnimation