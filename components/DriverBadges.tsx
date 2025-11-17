import React from 'react'

interface Props { categories: string[] }

const colorFor = (c: string) => {
  switch (c) {
    case 'security':
      return 'bg-rose-100 text-rose-700'
    case 'policy':
      return 'bg-indigo-100 text-indigo-700'
    case 'macro':
      return 'bg-sky-100 text-sky-700'
    case 'unrest':
      return 'bg-amber-100 text-amber-700'
    case 'election':
      return 'bg-emerald-100 text-emerald-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export default function DriverBadges({ categories }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => (
        <span key={c} className={`text-xs px-2 py-0.5 rounded-full ${colorFor(c)}`}>{c}</span>
      ))}
    </div>
  )
}

