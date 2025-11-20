'use client'

import { ChevronDown } from 'lucide-react'

export default function LandingBanner() {
  return (
    <>
      {/* PaCE + tagline centered */}
      <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
        <div className="text-center px-8 fade-in">
          <h1
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 tracking-wide"
            style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}
          >
            PaCE
          </h1>
          <div className="text-2xl md:text-3xl lg:text-4xl text-white font-bold tracking-wide mb-8" style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)' }}>
            <div className="overflow-hidden">
              <p className="inline-block whitespace-nowrap typewriter-text pr-3">
                Forecasting Geopolitical Risk
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex justify-center gap-8 md:gap-12 text-white counter-fade-in">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">180+</div>
              <div className="text-sm md:text-base font-light opacity-90">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">259K</div>
              <div className="text-sm md:text-base font-light opacity-90" title="0.5° map squares (~55 km)">Sub‑national Areas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">6</div>
              <div className="text-sm md:text-base font-light opacity-90">Months Ahead</div>
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
          animation: typing 1.15s steps(30, end) 1.0s forwards;
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

        /* Respect reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  )
}
