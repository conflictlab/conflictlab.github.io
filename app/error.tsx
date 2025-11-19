'use client'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main className="min-h-[60vh] flex items-center justify-center px-6">
          <div className="max-w-xl text-center">
            <h1 className="text-4xl font-light text-gray-900 mb-3">Something went wrong</h1>
            <p className="text-gray-600 mb-6">{error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={reset} className="btn-primary">Try again</button>
          </div>
        </main>
      </body>
    </html>
  )
}

