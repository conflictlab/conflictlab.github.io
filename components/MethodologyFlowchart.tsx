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
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Collection</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                UCDP conflict events, 1989–present, aggregated to countries & 0.5° grid cells
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 2: Feature Engineering */}
          <div className="relative">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Engineering</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Extract covariates: demographics, climate, economy, governance, spatial lags
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 3: Pattern Matching */}
          <div className="relative">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                <GitCompare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pattern Matching</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                DTW algorithm finds ~20 similar historical trajectories
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 4: Forecast Generation */}
          <div className="relative">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Forecast Generation</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Cluster futures and compute centroid for 1–6 month predictions
              </p>
            </div>
            {/* Arrow for desktop */}
            <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            {/* Arrow for mobile */}
            <div className="md:hidden flex justify-center py-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-gray-400 transform rotate-90">
                <path d="M5 12h14m0 0l-6-6m6 6l-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Step 5: Validation */}
          <div className="relative">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-300 rounded-xl p-6 h-full flex flex-col items-center text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Out-of-sample testing and real-world performance monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Detailed description below */}
        <div className="mt-12 bg-white border-2 border-gray-200 rounded-xl p-6 shadow-md">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Core Innovation: Shape-Based Forecasting</h3>
          <p className="text-gray-700 leading-relaxed text-center max-w-4xl mx-auto">
            Unlike traditional models that rely heavily on structural covariates, our approach recognizes that
            <span className="font-semibold text-gray-900"> conflict dynamics follow recurring temporal patterns</span>.
            By identifying historical trajectories similar to current conditions using Dynamic Time Warping (DTW),
            we can forecast future developments with high accuracy—even in the absence of extensive covariate data.
            This temporal-first approach captures escalation, de-escalation, and regime shifts that purely structural models miss.
          </p>
        </div>

        {/* Key metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">36 years</div>
            <p className="text-sm text-gray-700">Historical data (1989–2025)</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">259,200</div>
            <p className="text-sm text-gray-700">Grid cells monitored globally</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">6 months</div>
            <p className="text-sm text-gray-700">Forecast horizon with monthly updates</p>
          </div>
        </div>
      </div>
    </div>
  )
}
