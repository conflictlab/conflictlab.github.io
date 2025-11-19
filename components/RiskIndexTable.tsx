'use client'

import React, { useMemo, useState } from 'react'
import Sparkline from '@/components/Sparkline'
import Link from 'next/link'

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
    `cursor-pointer select-none ${sortKey === key ? 'text-clairient-light' : 'text-gray-400'}`

  return (
    <div className="overflow-x-auto border border-pace-charcoal-light rounded-lg">
      <table className="min-w-full divide-y divide-pace-charcoal-light">
        <thead className="bg-pace-charcoal">
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
        <tbody className="bg-gray-900 divide-y divide-pace-charcoal">
          {sorted.map((r) => (
            <Link key={r.id} href={`/forecasts/${r.id}`} legacyBehavior>
              <tr className="hover:bg-pace-charcoal cursor-pointer">
                <td className="px-4 py-2 text-sm text-gray-100">{r.name}</td>
                <td className="px-4 py-2 text-sm text-right font-medium">{r.pred1m}</td>
                <td className={`px-4 py-2 text-sm text-right ${r.deltaMoM >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{r.deltaMoM >= 0 ? '+' : ''}{r.deltaMoM}</td>
                <td className="px-4 py-2 text-sm text-right text-gray-300">{r.pred3m}</td>
                <td className="px-4 py-2 text-sm text-right text-gray-300">{r.pred6m}</td>
                <td className="px-4 py-2 text-sm">
                  {r.trend && r.trend.length > 1 ? <Sparkline values={r.trend} /> : <span className="text-gray-500">—</span>}
                </td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
    </div>
  )
}
