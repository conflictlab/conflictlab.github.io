import Breadcrumbs from '@/components/Breadcrumbs'
import Link from 'next/link'

export default function GlossaryPage() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">Methodology Glossary</h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Key terms used across our forecasts and reports, aligned with UCDP definitions and our modeling choices.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Conflict fatalities</h2>
            <p className="text-gray-700">
              Unless stated otherwise, “conflict fatalities” refers to the sum of deaths from state‑based armed conflict, non‑state conflict, and one‑sided violence against civilians, following the Uppsala Conflict Data Program (UCDP) taxonomy and “best” estimates.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-light text-gray-900 mb-1">State‑based armed conflict</h3>
            <p className="text-gray-700">
              Use of armed force between two parties, at least one being a government, resulting in battle‑related deaths. Examples include government–rebels or interstate conflict.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-light text-gray-900 mb-1">Non‑state conflict</h3>
            <p className="text-gray-700">
              Use of armed force between two organized actors, neither of which is the government, leading to fatalities (e.g., clashes between armed groups or militias).
            </p>
          </div>

          <div>
            <h3 className="text-xl font-light text-gray-900 mb-1">One‑sided violence</h3>
            <p className="text-gray-700">
              Intentional use of force by an organized actor against civilians that results in deaths. Includes state or non‑state actors targeting civilians.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Forecast horizons</h2>
            <p className="text-gray-700">
              We report predictions for one, three, and six months ahead (1m, 3m, 6m). “Next month” (1m) refers to the first month following the latest observation window; the 6‑month horizon spans the next six months in total.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Units of analysis</h2>
            <p className="text-gray-700">
              Forecasts are provided at the country‑month level and at a sub‑national grid (PRIO‑GRID 0.5° cells). Grid downloads include per‑cell points (lat, lon) and polygons with values for months m1..m6.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Data source</h2>
            <p className="text-gray-700">
              Fatality counts are derived from the UCDP/Georeferenced Event Dataset (GED) and associated candidate files. Unless otherwise noted, we use the UCDP “best” estimate.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-light text-gray-900 mb-2">Uncertainty and risk</h2>
            <p className="text-gray-700">
              Forecasts are inherently uncertain. We emphasize distributional properties (e.g., projected variability) and provide qualitative “risk bands” where relevant to summarize relative risk.
            </p>
          </div>

          <div className="text-sm text-gray-600 pt-4">
            <span>See also: </span>
            <Link href="/methodology" className="text-link">Methodology</Link>
          </div>
        </div>
      </section>
    </>
  )
}

