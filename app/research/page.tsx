import Link from 'next/link'
import type { Metadata } from 'next'
import { BookOpen, FileText, Database, Beaker, Presentation, ChevronRight, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Research — PaCE',
  description: 'Methodology, publications, datasets, and dissemination from the PaCE project.',
}

// Methods showcase removed per request

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
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <Link href="/publications" className="btn-secondary inline-flex items-center gap-1"><FileText size={16}/> Publications</Link>
            <Link href="/methodology" className="btn-secondary inline-flex items-center gap-1"><Beaker size={16}/> Methodology</Link>
            <Link href="/downloads" className="btn-secondary inline-flex items-center gap-1"><Database size={16}/> Data & Code</Link>
            <Link href="/dissemination" className="btn-secondary inline-flex items-center gap-1"><Presentation size={16}/> Dissemination</Link>
          </div>
        </div>
      </section>

      {/* Featured studies */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* First featured */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
            <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-pace-red mb-2">Featured</div>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Structured Pixels: Satellite Imagery as the Cause in Causal Effect Estimation</h2>
                <div className="text-sm text-gray-500 mb-3">Lu C, & Chadefaux T — HICSS 2026</div>
                <p className="text-gray-700 leading-relaxed mb-4 max-w-3xl">
                  We position satellite imagery as a causal input and isolate effects using a two‑step, R‑learner‑inspired pipeline. Learned representations capture meaningful environmental patterns and improve performance across semi‑synthesized tasks.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="text-xs px-3 py-1 rounded border border-pace-red text-pace-red hover:bg-pace-red hover:text-white transition-colors">
                    Cite
                  </button>
                </div>
              </div>
              <div className="w-full md:w-80">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-2">At a glance</div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Causal framing for imagery</li>
                    <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Two‑stage deconfounding (R‑learner)</li>
                    <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Modular across ML backbones</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Second featured */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
            <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
              <div className="flex-1">
                <div className="text-xs uppercase tracking-wider text-pace-red mb-2">Featured</div>
                <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">Accounting for Variability in Conflict Dynamics: A Pattern-Based Predictive Model</h2>
                <div className="text-sm text-gray-500 mb-3">Schincariol T, Frank H & Chadefaux T — Journal of Peace Research 2025</div>
                <p className="text-gray-700 leading-relaxed mb-4 max-w-3xl">
                  The "Shape Finder" captures variability in conflict fatalities—sudden surges and declines—by finding historically analogous sequences. This pattern‑based approach maintains high accuracy while significantly enhancing the ability to predict shifts in conflict intensity over time.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="text-xs px-3 py-1 rounded border border-pace-red text-pace-red hover:bg-pace-red hover:text-white transition-colors">
                    Cite
                  </button>
                </div>
              </div>
              <div className="w-full md:w-80">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-600 mb-2">At a glance</div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Pattern‑based forecasting</li>
                    <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Captures conflict variability</li>
                    <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Purely autoregressive approach</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse & topics */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-light text-gray-900">Browse by topic</h3>
            <Link href="/publications" className="text-pace-red hover:text-pace-red-dark text-sm">See all publications</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Forecasting', 'Conflict', 'Causal inference', 'Evaluation', 'GeoAI'].map(t => (
              <Link key={t} href="/publications" className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">{t}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* Methods showcase removed */}

      {/* Data & Code hub */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-6">Data & Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/downloads" className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm">
              <div className="flex items-center gap-3 mb-2"><Database size={18} className="text-pace-red"/><span className="font-medium text-gray-900">Forecast datasets</span></div>
              <p className="text-sm text-gray-600">Monthly country and sub‑national forecasts with uncertainty, CSV and JSON.</p>
            </Link>
            <Link href="/methodology" className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm">
              <div className="flex items-center gap-3 mb-2"><BookOpen size={18} className="text-pace-red"/><span className="font-medium text-gray-900">Methods & docs</span></div>
              <p className="text-sm text-gray-600">Modeling notes, evaluation metrics, and design decisions.</p>
            </Link>
            <a href="https://github.com/conflictlab" target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm">
              <div className="flex items-center gap-3 mb-2"><FileText size={18} className="text-pace-red"/><span className="font-medium text-gray-900">Code on GitHub</span></div>
              <p className="text-sm text-gray-600">Open‑source repos and notebooks from the lab.</p>
            </a>
          </div>
        </div>
      </section>

      {/* Impact & timeline */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-6">Impact & updates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ol className="relative border-l border-gray-200 pl-6">
                {[
                  { d: '2026-01', t: 'HICSS presentation on Structured Pixels (GeoAI causal methods)' },
                  { d: '2025-10', t: 'Forecasts refresh with improved uncertainty calibration' },
                  { d: '2025-07', t: 'DTW evaluation study on conflict trajectories' },
                ].map((e, i) => (
                  <li key={i} className="mb-6">
                    <span className="absolute -left-2 top-0 w-3 h-3 bg-pace-red rounded-full" />
                    <div className="text-xs text-gray-500">{e.d}</div>
                    <div className="text-sm text-gray-900">{e.t}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-2">Also see</div>
                <ul className="text-sm text-pace-red space-y-2">
                  <li><Link href="/dissemination" className="hover:underline">Talks & media</Link></li>
                  <li><Link href="/publications" className="hover:underline">All publications</Link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
