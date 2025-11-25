'use client'

import { Database, Zap, GitCompare, TrendingUp, CheckCircle } from 'lucide-react'

export default function MethodologyFlowchart() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="relative">
        {/* Main flow container */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">

          {/* Step 1: Data Collection */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:border-gray-400 transition-all">
              <div className="w-16 h-16 bg-pace-red rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Collection</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                UCDP conflict events, 1989–present, aggregated to countries & 0.5° grid cells
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 2: Feature Engineering */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:border-gray-400 transition-all">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Engineering</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Extract covariates: demographics, climate, economy, governance, spatial lags
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 3: Pattern Matching */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:border-gray-400 transition-all">
              <div className="w-16 h-16 bg-pace-red rounded-full flex items-center justify-center mb-4">
                <GitCompare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pattern Matching</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                DTW finds similar historical trajectories
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 4: Forecast Generation */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:border-gray-400 transition-all">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Forecast Generation</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Cluster futures and compute centroid for 1–6 month predictions
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 5: Validation */}
          <div className="relative">
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:border-gray-400 transition-all">
              <div className="w-16 h-16 bg-pace-red rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Out-of-sample testing and real-world performance monitoring
              </p>
            </div>
          </div>
        </div>

        

              </div>
    </div>
  )
}
