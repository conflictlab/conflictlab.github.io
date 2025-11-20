import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function DisseminationPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Dissemination
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Workshops, presentations, and conferences where the <span className="word-emphasis">PaCE Research Lab</span> shares its findings.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Navigation */}
          <div className="mb-12 pb-6 border-b border-gray-200">
            <nav className="flex space-x-6 text-lg">
              <a href="#workshops" className="text-pace-red hover:text-pace-red-dark">
                Workshops
              </a>
              <span className="text-gray-400">/</span>
              <a href="#presentations" className="text-pace-red hover:text-pace-red-dark">
                Presentations
              </a>
            </nav>
          </div>

          {/* Workshops Section */}
          <div className="mb-16">
            <h2 id="workshops" className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Workshops
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Conflict Forecasting Workshop */}
              <Link href="/workshops/conflict-forecasting-2024" className="group">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/workshop1.jpeg"
                      alt="Conflict Forecasting Workshop"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">2024</p>
                    <h3 className="text-lg font-light text-gray-900 mb-2 group-hover:text-pace-red transition-colors">
                      Conflict Forecasting Workshop: Methodological Innovations, Data Opportunities, and Policy Relevance
                    </h3>
                    <p className="text-sm text-gray-600">Trinity College Dublin, Ireland</p>
                  </div>
                </div>
              </Link>

              {/* November 2024 Workshop */}
              <Link href="/workshops/sensitivity-analysis-2024" className="group">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/PaCE Workshops November 2024_jfif.jpeg"
                      alt="Sensitivity Analysis Workshop"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">4 November 2024</p>
                    <h3 className="text-lg font-light text-gray-900 mb-2 group-hover:text-pace-red transition-colors">
                      Sensitivity Analysis of Determinants of Conflict Onset
                    </h3>
                    <p className="text-sm text-gray-600">Trinity College Dublin, Ireland</p>
                  </div>
                </div>
              </Link>

              {/* January 2024 Seminar */}
              <Link href="/workshops/hierarchical-hurdle-2024" className="group">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/Cornelius Fritz.jpg"
                      alt="Dr Cornelius Fritz"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">31 January 2024</p>
                    <h3 className="text-lg font-light text-gray-900 mb-2 group-hover:text-pace-red transition-colors">
                      Three-stage Hierarchical Hurdle Count Model for Conflict Forecasting
                    </h3>
                    <p className="text-sm text-gray-600">Trinity College Dublin, Ireland</p>
                  </div>
                </div>
              </Link>

              {/* March 2023 Seminar */}
              <Link href="/workshops/social-science-forecasting-2023" className="group">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                  <div className="relative h-48 w-full">
                    <Image
                      src="/Galit Shmueli NTHU 2020 Small.jpeg"
                      alt="Professor Galit Shmueli"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-2">21 March 2023</p>
                    <h3 className="text-lg font-light text-gray-900 mb-2 group-hover:text-pace-red transition-colors">
                      Advances in Social Science Forecasting
                    </h3>
                    <p className="text-sm text-gray-600">Trinity College Dublin, Ireland</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Presentations */}
          <div className="mb-16">
            <h2 id="presentations" className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Presentations
            </h2>

            {/* 2025 Presentations */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-gray-900 mb-6">2025</h3>
              <div className="space-y-6">
                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">October 2025</p>
                  <p className="text-gray-900 font-light mb-1">Jungmin Han</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Rebel Governance, State Atrocities, and Public Opinion on Military Intervention</span></p>
                  <p className="text-gray-600 text-sm">BISA-ISA Joint International Conference 2025, Newcastle, UK</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">October 2025</p>
                  <p className="text-gray-900 font-light mb-1">Jungmin Han</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">The Dynamics of Competitive Intervention: Multiplicity, Rivalry, and Civil War Duration</span></p>
                  <p className="text-gray-600 text-sm">BISA-ISA Joint International Conference 2025, Newcastle, UK</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">September 2025</p>
                  <p className="text-gray-900 font-light mb-1">Jungmin Han</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">The International Landscape of Peace: How Third-Party Interactions Shape Public Opinion on Rapprochement</span></p>
                  <p className="text-gray-600 text-sm">Seoul Workshop for Empirical Research in Politics, Seoul, South Korea (online)</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">June 2025</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Schincariol</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">The Geometry of Conflict: 3D Spatio-Temporal Patterns in Fatalities Prediction</span></p>
                  <p className="text-gray-600 text-sm">Jan Tinbergen European Peace Science Conference, Barcelona, Spain</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">June 2025</p>
                  <p className="text-gray-900 font-light mb-1">Jungmin Han</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Being Hawkish, To Be Democratic</span></p>
                  <p className="text-gray-600 text-sm">British International Studies Association (BISA) Annual Conference, Belfast</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">May 2025</p>
                  <p className="text-gray-900 font-light mb-1">Jungmin Han</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Patterns of Cooperation and Public Opinion on Rapprochement</span></p>
                  <p className="text-gray-600 text-sm">International Meeting on Experimental and Behavioral Social Sciences (IMEBESS), Valencia, Spain</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">March 2025</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Anticipating Conflict Onsets: Evidence From A Two-Staged Model</span></p>
                  <p className="text-gray-600 text-sm">The Annual Conference of International Studies Association (ISA), Chicago, USA</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">March 2025</p>
                  <p className="text-gray-900 font-light mb-1">Jungmin Han</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Being Hawkish, To Be Democratic</span></p>
                  <p className="text-gray-600 text-sm">The Annual Conference of International Studies Association (ISA), Chicago, USA</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">January 2025</p>
                  <p className="text-gray-900 font-light mb-1">Junjie Liu</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">NeutraSum: A language Model Can Help a Balanced Media Diet by Neutralizing News Summaries</span></p>
                  <p className="text-gray-600 text-sm">The Southern Political Science Association Annual Meeting (SPSA), San Juan, Puerto Rico</p>
                </div>
              </div>
            </div>

            {/* 2024 Presentations */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-gray-900 mb-6">2024</h3>
              <div className="space-y-6">
                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">September 2024</p>
                  <p className="text-gray-900 font-light mb-1">Jungmin Han</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Democratic Imprints from Abroad: How External Support from Democracies Can Promote Rebel Elections in Civil Wars</span></p>
                  <p className="text-gray-600 text-sm">The Annual Conference of American Political Science Association (APSA), Philadelphia, USA</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">September 2024</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">New Avenues for Validating Civil Conflict Theory: A Case for Interpretable Machine Learning</span></p>
                  <p className="text-gray-600 text-sm">Annual Conference of the Conflict Research Society (CRS), Edinburgh, Scotland, United Kingdom</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">August 2024</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank & Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">From Protests to Fatalities: Predicting Civil Conflict Escalation Using Protest Sequences / Patterns of Contention: The Role of Protest Sequences in Civil Conflict Escalation</span></p>
                  <p className="text-gray-600 text-sm">General Conference of the European Consortium for Political Research (ECPR), Dublin, Ireland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">July 2024</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank & Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Patterns of Contention: The Role of Protest Sequences in Civil Conflict Escalation</span></p>
                  <p className="text-gray-600 text-sm">Annual Conference of European Political Science Association (ESPA), Cologne, Germany</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">June 2024</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Structural and Procedural Theories on the Causes of Civil Conflict</span></p>
                  <p className="text-gray-600 text-sm">Jan Tinbergen European Peace Science Conference Program, Dublin City University, Ireland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">June 2024</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Patterns of Contention: the Role of Protest Sequences in Civil Conflict Escalation</span></p>
                  <p className="text-gray-600 text-sm">Jan Tinbergen European Peace Science Conference Program, Dublin City University, Ireland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">April 2024</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Chadefaux & Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Mapping Peace and Conflict Research in Ireland</span></p>
                  <p className="text-gray-600 text-sm">University College Dublin and the Department of Foreign Affairs, Dublin, Ireland</p>
                </div>
              </div>
            </div>

            {/* 2023 Presentations */}
            <div className="mb-12">
              <h3 className="text-2xl font-light text-gray-900 mb-6">2023</h3>
              <div className="space-y-6">
                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">October 2023</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Artificial Intelligence and Conflict Forecasting</span></p>
                  <p className="text-gray-600 text-sm">DCU International Relations Society, Dublin City University, Ireland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">October 2023</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank, Thomas Schincariol, Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Deep Learning and Machine Learning: Temporal patterns in conflict prediction - an improved shape-based approach</span></p>
                  <p className="text-gray-600 text-sm">VIEWS Prediction Competition Workshop, Berlin, Germany</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">October 2023</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Why do rebel groups target civilians in some cases, and not in others?</span></p>
                  <p className="text-gray-600 text-sm">CCEW SYMPOSIUM 2023 Crisis Early Warning: What&apos;s Next? Center for Crisis Early Warning (CCEW), University of the Bundeswehr Munich, Germany</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">September 2023</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">From Protests to Fatalities: The Role of Temporal Sequences in Civil Conflict Transitions</span></p>
                  <p className="text-gray-600 text-sm">Workshop on Conflict Dynamics, University of York, United Kingdom</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">August 2023</p>
                  <p className="text-gray-900 font-light mb-1">Jian Cao</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Dynamic Synthetic Controls: Accounting for Varying Speeds in Comparative Case Studies</span></p>
                  <p className="text-gray-600 text-sm">American Political Science Association Annual Meeting & Exhibition, Los Angeles, USA</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">July 2023</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Schincariol</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Leveraging Temporal Patterns in Forecasting Application in Human Migration Flow</span></p>
                  <p className="text-gray-600 text-sm">International conference on Time Series and Forecasting, Gran Canaria, Spain</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">June 2023</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Temporal Patterns in Protest Events</span></p>
                  <p className="text-gray-600 text-sm">European Political Science Association 13th Annual Conference, Glasgow, Scotland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">May 2023</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Artificial Intelligence and Conflict Forecasting</span></p>
                  <p className="text-gray-600 text-sm">Department of Foreign Affairs, Ireland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">May 2023</p>
                  <p className="text-gray-900 font-light mb-1">Yohan Park</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Trade Dispute and Foreign Direct Investment</span></p>
                  <p className="text-gray-600 text-sm">The Political Economy of International Organisation, San Diego, USA</p>
                </div>
              </div>
            </div>

            {/* 2022 Presentations */}
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-6">2022</h3>
              <div className="space-y-6">
                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">December 2022</p>
                  <p className="text-gray-900 font-light mb-1">Hannah Frank</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Temporal Patterns in Protest Events</span></p>
                  <p className="text-gray-600 text-sm">PSAI Postgraduate Conference, Queens University, Belfast, Northern Ireland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">August 2022</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Patterns of Conflict Emergence</span></p>
                  <p className="text-gray-600 text-sm">Crans Montana Forum, Switzerland</p>
                </div>

                <div className="border-l-2 border-clairient-blue pl-4">
                  <p className="text-sm text-gray-600 mb-1">July 2022</p>
                  <p className="text-gray-900 font-light mb-1">Thomas Chadefaux</p>
                  <p className="text-gray-900 mb-1"><span className="font-light">Patterns of Conflict Emergence</span></p>
                  <p className="text-gray-600 text-sm">Computational Conflict Research: Charting the Paths Ahead, Munich, Germany</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              The views, thoughts, and opinions expressed belong solely to the speakers and do not necessarily reflect the views of their employers or organizations.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
