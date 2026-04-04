'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative">
      <pre className="text-xs bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
        title="Copy to clipboard"
        aria-label="Copy code to clipboard"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>
    </div>
  )
}
