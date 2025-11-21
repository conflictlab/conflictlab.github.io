import Breadcrumbs from '@/components/Breadcrumbs'

export default function ProjectSummaryPage() {
  return (
    <>
      <section className="pt-10 pb-6 md:pt-12 md:pb-8 bg-white border-b border-gray-200">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">PaCE — Project Summary</h1>
          <p className="text-gray-600">Patterns of Conflict Emergence</p>
        </div>
      </section>

      <section className="py-8 bg-white print:py-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 print:px-8 print:py-8">
          {/* Key facts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-2">Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                PaCE (Patterns of Conflict Emergence) is a five‑year ERC‑funded research project (2022–26) at Trinity College Dublin. The lab
                develops transparent, data‑driven methods to identify recurring patterns preceding conflict and forecast geopolitical risk at
                country and sub‑national levels.
              </p>
            </div>
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-2">Fast Facts</h2>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Coverage: 180+ countries and 259,000 sub‑national areas</li>
                <li>Horizon: up to 6 months ahead</li>
                <li>Cadence: monthly updates</li>
                <li>Affiliation: Trinity College Dublin (Political Science)</li>
                <li>Funding: ERC (Grant 101002240)</li>
              </ul>
            </div>
          </div>

          {/* Timeline & affiliations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-2">Timeline</h2>
              <ul className="list-disc ml-5 text-gray-700 space-y-1">
                <li>Project period: 2022–2026</li>
                <li>Monthly forecast releases</li>
                <li>Methodological updates as preprints and publications</li>
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-light text-gray-900 mb-2">Affiliations</h2>
              <p className="text-gray-700">Department of Political Science, Trinity College Dublin</p>
              <div className="mt-3 flex items-center gap-4">
                <img src="/logos/logo.png" alt="PaCE" className="h-10 object-contain" />
                <img src="/logos/erc-logo.png" alt="ERC" className="h-12 object-contain" />
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="mb-8">
            <h2 className="text-xl font-light text-gray-900 mb-2">Attribution</h2>
            <p className="text-gray-700">
              This project has received funding from the European Research Council (ERC) under the European Union’s Horizon 2020 research
              and innovation programme (Grant agreement no: 101002240). Use the ERC logo alongside this text on press materials
              mentioning project funding.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-xl font-light text-gray-900 mb-2">Contact</h2>
            <p className="text-gray-700">Press: <a href="mailto:info@forecastlab.org" className="text-link">info@forecastlab.org</a></p>
            <p className="text-gray-500 text-sm">Response time: 2–3 business days · Time zone: Europe/Dublin</p>
          </div>
        </div>
      </section>

      {/* Print-specific CSS removed to avoid styled-jsx in a Server Component. 
          If you want print styles, I can move them to globals.css safely. */}
    </>
  )
}
