"use client"
import { useEffect } from 'react'
import Link from 'next/link'

export default function DownloadsRedirect() {
  useEffect(() => {
    try {
      window.location.replace('/data-api#grid')
    } catch {}
  }, [])
  return (
    <section className="py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-light text-gray-900 mb-3">Downloads moved</h1>
        <p className="text-gray-700 mb-4">
          Our downloads are now consolidated under the Data API page.
        </p>
        <p>
          <Link href="/data-api#grid" className="text-link">Go to Data API →</Link>
        </p>
      </div>
    </section>
  )
}

