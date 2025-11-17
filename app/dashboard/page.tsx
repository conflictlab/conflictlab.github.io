import { Clock } from 'lucide-react'
import Link from 'next/link'
import InteractiveMap from '@/components/InteractiveMap'

export default function Dashboard() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Demo
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
            <span className="word-emphasis">Real-time geopolitical risk</span> intelligence platform. Monitor global threats, 
            analyze portfolio exposure, and receive early warnings.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 font-light">
            <Clock className="mr-2" size={16} />
            <span>Coming Soon</span>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-24 bg-gray-50 data-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Dashboard Header */}
            <div className="border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light">Global Risk Monitor</h3>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Live Data
                </div>
              </div>
            </div>
            
            {/* Mock Dashboard Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-red-50 border border-red-100 rounded">
                  <h4 className="font-medium text-red-800 mb-3">High Risk Alerts</h4>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <div className="font-medium">West Africa</div>
                      <div className="text-gray-600">Protest risk: 78% ↑</div>
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">Eastern Europe</div>
                      <div className="text-gray-600">Political instability: 65% ↑</div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-100 rounded">
                  <h4 className="font-medium text-blue-800 mb-3">Portfolio Exposure</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>High Risk Assets:</span>
                      <span>12.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Geographic Concentration:</span>
                      <span>Asia 45%</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 border border-green-100 rounded">
                  <h4 className="font-medium text-green-800 mb-3">Model Accuracy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>30-day:</span>
                      <span>87.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>90-day:</span>
                      <span>72.1%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-gray-800 mb-4">Global Conflict Forecast Map</h4>
                <InteractiveMap />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-600 mb-8 font-light">
            Want early access to the platform?
          </p>
          <div className="space-x-8">
            <Link href="/contact" className="text-link">
              Join Waitlist
            </Link>
            <Link href="/technology" className="text-link">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
