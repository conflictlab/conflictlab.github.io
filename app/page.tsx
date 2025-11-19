import { readSnapshot } from '@/lib/forecasts'
import { getEntityHorizonMonths } from '@/lib/forecasts'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import LandingBanner from '@/components/LandingBanner'
import { Brain, Globe, TrendingUp, Database, Network, Target, ArrowRight } from 'lucide-react'

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
          <CountryChoropleth items={countryMapItems} hideDownloadButton={true} hideControls={true} hideLegend={true} showHotspots={true} mapHeight="calc(100vh - 80px)" initialZoom={3.0} />
          {/* Gradient overlay to dim the map - darker at edges, lighter in center - z-index must be above map but below title */}
          <div
            className="absolute inset-0 pointer-events-none z-[400]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)'
            }}
          />
        </div>

        {/* Title Overlay - positioned at 25%/25% */}
        <LandingBanner />
      </section>

      {/* About Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-gray-900 mb-12 text-center">About PaCE</h2>

          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* First card - Link to About */}
            <Link href="/about" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-teal-600 hover:shadow-xl hover:border-teal-500 transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                  <Brain className="text-teal-600" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">The Project</h3>
                    <ArrowRight className="text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    PaCE is a research project at Trinity College Dublin (2022-26)
                    using machine learning to forecast interstate and civil wars by identifying recurring patterns
                    in financial markets, news, diplomatic cables, and satellite imagery.
                  </p>
                </div>
              </div>
            </Link>

            {/* Second card - Link to Methodology */}
            <Link href="/methodology" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-pace-red hover:shadow-xl hover:border-pace-red-light transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <Target className="text-pace-red" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Our Methodology</h3>
                    <ArrowRight className="text-pace-red opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    Since 1900, over 200 wars have claimed 35 million battle deaths. By uncovering temporal
                    patterns in the lead-up to conflict—across financial, migration, protest, and climate data—we
                    aim to improve forecasts and help prevent future wars.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Capabilities Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">Explore Our Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Data Sources - Link to Downloads */}
              <Link href="/downloads" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                    <Database className="text-teal-600" size={28} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Download Our Data
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Access forecasts, historical data, and datasets from the PaCE project
                  </p>
                </div>
              </Link>

              {/* ML Models - Link to Methodology */}
              <Link href="/methodology" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                    <Network className="text-teal-600" size={28} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Our Methodology
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Learn about our machine learning models and forecasting approaches
                  </p>
                </div>
              </Link>

              {/* Forecasting - Link to Dashboard */}
              <Link href="/forecasts" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-teal-100 transition-colors">
                    <Globe className="text-teal-600" size={28} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Explore Our Forecasts
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    View interactive dashboards with 180+ countries and 259K grid cells
                  </p>
                </div>
              </Link>
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
