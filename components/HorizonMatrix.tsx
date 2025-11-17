import React from 'react'

interface Cell {
  id: string
  name: string
  bandByHorizon: { '1m': 'low' | 'medium' | 'high'; '3m': 'low' | 'medium' | 'high'; '6m': 'low' | 'medium' | 'high' }
}

interface Props {
  rows: Cell[]
}

const bandColor = (b: 'low' | 'medium' | 'high') =>
  ({ low: 'bg-emerald-100 text-emerald-700', medium: 'bg-amber-100 text-amber-700', high: 'bg-rose-100 text-rose-700' }[b])

export default function HorizonMatrix({ rows }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-4 bg-gray-50 text-xs font-medium text-gray-600">
        <div className="px-3 py-2">Entity</div>
        <div className="px-3 py-2 text-center">1m</div>
        <div className="px-3 py-2 text-center">3m</div>
        <div className="px-3 py-2 text-center">6m</div>
      </div>
      <div>
        {rows.map((r) => (
          <div key={r.id} className="grid grid-cols-4 border-t border-gray-100 text-sm">
            <div className="px-3 py-2 text-gray-900">{r.name}</div>
            <div className={`px-3 py-2 text-center ${bandColor(r.bandByHorizon['1m'])}`}>{r.bandByHorizon['1m']}</div>
            <div className={`px-3 py-2 text-center ${bandColor(r.bandByHorizon['3m'])}`}>{r.bandByHorizon['3m']}</div>
            <div className={`px-3 py-2 text-center ${bandColor(r.bandByHorizon['6m'])}`}>{r.bandByHorizon['6m']}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

