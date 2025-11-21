import {
  getForecastsPageData,
  getOrCalculateMonths,
  readSnapshot,
  getEntitySeries,
  generateEntityNarrative,
  getEntityComparativeStats,
  getAvailablePeriods,
} from '@/lib/forecasts'
import { getCountryScenarios } from '@/lib/scenarios'
import dynamic from 'next/dynamic'
const ForecastFanChart = dynamic(() => import('@/components/ForecastFanChart'), { ssr: false })
const TimeSeriesChart = dynamic(() => import('@/components/TimeSeriesChart'), { ssr: false })
const ScenariosChart = dynamic(() => import('@/components/ScenariosChart'), { ssr: false })
const PrioGridMap = dynamic(() => import('@/components/PrioGridMap'), { ssr: false })
const DTWMatches = dynamic(() => import('@/components/DTWMatches'), { ssr: false })
const ObservedHistory = dynamic(() => import('@/components/ObservedHistory'), { ssr: false })
import LazyVisible from '@/components/LazyVisible'
import Breadcrumbs from '@/components/Breadcrumbs'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'PaCE',
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

  const months = getOrCalculateMonths(snapshot.period, entity)

  const historicalSeries = getEntitySeries(entityId)
  const narrative = generateEntityNarrative(entity, historicalSeries, snapshot)
  const comparativeStats = getEntityComparativeStats(entity, snapshot)
  const scenarios = getCountryScenarios(entity.name)

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

  return { entity, months, historicalSeries, narrative, snapshot, comparativeStats, computedDeltaMoM, scenarios }
}

