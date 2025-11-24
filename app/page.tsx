import { readSnapshot, getOrCalculateMonths } from '@/lib/forecasts'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import LandingBanner from '@/components/LandingBanner'
import { Brain, Globe, TrendingUp, Database, ArrowRight, FileText, Users } from 'lucide-react'

const CountryChoropleth = dynamic(() => import('@/components/CountryChoropleth'), { ssr: false })

export default async function Home() {
  const snapshot = readSnapshot('latest')

  const countryMapItems = snapshot.entities
    .filter((e) => (e.entityType || 'country') === 'country')
    .map((e) => {
      const months = getOrCalculateMonths(snapshot.period, e)
      return { id: e.id, name: e.name, iso3: e.iso3, months }
    })

  return (
    <div>
      {/* Country Choropleth Map (full-bleed) with title overlay */}
      <section className="bg-white relative">
        <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <CountryChoropleth items={countryMapItems} hideDownloadButton={true} hideControls={true} hideLegend={true} hideSearch={true} dimZoomControls={true} hideMonthSlider={true} showHotspots={true} mapHeight="calc(100dvh - 48px)" initialZoom={3.0} hideZoomHint={true} />
          {/* Gradient overlay to dim the map - darker at edges, lighter in center - z-index must be above map but below title */}
          <div
            className="absolute inset-0 pointer-events-none z-[400]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.55) 100%)'
            }}
          />
        </div>

        {/* Title Overlay - positioned at 25%/25% */}
        <LandingBanner />
      </section>

      {/* About Section */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Narrower card for a pleasing ratio (~2/3 of container) */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300">
              {/* Red accent bar on left */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pace-red via-pace-red-light to-pace-red"></div>
              {/* Black accent bar on right */}
              <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-gray-900 via-gray-700 to-gray-900"></div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8 p-10 md:p-12 pl-12 md:pl-14 pr-12 md:pr-14">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <Image
                      src="/logos/logo.png"
                      alt="PaCE"
                      width={140}
                      height={140}
                      className="w-32 h-32 md:w-35 md:h-35"
                    />
                    {/* Subtle decorative circle behind logo */}
                    <div className="absolute -inset-2 bg-red-50 rounded-full -z-10 opacity-40"></div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
                    <span className="text-pace-red">PaCE</span>
                    <span className="text-lg md:text-xl font-light text-gray-600 ml-2">Patterns of Conflict Escalation</span>
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-800 text-lg leading-relaxed font-medium">
                      A research lab at Trinity College Dublin using machine learning to forecast conflict fatalities at the country and sub‑national level.
                    </p>
                    <p className="text-gray-600 text-base leading-relaxed">
                      We combine transparent methods, rich data, and clear communication to support early warning and decision‑making.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* First card - Link to Dashboard (Most Important) */}
            <Link href="/forecasts" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-pace-red hover:shadow-xl hover:border-pace-red-light transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <Globe className="text-pace-red" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Explore Our Forecasts</h3>
                    <ArrowRight className="text-pace-red opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    View interactive dashboards with conflict risk forecasts for 180+ countries and 259,000 <span title="0.5° map squares (~55 km)">Sub‑national Areas</span>,
                    updated monthly with predictions up to 6 months ahead.
                  </p>
                </div>
              </div>
            </Link>

            {/* Second card - About (swapped into large card) */}
            <Link href="/about" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-railings hover:shadow-xl hover:border-railings-light transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Users className="text-railings" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">About</h3>
                    <ArrowRight className="text-railings opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    Discover PaCE’s mission and research focus, and how our ERC‑funded work at Trinity College Dublin advances conflict forecasting.
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Capabilities Section */}
          <div className="mb-16">
            <h3 className="text-2xl font-light text-gray-900 mb-8 text-center">Learn More</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Publications */}
              <Link href="/publications" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-pace-red hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                    <FileText className="text-pace-red" size={28} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Publications
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Read our academic papers, policy reports, and research findings
                  </p>
                </div>
              </Link>

              {/* Data Downloads */}
              <Link href="/downloads" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-pace-red hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                    <Database className="text-pace-red" size={28} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Download Data
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Access our forecasts, historical data, and research datasets
                  </p>
                </div>
              </Link>

              {/* Methodology (moved down into small card) */}
              <Link href="/methodology" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-pace-red hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                    <Brain className="text-pace-red" size={28} />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    Our Methodology
                    <ArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">How we identify patterns to forecast conflict from diverse data</p>
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
              <Image
                src="/logos/erc-logo.png"
                alt="European Research Council"
                width={160} // Approximate width based on h-36 md:h-40 (144px for h-36, 160px for h-40)
                height={160} // height needs to be set for Next/Image
                className="h-36 md:h-40 object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
