'use client'

export default function LandingBanner() {
  return (
    <>
      {/* PaCE + Logo at top */}
      <div className="absolute top-24 left-0 right-0 flex justify-center z-[1000] pointer-events-none">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="PaCE Logo"
            className="h-16 md:h-20 lg:h-24"
            style={{ filter: 'drop-shadow(2px 2px 4px rgba(255,255,255,0.3)) drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}
          />
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-wide" style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}>
            PaCE
          </h1>
        </div>
      </div>

      {/* Typewriter text centered */}
      <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
        <div className="text-2xl md:text-3xl lg:text-4xl text-white font-light tracking-wide" style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)' }}>
          <p className="inline-block overflow-hidden whitespace-nowrap typewriter-text">
            Forecasting Geopolitical Risk
          </p>
        </div>
        <style jsx>{`
          .typewriter-text {
            animation: typing 1.5s steps(27) 0.3s forwards;
            width: 0;
          }
          @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </>
  )
}
