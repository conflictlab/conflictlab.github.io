'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

type Mover = { id: string; name: string; entityType: string; deltaMoM: number }
type Row = { id: string; name: string; pred1m: number }

export default function FallbackCountryList({ movers, rows }: { movers: Mover[]; rows: Row[] }) {
  const [q, setQ] = useState('')
  const highest = useMemo(() => {
    return [...rows].sort((a, b) => b.pred1m - a.pred1m).slice(0, 10)
  }, [rows])
  // Ensure both lists show the same count (match available movers)
  const COUNT = Math.min(10, movers?.length || 0, highest.length)
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase()
    if (!n) return [] as Row[]
    return rows.filter(r => r.name.toLowerCase().includes(n)).slice(0, 20)
  }, [rows, q])

  return (
    <section className="py-6" aria-label="Browse forecasts without map">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-light text-gray-900">Browse by list</h3>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country…"
              className="w-64 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-pace-red"
              aria-label="Search country"
            />
          </div>

          {q && (
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Matches</div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filtered.map((r) => (
                  <li key={r.id} className="flex items-center justify-between border border-gray-200 rounded p-2 hover:bg-gray-50">
                    <Link href={`/forecasts/${r.id}`} className="text-gray-800 hover:text-pace-charcoal hover:underline flex-1">{r.name}</Link>
                    <Link href={`/forecasts/${r.id}`} className="text-pace-red text-sm">→</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top risers (MoM)</h4>
              <ul className="space-y-1">
                {movers.slice(0, COUNT).map((m) => (
                  <li key={m.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 rounded px-2 py-1 -mx-2">
                    <Link href={`/forecasts/${m.id}`} className="text-gray-800 hover:text-pace-charcoal hover:underline flex-1 min-w-0 truncate">{m.name}</Link>
                    <span className={`font-medium ${m.deltaMoM >= 0 ? 'text-emerald-600' : 'text-rose-600'} font-mono tabular-nums w-20 text-left`}>{m.deltaMoM >= 0 ? '+' : ''}{m.deltaMoM.toFixed(1)}</span>
                    <Link href={`/forecasts/${m.id}`} className="text-pace-red">→</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Highest risk (next month)</h4>
              <ul className="space-y-1">
                {highest.slice(0, COUNT).map((r) => (
                  <li key={r.id} className="flex items-center gap-2 text-sm hover:bg-gray-50 rounded px-2 py-1 -mx-2">
                    <Link href={`/forecasts/${r.id}`} className="text-gray-800 hover:text-pace-charcoal hover:underline flex-1 min-w-0 truncate">{r.name}</Link>
                    <span className="text-gray-700 font-mono tabular-nums w-20 text-left">{r.pred1m.toFixed(1)}</span>
                    <Link href={`/forecasts/${r.id}`} className="text-pace-red">→</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
