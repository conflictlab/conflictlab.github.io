'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function LandingBanner() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Track mouse position for parallax
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20
      const y = (e.clientY / window.innerHeight - 0.5) * 20
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* PaCE + tagline centered */}
      <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
        <div
          className="text-center px-8 fade-in"
          style={{
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
          }}
        >
          <h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-wide"
            style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}
          >
            PaCE
          </h1>
          <div className="text-2xl md:text-3xl lg:text-4xl text-white font-light tracking-wide mb-8" style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)' }}>
            <p className="inline-block overflow-hidden whitespace-nowrap typewriter-text">
              Forecasting Geopolitical Risk
            </p>
          </div>

          {/* Statistics */}
          <div className="flex justify-center gap-12 text-white counter-fade-in">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">200+</div>
              <div className="text-sm md:text-base font-light opacity-90">Wars Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">35M+</div>
              <div className="text-sm md:text-base font-light opacity-90">Battle Deaths</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
        <div className="flex flex-col items-center text-white/80 scroll-indicator">
          <span className="text-sm font-light mb-2">Scroll to explore</span>
          <ChevronDown className="animate-bounce" size={24} />
        </div>
      </div>

      <style jsx>{`
        .fade-in {
          animation: fadeIn 1s ease-out;
        }

        .typewriter-text {
          animation: typing 1.5s steps(27) 1.3s forwards;
          width: 0;
        }

        .counter-fade-in {
          animation: fadeIn 1s ease-out 2s forwards;
          opacity: 0;
        }

        .scroll-indicator {
          animation: fadeIn 1s ease-out 3s forwards;
          opacity: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </>
  )
}
