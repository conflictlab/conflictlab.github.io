import Link from 'next/link'
import { BookOpen, FileText, Database, ArrowRight } from 'lucide-react'

export default function Research() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Research
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Explore our <span className="word-emphasis">methodology</span>, read our publications,
            and access datasets from the PaCE project.
          </p>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Methodology Card */}
            <Link
              href="/methodology"
              id="methodology"
              className="bg-white border border-gray-200 rounded-lg p-8 hover:border-clairient-blue hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <BookOpen className="text-clairient-blue" size={32} />
                <ArrowRight className="text-gray-400 group-hover:text-clairient-blue group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Methodology</h2>
              <p className="text-gray-600 leading-relaxed">
                Machine learning models that forecast geopolitical conflict and civil unrest using
                pattern recognition, diffusion modeling, and time-series analysis.
              </p>
            </Link>

            {/* Publications Card */}
            <Link
              href="/publications"
              id="publications"
              className="bg-white border border-gray-200 rounded-lg p-8 hover:border-clairient-blue hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <FileText className="text-clairient-blue" size={32} />
                <ArrowRight className="text-gray-400 group-hover:text-clairient-blue group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Publications</h2>
              <p className="text-gray-600 leading-relaxed">
                Academic papers, policy reports, and newsletters from the PaCE research team
                on conflict forecasting and geopolitical risk analysis.
              </p>
            </Link>

            {/* Datasets Card */}
            <Link
              href="/downloads"
              id="datasets"
              className="bg-white border border-gray-200 rounded-lg p-8 hover:border-clairient-blue hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <Database className="text-clairient-blue" size={32} />
                <ArrowRight className="text-gray-400 group-hover:text-clairient-blue group-hover:translate-x-1 transition-all" size={20} />
              </div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Datasets</h2>
              <p className="text-gray-600 leading-relaxed">
                Download our latest conflict risk forecasts, historical data, and methodological
                documentation for your own research and analysis.
              </p>
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
