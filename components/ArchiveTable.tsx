'use client'

import Link from 'next/link'
import { useState } from 'react'

interface ArchiveTableProps {
  periods: string[]
  hasFile: (period: string, file: string) => boolean
}

export default function ArchiveTable({ periods, hasFile }: ArchiveTableProps) {
  const [showAll, setShowAll] = useState(false)
  const displayPeriods = showAll ? periods : periods.slice(0, 6)

  if (!periods.length) {
    return <div className="text-xs text-gray-600">No archive found.</div>
  }

  return (
    <>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">Period</th>
            <th className="py-2">Bundle</th>
            <th className="py-2">Hist.csv</th>
            <th className="py-2">metadata.json</th>
            <th className="py-2">h6 files</th>
            <th className="py-2">h12 files</th>
          </tr>
        </thead>
        <tbody>
          {displayPeriods.map(p => (
            <tr key={p} className="border-t border-gray-100 align-top">
              <td className="py-2 font-mono">{p}</td>
              <td className="py-2">
                <Link href={`/data/forecasts/archive/${p}/forecasts-${p}.zip`} className="text-link">
                  forecasts-{p}.zip
                </Link>
              </td>
              <td className="py-2">
                <Link href={`/data/forecasts/archive/${p}/Hist.csv`} className="text-link">
                  Hist.csv
                </Link>
              </td>
              <td className="py-2">
                <Link href={`/data/forecasts/archive/${p}/metadata.json`} className="text-link">
                  metadata.json
                </Link>
              </td>
              <td className="py-2">
                <div className="flex flex-wrap gap-2">
                  {hasFile(p, 'forecasts_h6.csv') && (
                    <Link href={`/data/forecasts/archive/${p}/forecasts_h6.csv`} className="text-link">
                      mean
                    </Link>
                  )}
                  {hasFile(p, 'forecasts_h6_min.csv') && (
                    <Link href={`/data/forecasts/archive/${p}/forecasts_h6_min.csv`} className="text-link">
                      min
                    </Link>
                  )}
                  {hasFile(p, 'forecasts_h6_max.csv') && (
                    <Link href={`/data/forecasts/archive/${p}/forecasts_h6_max.csv`} className="text-link">
                      max
                    </Link>
                  )}
                  {!hasFile(p, 'forecasts_h6.csv') && <span className="text-gray-400">n/a</span>}
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-wrap gap-2">
                  {hasFile(p, 'forecasts_h12.csv') && (
                    <Link href={`/data/forecasts/archive/${p}/forecasts_h12.csv`} className="text-link">
                      mean
                    </Link>
                  )}
                  {hasFile(p, 'forecasts_h12_min.csv') && (
                    <Link href={`/data/forecasts/archive/${p}/forecasts_h12_min.csv`} className="text-link">
                      min
                    </Link>
                  )}
                  {hasFile(p, 'forecasts_h12_max.csv') && (
                    <Link href={`/data/forecasts/archive/${p}/forecasts_h12_max.csv`} className="text-link">
                      max
                    </Link>
                  )}
                  {!hasFile(p, 'forecasts_h12.csv') && <span className="text-gray-400">n/a</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {periods.length > 6 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? '← Show less' : `Show all ${periods.length} periods →`}
          </button>
        </div>
      )}
    </>
  )
}
