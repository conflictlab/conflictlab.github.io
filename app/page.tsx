import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import companyData from '@/content/company.json'
import FinancialPerformanceChart from '@/components/FinancialPerformanceChart'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center hero-background-intel">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-8 leading-tight">
            {companyData.tagline}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light max-w-3xl mx-auto leading-relaxed">
            <span className="word-highlight" data-text="Actionable geopolitical intelligence">
              <span className="typing-text">Actionable geopolitical intelligence</span>
            </span> for investors, insurers, and decision-makers navigating global risk.
          </p>
          <Link href="/technology" className="inline-flex items-center text-lg text-clairient-blue hover:text-clairient-dark border-b border-clairient-blue hover:border-clairient-dark">
            Learn more
            <ArrowRight className="ml-2" size={18} />
          </Link>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-gray-50 data-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <p className="text-2xl md:text-3xl text-gray-700 font-light leading-relaxed">
              To equip global decision-makers with <span className="word-highlight" data-text="clear intelligence">
                <span className="typing-text">clear intelligence</span>
              </span> on political instability and conflict—transforming uncertainty into strategic foresight.
            </p>
          </div>
        </div>
      </section>

      {/* Financial Performance */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Proven <span className="word-emphasis">Financial Impact</span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Portfolio strategies informed by our geopolitical intelligence consistently outperform traditional approaches
            </p>
          </div>
          
          <FinancialPerformanceChart />
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-600 mb-8 font-light">
            Ready to see how predictive intelligence works?
          </p>
          <div className="space-x-8">
            <Link href="/dashboard" className="text-link">
              View Demo
            </Link>
            <Link href="/contact" className="text-link">
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}