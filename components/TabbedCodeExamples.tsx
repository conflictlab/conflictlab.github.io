'use client'

import { useState } from 'react'
import CodeBlock from './CodeBlock'

interface CodeExample {
  label: string
  language: string
  code: string
}

interface TabbedCodeExamplesProps {
  examples: CodeExample[]
}

export default function TabbedCodeExamples({ examples }: TabbedCodeExamplesProps) {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        {examples.map((example, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === index
                ? 'bg-white text-gray-900 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {example.label}
          </button>
        ))}
      </div>

      {/* Code Content */}
      <div className="p-4 bg-white">
        <CodeBlock
          code={examples[activeTab].code}
          language={examples[activeTab].language}
        />
      </div>
    </div>
  )
}
