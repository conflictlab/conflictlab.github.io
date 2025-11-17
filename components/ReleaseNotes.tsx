import React from 'react'

interface Props { notes?: string[] }

export default function ReleaseNotes({ notes }: Props) {
  if (!notes || notes.length === 0) return null
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-lg font-light text-gray-900 mb-3">Release Notes</h3>
      <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
        {notes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  )
}

