import { getForecastsPageData, getEntityHorizonMonths } from '@/lib/forecasts'
import ForecastFanChart from '@/components/ForecastFanChart'
import { notFound } from 'next/navigation'

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

  return { entity, months }
}

export default async function EntityForecastPage({ params }: { params: { entity: string } }) {
  const data = await getEntityData(params.entity)

  if (!data) {
    notFound()
  }

  const { entity, months } = data

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="py-12 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
            {entity.name}
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Detailed 6-month forecast for predicted conflict fatalities.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <ForecastFanChart
                title="Predicted Fatalities (6-Month Horizon)"
                months={months}
              />
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Risk Drivers</h2>
              <div className="space-y-4">
                {entity.drivers.length > 0 ? (
                  entity.drivers.map((driver, i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                      <p className="font-semibold text-gray-800">{driver.category}</p>
                      <p className="text-sm text-gray-600">{driver.note}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-pace-red h-2.5 rounded-full" style={{ width: `${driver.impact}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No specific drivers identified for this period.</p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Analyst Notes</h2>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-600 italic">
                  {entity.notes || 'No analyst notes available for this period.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}