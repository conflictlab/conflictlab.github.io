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

            <div className="space-y-12">
              {/* Conflict Forecasting Workshop */}
              <div>
                <div className="border border-gray-200 rounded-lg p-8 bg-white">
                  <p className="text-sm text-gray-600 mb-2">2024</p>
                  <h3 className="text-2xl font-light text-gray-900 mb-6">
                    Conflict Forecasting Workshop: Methodological Innovations, Data Opportunities, and Policy Relevance
                  </h3>

                  {/* Top Banner - 3 photos side by side */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    <Image src="/workshop1.jpeg" alt="Conflict Forecasting Workshop" width={640} height={384} className="w-full h-48 object-cover rounded-lg" />
                    <Image src="/workshop2.jpg" alt="Conflict Forecasting Workshop" width={640} height={384} className="w-full h-48 object-cover rounded-lg" />
                    <Image src="/workshop3.jpeg" alt="Conflict Forecasting Workshop" width={640} height={384} className="w-full h-48 object-cover rounded-lg" />
                  </div>

                  <div className="mb-6">
                    <Link href="#" className="text-pace-red hover:text-pace-red-dark underline">
                      Workshop Programme
                    </Link>
                  </div>

                  <div className="space-y-6 text-gray-600">
                    <div>
                      <h4 className="text-lg font-light text-gray-900 mb-3">Background on Conflict Forecasting</h4>
                      <p className="leading-relaxed">
                        Conflict forecasting has evolved significantly over recent years, spurred by advancements in statistical modeling, machine learning, and the growing availability of data. Traditionally, statistical and ML approaches have been central in predicting the likelihood, intensity, and duration of conflicts. These models often rely on historical data, socio-political indicators, and increasingly, real-time data streams, to anticipate conflict scenarios.
                      </p>
                      <p className="leading-relaxed mt-4">
                        Parallel to these developments, theoretical frameworks such as game theory have offered insights into the strategic interactions among conflict actors, providing a understanding of conflict dynamics. Another very successful approach relies on the &ldquo;wisdom of crowds,&rdquo; where collective judgment and prediction markets are used to forecast conflicts, capitalizing on the diverse opinions of a large group of individuals.
                      </p>
                      <p className="leading-relaxed mt-4">
                        The surge in data availability, including social media feeds, satellite imagery, and real-time reporting, presents both opportunities and challenges for conflict forecasting. This workshop explored these various approaches, and investigated how they can be integrated and leveraged to enhance the accuracy and usefulness of conflict forecasts.
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-light text-gray-900 mb-3">Objectives of the Workshop</h4>
                      <ul className="list-disc list-inside space-y-2 leading-relaxed">
                        <li><span className="font-light text-gray-900">Showcase recent research:</span> highlight cutting-edge research in conflict forecasting, focusing on both methodological advancements and innovative data use. This includes exploring, among others, statistical models, ML algorithms, game theory applications, and crowd-sourced predictions.</li>
                        <li><span className="font-light text-gray-900">Explore data-driven opportunities:</span> examine the impact of the increasing availability of diverse data sources on conflict forecasting, discuss how to effectively harness this data while addressing challenges like data reliability and ethical considerations.</li>
                        <li><span className="font-light text-gray-900">Consider policy implications:</span> the workshop included a focus on how these academic advancements can be translated into practical tools and insights for policy-making. This includes discussions on how forecasting models can inform conflict prevention, response strategies, and policy formulation.</li>
                        <li><span className="font-light text-gray-900">Foster collaboration:</span> create a place for researchers to collaborate, share ideas, and potentially form partnerships for future research endeavors.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-lg font-light text-gray-900 mb-3">Format</h4>
                      <p className="leading-relaxed">
                        The workshop featured paper presentations organized in panels. Each session was followed by a Q&A segment, encouraging active participation and exchange of ideas.
                      </p>
                    </div>
                  </div>

                  {/* Bottom Banner - Photo maintaining aspect ratio */}
                  <div className="mt-6 flex justify-center">
                    <img
                      src="/workshop4.jpeg"
                      alt="Conflict Forecasting Workshop"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Workshops */}
              <div className="space-y-8">
                {/* November 2024 */}
                <article className="border border-gray-200 rounded-lg p-6 bg-white">
                  <p className="text-sm text-gray-600 mb-2">4 November 2024</p>
                  <h3 className="text-xl font-light text-gray-900 mb-4">
                    Guest Workshop: Sensitivity Analysis of Determinants of Conflict Onset
                  </h3>
                  <div className="flex justify-center mb-4">
                    <img
                      src="/PaCE Workshops November 2024_jfif.jpeg"
                      alt="PaCE Workshop November 2024"
                      className="w-1/3 h-auto rounded-lg"
                    />
                  </div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-light">Speakers:</span> Sverke R. Saxegaard & Eric G. E. Nilsen, PhD Research Fellows, Department of Political Science, University of Oslo, Norway
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    What country-characteristics are robustly correlated with intrastate conflict onset? Numerous studies have over the last three decades sought to establish the determinants of intrastate conflict. In 2006, Hegre and Sambanis showed that a number of these findings were not robust. Since then, new studies have identified altogether new variables that ostensibly are determinants of intrastate conflict onset. Moreover, contemporary civil conflict has been described as fundamentally different than before, begging the question of whether their determinants are also different. This paper takes stock of the last twenty years of quantitative research on the determinants of intrastate conflict onset, by conducting a systematic sensitivity analysis of 144 individual variables. The results of the approximately 18 million regression models indicate that a vast majority of established patterns and relationships in the literature are not robust to model specifications.
                  </p>
                </article>

                {/* January 2024 */}
                <article className="border border-gray-200 rounded-lg p-6 bg-white">
                  <p className="text-sm text-gray-600 mb-2">31 January 2024</p>
                  <h3 className="text-xl font-light text-gray-900 mb-4">
                    Guest Seminar: Three-stage Hierarchical Hurdle Count Model for Conflict Forecasting
                  </h3>
                  <div className="flex justify-center mb-4">
                    <img
                      src="/Cornelius Fritz.jpg"
                      alt="Dr Cornelius Fritz"
                      className="w-1/3 h-auto rounded-lg"
                    />
                  </div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-light">Speaker:</span> Dr Cornelius Fritz
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    In my research, I use statistics to learn from network data to answer questions posed within the social sciences in uncertain and changing environments. My research mainly originates from multidisciplinary collaborations with social scientists approaching me with data and questions revolving around networks. As a statistician, I operate in two worlds: the real world, which encompasses observed data with all its imperfections and substantive knowledge of the subject matter, and the model world, which is an artificial representation of the real world characterized by a stochastic model. I develop novel data analysis techniques by combining statistical and machine learning with substantive theory to bridge the gap between the real and model world.
                  </p>
                </article>

                {/* March 2023 */}
                <article className="border border-gray-200 rounded-lg p-6 bg-white">
                  <p className="text-sm text-gray-600 mb-2">21 March 2023</p>
                  <h3 className="text-xl font-light text-gray-900 mb-4">
                    Advances in Social Science Forecasting
                  </h3>
                  <div className="flex justify-center mb-4">
                    <img
                      src="/Galit Shmueli NTHU 2020 Small.jpeg"
                      alt="Professor Galit Shmueli"
                      className="w-1/3 h-auto rounded-lg"
                    />
                  </div>
                  <p className="text-gray-600 mb-2">
                    <span className="font-light">Speaker:</span> Professor Galit Shmueli
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    <span className="font-light">Topic:</span> &ldquo;Forks over knives: Predictive inconsistency in criminal justice algorithmic risk assessment tools.&rdquo;
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-2">
                    Big data and algorithmic risk prediction tools promise to improve criminal justice systems by reducing human biases and inconsistencies in decision-making. Yet different, equally justifiable choices when developing, testing and deploying these socio-technical tools can lead to disparate predicted risk scores for the same individual. In this talk Prof. Galit Shmueli explored the challenges of &lsquo;predictive inconsistency&rsquo;, arguing that in a diverse and pluralistic society we should not expect to completely eliminate predictive inconsistency, but identify and document reasonable &lsquo;forking paths&rsquo;.
                  </p>
                </article>
              </div>
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
