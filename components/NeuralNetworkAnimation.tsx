'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Neuron {
  id: number
  x: number
  y: number
  layer: number
  activation: number
  targetActivation: number
  radius: number
  pulsePhase: number
}

interface Connection {
  from: number
  to: number
  weight: number
  activity: number
  pulsePosition: number
}

const NeuralNetworkAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>()
  const [phase, setPhase] = useState(0) // 0: building, 1: learning, 2: thinking, 3: predicting

  const CANVAS_WIDTH = 1000
  const CANVAS_HEIGHT = 600

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    let phaseTimer = 0
    let neurons: Neuron[] = []
    let connections: Connection[] = []
    let learningData: number[][] = []
    let currentInput = 0

    // Initialize neural network structure
    const initNetwork = () => {
      neurons = []
      connections = []
      let neuronId = 0

      // Layer configurations: [input, hidden1, hidden2, output]
      const layerSizes = [4, 8, 6, 3]
      const layerPositions = [150, 350, 650, 850]

      // Create neurons
      layerSizes.forEach((size, layerIndex) => {
        const x = layerPositions[layerIndex]
        const startY = (CANVAS_HEIGHT - (size * 60)) / 2

        for (let i = 0; i < size; i++) {
          const neuron: Neuron = {
            id: neuronId++,
            x,
            y: startY + i * 60 + 30,
            layer: layerIndex,
            activation: Math.random() * 0.3,
            targetActivation: 0,
            radius: layerIndex === 0 || layerIndex === layerSizes.length - 1 ? 12 : 10,
            pulsePhase: Math.random() * Math.PI * 2
          }
          neurons.push(neuron)
        }
      })

      // Create connections between adjacent layers
      layerSizes.forEach((size, layerIndex) => {
        if (layerIndex < layerSizes.length - 1) {
          const currentLayerNeurons = neurons.filter(n => n.layer === layerIndex)
          const nextLayerNeurons = neurons.filter(n => n.layer === layerIndex + 1)

          currentLayerNeurons.forEach(fromNeuron => {
            nextLayerNeurons.forEach(toNeuron => {
              const connection: Connection = {
                from: fromNeuron.id,
                to: toNeuron.id,
                weight: (Math.random() - 0.5) * 2,
                activity: 0,
                pulsePosition: 0
              }
              connections.push(connection)
            })
          })
        }
      })

      // Generate training data patterns
      learningData = [
        [0.8, 0.2, 0.9, 0.1], // Pattern 1
        [0.1, 0.9, 0.2, 0.8], // Pattern 2
        [0.6, 0.7, 0.3, 0.9], // Pattern 3
        [0.2, 0.1, 0.8, 0.4], // Pattern 4
      ]
    }

    // Simulate forward pass through network
    const forwardPass = (inputPattern: number[]) => {
      // Set input layer
      const inputNeurons = neurons.filter(n => n.layer === 0)
      inputNeurons.forEach((neuron, i) => {
        neuron.targetActivation = inputPattern[i] || 0
      })

      // Propagate through layers
      for (let layer = 1; layer < 4; layer++) {
        const layerNeurons = neurons.filter(n => n.layer === layer)
        
        layerNeurons.forEach(neuron => {
          let sum = 0
          const incomingConnections = connections.filter(c => c.to === neuron.id)
          
          incomingConnections.forEach(conn => {
            const fromNeuron = neurons.find(n => n.id === conn.from)
            if (fromNeuron) {
              sum += fromNeuron.activation * conn.weight
            }
          })
          
          // Apply activation function (sigmoid-like)
          neuron.targetActivation = 1 / (1 + Math.exp(-sum))
        })
      }
    }

    // Update network state
    const updateNetwork = () => {
      // Smooth activation transitions
      neurons.forEach(neuron => {
        const diff = neuron.targetActivation - neuron.activation
        neuron.activation += diff * 0.1
        neuron.pulsePhase += 0.1
      })

      // Update connection activities
      connections.forEach(conn => {
        const fromNeuron = neurons.find(n => n.id === conn.from)
        const toNeuron = neurons.find(n => n.id === conn.to)
        
        if (fromNeuron && toNeuron) {
          const targetActivity = fromNeuron.activation * Math.abs(conn.weight) * 0.8
          conn.activity += (targetActivity - conn.activity) * 0.05
          
          // Update pulse position for data flow visualization
          if (conn.activity > 0.1) {
            conn.pulsePosition = (conn.pulsePosition + 0.08) % 1
          }
        }
      })

      // Phase-specific updates
      if (phase === 1) {
        // Learning phase - adjust weights slightly
        if (Math.random() > 0.95) {
          connections.forEach(conn => {
            conn.weight += (Math.random() - 0.5) * 0.1
            conn.weight = Math.max(-2, Math.min(2, conn.weight))
          })
        }
      }

      if (phase >= 2) {
        // Thinking/Predicting phases - run different input patterns
        if (phaseTimer % 120 === 0) {
          currentInput = (currentInput + 1) % learningData.length
          forwardPass(learningData[currentInput])
        }
      }
    }

    // Draw neuron
    const drawNeuron = (neuron: Neuron) => {
      const intensity = neuron.activation
      const pulseSize = neuron.radius + Math.sin(neuron.pulsePhase) * 2 * intensity

      // Glow effect
      const glowGradient = ctx.createRadialGradient(
        neuron.x, neuron.y, 0,
        neuron.x, neuron.y, pulseSize + 15
      )
      
      if (neuron.layer === 0) {
        // Input neurons - blue
        glowGradient.addColorStop(0, `rgba(59, 130, 246, ${intensity * 0.8})`)
        glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
      } else if (neuron.layer === 3) {
        // Output neurons - green
        glowGradient.addColorStop(0, `rgba(34, 197, 94, ${intensity * 0.8})`)
        glowGradient.addColorStop(1, 'rgba(34, 197, 94, 0)')
      } else {
        // Hidden neurons - purple
        glowGradient.addColorStop(0, `rgba(147, 51, 234, ${intensity * 0.8})`)
        glowGradient.addColorStop(1, 'rgba(147, 51, 234, 0)')
      }

      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(neuron.x, neuron.y, pulseSize + 15, 0, Math.PI * 2)
      ctx.fill()

      // Main neuron body
      const mainGradient = ctx.createRadialGradient(
        neuron.x - 3, neuron.y - 3, 0,
        neuron.x, neuron.y, pulseSize
      )
      mainGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      
      if (neuron.layer === 0) {
        mainGradient.addColorStop(1, `rgba(59, 130, 246, ${0.7 + intensity * 0.3})`)
      } else if (neuron.layer === 3) {
        mainGradient.addColorStop(1, `rgba(34, 197, 94, ${0.7 + intensity * 0.3})`)
      } else {
        mainGradient.addColorStop(1, `rgba(147, 51, 234, ${0.7 + intensity * 0.3})`)
      }

      ctx.fillStyle = mainGradient
      ctx.beginPath()
      ctx.arc(neuron.x, neuron.y, pulseSize, 0, Math.PI * 2)
      ctx.fill()

      // Activation value text for highly active neurons
      if (intensity > 0.7) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '10px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(intensity.toFixed(1), neuron.x, neuron.y + 3)
      }
    }

    // Draw connection
    const drawConnection = (conn: Connection) => {
      const fromNeuron = neurons.find(n => n.id === conn.from)
      const toNeuron = neurons.find(n => n.id === conn.to)
      
      if (!fromNeuron || !toNeuron || conn.activity < 0.01) return

      const alpha = Math.min(0.8, conn.activity)
      const lineWidth = 1 + conn.activity * 3

      // Connection line
      const gradient = ctx.createLinearGradient(
        fromNeuron.x, fromNeuron.y,
        toNeuron.x, toNeuron.y
      )
      
      const color = conn.weight > 0 ? '59, 130, 246' : '239, 68, 68' // Blue for positive, red for negative
      gradient.addColorStop(0, `rgba(${color}, ${alpha * 0.3})`)
      gradient.addColorStop(1, `rgba(${color}, ${alpha * 0.6})`)

      ctx.strokeStyle = gradient
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(fromNeuron.x, fromNeuron.y)
      ctx.lineTo(toNeuron.x, toNeuron.y)
      ctx.stroke()

      // Data pulse
      if (conn.activity > 0.3) {
        const pulseX = fromNeuron.x + (toNeuron.x - fromNeuron.x) * conn.pulsePosition
        const pulseY = fromNeuron.y + (toNeuron.y - fromNeuron.y) * conn.pulsePosition
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Draw layer labels
    const drawLabels = () => {
      const labels = ['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2', 'Output Layer']
      const positions = [150, 350, 650, 850]
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '14px Arial'
      ctx.textAlign = 'center'
      
      labels.forEach((label, i) => {
        ctx.fillText(label, positions[i], 30)
      })

      // Input/Output descriptions
      if (phase >= 2) {
        ctx.font = '12px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
        
        // Input descriptions
        const inputLabels = ['Economic Data', 'Social Signals', 'Political Events', 'News Sentiment']
        inputLabels.forEach((label, i) => {
          const neuron = neurons.find(n => n.layer === 0 && n.id === i)
          if (neuron) {
            ctx.textAlign = 'right'
            ctx.fillText(label, neuron.x - 25, neuron.y + 4)
          }
        })
        
        // Output descriptions  
        const outputLabels = ['Conflict Risk', 'Political Stability', 'Economic Impact']
        outputLabels.forEach((label, i) => {
          const outputNeurons = neurons.filter(n => n.layer === 3)
          if (outputNeurons[i]) {
            ctx.textAlign = 'left'
            ctx.fillText(label, outputNeurons[i].x + 25, outputNeurons[i].y + 4)
          }
        })
      }
    }

    // Render everything
    const render = () => {
      // Clear with fade
      ctx.fillStyle = 'rgba(10, 20, 35, 0.95)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw connections first (behind neurons)
      connections.forEach(conn => drawConnection(conn))
      
      // Draw neurons
      neurons.forEach(neuron => drawNeuron(neuron))
      
      // Draw labels
      drawLabels()

      // Phase indicator
      const phaseNames = [
        'Building Neural Architecture',
        'Training & Learning Patterns',
        'Processing Geopolitical Data',
        'Generating Risk Predictions'
      ]
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 20px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(phaseNames[phase], 30, 50)

      // Network stats
      if (phase >= 1) {
        ctx.font = '14px Arial'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
        const activeConnections = connections.filter(c => c.activity > 0.1).length
        const avgActivation = neurons.reduce((sum, n) => sum + n.activation, 0) / neurons.length
        
        ctx.fillText(`Active Connections: ${activeConnections}/${connections.length}`, 30, CANVAS_HEIGHT - 60)
        ctx.fillText(`Network Activity: ${(avgActivation * 100).toFixed(1)}%`, 30, CANVAS_HEIGHT - 40)
        
        if (phase >= 2) {
          ctx.fillText(`Processing Pattern: ${currentInput + 1}/${learningData.length}`, 30, CANVAS_HEIGHT - 20)
        }
      }
    }

    // Animation loop
    const animate = () => {
      time += 1
      phaseTimer += 1

      // Phase transitions
      if (phaseTimer > 180 && phase === 0) { // Building (3 seconds)
        setPhase(1)
        phaseTimer = 0
      } else if (phaseTimer > 300 && phase === 1) { // Learning (5 seconds)
        setPhase(2)
        phaseTimer = 0
        forwardPass(learningData[0])
      } else if (phaseTimer > 360 && phase === 2) { // Processing (6 seconds)
        setPhase(3)
        phaseTimer = 0
      } else if (phaseTimer > 300 && phase === 3) { // Predicting (5 seconds)
        setPhase(0)
        phaseTimer = 0
        initNetwork() // Reset
      }

      updateNetwork()
      render()

      animationIdRef.current = requestAnimationFrame(animate)
    }

    // Initialize
    initNetwork()
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

export default NeuralNetworkAnimation