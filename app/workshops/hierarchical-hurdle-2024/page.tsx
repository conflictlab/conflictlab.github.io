import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function HierarchicalHurdleWorkshop2024() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 mb-4">
            <Link href="/dissemination#workshops" className="text-pace-red hover:text-pace-red-dark">← Back to Workshops</Link>
          </p>
          <p className="text-sm text-gray-600 mb-2">31 January 2024</p>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Guest Seminar: Three-stage Hierarchical Hurdle Count Model for Conflict Forecasting
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
              src="/Cornelius Fritz.jpg"
              alt="Dr Cornelius Fritz"
              width={800}
              height={600}
              className="rounded-lg max-w-2xl w-full h-auto"
            />
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Speaker</h2>
              <p className="text-gray-900">
                Dr Cornelius Fritz
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">About the Speaker</h2>
              <p>
                In my research, I use statistics to learn from network data to answer questions posed within the social sciences in uncertain and changing environments. My research mainly originates from multidisciplinary collaborations with social scientists approaching me with data and questions revolving around networks. As a statistician, I operate in two worlds: the real world, which encompasses observed data with all its imperfections and substantive knowledge of the subject matter, and the model world, which is an artificial representation of the real world characterized by a stochastic model. I develop novel data analysis techniques by combining statistical and machine learning with substantive theory to bridge the gap between the real and model world.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
