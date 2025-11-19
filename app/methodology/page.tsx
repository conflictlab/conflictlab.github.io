import Link from 'next/link'
import PrioGridAnimation from '@/components/PrioGridAnimation'
import dynamic from 'next/dynamic'
import { readSnapshot } from '@/lib/forecasts'
import { Activity, Users, TrendingUp, Vote, CloudSun, Map, Move, Shield, ShoppingBag } from 'lucide-react'

const PrioGridMap = dynamic(() => import('@/components/PrioGridMap'), { ssr: false })
const DTWTrajShowcase = dynamic(() => import('@/components/DTWTrajShowcase'), { ssr: false })

export default async function Methodology() {
  const snap = readSnapshot('latest')
  return (
    <>
      {/* Hero Section */}
      <section className="pt-12 pb-8 md:pt-16 md:pb-10 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4 leading-tight">
            Methodology
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            <span className="word-emphasis">Machine learning models</span> that forecast geopolitical conflict and civil unrest. 
            Built for precision, transparency, and integration with existing systems.
          </p>
        </div>
      </section>

      {/* Removed animation section */}

      {/* PRIO-GRID Diffusion Model */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              <span className="word-emphasis">Conflict Diffusion</span> Modeling
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
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Pattern Discovery & Time‑Series AI</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              We mine sequences for structure — motifs, anomalies, regime shifts — and learn compact embeddings that capture
              the shape and momentum of real‑world dynamics. Clustering similar trajectories and aligning asynchronous signals
              lets us surface recurring signatures, spot emerging look‑alikes, and rank what matters most — fast.
            </p>
          </div>
          <DTWTrajShowcase />
        </div>
      </section>

      {/* Rich Covariates for Forecasting */}
      <section className="py-24 bg-white">
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

      {/* Live Forecast Demo (Grid-level map) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Live <span className="word-highlight" data-text="Global Risk Intelligence"><span className="typing-text">Global Risk Intelligence</span></span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Real-time conflict forecasts powered by our machine learning models
            </p>
          </div>
          
          <div className="mb-12">
            <PrioGridMap period={snap.period} activeView="grid" />
          </div>
          
          <div className="text-center">
            <Link href="/forecasts" className="text-link">
              View our forecasts
            </Link>
          </div>
        </div>
      </section>

    </>
  )
}
