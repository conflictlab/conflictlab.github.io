import Image from 'next/image'
import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function SensitivityAnalysisWorkshop2024() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 mb-4">
            <Link href="/dissemination#workshops" className="text-pace-red hover:text-pace-red-dark">← Back to Workshops</Link>
          </p>
          <p className="text-sm text-gray-600 mb-2">4 November 2024</p>
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
            Guest Workshop: Sensitivity Analysis of Determinants of Conflict Onset
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
              src="/workshops/PaCE Workshops November 2024_jfif.jpeg"
              alt="PaCE Workshop November 2024"
              width={800}
              height={600}
              className="rounded-lg max-w-2xl w-full h-auto"
            />
          </div>

          <div className="space-y-6 text-gray-600 leading-relaxed">
            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Speakers</h2>
              <p className="text-gray-900">
                Sverke R. Saxegaard & Eric G. E. Nilsen, PhD Research Fellows, Department of Political Science, University of Oslo, Norway
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-light text-gray-900 mb-4">Abstract</h2>
              <p>
                What country-characteristics are robustly correlated with intrastate conflict onset? Numerous studies have over the last three decades sought to establish the determinants of intrastate conflict. In 2006, Hegre and Sambanis showed that a number of these findings were not robust. Since then, new studies have identified altogether new variables that ostensibly are determinants of intrastate conflict onset. Moreover, contemporary civil conflict has been described as fundamentally different than before, begging the question of whether their determinants are also different. This paper takes stock of the last twenty years of quantitative research on the determinants of intrastate conflict onset, by conducting a systematic sensitivity analysis of 144 individual variables. The results of the approximately 18 million regression models indicate that a vast majority of established patterns and relationships in the literature are not robust to model specifications.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
