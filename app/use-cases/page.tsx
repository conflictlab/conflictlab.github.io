import Link from 'next/link'
import { Download } from 'lucide-react'
import useCasesData from '@/content/use-cases.json'

// PDF mappings for each use case
const pdfMappings = {
  "Asset Managers": "/pdfs/AICAP_Asset_Managers_Case_Study.html",
  "Insurers": "/pdfs/AICAP_Insurance_SRCC_Guide.html", 
  "ESG Funds": "/pdfs/AICAP_ESG_Conflict_Screening_Guide.html",
  "Governments": "/pdfs/AICAP_Government_Strategic_Intelligence.html"
}

export default function UseCases() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Use Cases
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Organizations across finance, insurance, and humanitarian sectors use our <span className="word-highlight">predictive intelligence</span> to anticipate geopolitical risks and make informed decisions.
          </p>
        </div>
      </section>

      {/* Industries */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {useCasesData.sectors.map((sector, index) => (
              <div key={index} className="pb-8 border-b border-gray-200 last:border-b-0">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-light text-gray-900">{sector.name}</h3>
                  {pdfMappings[sector.name as keyof typeof pdfMappings] && (
                    <a 
                      href={pdfMappings[sector.name as keyof typeof pdfMappings]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-clairient-blue hover:text-clairient-dark border border-clairient-blue hover:border-clairient-dark px-3 py-1 rounded transition-colors duration-200"
                      title="Download detailed case study"
                    >
                      <Download size={14} className="mr-1" />
                      Case Study
                    </a>
                  )}
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">{sector.useCase}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{sector.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-light text-clairient-blue mb-2">2-6</div>
              <div className="text-gray-600 text-sm">Months early warning</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-clairient-blue mb-2">25%</div>
              <div className="text-gray-600 text-sm">Pricing improvement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-clairient-blue mb-2">15%</div>
              <div className="text-gray-600 text-sm">Risk reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-clairient-blue mb-2">100%</div>
              <div className="text-gray-600 text-sm">ESG compliance</div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg text-gray-600 mb-8 font-light">
            Ready to see how it works for your organization?
          </p>
          <div className="space-x-8">
            <Link href="/dashboard" className="text-link">
              View Demo
            </Link>
            <Link href="/contact" className="text-link">
              Start Discussion
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}