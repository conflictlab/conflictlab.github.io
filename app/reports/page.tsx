import Breadcrumbs from '@/components/Breadcrumbs'

export default function ReportsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Reports & Newsletters
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Research reports, policy briefs, and newsletters from the <span className="word-emphasis">PaCE Conflict Research Lab</span>.
          </p>
        </div>
      </section>

      {/* Reports and Newsletters Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-gray-200 rounded-lg p-8 bg-white">
            <p className="text-gray-600 text-lg">
              Coming soon: Research reports, newsletters, and policy briefs.
            </p>
          </div>

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              The views, thoughts, and opinions expressed in these reports belong solely to the authors and do not necessarily reflect the views of their employers, organizations, or institutions.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
