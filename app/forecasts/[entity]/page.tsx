import {
  getForecastsPageData,
  getEntityHorizonMonths,
  readSnapshot,
  getEntitySeries,
  generateEntityNarrative,
  getEntityComparativeStats,
  getAvailablePeriods,
} from '@/lib/forecasts'
import dynamic from 'next/dynamic'
const ForecastFanChart = dynamic(() => import('@/components/ForecastFanChart'), { ssr: false })
const TimeSeriesChart = dynamic(() => import('@/components/TimeSeriesChart'), { ssr: false })
import LazyVisible from '@/components/LazyVisible'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'
import Breadcrumbs from '@/components/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Entity Forecast — PaCE',
  description: 'Detailed six-month forecast and comparative context for conflict fatalities.',
}

export async function generateStaticParams() {
  const snapshot = readSnapshot('latest')
  return snapshot.entities.map(entity => ({
    entity: entity.id,
  }))
}

async function getEntityData(entityId: string) {
  const { snapshot } = await getForecastsPageData()
  const entity = snapshot.entities.find(e => e.id === entityId)
  if (!entity) return null

  const months = getEntityHorizonMonths(snapshot.period, entity.name) || [
    entity.horizons['1m'].p50,
    Number(((entity.horizons['1m'].p50 + entity.horizons['3m'].p50) / 2).toFixed(1)),
    entity.horizons['3m'].p50,
    Number((entity.horizons['3m'].p50 + (entity.horizons['6m'].p50 - entity.horizons['3m'].p50) / 3).toFixed(1)),
    Number((entity.horizons['3m'].p50 + (entity.horizons['6m'].p50 - entity.horizons['3m'].p50) * 2 / 3).toFixed(1)),
    entity.horizons['6m'].p50,
  ]

  const historicalSeries = getEntitySeries(entityId)
  const narrative = generateEntityNarrative(entity, historicalSeries, snapshot)
  const comparativeStats = getEntityComparativeStats(entity, snapshot)

  // Compute MoM change exactly as the dashboard table does: current 1m index minus previous snapshot's 1m index
  let computedDeltaMoM = entity.deltaMoM
  try {
    const periods = getAvailablePeriods()
    const currentIdx = periods.indexOf(snapshot.period)
    const prevPeriod = currentIdx > 0 ? periods[currentIdx - 1] : undefined
    if (prevPeriod) {
      const prevSnap = readSnapshot(prevPeriod)
      const prevMatch = prevSnap.entities.find(
        (e) => e.id === entity.id || (entity.iso3 && e.iso3 === entity.iso3) || (e.name || '').toUpperCase() === (entity.name || '').toUpperCase()
      )
      const prevVal = prevMatch ? (prevMatch.horizons?.['1m']?.index ?? prevMatch.index) : undefined
      if (prevVal !== undefined) {
        computedDeltaMoM = Number((entity.horizons['1m'].index - prevVal).toFixed(1))
      }
    }
  } catch {}

  return { entity, months, historicalSeries, narrative, snapshot, comparativeStats, computedDeltaMoM }
}