export default async function EntityForecastPage({ params }: { params: { entity: string } }) {
  const data = await getEntityData(params.entity)

  if (!data) {
    notFound()
  }

  const { entity, months, historicalSeries, narrative, comparativeStats, computedDeltaMoM, scenarios, snapshot } = data as any

  function formatMonthLabel(period: string) {
    const [y, m] = period.split('-').map(Number)
    const dt = new Date(y, (m - 1), 1)
    return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  const nextMonthLabel = formatMonthLabel(snapshot.period)
  const predicted6mChange = Number((entity.horizons['6m'].p50 - entity.horizons['1m'].p50).toFixed(1))

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
          <Breadcrumbs />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight">
            {entity.name}
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Predicted fatalities from state‑based armed conflict — forecast and analysis
          </p>
          {/* Key metrics (moved into hero) */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-1 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-3">
            <div>
              <div className="text-xs text-gray-500 mb-1 h-5 whitespace-nowrap overflow-hidden text-ellipsis" title={`Predicted fatalities — ${nextMonthLabel}`}>Predicted fatalities — {nextMonthLabel}</div>
              <div className="text-2xl md:text-3xl font-semibold text-gray-900">{entity.horizons['1m'].p50.toFixed(1)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 h-5 whitespace-nowrap overflow-hidden text-ellipsis">Risk Band</div>
              <div className={`inline-block px-2.5 py-1 rounded-full text-xs md:text-sm font-medium border ${getBandColor(entity.band)}`}>
                {entity.band.toUpperCase()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 h-5 whitespace-nowrap overflow-hidden text-ellipsis">MoM Change</div>
              <div className={`text-xl md:text-2xl font-semibold ${computedDeltaMoM > 0 ? 'text-red-600' : computedDeltaMoM < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {computedDeltaMoM > 0 ? '+' : ''}{computedDeltaMoM.toFixed(1)} {getTrendIcon(computedDeltaMoM)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 h-5 whitespace-nowrap overflow-hidden text-ellipsis">Predicted 6‑month change</div>
              <div className={`text-xl md:text-2xl font-semibold ${predicted6mChange > 0 ? 'text-red-600' : predicted6mChange < 0 ? 'text-green-600' : 'text-gray-600'}`}>
                {predicted6mChange > 0 ? '+' : ''}{predicted6mChange.toFixed(1)} {getTrendIcon(predicted6mChange)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1 h-5 whitespace-nowrap overflow-hidden text-ellipsis" title="Ranking (by predicted fatalities, next month)">Ranking (by predicted fatalities, next month)</div>
              <div className="text-xl md:text-2xl font-semibold text-gray-900">
                #{comparativeStats.rank} <span className="text-xs md:text-sm text-gray-500">/ {comparativeStats.totalInType}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      

      

      {/* Unified Key Metrics + Situation Overview */}
      <section className="py-8 -mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Country Grid Map */}
            <div className="rounded-lg p-0 bg-gray-50 overflow-hidden">
              <h2 className="text-lg font-light text-gray-900 px-4 pt-3 pb-2">Predicted fatalities per grid cell (0.5° × 0.5°), {entity.name}</h2>
              <div className="h-[540px]">
                <PrioGridMap period={snapshot.period} countryName={entity.name} hideViewToggle={true} />
              </div>
            </div>
            {/* Right: Scenarios panel */}
            <div className="bg-gray-50 p-0 rounded-lg h-[540px]">
              <LazyVisible minHeight="540px">
                {scenarios ? (
                  <ScenariosChart data={scenarios} countryName={entity.name} maxTotalHeight={540} />
                ) : (
                  <div className="text-sm text-gray-500">No scenario data available.</div>
                )}
              </LazyVisible>
            </div>
          </div>
        </div>
      </section>

      {/* Scenario description */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-sm max-w-none text-gray-600 text-justify">
            <p>
              Scenarios are generated by identifying historical conflict patterns that most closely resemble the current situation in {entity.name}. Our model analyzes thousands of past conflict trajectories worldwide and clusters them based on similarity in dynamics, intensity, and contextual factors.
            </p>
            <p className="mt-2">
              Each line represents a distinct scenario — a cluster of similar historical cases whose trajectories inform potential futures. The percentage shown for each scenario indicates its probability: how likely the model considers this trajectory given current conditions. Higher probability scenarios are shown with more opaque lines. The dashed red portions show projected paths over the next six months, while the solid gray segments show the observed historical pattern leading up to the present.
            </p>
            <p className="mt-2">
              This approach captures the inherent uncertainty in conflict forecasting: rather than a single prediction, we present multiple plausible outcomes weighted by their likelihood based on historical precedent.
            </p>
          </div>
        </div>
      </section>

      {/* Scenario clusters moved next to map above */}

      {/* What happened + Closest matches */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            <div className="lg:col-span-2 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-light text-gray-900">What happened</h3>
              </div>
              <ObservedHistory countryName={entity.name} height={240} />
            </div>
            <div className="lg:col-span-3">
              <h3 className="text-xl font-light text-gray-900 mb-2">Closest historical matches</h3>
              <DTWMatches countryName={entity.name} />
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section - TEMPORARILY COMMENTED OUT
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Time Series *}
            {historicalSeries.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-2xl font-light text-gray-900 mb-4">Historical Trend</h2>
              <LazyVisible minHeight="240px">
                <TimeSeriesChart
                  data={{
                    historical: historicalSeries.map((s: { index: number; period: string }) => s.index),
                    forecast: months,
                    country: entity.name,
                    histPeriods: historicalSeries.map((s: { index: number; period: string }) => s.period),
                    forecastPeriods: (() => {
                      const [yy, mm] = snapshot.period.split('-').map(Number)
                      const start = new Date(Date.UTC(yy, (mm - 1), 1))
                      const out: string[] = []
                      for (let i = 0; i < 6; i++) {
                        const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))
                        const y = d.getUTCFullYear()
                        const m = String(d.getUTCMonth() + 1).padStart(2, '0')
                        out.push(`${y}-${m}`)
                      }
                      return out
                    })()
                  }}
                />
              </LazyVisible>
              </div>
            )}

            {/* Forecast Fan Chart *}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-light text-gray-900 mb-4">6-Month Forecast</h2>
              <LazyVisible minHeight="240px">
                <ForecastFanChart title="" months={months} countryName={entity.name} />
              </LazyVisible>
            </div>
          </div>
        </div>
      </section>
      END TEMPORARILY COMMENTED OUT */}

      

      

      

      

      {/* Drivers and Notes - only show if there's actual content */}
      {(entity.drivers.length > 0 || entity.notes) && (
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {entity.drivers.length > 0 && (
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Risk Drivers</h2>
                  <div className="space-y-4">
                    {entity.drivers.map((driver: { category: string; impact: number; note?: string }, i: number) => (
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
                    ))}
                  </div>
                </div>
              )}

              {entity.notes && (
                <div>
                  <h2 className="text-2xl font-light text-gray-900 mb-4">Analyst Notes</h2>
                  <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <p className="text-gray-700 leading-relaxed">{entity.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      {/* Page-level acknowledgement (subtle, bottom of page) */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            <Link href="/acknowledgements" className="text-link">Acknowledgements</Link>
          </p>
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
