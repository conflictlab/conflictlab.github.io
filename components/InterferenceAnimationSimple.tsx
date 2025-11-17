'use client'

import React, { useEffect, useRef, useState } from 'react'

const InterferenceAnimationSimple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>()
  const [phase, setPhase] = useState(0)

  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    let phaseTimer = 0

    // Wave sources
    const chaoticSources = [
      { x: 100, y: 150, freq: 0.03, amp: 30 },
      { x: 700, y: 200, freq: 0.025, amp: 25 },
      { x: 200, y: 450, freq: 0.035, amp: 35 },
      { x: 600, y: 400, freq: 0.028, amp: 28 },
    ]

    const coherentSources = [
      { x: 250, y: 250, freq: 0.02, amp: 40 },
      { x: 550, y: 250, freq: 0.02, amp: 40 },
      { x: 400, y: 200, freq: 0.02, amp: 45 },
    ]

    const animate = () => {
      time += 1
      phaseTimer += 1

      // Phase transitions
      if (phaseTimer > 240 && phase === 0) {
        setPhase(1)
        phaseTimer = 0
      } else if (phaseTimer > 180 && phase === 1) {
        setPhase(2)
        phaseTimer = 0
      } else if (phaseTimer > 180 && phase === 2) {
        setPhase(3)
        phaseTimer = 0
      } else if (phaseTimer > 120 && phase === 3) {
        setPhase(0)
        phaseTimer = 0
      }

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 20, 40, 1)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Simple interference pattern
      const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT)
      const data = imageData.data

      for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
        for (let x = 0; x < CANVAS_WIDTH; x += 4) {
          let amplitude = 0

          // Add wave contributions based on phase
          if (phase === 0 || phase === 3) {
            // Chaotic phase
            chaoticSources.forEach(source => {
              const dist = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
              amplitude += source.amp * Math.sin(source.freq * dist - time * 0.1) / (1 + dist * 0.01)
            })
          } else {
            // Coherent phase
            coherentSources.forEach(source => {
              const dist = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2)
              amplitude += source.amp * Math.sin(source.freq * dist - time * 0.1) / (1 + dist * 0.01)
            })
          }

          // Convert to color
          const normalized = Math.max(0, Math.min(1, (amplitude + 100) / 200))
          
          let r, g, b
          if (phase >= 2) {
            // Clear phase - blue tones
            r = normalized * 50 + 30
            g = normalized * 120 + 80  
            b = normalized * 200 + 55
          } else {
            // Chaotic phase - red/orange
            r = normalized * 255
            g = normalized * 100
            b = normalized * 50
          }

          // Fill 4x4 block for performance
          for (let dy = 0; dy < 4 && y + dy < CANVAS_HEIGHT; dy++) {
            for (let dx = 0; dx < 4 && x + dx < CANVAS_WIDTH; dx++) {
              const idx = ((y + dy) * CANVAS_WIDTH + (x + dx)) * 4
              data[idx] = r
              data[idx + 1] = g
              data[idx + 2] = b
              data[idx + 3] = 255
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0)

      // Phase text
      const phaseNames = [
        'Signal Interference Detected',
        'Resolving Patterns', 
        'Clear Signal Achieved',
        'Signal Evolution'
      ]

      ctx.fillStyle = 'white'
      ctx.font = 'bold 18px Arial'
      ctx.fillText(phaseNames[phase], 20, 40)

      animationIdRef.current = requestAnimationFrame(animate)
    }

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
        className="border border-gray-600 rounded-lg shadow-2xl"
      />
    </div>
  )
}

export default InterferenceAnimationSimple