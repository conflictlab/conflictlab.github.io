import { notFound } from 'next/navigation'
import { readSnapshot, getEntitySeries } from '@/lib/forecasts'
import ForecastFanChart from '@/components/ForecastFanChart'
import Sparkline from '@/components/Sparkline'
import DriverBadges from '@/components/DriverBadges'

interface Params { params: { entity: string } }

export default async function ForecastEntityPage({ params }: Params) {
  const { entity } = params
  const snap = readSnapshot('latest')
  const e = snap.entities.find((x) => x.id.toLowerCase() === entity.toLowerCase() || x.iso3?.toLowerCase() === entity.toLowerCase())
  if (!e) return notFound()
  const series = getEntitySeries(e.id).slice(-12)

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">{e.name}</h1>
        <p className="text-gray-600 mb-6">Period: {snap.period} · Confidence: {(e.confidence * 100).toFixed(0)}%</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="text-sm text-gray-500 mb-2">Recent Trend</div>
            <Sparkline values={series.map((s) => s.index)} width={300} height={60} />
          </div>
          <ForecastFanChart title={e.name} horizons={{
            '1m': { p10: e.horizons['1m'].p10, p50: e.horizons['1m'].p50, p90: e.horizons['1m'].p90 },
            '3m': { p10: e.horizons['3m'].p10, p50: e.horizons['3m'].p50, p90: e.horizons['3m'].p90 },
            '6m': { p10: e.horizons['6m'].p10, p50: e.horizons['6m'].p50, p90: e.horizons['6m'].p90 },
          }} />
        </div>

        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Index</div>
              <div className="text-xl text-gray-900">{e.index}</div>
            </div>
            <div>
              <div className="text-gray-500">Δ MoM</div>
              <div className={`text-xl ${e.deltaMoM >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{e.deltaMoM >= 0 ? '+' : ''}{e.deltaMoM}</div>
            </div>
            <div>
              <div className="text-gray-500">Δ YoY</div>
              <div className={`text-xl ${e.deltaYoY >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{e.deltaYoY >= 0 ? '+' : ''}{e.deltaYoY}</div>
            </div>
            <div>
              <div className="text-gray-500">Drivers</div>
              <DriverBadges categories={e.drivers.map((d) => d.category)} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

