import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function ConflictForecastingWorkshop2024() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 mb-4">
            <Link href="/dissemination#workshops" className="text-pace-red hover:text-pace-red-dark">← Back to Workshops</Link>
          </p>
          <p className="text-sm text-gray-600 mb-2">2024</p>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Conflict Forecasting Workshop: Methodological Innovations, Data Opportunities, and Policy Relevance
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Trinity College Dublin, Ireland
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Photos */}
          <div className="grid grid-cols-3 gap-2 mb-8">
            <Image src="/workshops/workshop1.jpeg" alt="Conflict Forecasting Workshop" width={640} height={384} className="w-full h-48 object-cover rounded-lg" />
            <Image src="/workshops/workshop2.jpg" alt="Conflict Forecasting Workshop" width={640} height={384} className="w-full h-48 object-cover rounded-lg" />
            <Image src="/workshops/workshop3.jpeg" alt="Conflict Forecasting Workshop" width={640} height={384} className="w-full h-48 object-cover rounded-lg" />
          </div>

          <div className="mb-6">
            <Link href="#" className="text-pace-red hover:text-pace-red-dark underline">
              Workshop Programme
            </Link>
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Background on Conflict Forecasting</h2>
              <p className="mb-4">
                Conflict forecasting has evolved significantly over recent years, spurred by advancements in statistical modeling, machine learning, and the growing availability of data. Traditionally, statistical and ML approaches have been central in predicting the likelihood, intensity, and duration of conflicts. These models often rely on historical data, socio-political indicators, and increasingly, real-time data streams, to anticipate conflict scenarios.
              </p>
              <p className="mb-4">
                Parallel to these developments, theoretical frameworks such as game theory have offered insights into the strategic interactions among conflict actors, providing a understanding of conflict dynamics. Another very successful approach relies on the &ldquo;wisdom of crowds,&rdquo; where collective judgment and prediction markets are used to forecast conflicts, capitalizing on the diverse opinions of a large group of individuals.
              </p>
              <p>
                The surge in data availability, including social media feeds, satellite imagery, and real-time reporting, presents both opportunities and challenges for conflict forecasting. This workshop explored these various approaches, and investigated how they can be integrated and leveraged to enhance the accuracy and usefulness of conflict forecasts.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Objectives of the Workshop</h2>
              <ul className="list-disc list-inside space-y-3">
                <li><span className="font-medium text-gray-900">Showcase recent research:</span> highlight cutting-edge research in conflict forecasting, focusing on both methodological advancements and innovative data use. This includes exploring, among others, statistical models, ML algorithms, game theory applications, and crowd-sourced predictions.</li>
                <li><span className="font-medium text-gray-900">Explore data-driven opportunities:</span> examine the impact of the increasing availability of diverse data sources on conflict forecasting, discuss how to effectively harness this data while addressing challenges like data reliability and ethical considerations.</li>
                <li><span className="font-medium text-gray-900">Consider policy implications:</span> the workshop included a focus on how these academic advancements can be translated into practical tools and insights for policy-making. This includes discussions on how forecasting models can inform conflict prevention, response strategies, and policy formulation.</li>
                <li><span className="font-medium text-gray-900">Foster collaboration:</span> create a place for researchers to collaborate, share ideas, and potentially form partnerships for future research endeavors.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Format</h2>
              <p>
                The workshop featured paper presentations organized in panels. Each session was followed by a Q&A segment, encouraging active participation and exchange of ideas.
              </p>
            </div>
          </div>

          {/* Bottom Photo */}
          <div className="mt-8 flex justify-center">
            <img
              src="/workshops/workshop4.jpeg"
              alt="Conflict Forecasting Workshop"
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>
    </>
  )
}
