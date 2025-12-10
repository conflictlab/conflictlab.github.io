'use client'

import { useEffect, useRef } from 'react'

export default function PrioGridAnimation() {
  const gridStackRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const currentTimeRef = useRef(0)
  const conflictDataRef = useRef<number[][][][]>([])

  // Configuration
  const GRID_WIDTH = 8
  const GRID_HEIGHT = 6
  const TIME_SLICES = 3
  const MAX_TIME = 60

  useEffect(() => {
    // Generate conflict diffusion data
    const generateConflictData = () => {
      const data: number[][][][] = []

      for (let t = 0; t <= MAX_TIME; t++) {
        const timeStep: number[][][] = []
        
        for (let slice = 0; slice < TIME_SLICES; slice++) {
          const sliceData: number[][] = []
          const timeOffset = t + slice * 15 // Each slice represents +15 time units
          
          for (let row = 0; row < GRID_HEIGHT; row++) {
            const rowData: number[] = []
            
            for (let col = 0; col < GRID_WIDTH; col++) {
              // Simulate conflict diffusion from multiple epicenters
              let conflictLevel = 0
              
              // Primary epicenter (bottom-left)
              const dist1 = Math.sqrt(Math.pow(row - 4, 2) + Math.pow(col - 1, 2))
              const primary = Math.max(0, 6 - dist1 - timeOffset * 0.1)
              
              // Secondary epicenter (top-right) - starts later
              const dist2 = Math.sqrt(Math.pow(row - 1, 2) + Math.pow(col - 6, 2))
              const secondary = Math.max(0, 5 - dist2 - Math.max(0, timeOffset - 20) * 0.15)
              
              // Diffusion wave effect
              const waveEffect = Math.sin(timeOffset * 0.2 - dist1 * 0.5) * 0.5 + 0.5
              
              // Combine effects
              conflictLevel = Math.max(primary, secondary) * 
                            (0.7 + 0.3 * waveEffect) * 
                            (timeOffset > 0 ? Math.min(1, timeOffset / 10) : 0)
              
              // Add some randomization
              conflictLevel += (Math.random() - 0.5) * 0.5
              
              // Clamp to valid range
              conflictLevel = Math.max(0, Math.min(6, Math.floor(conflictLevel)))
              
              rowData.push(conflictLevel)
            }
            sliceData.push(rowData)
          }
          timeStep.push(sliceData)
        }
        data.push(timeStep)
      }
      
      conflictDataRef.current = data
    }

    // Create grid structure
    const createGridSlices = () => {
      if (!gridStackRef.current) return

      gridStackRef.current.innerHTML = ''

      for (let slice = 0; slice < TIME_SLICES; slice++) {
        const timeSlice = document.createElement('div')
        timeSlice.className = `absolute w-full h-full opacity-90`
        timeSlice.style.transformStyle = 'preserve-3d'
        timeSlice.style.transform = `translateZ(${-slice * 100}px)`

        const gridLayer = document.createElement('div')
        gridLayer.className = 'grid grid-cols-8 grid-rows-6 gap-0.5 w-full h-full'
        gridLayer.style.transformStyle = 'preserve-3d'

        // Create grid cells
        for (let row = 0; row < GRID_HEIGHT; row++) {
          for (let col = 0; col < GRID_WIDTH; col++) {
            const cell = document.createElement('div')
            cell.className = 'border border-black border-opacity-10 transition-all duration-700 ease-in-out shadow-sm'
            cell.style.background = 'rgba(255, 255, 255, 0.9)'
            cell.id = `cell-${slice}-${row}-${col}`
            gridLayer.appendChild(cell)
          }
        }

        timeSlice.appendChild(gridLayer)
        gridStackRef.current.appendChild(timeSlice)
      }
    }

    // Update visualization
    const updateVisualization = () => {
      const timeIndex = Math.floor(currentTimeRef.current)
      const data = conflictDataRef.current
      
      if (!data.length) return

      for (let slice = 0; slice < TIME_SLICES; slice++) {
        for (let row = 0; row < GRID_HEIGHT; row++) {
          for (let col = 0; col < GRID_WIDTH; col++) {
            const cell = document.getElementById(`cell-${slice}-${row}-${col}`)
            if (!cell) continue
            
            const conflictLevel = data[timeIndex][slice][row][col]
            
            // Apply heatmap colors
            const colors = [
              'rgba(255, 255, 255, 0.9)',     // White - no conflict
              'rgba(34, 197, 94, 0.3)',       // Green - low
              'rgba(101, 163, 13, 0.4)',      // Yellow-green
              'rgba(234, 179, 8, 0.5)',       // Yellow
              'rgba(249, 115, 22, 0.6)',      // Orange
              'rgba(239, 68, 68, 0.7)',       // Red
              'rgba(153, 27, 27, 0.8)'        // Dark red
            ]
            
            cell.style.background = colors[conflictLevel] || colors[0]
            
            // Disable per-cell pulsing to avoid distracting blinking
            cell.style.animation = 'none'
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      currentTimeRef.current += 0.03
      if (currentTimeRef.current >= MAX_TIME) {
        currentTimeRef.current = 0
      }
      updateVisualization()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    generateConflictData()
    createGridSlices()
    animate()

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="w-full h-96 flex justify-center items-center bg-gray-50 rounded-lg overflow-hidden">
      <div 
        className="w-96 h-72 flex justify-center items-center"
        style={{ 
          perspective: '1200px',
          perspectiveOrigin: '50% 50%'
        }}
      >
        <div 
          ref={gridStackRef}
          className="relative w-full h-full"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: 'rotateX(45deg) rotateY(-30deg) rotateZ(10deg)'
          }}
        >
          {/* Grid slices will be generated by JavaScript */}
        </div>
      </div>
    </div>
  )
}
