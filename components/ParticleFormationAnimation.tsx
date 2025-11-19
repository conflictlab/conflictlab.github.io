'use client'

import React, { useEffect, useMemo, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
  inFormation: boolean
}

interface Shape {
  name: string
  points: { x: number; y: number }[]
}

const ParticleFormationAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const currentShapeRef = useRef(0)
  const phaseRef = useRef(0) // 0: chaos, 1: converging, 2: formed, 3: dissolving
  const phaseTimerRef = useRef(0)

  const PARTICLE_COUNT = 300
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

  // Define target shapes
  const shapes: Shape[] = useMemo(() => [
    // Network/Neural nodes
    {
      name: 'network',
      points: [
        // Central hub
        { x: 400, y: 300 },
        // Ring 1
        { x: 300, y: 200 }, { x: 500, y: 200 }, { x: 550, y: 350 }, { x: 450, y: 450 }, { x: 250, y: 400 },
        // Ring 2  
        { x: 200, y: 150 }, { x: 600, y: 150 }, { x: 650, y: 300 }, { x: 600, y: 450 }, { x: 200, y: 450 }, { x: 150, y: 300 },
        // Additional scattered nodes
        { x: 350, y: 100 }, { x: 450, y: 100 }, { x: 700, y: 250 }, { x: 700, y: 350 }, { x: 100, y: 250 }, { x: 100, y: 350 },
        { x: 300, y: 500 }, { x: 500, y: 500 }, { x: 250, y: 50 }, { x: 550, y: 50 }
      ]
    },
    // Globe/circular pattern
    {
      name: 'globe',
      points: Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * Math.PI * 2
        const radius = 180 + Math.sin(i * 0.3) * 30
        return {
          x: 400 + Math.cos(angle) * radius,
          y: 300 + Math.sin(angle) * radius * 0.7
        }
      })
    },
    // Brain-like structure
    {
      name: 'brain',
      points: [
        // Left hemisphere
        ...Array.from({ length: 40 }, (_, i) => {
          const t = i / 39
          const x = 200 + t * 150 + Math.sin(t * Math.PI * 3) * 20
          const y = 200 + Math.sin(t * Math.PI) * 100 + Math.sin(t * Math.PI * 5) * 10
          return { x, y }
        }),
        // Right hemisphere
        ...Array.from({ length: 40 }, (_, i) => {
          const t = i / 39
          const x = 450 + t * 150 + Math.sin(t * Math.PI * 3) * 20
          const y = 200 + Math.sin(t * Math.PI) * 100 + Math.sin(t * Math.PI * 5) * 10
          return { x, y }
        }),
        // Connecting bridge
        { x: 350, y: 250 }, { x: 370, y: 260 }, { x: 390, y: 265 }, { x: 410, y: 260 }, { x: 430, y: 250 },
        { x: 360, y: 280 }, { x: 380, y: 285 }, { x: 400, y: 290 }, { x: 420, y: 285 }, { x: 440, y: 280 }
      ]
    }
  ], [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        targetX: 0,
        targetY: 0,
        inFormation: false
      }))
    }

    // Assign particles to shape points
    const assignTargets = () => {
      const currentShape = shapes[currentShapeRef.current]
      const particles = particlesRef.current
      
      // Reset all particles
      particles.forEach(p => p.inFormation = false)
      
      // Assign particles to shape points (multiple particles per point for density)
      currentShape.points.forEach((point, pointIndex) => {
        const particlesPerPoint = Math.floor(PARTICLE_COUNT / currentShape.points.length)
        const startIdx = pointIndex * particlesPerPoint
        
        for (let i = 0; i < particlesPerPoint && startIdx + i < particles.length; i++) {
          const particle = particles[startIdx + i]
          // Add some random offset for organic look
          particle.targetX = point.x + (Math.random() - 0.5) * 20
          particle.targetY = point.y + (Math.random() - 0.5) * 20
          particle.inFormation = true
        }
      })
    }

    // Animation loop
    const animate = () => {
      if (!ctx) return

      // Clear canvas
      ctx.fillStyle = 'rgba(248, 250, 252, 0.1)' // Very light overlay for trail effect
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const particles = particlesRef.current
      phaseTimerRef.current++

      // Phase management
      if (phaseRef.current === 0 && phaseTimerRef.current > 180) { // Chaos phase (3 seconds)
        phaseRef.current = 1
        phaseTimerRef.current = 0
        assignTargets()
      } else if (phaseRef.current === 1 && phaseTimerRef.current > 120) { // Converging phase (2 seconds)
        phaseRef.current = 2
        phaseTimerRef.current = 0
      } else if (phaseRef.current === 2 && phaseTimerRef.current > 180) { // Formed phase (3 seconds)
        phaseRef.current = 3
        phaseTimerRef.current = 0
      } else if (phaseRef.current === 3 && phaseTimerRef.current > 60) { // Dissolving phase (1 second)
        phaseRef.current = 0
        phaseTimerRef.current = 0
        currentShapeRef.current = (currentShapeRef.current + 1) % shapes.length
      }

      // Update and draw particles
      particles.forEach(particle => {
        if (phaseRef.current === 0 || phaseRef.current === 3) {
          // Chaos or dissolving - random movement
          particle.vx += (Math.random() - 0.5) * 0.1
          particle.vy += (Math.random() - 0.5) * 0.1
          particle.vx *= 0.98 // Slight damping
          particle.vy *= 0.98
          
          particle.x += particle.vx
          particle.y += particle.vy
          
          // Wrap around edges
          if (particle.x < 0) particle.x = CANVAS_WIDTH
          if (particle.x > CANVAS_WIDTH) particle.x = 0
          if (particle.y < 0) particle.y = CANVAS_HEIGHT
          if (particle.y > CANVAS_HEIGHT) particle.y = 0
          
        } else if (phaseRef.current === 1 && particle.inFormation) {
          // Converging - move toward target
          const dx = particle.targetX - particle.x
          const dy = particle.targetY - particle.y
          const force = 0.02
          
          particle.vx += dx * force
          particle.vy += dy * force
          particle.vx *= 0.95 // Damping
          particle.vy *= 0.95
          
          particle.x += particle.vx
          particle.y += particle.vy
          
        } else if (phaseRef.current === 2 && particle.inFormation) {
          // Formed - stay near target with slight movement
          const dx = particle.targetX - particle.x
          const dy = particle.targetY - particle.y
          
          particle.x += dx * 0.1 + (Math.random() - 0.5) * 0.5
          particle.y += dy * 0.1 + (Math.random() - 0.5) * 0.5
        }

        // Draw particle
        const alpha = particle.inFormation && phaseRef.current >= 1 ? 0.8 : 0.4
        const size = particle.inFormation && phaseRef.current >= 1 ? 2.5 : 1.5
        
        ctx.fillStyle = `rgba(30, 64, 175, ${alpha})` // Blue color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw connections in formed state
      if (phaseRef.current === 2 && shapes[currentShapeRef.current].name === 'network') {
        ctx.strokeStyle = 'rgba(30, 64, 175, 0.3)'
        ctx.lineWidth = 1
        const networkPoints = shapes[currentShapeRef.current].points
        
        // Draw connections between nearby points
        for (let i = 0; i < networkPoints.length; i++) {
          for (let j = i + 1; j < networkPoints.length; j++) {
            const dist = Math.sqrt(
              Math.pow(networkPoints[i].x - networkPoints[j].x, 2) + 
              Math.pow(networkPoints[i].y - networkPoints[j].y, 2)
            )
            
            if (dist < 200) { // Only connect nearby points
              ctx.beginPath()
              ctx.moveTo(networkPoints[i].x, networkPoints[j].y)
              ctx.lineTo(networkPoints[j].x, networkPoints[j].y)
              ctx.stroke()
            }
          }
        }
      }

      // Display phase info
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.font = '16px Arial'
      const phaseNames = ['Analyzing Chaos', 'Finding Patterns', 'Pattern Recognized', 'Evolving']
      const shapeName = shapes[currentShapeRef.current].name
      ctx.fillText(`${phaseNames[phaseRef.current]} - ${shapeName}`, 20, 30)

      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    initParticles()
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [shapes])

  return (
    <div className="w-full flex justify-center items-center bg-slate-50 p-8 rounded-lg">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border border-gray-200 rounded-lg shadow-lg bg-white"
      />
    </div>
  )
}

export default ParticleFormationAnimation
