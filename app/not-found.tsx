import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="max-w-xl text-center">
        <h1 className="text-5xl font-light text-gray-900 mb-3">Page not found</h1>
        <p className="text-gray-600 mb-8">We couldn't find that page. Try one of the links below.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">Home</Link>
          <Link href="/forecasts" className="btn-secondary">Forecasts</Link>
          <Link href="/contact" className="btn-secondary">Contact</Link>
        </div>
      </div>
    </main>
  )
}
