import Breadcrumbs from '@/components/Breadcrumbs'
import Link from 'next/link'
import Image from 'next/image'

export default function About() {
  return (
    <>
      {/* Hero Section with Navigation */}
      <section className="pt-10 pb-6 md:pt-12 md:pb-8 hero-background-network-image border-b border-gray-200">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Logo + title inline, no background circle */}
          <div className="mb-4">
            <div className="flex items-center gap-4">
              <Image
                src="/logos/logo.png"
                alt="PaCE logo"
                width={72}
                height={72}
                priority
                className="h-14 md:h-16 w-auto"
              />
              <h1 className="text-3xl md:text-5xl font-light text-gray-900 leading-tight">
                Patterns of Conflict Emergence
              </h1>
            </div>
            <p className="mt-2 text-xl text-gray-600 font-light leading-relaxed">
              Learn more about the PaCE project and research focus.
            </p>
          </div>

          {/* Quick links (buttons) */}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/about#pace" className="btn-secondary inline-flex items-center justify-center">About Pace</Link>
            <Link href="/about/team" className="btn-secondary inline-flex items-center justify-center">Team</Link>
            <Link href="/contact" className="btn-secondary inline-flex items-center justify-center">Contact</Link>
          </div>
        </div>
      </section>

      {/* PaCE Section */}
      <section id="pace" className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-gray-900 mb-2 border-b border-gray-200 pb-2">PaCE</h2>
          <p className="text-lg text-gray-700 mb-6">Patterns of Conflict Emergence</p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              PaCE (Patterns of Conflict Emergence) is a five-year European Research Council (ERC) funded project (2022–26),
              based in the Department of Political Science at Trinity College Dublin. The project aims to uncover recurring
              patterns and temporal sequences in the run-up to war and conflict and, through the use of machine-learning methods,
              provide tools to forecast interstate and civil wars using a range of data from financial markets, news articles,
              diplomatic documents, and satellite imagery.
            </p>

            <h3 className="text-2xl font-light text-gray-900 mt-10 mb-3">Background to the Research</h3>
            <p>
              There have been more than 200 wars since the start of the 20th century, leading to 35 million battle deaths and
              countless more civilian casualties. Large-scale political violence still kills hundreds every day across the world.
              International conflicts and civil wars also lead to forced migration, disastrous economic consequences, weakened
              political systems, and poverty. The recurrence of wars despite their tremendous economic, social, and institutional
              costs may suggest that we are doomed to repeat the errors of the past. Does history indeed repeat itself? Are there
              particular temporal patterns in the build-up to the onset of wars? Would better understanding of these patterns help
              us to avoid such conflicts?
            </p>
            <p>
              Recent advances overcoming methodological and data barriers present an opportunity to identify these recurrences
              empirically and to examine whether these patterns can be classified to improve forecasts and inform theories of
              conflict. Just as DNA sequencing has been critical to medical diagnoses, PaCE aims to diagnose international politics
              by uncovering the relevant patterns around conflict. The project aims to uncover, cluster, and classify such patterns
              in meaningful ways to help us improve future forecasts.
            </p>

            <h3 className="text-2xl font-light text-gray-900 mt-10 mb-3">Research Focus</h3>
            <p>
              Our research team is investigating a wide range of data, exploring financial, migration, protest, and climate
              patterns. Certain indicators may follow a typical path — a motif — prior to conflict events (whether inter- or
              intra-state). Are the variables associated with conflict chaotic and therefore inherently unpredictable? Using novel
              methods in social sciences, we search for patterns in the observable actions that international leaders and actors
              take prior to conflict events, as well as in their perceptions. This work spans multiple levels of temporal
              resolution — the minute, the month, the year — and uses original data on financial assets, news articles, and
              diplomatic cables.
            </p>

            <div className="mt-8 text-sm text-gray-600">
              <p>
                Funding: This project has received funding from the European Research Council (ERC) under the European Union’s
                Horizon 2020 research and innovation programme (Grant agreement no: 101002240).
              </p>
              <div className="mt-3">
                <Image src="/logos/erc-logo.png" alt="European Research Council" width={520} height={240} className="h-32 md:h-40 w-auto" />
              </div>
            </div>
          </div>

          {/* Calls to action */}
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/about/team" className="btn-secondary inline-flex items-center justify-center">Meet the Team</Link>
            <Link href="/contact" className="btn-secondary inline-flex items-center justify-center">Contact Us</Link>
            <Link href="/acknowledgements" className="btn-secondary inline-flex items-center justify-center">Acknowledgements</Link>
          </div>

          {/* Resources subsection */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-light text-gray-900 mb-3">Resources</h3>
            <p className="text-gray-700 mb-4">Press info and brand assets for PaCE.</p>
            <Link href="/media-kit" className="btn-secondary inline-flex items-center justify-center">Media Kit</Link>
          </div>
        </div>
      </section>
    </>
  )
}
