"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MethodologyDraftRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/methodology')
  }, [router])
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-light text-gray-900 mb-3">Moved</h1>
      <p className="text-gray-700">
        This page has moved to{' '}
        <a href="/methodology" className="text-link">Methodology</a>. Redirecting…
      </p>
    </div>
  )
}

