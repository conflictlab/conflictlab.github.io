'use client'

import React, { useEffect, useRef, useState } from 'react'

interface Node {
  id: number
  x: number
  y: number
  targetX: number
  targetY: number
  radius: number
  connections: number[]
  active: boolean
  pulsePhase: number
  importance: number
}

interface Connection {
  from: number
  to: number
  strength: number
  active: boolean
  growthProgress: number
}

const NetworkGrowthAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationIdRef = useRef<number>()
  const [phase, setPhase] = useState(0) // 0: seed, 1: growing, 2: mature, 3: evolving

  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    let phaseTimer = 0
    let nodes: Node[] = []
    let connections: Connection[] = []
    let nextNodeId = 0

    // Initialize with seed nodes
    const initNetwork = () => {
      nodes = [
        {
          id: 0,
          x: CANVAS_WIDTH / 2,
          y: CANVAS_HEIGHT / 2,
          targetX: CANVAS_WIDTH / 2,
          targetY: CANVAS_HEIGHT / 2,
          radius: 8,
          connections: [],
          active: true,
          pulsePhase: 0,
          importance: 1
        }
      ]
      connections = []
      nextNodeId = 1
    }

    // Add new node with organic positioning
    const addNode = (nearNodeId?: number) => {
      let x, y, targetX, targetY

      if (nearNodeId !== undefined && nodes[nearNodeId]) {
        // Position near existing node
        const parent = nodes[nearNodeId]
        const angle = Math.random() * Math.PI * 2
        const distance = 80 + Math.random() * 60
        targetX = parent.x + Math.cos(angle) * distance
        targetY = parent.y + Math.sin(angle) * distance
        
        // Start from parent position for growth animation
        x = parent.x
        y = parent.y
      } else {
        // Random positioning
        targetX = 100 + Math.random() * (CANVAS_WIDTH - 200)
        targetY = 100 + Math.random() * (CANVAS_HEIGHT - 200)
        x = targetX
        y = targetY
      }

      const node: Node = {
        id: nextNodeId++,
        x,
        y,
        targetX,
        targetY,
        radius: 4 + Math.random() * 4,
        connections: [],
        active: true,
        pulsePhase: Math.random() * Math.PI * 2,
        importance: Math.random() * 0.5 + 0.5
      }

      nodes.push(node)

      // Create connection to nearby nodes
      if (nearNodeId !== undefined) {
        const connection: Connection = {
          from: nearNodeId,
          to: node.id,
          strength: 0.5 + Math.random() * 0.5,
          active: true,
          growthProgress: 0
        }
        connections.push(connection)
        nodes[nearNodeId].connections.push(node.id)
        node.connections.push(nearNodeId)
      }

      return node.id
    }

    // Create connections between nearby nodes
    const createConnections = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeA = nodes[i]
          const nodeB = nodes[j]
          const distance = Math.sqrt((nodeA.x - nodeB.x) ** 2 + (nodeA.y - nodeB.y) ** 2)
          
          // Connect if close enough and not already connected
          if (distance < 150 && !nodeA.connections.includes(nodeB.id) && Math.random() > 0.7) {
            const connection: Connection = {
              from: nodeA.id,
              to: nodeB.id,
              strength: Math.max(0.3, 1 - distance / 150),
              active: true,
              growthProgress: 0
            }
            connections.push(connection)
            nodeA.connections.push(nodeB.id)
            nodeB.connections.push(nodeA.id)
          }
        }
      }
    }

    // Update network structure
    const updateNetwork = () => {
      // Move nodes toward targets
      nodes.forEach(node => {
        const dx = node.targetX - node.x
        const dy = node.targetY - node.y
        node.x += dx * 0.1
        node.y += dy * 0.1
        node.pulsePhase += 0.1
      })

      // Grow connections
      connections.forEach(conn => {
        if (conn.growthProgress < 1) {
          conn.growthProgress += 0.02
        }
      })

      // Phase-specific growth
      if (phase === 1 && Math.random() > 0.97 && nodes.length < 25) {
        // Growing phase - add nodes preferentially near high-connection nodes
        const importantNodes = nodes.filter(n => n.connections.length > 2)
        const parentNode = importantNodes.length > 0 ? 
          importantNodes[Math.floor(Math.random() * importantNodes.length)] :
          nodes[Math.floor(Math.random() * nodes.length)]
        addNode(parentNode.id)
      }

      if (phase === 1 && Math.random() > 0.95) {
        createConnections()
      }

      if (phase === 2 && Math.random() > 0.98) {
        // Mature phase - occasional new connections
        createConnections()
      }

      if (phase === 3) {
        // Evolving phase - restructure network
        if (Math.random() > 0.99) {
          // Randomly deactivate some connections
          connections.forEach(conn => {
            if (Math.random() > 0.95) {
              conn.active = !conn.active
            }
          })
        }
        
        // Move nodes to new positions
        nodes.forEach(node => {
          if (Math.random() > 0.99) {
            node.targetX = 100 + Math.random() * (CANVAS_WIDTH - 200)
            node.targetY = 100 + Math.random() * (CANVAS_HEIGHT - 200)
          }
        })
      }
    }

    // Render network
    const render = () => {
      // Clear with fade effect
      ctx.fillStyle = 'rgba(15, 23, 42, 0.1)'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw connections
      connections.forEach(conn => {
        if (!conn.active || conn.growthProgress === 0) return

        const fromNode = nodes.find(n => n.id === conn.from)
        const toNode = nodes.find(n => n.id === conn.to)
        if (!fromNode || !toNode) return

        const alpha = conn.strength * conn.growthProgress * 0.6
        const lineWidth = 1 + conn.strength * 2

        // Animated growth effect
        const endX = fromNode.x + (toNode.x - fromNode.x) * conn.growthProgress
        const endY = fromNode.y + (toNode.y - fromNode.y) * conn.growthProgress

        // Gradient line
        const gradient = ctx.createLinearGradient(fromNode.x, fromNode.y, endX, endY)
        gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`)
        gradient.addColorStop(1, `rgba(147, 51, 234, ${alpha * 0.7})`)

        ctx.strokeStyle = gradient
        ctx.lineWidth = lineWidth
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(fromNode.x, fromNode.y)
        ctx.lineTo(endX, endY)
        ctx.stroke()

        // Data flow particles
        if (conn.growthProgress === 1 && Math.random() > 0.95) {
          const t = (time * 0.02) % 1
          const particleX = fromNode.x + (toNode.x - fromNode.x) * t
          const particleY = fromNode.y + (toNode.y - fromNode.y) * t
          
          ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
          ctx.beginPath()
          ctx.arc(particleX, particleY, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      // Draw nodes
      nodes.forEach(node => {
        if (!node.active) return

        // Pulsing effect based on importance
        const pulseSize = node.radius + Math.sin(node.pulsePhase) * node.importance * 2
        
        // Node glow
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, pulseSize + 10
        )
        glowGradient.addColorStop(0, `rgba(59, 130, 246, ${0.3 + node.importance * 0.4})`)
        glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize + 10, 0, Math.PI * 2)
        ctx.fill()

        // Main node
        const nodeGradient = ctx.createRadialGradient(
          node.x - 2, node.y - 2, 0,
          node.x, node.y, pulseSize
        )
        nodeGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
        nodeGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.8)')
        nodeGradient.addColorStop(1, 'rgba(30, 58, 138, 0.9)')

        ctx.fillStyle = nodeGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2)
        ctx.fill()

        // Connection count indicator for important nodes
        if (node.connections.length > 3) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
          ctx.font = '10px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(node.connections.length.toString(), node.x, node.y + 3)
        }
      })

      // Phase indicator
      const phaseNames = [
        'Network Seed Initialized',
        'Growing Neural Pathways', 
        'Mature Network Architecture',
        'Network Evolution & Adaptation'
      ]

      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.font = 'bold 18px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(phaseNames[phase], 20, 40)

      // Network stats
      ctx.font = '14px Arial'
      ctx.fillText(`Nodes: ${nodes.length}`, 20, 65)
      ctx.fillText(`Connections: ${connections.length}`, 20, 85)
    }

    // Animation loop
    const animate = () => {
      time += 1
      phaseTimer += 1

      // Phase management
      if (phaseTimer > 300 && phase === 0) { // Seed phase (5 seconds)
        setPhase(1)
        phaseTimer = 0
        // Add initial growth nodes
        for (let i = 0; i < 3; i++) {
          addNode(0)
        }
      } else if (phaseTimer > 600 && phase === 1) { // Growing phase (10 seconds)
        setPhase(2)
        phaseTimer = 0
      } else if (phaseTimer > 360 && phase === 2) { // Mature phase (6 seconds)
        setPhase(3)
        phaseTimer = 0
      } else if (phaseTimer > 480 && phase === 3) { // Evolving phase (8 seconds)
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

export default NetworkGrowthAnimation