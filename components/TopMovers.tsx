import React from 'react'
import Link from 'next/link'

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
    <div className="border border-pace-charcoal-light rounded-lg p-4 bg-pace-charcoal flex flex-col" style={{ height }}>
      <h3 className="text-lg font-light text-gray-100 mb-3">Top Movers (MoM)</h3>
      <ul className="space-y-2 flex-1 overflow-auto">
        {movers.map((m) => (
          <li key={m.id} className="flex items-center justify-between text-sm hover:bg-pace-charcoal-light rounded px-2 py-1 -mx-2 -my-1 transition-colors">
            <Link href={`/forecasts/${m.id}`} className="flex items-center gap-2 flex-1">
              {m.entityType !== 'country' && (
                <span className="text-gray-400 capitalize">{m.entityType}</span>
              )}
              <span className="text-gray-100 hover:text-white hover:underline">{m.name}</span>
            </Link>
            <div className={`font-medium ${m.deltaMoM >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} title="Month-over-month change in 1‑month prediction">
              {m.deltaMoM >= 0 ? '+' : ''}{m.deltaMoM}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
