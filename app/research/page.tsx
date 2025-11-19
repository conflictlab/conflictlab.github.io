import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research — PaCE',
  description: 'Methodology, publications, datasets, and dissemination from the PaCE project.',
}
import { BookOpen, FileText, Database, Presentation, ArrowRight } from 'lucide-react'

export default function Research() {
  return (
    <>
      {/* Hero Section with Cards */}
      <section className="py-12 md:py-16 hero-background-network-image">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
              Research
            </h1>
            <p className="text-xl text-gray-600 font-light leading-relaxed">
              Explore our <span className="word-emphasis">methodology</span>, read our publications,
              and access datasets from the PaCE project.
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Methodology Card */}
            <Link href="/methodology" id="methodology" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-pace-red hover:shadow-xl hover:border-pace-red-light transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <BookOpen className="text-pace-red" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Methodology</h3>
                    <ArrowRight className="text-pace-red opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    Machine learning models that forecast geopolitical conflict and civil unrest using
                    pattern recognition, diffusion modeling, and time-series analysis.
                  </p>
                </div>
              </div>
            </Link>

            {/* Publications Card */}
            <Link href="/publications" id="publications" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-pace-red hover:shadow-xl hover:border-pace-red-light transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <FileText className="text-pace-red" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Publications</h3>
                    <ArrowRight className="text-pace-red opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    Academic papers, policy reports, and newsletters from the PaCE research team
                    on conflict forecasting and geopolitical risk analysis.
                  </p>
                </div>
              </div>
            </Link>

            {/* Datasets Card */}
            <Link href="/downloads" id="datasets" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-pace-red hover:shadow-xl hover:border-pace-red-light transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <Database className="text-pace-red" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Datasets</h3>
                    <ArrowRight className="text-pace-red opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    Download our latest conflict risk forecasts, historical data, and methodological
                    documentation for your own research and analysis.
                  </p>
                </div>
              </div>
            </Link>

            {/* Dissemination Card */}
            <Link href="/dissemination" id="dissemination" className="bg-white p-8 rounded-lg shadow-md border-l-4 border-pace-red hover:shadow-xl hover:border-pace-red-light transition-all duration-300 group cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                  <Presentation className="text-pace-red" size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Dissemination</h3>
                    <ArrowRight className="text-pace-red opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                  </div>
                  <p className="text-base leading-relaxed text-gray-700">
                    Workshops, presentations, and conferences where the PaCE research team
                    shares findings with the academic community and policymakers.
                  </p>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light text-gray-900 mb-6">About PaCE Research</h2>
          <p className="text-lg text-gray-600 font-light leading-relaxed mb-8">
            The PaCE (Patterns of Conflict Escalation) project is a 5-year research initiative (2022-2026)
            funded by the European Research Council. Our mission is to improve conflict forecasting by
            uncovering temporal patterns in financial markets, news, diplomatic cables, and satellite imagery.
          </p>
          <Link href="/about" className="btn-primary inline-flex items-center">
            Learn more about our team
            <ArrowRight className="ml-2" size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
