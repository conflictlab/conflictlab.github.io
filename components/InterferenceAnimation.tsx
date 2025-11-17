'use client'

import React, { useEffect, useRef } from 'react'

interface WaveSource {
  x: number
  y: number
  frequency: number
  amplitude: number
  phase: number
  active: boolean
}

const InterferenceAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)
  const phaseRef = useRef(0) // 0: chaos, 1: resolving, 2: clarity, 3: evolving
  const phaseTimerRef = useRef(0)
  const waveSourcesRef = useRef<WaveSource[]>([])

  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600
  const RESOLUTION = 4 // Higher = more detailed but slower

  // Initialize wave sources once (chaotic + coherent sets)
  const ensureWaveSources = () => {
    if (waveSourcesRef.current.length > 0) return
    const chaoticCount = 7
    const coherentCount = 5
    const sources: WaveSource[] = []
    // Chaotic sources — random placement and phases, active initially
    for (let i = 0; i < chaoticCount; i++) {
      sources.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        frequency: 0.06 + Math.random() * 0.06,
        amplitude: 20 + Math.random() * 30,
        phase: Math.random() * Math.PI * 2,
        active: true,
      })
    }
    // Coherent sources — arranged around center line, inactive initially
    const cx = CANVAS_WIDTH / 2
    const cy = CANVAS_HEIGHT / 2
    const radius = Math.min(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.25
    for (let i = 0; i < coherentCount; i++) {
      const ang = (i / coherentCount) * Math.PI * 2
      sources.push({
        x: cx + Math.cos(ang) * radius,
        y: cy + Math.sin(ang) * radius,
        frequency: 0.08,
        amplitude: 28,
        phase: 0,
        active: false,
      })
    }
    waveSourcesRef.current = sources
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ensure sources are available for animation
    ensureWaveSources()

    // Calculate wave interference at a point
    const calculateWaveAt = (x: number, y: number, time: number): number => {
      let totalAmplitude = 0
      
      waveSourcesRef.current.forEach(source => {
        if (!source.active) return
        
        const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
        const waveValue = source.amplitude * 
          Math.sin(source.frequency * distance - time * 0.1 + source.phase) / 
          (1 + distance * 0.01) // Distance attenuation
        
        totalAmplitude += waveValue
      })
      
      return totalAmplitude
    }

    // Render interference pattern
    const renderInterference = (time: number) => {
      const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT)
      const data = imageData.data

      for (let y = 0; y < CANVAS_HEIGHT; y += RESOLUTION) {
        for (let x = 0; x < CANVAS_WIDTH; x += RESOLUTION) {
          const amplitude = calculateWaveAt(x, y, time)
          
          // Normalize amplitude to color values
          const normalized = Math.max(0, Math.min(1, (amplitude + 100) / 200))
          
          let r, g, b, a
          
          if (phaseRef.current === 0) {
            // Chaos phase - noisy interference pattern
            const intensity = Math.abs(amplitude) / 50
            r = intensity * 255
            g = intensity * 100
            b = intensity * 50
            a = Math.min(255, intensity * 200 + 50)
          } else if (phaseRef.current === 1) {
            // Resolving phase - gradual coherence
            const clarity = phaseTimerRef.current / 180 // 0 to 1 over 3 seconds
            const coherentColor = normalized
            const chaoticColor = Math.abs(amplitude) / 50
            
            const mixedColor = chaoticColor * (1 - clarity) + coherentColor * clarity
            
            r = mixedColor * 100 + clarity * 155
            g = mixedColor * 150 + clarity * 200
            b = mixedColor * 200 + clarity * 255
            a = Math.min(255, mixedColor * 180 + 75)
          } else {
            // Clarity phase - clean constructive interference
            const intensity = normalized
            r = intensity * 50 + 30
            g = intensity * 120 + 80
            b = intensity * 200 + 55
            a = Math.min(255, intensity * 150 + 100)
          }

          // Fill resolution block
          for (let dy = 0; dy < RESOLUTION && y + dy < CANVAS_HEIGHT; dy++) {
            for (let dx = 0; dx < RESOLUTION && x + dx < CANVAS_WIDTH; dx++) {
              const pixelIndex = ((y + dy) * CANVAS_WIDTH + (x + dx)) * 4
              data[pixelIndex] = r     // Red
              data[pixelIndex + 1] = g // Green
              data[pixelIndex + 2] = b // Blue
              data[pixelIndex + 3] = a // Alpha
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }

    // Draw wave sources
    const drawSources = () => {
      waveSourcesRef.current.forEach(source => {
        if (!source.active) return
        
        const pulseSize = 5 + Math.sin(timeRef.current * 0.1 + source.phase) * 3
        
        ctx.fillStyle = phaseRef.current >= 2 ? 
          'rgba(255, 255, 255, 0.8)' : 
          'rgba(255, 100, 100, 0.6)'
        ctx.beginPath()
        ctx.arc(source.x, source.y, pulseSize, 0, Math.PI * 2)
        ctx.fill()
        
        // Ripple effect
        ctx.strokeStyle = phaseRef.current >= 2 ? 
          'rgba(255, 255, 255, 0.3)' : 
          'rgba(255, 100, 100, 0.3)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(source.x, source.y, pulseSize + 10, 0, Math.PI * 2)
        ctx.stroke()
      })
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return

      timeRef.current += 1
      phaseTimerRef.current++

      // Phase management
      if (phaseRef.current === 0 && phaseTimerRef.current > 240) { // Chaos (4 seconds)
        phaseRef.current = 1
        phaseTimerRef.current = 0
        
        // Start deactivating chaotic sources and activating coherent ones
        const transitionSpeed = 0.02
        setTimeout(() => {
          waveSourcesRef.current.forEach((source, i) => {
            if (i < 7) { // Chaotic sources
              source.active = Math.random() > 0.3 // Randomly deactivate
            } else { // Coherent sources
              source.active = true
            }
          })
        }, 1000)
        
      } else if (phaseRef.current === 1 && phaseTimerRef.current > 180) { // Resolving (3 seconds)
        phaseRef.current = 2
        phaseTimerRef.current = 0
        
        // Activate only coherent sources
        waveSourcesRef.current.forEach((source, i) => {
          source.active = i >= 7 // Only coherent sources
        })
        
      } else if (phaseRef.current === 2 && phaseTimerRef.current > 180) { // Clarity (3 seconds)
        phaseRef.current = 3
        phaseTimerRef.current = 0
        
      } else if (phaseRef.current === 3 && phaseTimerRef.current > 120) { // Evolving (2 seconds)
        phaseRef.current = 0
        phaseTimerRef.current = 0
        
        // Reset to chaotic state
        waveSourcesRef.current.forEach((source, i) => {
          if (i < 7) {
            source.active = true
            source.phase = Math.random() * Math.PI * 2 // Randomize phases
          } else {
            source.active = false
          }
        })
      }

      // Clear and render
      ctx.fillStyle = 'rgba(10, 20, 40, 1)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      renderInterference(timeRef.current)
      drawSources()

      // Phase indicator
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 18px Arial'
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
      ctx.shadowBlur = 4
      
      const phaseNames = [
        'Signal Interference Detected', 
        'Resolving Interference Patterns', 
        'Clear Signal Achieved', 
        'Signal Evolution'
      ]
      
      ctx.fillText(phaseNames[phaseRef.current], 20, 40)
      
      // Progress bar
      const progress = phaseTimerRef.current / (phaseRef.current === 0 ? 240 : phaseRef.current === 1 ? 180 : phaseRef.current === 2 ? 180 : 120)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fillRect(20, 55, 200, 8)
      ctx.fillStyle = 'rgba(100, 200, 255, 0.8)'
      ctx.fillRect(20, 55, 200 * Math.min(1, progress), 8)
      
      ctx.shadowBlur = 0

      animationRef.current = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full flex justify-center items-center bg-slate-900 p-8 rounded-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-600 rounded-lg shadow-2xl"
      />
    </div>
  )
}

export default InterferenceAnimation
