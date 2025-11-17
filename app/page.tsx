import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import companyData from '@/content/company.json'
import FinancialPerformanceChart from '@/components/FinancialPerformanceChart'

export default function Home() {
  return (
    <>
      {/* Hero Section (Light, minimalist) */}
      <section className="hero-background-network-image min-h-[70vh] md:min-h-[78vh] flex items-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-light text-gray-900 mb-6 leading-tight">
            {companyData.tagline}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 font-light max-w-3xl mx-auto leading-relaxed">
            Actionable geopolitical intelligence for investors, insurers, and decision-makers.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/contact" className="btn-primary inline-flex items-center">
              Get Started
              <ArrowRight className="ml-2" size={18} />
            </Link>
            <Link href="/dashboard" className="btn-secondary inline-flex items-center">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
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
      <section className="py-24">
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

      
    </>
  )
}
