import dynamic from 'next/dynamic'
import { readSnapshot, getEntityHorizonMonths } from '@/lib/forecasts'

const CountryChoropleth = dynamic(() => import('@/components/CountryChoropleth'), { ssr: false })

export default async function TestMapPage() {
  const snap = readSnapshot('latest')
  // Build items for country map (six‑month horizons per country)
  const items = snap.entities
    .filter((e) => (e.entityType || 'country') === 'country')
    .map((e) => {
      const months = getEntityHorizonMonths(snap.period, e.name) || [
        e.horizons['1m'].p50,
        Number(((e.horizons['1m'].p50 + e.horizons['3m'].p50) / 2).toFixed(1)),
        e.horizons['3m'].p50,
        Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) / 3).toFixed(1)),
        Number((e.horizons['3m'].p50 + (e.horizons['6m'].p50 - e.horizons['3m'].p50) * 2 / 3).toFixed(1)),
        e.horizons['6m'].p50,
      ]
      return { name: e.name, iso3: e.iso3, months }
    })

  // Fill entire viewport (hide nav/footer for this route)
  return (
    <div className="fixed inset-0">
      <CountryChoropleth items={items} />
    </div>
  )
}
