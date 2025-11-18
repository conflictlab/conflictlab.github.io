'use client'

export default function LandingBanner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-none">
      <div className="text-center px-8">
        <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-6 tracking-wide" style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)' }}>
          PaCE
        </h1>
        <div className="text-3xl md:text-4xl lg:text-5xl text-white font-light tracking-wide" style={{ textShadow: '3px 3px 8px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)' }}>
          <p className="inline-block overflow-hidden whitespace-nowrap typewriter-text">
            Forecasting Geopolitical Risk
          </p>
        </div>
        <style jsx>{`
          .typewriter-text {
            animation: typing 2.5s steps(27) 0.5s forwards;
            width: 0;
          }
          @keyframes typing {
            from { width: 0; }
            to { width: 100%; }
          }
        `}</style>
      </div>
    </div>
  )
}
