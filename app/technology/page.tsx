import Link from 'next/link'
import servicesData from '@/content/services.json'
import InteractiveMap from '@/components/InteractiveMap'

export default function Technology() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Technology
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            <span className="word-emphasis">Machine learning models</span> that forecast geopolitical conflict and civil unrest. 
            Built for precision, transparency, and integration with existing systems.
          </p>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-24 bg-gray-50 data-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {servicesData.coreCapabilities.map((capability, index) => (
              <div key={index}>
                <h3 className="text-2xl font-light text-gray-900 mb-6">
                  {index === 0 && <span className="word-highlight">{capability.title}</span>}
                  {index === 1 && <span className="word-emphasis">{capability.title}</span>}
                  {index > 1 && capability.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Forecast Demo */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Live <span className="word-typewriter">Global Risk Intelligence</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Real-time conflict forecasts powered by our machine learning models
            </p>
          </div>
          
          <div className="mb-12">
            <InteractiveMap />
          </div>
          
          <div className="text-center">
            <div className="space-x-8">
              <Link href="/dashboard" className="text-link">
                View Full Demo
              </Link>
              <Link href="/contact" className="text-link">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}