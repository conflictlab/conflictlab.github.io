import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function SocialScienceForecasting2023() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 mb-4">
            <Link href="/dissemination#workshops" className="text-pace-red hover:text-pace-red-dark">← Back to Workshops</Link>
          </p>
          <p className="text-sm text-gray-600 mb-2">21 March 2023</p>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Advances in Social Science Forecasting
          </h1>
          <p className="text-xl text-gray-600 font-light">
            Trinity College Dublin, Ireland
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Photo */}
          <div className="flex justify-center mb-8">
            <Image
              src="/Galit Shmueli NTHU 2020 Small.jpeg"
              alt="Professor Galit Shmueli"
              width={800}
              height={600}
              className="rounded-lg max-w-2xl w-full h-auto"
            />
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Speaker</h2>
              <p className="text-gray-900">
                Professor Galit Shmueli
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Topic</h2>
              <p className="text-gray-900 italic">
                &ldquo;Forks over knives: Predictive inconsistency in criminal justice algorithmic risk assessment tools.&rdquo;
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Abstract</h2>
              <p>
                Big data and algorithmic risk prediction tools promise to improve criminal justice systems by reducing human biases and inconsistencies in decision-making. Yet different, equally justifiable choices when developing, testing and deploying these socio-technical tools can lead to disparate predicted risk scores for the same individual. In this talk Prof. Galit Shmueli explored the challenges of &lsquo;predictive inconsistency&rsquo;, arguing that in a diverse and pluralistic society we should not expect to completely eliminate predictive inconsistency, but identify and document reasonable &lsquo;forking paths&rsquo;.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
