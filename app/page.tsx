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
      {/* Country Choropleth Map (full-bleed) with title overlay */}
      <section className="bg-white relative">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <CountryChoropleth items={countryMapItems} hideDownloadButton={true} mapHeight="calc(100vh - 80px)" initialZoom={3.0} />
          {/* Dark overlay to dim the map - z-index must be above map but below title */}
          <div className="absolute inset-0 bg-black/20 pointer-events-none z-[400]" />
        </div>

        {/* Title Overlay - logo-centric design */}
        <div className="absolute inset-0 flex items-start justify-center pt-[16.67vh] z-[1000] pointer-events-none">
          <div className="text-center px-8 py-6">
            <img
              src="/logo.png"
              alt="PaCE Logo"
              className="h-24 w-24 md:h-32 md:w-32 mx-auto mb-4"
              style={{ filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))' }}
            />
            <h1 className="text-5xl md:text-6xl font-light text-white mb-3 tracking-wide" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)' }}>
              PaCE
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light tracking-wide" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
              Predicting War Through Pattern Recognition
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-gray-900 mb-8">About PaCE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* First text block */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <p className="text-lg leading-relaxed text-gray-700">
                PaCE is a research project at Trinity College Dublin (2022-26)
                using machine learning to forecast interstate and civil wars by identifying recurring patterns
                in financial markets, news, diplomatic cables, and satellite imagery.
              </p>
            </div>

            {/* Second text block */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <p className="text-lg leading-relaxed text-gray-700">
                Since 1900, over 200 wars have claimed 35 million battle deaths. By uncovering temporal
                patterns in the lead-up to conflict—across financial, migration, protest, and climate data—we
                aim to improve forecasts and help prevent future wars.
              </p>
            </div>
          </div>

          {/* Acknowledgements */}
          <div className="mt-16 text-center">
            <h3 className="text-xl font-light text-gray-900 mb-4">Acknowledgements: Funding</h3>
            <p className="text-sm text-gray-600 max-w-3xl mx-auto mb-8">
              This project has received funding from the European Research Council (ERC) under the
              European Union&rsquo;s Horizon 2020 research and innovation programme (grant agreement No 101002240)
            </p>

            {/* ERC Logo */}
            <div className="flex justify-center">
              <img
                src="/erc-logo.png"
                alt="European Research Council"
                className="h-24 object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
