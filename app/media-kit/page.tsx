import Breadcrumbs from '@/components/Breadcrumbs'
import Link from 'next/link'

export default function MediaKitPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-10 pb-6 md:pt-12 md:pb-8 hero-background-network-image border-b border-gray-200">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4">
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-2 leading-tight">Media Kit</h1>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Boilerplate */}
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">Press Boilerplate</h2>
            <p className="text-gray-700 leading-relaxed">
              PaCE (Patterns of Conflict Emergence) is a five-year ERC‑funded research project (2022–26) at Trinity College Dublin.
              The team develops transparent, data‑driven methods to identify recurring patterns ahead of conflict and forecast
              geopolitical risk across countries and sub‑national areas.
            </p>
          </div>

          {/* Project summary */}
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">Project Summary — 1‑Pager</h2>
            <p className="text-gray-700 mb-4">Open the one‑page overview suitable for press briefings and event handouts.</p>
            <Link href="/media-kit/project-summary" className="btn-secondary inline-flex items-center">Open 1‑Pager</Link>
            <p className="text-xs text-gray-500 mt-2">Tip: Use your browser’s “Print → Save as PDF” to export.</p>
          </div>

          {/* Logos */}
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">Logos</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="p-4 border border-gray-200 rounded-lg bg-white text-center">
                <img src="/logos/logo.png" alt="PaCE logo" className="h-20 mx-auto object-contain" />
                <div className="mt-3 text-sm">
                  <a href="/logos/logo.png" className="text-link">PNG</a>
                </div>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg bg-white text-center">
                <img src="/logos/PaCE final icon.svg" alt="PaCE vector icon" className="h-20 mx-auto object-contain" />
                <div className="mt-3 text-sm">
                  <a href="/logos/PaCE final icon.svg" className="text-link">SVG</a>
                  <span className="mx-2">·</span>
                  <a href="/logos/PaCE final icon.pdf" className="text-link">PDF</a>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Use logos on neutral backgrounds. Do not distort, recolor, or add effects.</p>
          </div>

          {/* Fast Facts */}
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">Fast Facts</h2>
            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Coverage: 180+ countries and 259,000 sub‑national areas</li>
              <li>Horizon: up to 6 months ahead</li>
              <li>Cadence: monthly updates</li>
              <li>Affiliation: Trinity College Dublin (Political Science)</li>
              <li>Funding: European Research Council (Grant 101002240)</li>
            </ul>
          </div>

          

          {/* Contact */}
          <div>
            <h2 className="text-3xl font-light text-gray-900 mb-4">Press Contact</h2>
            <p className="text-gray-700">Email: <a href="mailto:info@forecastlab.org" className="text-link">info@forecastlab.org</a></p>
          </div>

          
        </div>
      </section>
    </>
  )
}
