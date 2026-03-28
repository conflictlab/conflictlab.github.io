'use client'

import Link from 'next/link'
import { useState } from 'react'

interface ArchiveEntry {
  period: string
  files: {
    bundle: boolean
    hist: boolean
    metadata: boolean
    h6_mean: boolean
    h6_min: boolean
    h6_max: boolean
    h12_mean: boolean
    h12_min: boolean
    h12_max: boolean
  }
}

interface ArchiveTableProps {
  archiveData: ArchiveEntry[]
}

export default function ArchiveTable({ archiveData }: ArchiveTableProps) {
  const [showAll, setShowAll] = useState(false)
  const displayData = showAll ? archiveData : archiveData.slice(0, 6)

  if (!archiveData.length) {
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
          {displayData.map(({ period, files }) => (
            <tr key={period} className="border-t border-gray-100 align-top">
              <td className="py-2 font-mono">{period}</td>
              <td className="py-2">
                <Link href={`/data/forecasts/archive/${period}/forecasts-${period}.zip`} className="text-link">
                  forecasts-{period}.zip
                </Link>
              </td>
              <td className="py-2">
                {files.hist && (
                  <Link href={`/data/forecasts/archive/${period}/Hist.csv`} className="text-link">
                    Hist.csv
                  </Link>
                )}
              </td>
              <td className="py-2">
                {files.metadata && (
                  <Link href={`/data/forecasts/archive/${period}/metadata.json`} className="text-link">
                    metadata.json
                  </Link>
                )}
              </td>
              <td className="py-2">
                <div className="flex flex-wrap gap-2">
                  {files.h6_mean && (
                    <Link href={`/data/forecasts/archive/${period}/forecasts_h6.csv`} className="text-link">
                      mean
                    </Link>
                  )}
                  {files.h6_min && (
                    <Link href={`/data/forecasts/archive/${period}/forecasts_h6_min.csv`} className="text-link">
                      min
                    </Link>
                  )}
                  {files.h6_max && (
                    <Link href={`/data/forecasts/archive/${period}/forecasts_h6_max.csv`} className="text-link">
                      max
                    </Link>
                  )}
                  {!files.h6_mean && <span className="text-gray-400">n/a</span>}
                </div>
              </td>
              <td className="py-2">
                <div className="flex flex-wrap gap-2">
                  {files.h12_mean && (
                    <Link href={`/data/forecasts/archive/${period}/forecasts_h12.csv`} className="text-link">
                      mean
                    </Link>
                  )}
                  {files.h12_min && (
                    <Link href={`/data/forecasts/archive/${period}/forecasts_h12_min.csv`} className="text-link">
                      min
                    </Link>
                  )}
                  {files.h12_max && (
                    <Link href={`/data/forecasts/archive/${period}/forecasts_h12_max.csv`} className="text-link">
                      max
                    </Link>
                  )}
                  {!files.h12_mean && <span className="text-gray-400">n/a</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {archiveData.length > 6 && (
        <div className="mt-4">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {showAll ? '← Show less' : `Show all ${archiveData.length} periods →`}
          </button>
        </div>
      )}
    </>
  )
}
