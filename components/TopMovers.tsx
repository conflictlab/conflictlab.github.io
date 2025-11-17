import React from 'react'

interface Mover {
  id: string
  name: string
  entityType: string
  deltaMoM: number
  band: 'low' | 'medium' | 'high'
}

interface Props { movers: Mover[]; height?: number }

export default function TopMovers({ movers, height = 240 }: Props) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col" style={{ height }}>
      <h3 className="text-lg font-light text-gray-900 mb-3">Top Movers (MoM)</h3>
      <ul className="space-y-2 flex-1 overflow-auto">
        {movers.map((m) => (
          <li key={m.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {m.entityType !== 'country' && (
                <span className="text-gray-500 capitalize">{m.entityType}</span>
              )}
              <span className="text-gray-900">{m.name}</span>
            </div>
            <div className={`font-medium ${m.deltaMoM >= 0 ? 'text-emerald-700' : 'text-rose-700'}`} title="Month-over-month change in 1‑month prediction">
              {m.deltaMoM >= 0 ? '+' : ''}{m.deltaMoM}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
