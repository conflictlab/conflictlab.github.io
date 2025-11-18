'use client'

export default function LandingBanner() {
  return (
    <div className="absolute top-[25%] left-[25%] z-[1000] pointer-events-none">
      <div className="text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-2 tracking-wide" style={{ textShadow: '3px 3px 10px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)' }}>
          PaCE
        </h1>
        <div className="text-lg md:text-xl text-white font-light tracking-wide" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)' }}>
          <p className="inline-block overflow-hidden whitespace-nowrap typewriter-text">
            Forecasting Geopolitical Risk
          </p>
          <p className="mt-1">Before It Materializes</p>
        </div>
        <style jsx>{`
          .typewriter-text {
            animation: typing 2s steps(27) 0.5s forwards;
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
