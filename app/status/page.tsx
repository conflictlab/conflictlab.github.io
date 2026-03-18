"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

type Status = {
  generatedAt: string
  ok: boolean
  summary: {
    latestPeriod: string | null
    snapshotGeneratedAt: string | null
    snapshotAgeDays: number | null
    minmaxCountries: number
    minmaxUpdatedAt: string | null
    scenariosUpdatedAt: string | null
    scenariosDenormUpdatedAt: string | null
    matchesUpdatedAt: string | null
    gridLatestPeriod: string | null
    staticApiCandidate: string | null
  }
  warnings: string[]
  errors: string[]
}

export default function StatusPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    fetch('/status.json', { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(setStatus)
      .catch(e => setErr(e?.message || String(e)))
  }, [])

  return (
    <>
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]">
          <Breadcrumbs />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-3">System Status</h1>
          <p className="text-sm text-gray-600 font-light">Website and data API health snapshot</p>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {err && (
            <div className="border border-red-200 bg-red-50 text-red-800 rounded p-4 text-sm">Failed to load status.json: {err}</div>
          )}
          {!status && !err && (
            <div className="text-sm text-gray-600">Loading…</div>
          )}
          {status && (
            <div className="space-y-6">
              <div className={`rounded p-4 text-sm border ${status.ok ? 'border-green-200 bg-green-50 text-green-900' : 'border-red-200 bg-red-50 text-red-900'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Overall Status: {status.ok ? 'OK' : 'Issues detected'}</div>
                    <div className="text-xs opacity-75">Generated: {status.generatedAt}</div>
                  </div>
                  {status.summary.staticApiCandidate && (
                    <Link href={status.summary.staticApiCandidate} className="text-xs underline">View sample API</Link>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded p-4">
                  <div className="text-sm font-medium mb-2">Forecast Snapshot</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div>Latest period: <span className="font-mono">{status.summary.latestPeriod || '—'}</span></div>
                    <div>Generated at: <span className="font-mono">{status.summary.snapshotGeneratedAt || '—'}</span></div>
                    <div>Age (days): <span className="font-mono">{status.summary.snapshotAgeDays ?? '—'}</span></div>
                  </div>
                </div>
                <div className="border border-gray-200 rounded p-4">
                  <div className="text-sm font-medium mb-2">Data Files</div>
                  <div className="text-xs text-gray-700 space-y-1">
                    <div>minmax.json updated: <span className="font-mono">{status.summary.minmaxUpdatedAt || '—'}</span> ({status.summary.minmaxCountries} countries)</div>
                    <div>scenarios.json updated: <span className="font-mono">{status.summary.scenariosUpdatedAt || '—'}</span></div>
                    <div>scenarios.denorm.json updated: <span className="font-mono">{status.summary.scenariosDenormUpdatedAt || '—'}</span></div>
                    <div>matches.json updated: <span className="font-mono">{status.summary.matchesUpdatedAt || '—'}</span></div>
                    <div>Grid latest period: <span className="font-mono">{status.summary.gridLatestPeriod || '—'}</span></div>
                  </div>
                </div>
              </div>

              {(status.errors.length > 0 || status.warnings.length > 0) && (
                <div className="border border-gray-200 rounded p-4">
                  {status.errors.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-red-700 mb-1">Errors</div>
                      <ul className="list-disc list-inside text-xs text-red-800">
                        {status.errors.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>
                  )}
                  {status.warnings.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-yellow-700 mb-1">Warnings</div>
                      <ul className="list-disc list-inside text-xs text-yellow-800">
                        {status.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

