'use client'

import React, { useMemo, useState } from 'react'
import Sparkline from '@/components/Sparkline'

interface Row {
  id: string
  name: string
  entityType: string
  pred1m: number
  pred3m: number
  pred6m: number
  deltaMoM: number
  trend?: number[]
}

interface Props { rows: Row[] }

type SortKey = 'name' | 'pred1m' | 'pred3m' | 'pred6m' | 'deltaMoM'

export default function RiskIndexTable({ rows }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('pred1m')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = useMemo(() => {
    const out = [...rows]
    out.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      if (av === bv) {
        const an = (a.name ?? '').toString()
        const bn = (b.name ?? '').toString()
        return an.localeCompare(bn)
      }
      const anNum = typeof av === 'number' ? av : Number(av)
      const bnNum = typeof bv === 'number' ? bv : Number(bv)
      return (anNum || 0) < (bnNum || 0) ? -1 : 1
    })
    return sortDir === 'asc' ? out : out.reverse()
  }, [rows, sortKey, sortDir])

  const onSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const headerClass = (key: SortKey) =>
    `cursor-pointer select-none ${sortKey === key ? 'text-clairient-blue' : 'text-gray-700'}`

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
              <span className={headerClass('name')} onClick={() => onSort('name')}>Name</span>
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
              <span className={headerClass('pred1m')} onClick={() => onSort('pred1m')}>1m Pred.</span>
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
              <span className={headerClass('deltaMoM')} onClick={() => onSort('deltaMoM')}>Δ MoM</span>
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
              <span className={headerClass('pred3m')} onClick={() => onSort('pred3m')}>3m Pred.</span>
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
              <span className={headerClass('pred6m')} onClick={() => onSort('pred6m')}>6m Pred.</span>
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider">1–6m Pred.</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {sorted.map((r) => (
            <tr key={r.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-900">{r.name}</td>
              <td className="px-4 py-2 text-sm text-right font-medium">{r.pred1m}</td>
              <td className={`px-4 py-2 text-sm text-right ${r.deltaMoM >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{r.deltaMoM >= 0 ? '+' : ''}{r.deltaMoM}</td>
              <td className="px-4 py-2 text-sm text-right text-gray-700">{r.pred3m}</td>
              <td className="px-4 py-2 text-sm text-right text-gray-700">{r.pred6m}</td>
              <td className="px-4 py-2 text-sm">
                {r.trend && r.trend.length > 1 ? <Sparkline values={r.trend} /> : <span className="text-gray-400">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
