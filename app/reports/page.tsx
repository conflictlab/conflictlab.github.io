import Breadcrumbs from '@/components/Breadcrumbs'
import Link from 'next/link'
import { FileText } from 'lucide-react'

export default function ReportsPage() {
  const newsletters = [
    { title: 'August 2025', file: '/newslettersAndReports/August 2025 Newsletter.pdf' },
    { title: 'July 2025', file: '/newslettersAndReports/July 2025 Newsletter.pdf' },
    { title: 'June 2025', file: '/newslettersAndReports/June 2025 Newsletter.pdf' },
    { title: 'May 2025', file: '/newslettersAndReports/May 25 newsletter.pdf' },
    { title: 'April 2025', file: '/newslettersAndReports/April 2025 newsletter.pdf' },
    { title: 'March 2025', file: '/newslettersAndReports/March 2025 newsletter.pdf' },
    { title: 'February 2025', file: '/newslettersAndReports/February 2025 newsletter.pdf' },
    { title: 'January 2025', file: '/newslettersAndReports/January 2025 newsletter.pdf' },
    { title: 'December 2024', file: '/newslettersAndReports/December 2024 newsletter.pdf' },
    { title: 'November 2024', file: '/newslettersAndReports/November 2024 newsletter.pdf' },
    { title: 'October 2024', file: '/newslettersAndReports/October 2024 Newsletter.pdf' },
    { title: 'September 2024', file: '/newslettersAndReports/Septemeber 2024 Newsletter.pdf' },
    { title: 'August 2024', file: '/newslettersAndReports/August 2024 Newsletter.pdf' },
    { title: 'July 2024', file: '/newslettersAndReports/July 2024 Newsletter.pdf' },
    { title: 'June 2024', file: '/newslettersAndReports/June 2024 Newsletter.pdf' },
    { title: 'May 2024', file: '/newslettersAndReports/May 2024 Newsletter.pdf' },
    { title: 'April 2024', file: '/newslettersAndReports/April 2024 Newsletter.pdf' },
    { title: 'March 2024', file: '/newslettersAndReports/March 2024 Newsletter (1).pdf' },
  ]

  // Use generic symbol covers rather than generated previews

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
            Research reports, policy briefs, and monthly newsletters from the <span className="word-emphasis">PaCE Conflict Research Lab</span>.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Latest Report */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Latest Report
            </h2>
            <Link
              href="/newslettersAndReports/ForecastingReport_March 2025.pdf"
              target="_blank"
              className="group"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                {/* Generic symbol cover */}
                <div className="bg-gray-100 flex items-center justify-center h-80 md:h-auto">
                  <div className="text-center p-8">
                    <FileText size={80} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">Report</p>
                  </div>
                </div>
                <div className="md:col-span-2 p-6">
                  <p className="text-sm text-gray-600 mb-2">March 2025</p>
                  <h3 className="text-2xl font-light text-gray-900 mb-4 group-hover:text-pace-red transition-colors">
                    Conflict Forecasting Report
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Our comprehensive forecasting report provides detailed analysis and predictions for conflict trends worldwide.
                    This report includes methodological insights, regional assessments, and policy recommendations.
                  </p>
                  <div className="inline-flex items-center text-pace-red group-hover:text-pace-red-dark transition-colors">
                    <FileText size={16} className="mr-2" />
                    <span className="font-medium">View Report (PDF)</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Latest Newsletter */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Latest Newsletter
            </h2>
            <Link
              href="/newslettersAndReports/August 2025 Newsletter.pdf"
              target="_blank"
              className="group"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                {/* Generic symbol cover */}
                <div className="bg-gray-100 flex items-center justify-center h-80 md:h-auto">
                  <div className="text-center p-8">
                    <FileText size={80} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">Newsletter</p>
                  </div>
                </div>
                <div className="md:col-span-2 p-6">
                  <p className="text-sm text-gray-600 mb-2">August 2025</p>
                  <h3 className="text-2xl font-light text-gray-900 mb-4 group-hover:text-pace-red transition-colors">
                    Monthly Newsletter
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    Our monthly newsletter featuring recent research updates, forecast highlights, team news, and upcoming events from the PaCE Conflict Research Lab.
                  </p>
                  <div className="inline-flex items-center text-pace-red group-hover:text-pace-red-dark transition-colors">
                    <FileText size={16} className="mr-2" />
                    <span className="font-medium">View Newsletter (PDF)</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Past Newsletters Archive */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Newsletter Archive
            </h2>
            {/* Switch from cards to a clean, chronological list */}
            <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
              {newsletters.slice(1).map((newsletter, index) => (
                <li key={index} className="p-0">
                  <Link
                    href={newsletter.file}
                    target="_blank"
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={20} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 font-light">{newsletter.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
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
