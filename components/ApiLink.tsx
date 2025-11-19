'use client'

import React, { useMemo, useState } from 'react'

interface Props {
  path: string
  label?: string
}

export default function ApiLink({ path, label }: Props) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  const href = useMemo(() => `${base}${path}`, [base, path])
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const absolute = useMemo(() => (origin ? origin + href : href), [origin, href])
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(absolute)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <a href={href} className="text-link">
        <code className="text-gray-900">{label || path}</code>
      </a>
      <button
        type="button"
        className="text-xs text-pace-red hover:text-pace-red-dark"
        onClick={copy}
        title="Copy absolute URL"
      >{copied ? 'Copied' : 'Copy URL'}</button>
    </div>
  )
}