export default async function EntityForecastPage({ params }: { params: { entity: string } }) {
  const data = await getEntityData(params.entity)

  if (!data) {
    notFound()
  }

  const { entity, months, historicalSeries, narrative, comparativeStats, computedDeltaMoM } = data

  const getBandColor = (band: string) => {
    if (band === 'high') return 'bg-red-100 text-red-800 border-red-300'
    if (band === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-green-100 text-green-800 border-green-300'
  }

  const getTrendIcon = (delta: number) => {
    if (delta > 10) return '↑↑'
    if (delta > 0) return '↑'
    if (delta < -10) return '↓↓'
    if (delta < 0) return '↓'
    return '→'
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="py-12 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]">
          <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded px-2 py-1">
            <Breadcrumbs />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
            {entity.name}
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Predicted fatalities from state‑based armed conflict — forecast and analysis
          </p>
        </div>
      </section>

      {/* Summary Stats Cards */}
      <section className="py-8 -mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Risk Index */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Risk Index</div>
              <div className="text-3xl font-semibold text-gray-900">{entity.index.toFixed(1)}</div>
            </div>

            {/* Risk Band */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Risk Band</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getBandColor(entity.band)}`}>
                {entity.band.toUpperCase()}
              </div>
            </div>

            {/* Month-over-Month (matches dashboard table calculation) */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">MoM Change</div>
              <div className={`text-2xl font-semibold ${computedDeltaMoM > 0 ? 'text-red-600' : computedDeltaMoM < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {computedDeltaMoM > 0 ? '+' : ''}{computedDeltaMoM.toFixed(1)} {getTrendIcon(computedDeltaMoM)}
              </div>
            </div>

            {/* Confidence */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Confidence</div>
              <div className="text-2xl font-semibold text-gray-900">{(entity.confidence * 100).toFixed(0)}%</div>
            </div>

            {/* Ranking */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">Ranking</div>
              <div className="text-2xl font-semibold text-gray-900">
                #{comparativeStats.rank} <span className="text-sm text-gray-500">/ {comparativeStats.totalInType}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section (moved before Situation Overview) */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Time Series */}
            {historicalSeries.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-light text-gray-900 mb-4">Historical Trend</h2>
                <LazyVisible minHeight="240px">
                  <TimeSeriesChart
                    data={{
                      historical: historicalSeries.map(s => s.index),
                      forecast: [entity.horizons['1m'].p50, entity.horizons['3m'].p50, entity.horizons['6m'].p50],
                      country: entity.name
                    }}
                  />
                </LazyVisible>
                <div className="mt-4 text-sm text-gray-500">
                  Historical risk index showing {historicalSeries.length} months of data
                </div>
              </div>
            )}

            {/* Forecast Fan Chart */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-light text-gray-900 mb-4">6-Month Forecast</h2>
              <LazyVisible minHeight="240px">
                <ForecastFanChart title="" months={months} />
              </LazyVisible>
            </div>
          </div>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Situation Overview</h2>
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
              {renderNarrative(narrative)}
            </div>
          </div>
        </div>
      </section>

      {/* Comparative Context */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-light text-gray-900 mb-4">Comparative Context</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-2">Percentile Ranking</div>
                <div className="text-4xl font-semibold text-gray-900 mb-2">{comparativeStats.percentile}th</div>
                <p className="text-sm text-gray-600">
                  Higher risk than {comparativeStats.percentile}% of monitored {entity.entityType}s
                </p>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">{entity.entityType.charAt(0).toUpperCase() + entity.entityType.slice(1)} Average</div>
                <div className="text-4xl font-semibold text-gray-900 mb-2">{comparativeStats.typeAvg}</div>
                <p className="text-sm text-gray-600">
                  {comparativeStats.aboveTypeAvg ? 'Above' : 'Below'} the average for this type
                </p>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-2">Global Average</div>
                <div className="text-4xl font-semibold text-gray-900 mb-2">{comparativeStats.globalAvg}</div>
                <p className="text-sm text-gray-600">
                  Average across all monitored entities
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Horizon Comparison */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-light text-gray-900 mb-6">Forecast Horizons</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['1m', '3m', '6m'] as const).map((horizon) => (
                <div key={horizon} className="border border-gray-200 rounded-lg p-5">
                  <div className="text-sm text-gray-500 mb-2">{horizon === '1m' ? '1 Month' : horizon === '3m' ? '3 Months' : '6 Months'}</div>
                  <div className="text-4xl font-semibold text-gray-900 mb-4">
                    {entity.horizons[horizon].p50.toFixed(1)}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">10th percentile:</span>
                      <span className="font-medium text-gray-700">{entity.horizons[horizon].p10.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">50th percentile:</span>
                      <span className="font-medium text-gray-900">{entity.horizons[horizon].p50.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">90th percentile:</span>
                      <span className="font-medium text-gray-700">{entity.horizons[horizon].p90.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Drivers and Notes */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Risk Drivers</h2>
              <div className="space-y-4">
                {entity.drivers.length > 0 ? (
                  entity.drivers.map((driver, i) => (
                    <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800 capitalize">{driver.category}</p>
                        <span className="text-sm text-gray-500">{driver.impact}% impact</span>
                      </div>
                      {driver.note && <p className="text-sm text-gray-600 mb-3">{driver.note}</p>}
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-pace-red h-2.5 rounded-full transition-all" style={{ width: `${driver.impact}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-gray-500">No specific drivers identified for this period.</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Analyst Notes</h2>
              <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                {entity.notes ? (
                  <p className="text-gray-700 leading-relaxed">{entity.notes}</p>
                ) : (
                  <p className="text-gray-500 italic">No analyst notes available for this period.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function renderNarrative(text: string) {
  // Simple parser to convert **bold** segments to <strong> while keeping other text as-is
  const parts = text.split(/\*\*/g)
  const nodes: React.ReactNode[] = []
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i]
    if (i % 2 === 1) nodes.push(<strong key={`b-${i}`}>{seg}</strong>)
    else nodes.push(<span key={`t-${i}`}>{seg}</span>)
  }
  return nodes
}
