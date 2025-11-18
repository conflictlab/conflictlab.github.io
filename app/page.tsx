import { readSnapshot } from '@/lib/forecasts'
import { getEntityHorizonMonths } from '@/lib/forecasts'
import dynamic from 'next/dynamic'

const CountryChoropleth = dynamic(() => import('@/components/CountryChoropleth'), { ssr: false })

export default async function Home() {
  const snapshot = readSnapshot('latest')

  const countryMapItems = snapshot.entities
    .filter((e) => (e.entityType || 'country') === 'country')
    .map((e) => {
      const months = getEntityHorizonMonths(snapshot.period, e.name) || [
        e.horizons['1m'].p50,
        Number(((e.horizons['1m'].p50 + e.horizons['3m'].p50) / 2).toFixed(1)),
        e.horizons['3m'].p50,
        Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) / 3).toFixed(1)),
        Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) * 2 / 3).toFixed(1)),
        e.horizons['6m'].p50,
      ]
      return { name: e.name, iso3: e.iso3, months }
    })

  return (
    <div>
      {/* Country Choropleth Map (full-bleed) */}
      <section className="bg-white">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <CountryChoropleth items={countryMapItems} hideDownloadButton={true} mapHeight="calc(100vh - 80px)" initialZoom={3.7} />
        </div>
      </section>
    </div>
  )
}
