import Link from 'next/link'
import Image from 'next/image'
import PrioGridAnimation from '@/components/PrioGridAnimation'
import MethodologyFlowchart from '@/components/MethodologyFlowchart'
import dynamic from 'next/dynamic'
import { readSnapshot } from '@/lib/forecasts'
import { Activity, Users, TrendingUp, Vote, CloudSun, Map, Move, Shield, ShoppingBag } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'

const PrioGridMap = dynamic(() => import('@/components/PrioGridMap'), { ssr: false })
const DTWTrajShowcase = dynamic(() => import('@/components/DTWTrajShowcase'), { ssr: false })

export default async function Methodology() {
  const snap = readSnapshot('latest')
  return (
    <>
      {/* Hero Section */}
      <section className="pt-12 pb-8 md:pt-16 md:pb-10 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
            Methodology
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Machine learning models that forecast geopolitical conflict, civil unrest and migration.
            Built for precision, transparency, and integration with existing systems.
          </p>
          <Breadcrumbs />
        </div>
      </section>

      {/* Methodology Overview Flowchart */}
      <section className="pt-8 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-light text-gray-900">
              How Our Forecasting System Works
            </h2>
          </div>
          <MethodologyFlowchart />

          {/* Key Advantages */}
          <div className="mt-8 bg-white p-6 rounded-lg border border-gray-200 max-w-4xl mx-auto">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Key Advantages</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-gray-600">
                <li>✓ <strong>Interpretable:</strong> Can cite specific historical analogues</li>
                <li>✓ <strong>Fast:</strong> Minutes, not hours</li>
                <li>✓ <strong>No covariates needed:</strong> Only past fatalities required</li>
              </ul>
              <ul className="space-y-2 text-gray-600">
                <li>✓ <strong>Captures variability:</strong> Predicts surges and declines</li>
                <li>✓ <strong>Always available:</strong> No lag for data updates</li>
                <li>✓ <strong>Flexible:</strong> Handles varying speeds via DTW</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRIO-GRID Diffusion Model */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Conflict Diffusion Modeling
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              Our machine learning models predict how conflict spreads across space and time using 
              PRIO-GRID cellular analysis at 0.5° resolution.
            </p>
          </div>
          
          <div className="mb-12">
            <PrioGridAnimation />
          </div>
                  </div>
      </section>

      {/* Pattern Discovery & Time‑Series AI */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Pattern Discovery & Time‑Series AI</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto mb-8">
              We mine sequences for structure — motifs, anomalies, regime shifts — and learn compact embeddings that capture
              the shape and momentum of real‑world dynamics. Clustering similar trajectories and aligning asynchronous signals
              lets us surface recurring signatures, spot emerging look‑alikes, and rank what matters most — fast.
            </p>
          </div>

          {/* Interactive DTW Showcase */}
          <DTWTrajShowcase />

          {/* Shape Finder Algorithm */}
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="text-2xl font-light text-gray-900 mb-6 text-center">The Shape Finder Algorithm</h3>
            <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
              Our forecasting approach finds historical patterns similar to the current trajectory and uses their outcomes
              to predict the future. This method is purely autoregressive — it uses only past fatalities, no covariates needed.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="relative w-full rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/academicPapers/methods/Figs/method1.png"
                  alt="Shape Finder methodology step 1"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              <div className="relative w-full rounded-lg overflow-hidden shadow-md">
                <Image
                  src="/academicPapers/methods/Figs/method2.png"
                  alt="Shape Finder methodology step 2"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </div>
                      </div>

          {/* 3D Spatial-Temporal Visualization */}
          <div className="max-w-5xl mx-auto mt-16">
            <h3 className="text-2xl font-light text-gray-900 mb-6 text-center">Spatial-Temporal Pattern Recognition</h3>
            <p className="text-gray-600 mb-8 text-center max-w-3xl mx-auto">
              Each trajectory in this 3D space represents a conflict evolving over time and across geographic coordinates.
              By analyzing these patterns, we can identify when current conflicts follow trajectories similar to historical ones,
              allowing us to forecast likely outcomes based on how similar past patterns unfolded.
            </p>
            <div className="relative w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/academicPapers/methods/Figs/3dShapes.jpg"
                alt="3D visualization of conflict patterns across space and time"
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-4 max-w-3xl mx-auto">
              Conflict trajectories visualized across latitude, longitude, and time dimensions. Similar shapes in this space
              indicate conflicts with comparable spatial-temporal dynamics, regardless of when or where they occurred.
            </p>
                      </div>
        </div>
      </section>

      {/* Data Sources & Processing */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Data Sources & Processing</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto mb-8">
              Our forecasts are built on high-quality, georeferenced conflict data with careful preprocessing to handle
              the unique challenges of violence data.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Primary Data Source</h3>
                <div className="space-y-3 text-gray-600">
                  <p><strong>Uppsala Conflict Data Program (UCDP)</strong></p>
                  <ul className="space-y-1 ml-4">
                    <li>• 1989–2025 (36 years)</li>
                    <li>• Global coverage</li>
                    <li>• Georeferenced incidents</li>
                    <li>• Daily/monthly aggregation</li>
                    <li>• Updated monthly</li>
                  </ul>
                  <p className="text-sm mt-4">
                <a href="https://ucdp.uu.se/" target="_blank" rel="noopener noreferrer" className="text-pace-red hover:underline">Learn more about UCDP →</a>
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-medium text-gray-900 mb-4">Aggregation Levels</h3>
                <div className="space-y-3 text-gray-600">
                  <p><strong>Country-level:</strong> National aggregates</p>
                  <p><strong>Grid-level:</strong> PRIO-GRID cells at 0.5° resolution (~55 km × 55 km at the equator)</p>
                  <p className="text-sm pt-2">
                    The grid-level approach captures sub-national heterogeneity and spatial diffusion patterns
                    that country-level data misses.
                  </p>
                </div>
              </div>
            </div>

                      </div>
        </div>
      </section>

      {/* Rich Covariates for Forecasting */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">What We Feed The Models</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              Beyond past violence, our models ingest diverse signals on population, economy, politics, climate, access, and contagion. Below are examples of the kinds of covariates we use (non‑exhaustive).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Activity size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Conflict history & contagion</h3>
              </div>
              <p className="text-sm text-gray-600">Lagged local fatalities; spatial lags from neighboring cells; distance to most recent events.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Users size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Demography & exposure</h3>
              </div>
              <p className="text-sm text-gray-600">Population density; urban–rural share; distance to capital or major city; settlement proximity.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><TrendingUp size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Economy & prices</h3>
              </div>
              <p className="text-sm text-gray-600">Night‑time lights; food & commodity prices; inflation; GDP per capita; local market activity.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Vote size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Governance & politics</h3>
              </div>
              <p className="text-sm text-gray-600">Election calendar; regime type & constraints; emergency measures; protest restrictions.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><CloudSun size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Climate & environment</h3>
              </div>
              <p className="text-sm text-gray-600">Rainfall anomalies; temperature anomalies; drought indices (e.g., SPEI); vegetation (NDVI).</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Map size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Infrastructure & access</h3>
              </div>
              <p className="text-sm text-gray-600">Road network & travel time; border proximity; remoteness; mobile & internet coverage.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Move size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Displacement & flows</h3>
              </div>
              <p className="text-sm text-gray-600">Refugee/IDP stocks & flows; cross‑border mobility; reception capacity and pressures.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Shield size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Security & armed actors</h3>
              </div>
              <p className="text-sm text-gray-600">Presence of organized groups; known corridors & operating areas; arms trafficking routes.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><ShoppingBag size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Market & livelihoods</h3>
              </div>
              <p className="text-sm text-gray-600">Local food prices; crop/harvest proxies; shocks to household purchasing power.</p>
            </div>
          </div>
                  </div>
      </section>

      {/* Performance & Validation */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Performance & Validation</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto mb-8">
              Our models undergo rigorous out-of-sample testing and real-world validation against leading forecasting systems.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Key Findings</h3>
              <div className="space-y-4 text-gray-600">
                <div className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Pattern Repetition</p>
                    <p className="text-sm">Conflict sequences repeat significantly more than random processes (earthquakes, stock markets, white noise)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Cross-Context Generalization</p>
                    <p className="text-sm">Patterns generalize across regions and decades — similar dynamics emerge in different places and times</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Predictive Power</p>
                    <p className="text-sm">Similar patterns predict similar futures — historical analogues provide actionable forecasts</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-600 font-bold">✓</span>
                  <div>
                    <p className="font-medium text-gray-900">Temporal Information Dominates</p>
                    <p className="text-sm">Autoregressive models (AR) ≈ AR + Covariates {'>>'} Covariates alone — past patterns matter more than structural variables</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Where Our Approach Excels</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-2 text-gray-600">
                  <li>✓ High-intensity conflicts with complex dynamics</li>
                  <li>✓ Situations with substantial trajectory variability</li>
                  <li>✓ Short to medium-term horizons (1-6 months)</li>
                </ul>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Capturing escalation and de-escalation patterns</li>
                  <li>✓ Identifying turning points and regime shifts</li>
                  <li>✓ Providing interpretable historical analogues</li>
                </ul>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Limitations & Forecast Ceiling</h3>
              <p className="text-gray-600 mb-4">
                No forecasting system is perfect. Research across multiple projects suggests an <strong>80-85% accuracy ceiling</strong> for conflict forecasting due to:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <ul className="space-y-1">
                  <li>• Data measurement error and reporting bias</li>
                  <li>• Quasi-random structural error (complex systems)</li>
                  <li>• Rational randomness (strategic unpredictability)</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Arational randomness (free will, idiosyncratic factors)</li>
                  <li>• Effective policy response (successful prevention)</li>
                  <li>• Unpredictable exogenous shocks</li>
                </ul>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                See: <a href="https://doi.org/10.1080/03050629.2018.1441003" target="_blank" rel="noopener noreferrer" className="text-clairient-blue hover:underline">Schrodt (2018)</a> on irreducible sources of error
              </p>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Validation results from: <a href="https://doi.org/10.1177/00223433231206836" target="_blank" rel="noopener noreferrer" className="text-clairient-blue hover:underline">Hegre et al. (2024)</a> |
                <a href="https://doi.org/10.1177/00223433241234567" target="_blank" rel="noopener noreferrer" className="text-clairient-blue hover:underline ml-2">Schincariol, Frank & Chadefaux (2025)</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Applications & Use Cases */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Applications Beyond Conflict</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              Our pattern recognition methods extend to other domains with temporal dynamics.
            </p>
          </div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Protest Dynamics</h3>
              <p className="text-sm text-gray-600 mb-3">
                Pattern-based forecasting of protest escalation and transitions to violence. Patterns generalize across contexts.
              </p>
              <p className="text-xs text-gray-500">Schincariol & Chadefaux (2025)</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Migration Flows</h3>
              <p className="text-sm text-gray-600 mb-3">
                Time-series forecasting of displacement and refugee movements using historical pattern matching.
              </p>
              <p className="text-xs text-gray-500">Schincariol & Chadefaux (2024)</p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Humanitarian Early Warning</h3>
              <p className="text-sm text-gray-600 mb-3">
                Anticipate humanitarian needs based on predicted conflict trajectories and displacement patterns.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Diplomatic Planning</h3>
              <p className="text-sm text-gray-600 mb-3">
                Identify windows of opportunity for intervention based on pattern-informed forecasts of escalation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Resource Allocation</h3>
              <p className="text-sm text-gray-600 mb-3">
                Deploy peacekeeping forces, humanitarian resources, and preventive diplomacy where and when most needed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Risk Assessment</h3>
              <p className="text-sm text-gray-600 mb-3">
                Provide business, NGO, and government stakeholders with actionable forecasts for operational planning.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/forecasts" className="inline-flex items-center gap-2 px-6 py-3 bg-clairient-blue text-white rounded-lg hover:bg-blue-700 transition-colors">
              Explore Our Forecasts
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Forecast Demo (Grid-level map) */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Live Global Risk Intelligence
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Real-time conflict forecasts powered by our machine learning models
            </p>
          </div>
          
          <div className="mb-12">
            <PrioGridMap period={snap.period} activeView="grid" />
          </div>
          
          <div className="text-center space-x-6">
            <Link href="/forecasts" className="text-link">
              View our forecasts
            </Link>
            <Link href="/publications" className="text-link">
              View our publications
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}
