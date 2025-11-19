'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-light text-gray-900 mb-3">Unable to load forecasts</h1>
        <p className="text-gray-600 mb-6">{error?.message || 'Please retry. If the problem persists, check back later.'}</p>
        <button onClick={reset} className="btn-primary">Retry</button>
      </div>
    </div>
  )
}

