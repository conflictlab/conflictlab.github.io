import Link from 'next/link'
import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { BookOpen, FileText, Database, Beaker, Presentation, ChevronRight } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'
import Collapsible from '@/components/Collapsible'
import { publications } from '@/content/publications'

export const metadata: Metadata = {
  title: 'Research — PaCE',
  description: 'Methods, publications, datasets, and impact from the PaCE project.',
}

// Methods showcase removed per request

function FeaturedBadge({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">
      {/* external icon removed for simplicity */}
      {label}
    </a>
  )
}

export default function ResearchPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">Research at PaCE</h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed max-w-3xl">
            We build transparent, data‑driven methods to forecast conflict risk. Explore our publications and methods.
          </p>
          <Breadcrumbs />
          <div className="mt-6 flex flex-wrap gap-3">
            {/* Order matches menu: Methodology, Publications, Dissemination */}
            <Link href="/methodology" className="btn-secondary inline-flex items-center gap-1"><Beaker size={16}/> Methodology</Link>
            <Link href="/publications" className="btn-secondary inline-flex items-center gap-1"><FileText size={16}/> Publications</Link>
            <Link href="/dissemination" className="btn-secondary inline-flex items-center gap-1"><Presentation size={16}/> Dissemination</Link>
          </div>
          {/* Brief methods intro */}
          <div className="mt-6 bg-white/70 border border-gray-200 rounded-lg p-4 max-w-3xl">
            <h3 className="text-lg font-light text-gray-900 mb-1">Methods at a glance</h3>
            <p className="text-sm text-gray-700">
              We combine transparent statistical models with event, financial, and geospatial data to forecast conflict fatalities
              over 1–6 month horizons.
              <Link href="/methodology" className="text-link ml-2">Read more</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Featured studies (auto: two most recent by year) */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {publications
            .slice()
            .sort((a, b) => b.year - a.year)
            .slice(0, 2)
            .map((p, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
                <div className="flex items-start justify-between gap-6 flex-col md:flex-row">
                  <div className="flex-1">
                    <div className="text-xs uppercase tracking-wider text-pace-red mb-2">Featured publication</div>
                    <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">{p.title}</h2>
                    <div className="text-sm text-gray-500 mb-3">{p.authors} — {p.venue}, {p.year}</div>
                    <Collapsible title="Abstract" initiallyCollapsed={true}>
                      <p className="text-gray-700 leading-relaxed max-w-3xl">{p.abstract}</p>
                    </Collapsible>
                    <div className="flex flex-wrap gap-2">
                      <FeaturedBadge href={p.url || '/publications'} label="Paper" />
                      <FeaturedBadge href="/downloads" label="Dataset" />
                    </div>
                  </div>
                  <div className="w-full md:w-80">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-2">Highlights</div>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Peer‑reviewed venue</li>
                        <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> Recent ({p.year})</li>
                        <li className="flex items-start gap-2"><ChevronRight size={16} className="text-pace-red mt-0.5"/> See details on Publications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* See all publications */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/publications" className="btn-secondary inline-flex items-center">See all publications</Link>
        </div>
      </section>

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
