import { Target, Award, TrendingUp, Users } from 'lucide-react'
import companyData from '@/content/company.json'

export default function About() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About {companyData.name}
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {companyData.description}
            </p>
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-8">
                {companyData.mission}
              </p>
              <div className="bg-clairient-blue/10 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-clairient-blue mb-3">
                  Why {companyData.name}?
                </h3>
                <p className="text-gray-700">
                  The name <strong>Clarint</strong> is derived from <em>"clair"</em> (clear/clarity) and <em>"int"</em> (intelligence). 
                  It captures our central promise: <strong>clarity through intelligence.</strong>
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-clairient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Lead Time</h3>
                <p className="text-sm text-gray-600">Weeks to months of early warning</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-clairient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Transparency</h3>
                <p className="text-sm text-gray-600">Explainable AI with confidence scores</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-clairient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Customizable</h3>
                <p className="text-sm text-gray-600">Tailored by geography, event type, and horizon</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
                <div className="w-12 h-12 bg-clairient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-white" size={24} />
                </div>
                <h3 className="font-semibold mb-2">Research-Backed</h3>
                <p className="text-sm text-gray-600">Academic rigor meets real-world focus</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Positioning */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading">Strategic Positioning</h2>
            <p className="section-subheading mx-auto">
              Clarint operates at the intersection of three fast-converging domains
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4 text-clairient-blue">
                Quantitative Conflict Forecasting
              </h3>
              <p className="text-gray-600 mb-4">
                Advanced predictive modeling using machine learning to forecast geopolitical events 
                and civil unrest with unprecedented accuracy.
              </p>
              <p className="text-sm text-gray-500">
                Similar to: ViEWS, ICEWS
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4 text-clairient-blue">
                Operational Risk Monitoring
              </h3>
              <p className="text-gray-600 mb-4">
                Real-time threat detection and monitoring systems that provide actionable 
                intelligence for operational decision-making.
              </p>
              <p className="text-sm text-gray-500">
                Similar to: CORE by Control Risks, Dataminr
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm border">
              <h3 className="text-xl font-semibold mb-4 text-clairient-blue">
                Geopolitical ESG Intelligence
              </h3>
              <p className="text-gray-600 mb-4">
                ESG-aligned screening and sustainability metrics that incorporate 
                conflict-sensitive analysis for responsible investment.
              </p>
              <p className="text-sm text-gray-500">
                Similar to: Verisk Maplecroft, S&P ESG
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-clairient-blue text-white p-8 rounded-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold mb-4">Our Differentiation</h3>
              <p className="text-blue-100">
                <strong>Model-based foresight, client-specific exposure integration, and explainability</strong> — 
                positioning Clarint as a core infrastructure layer for global risk anticipation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-heading">Our Roadmap</h2>
            <p className="section-subheading mx-auto">
              Building the forecasting layer for a more anticipatory world
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-clairient-blue rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2">Launch Clarint Core</h3>
                <p className="text-gray-600">
                  Deploy our forecast dashboard and API MVP, providing foundational predictive intelligence capabilities.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-clairient-blue rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2">Develop Exposure Engine</h3>
                <p className="text-gray-600">
                  Build firm-level modeling capabilities linked to global forecasts, enabling precise risk assessment.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-clairient-blue rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2">Performance Benchmarking</h3>
                <p className="text-gray-600">
                  Conduct comprehensive performance tests against leading commercial providers to validate our models.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-clairient-blue rounded-full flex items-center justify-center text-white font-bold">
                4
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-semibold mb-2">Early Client Pilots</h3>
                <p className="text-gray-600">
                  Launch pilot programs with asset managers, insurers, and NGOs to refine our offerings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="py-20 bg-clairient-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            The Future of Risk Intelligence
          </h2>
          <p className="text-xl text-blue-100 max-w-4xl mx-auto">
            As volatility, climate stress, and political risk reshape global operating conditions, 
            institutions need not just data—but foresight. Clarint delivers that foresight, 
            transforming uncertainty into strategic advantage.
          </p>
        </div>
      </section>
    </>
  )
}