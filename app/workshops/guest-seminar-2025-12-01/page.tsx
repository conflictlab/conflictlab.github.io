import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'

export default function GuestSeminar2025Dec01() {
  return (
    <>
      {/* Hero */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600 mb-4">
            <Link href="/dissemination#workshops" className="text-pace-red hover:text-pace-red-dark">← Back to Workshops</Link>
          </p>
          <p className="text-sm text-gray-600 mb-2">2025</p>
          <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-3 leading-snug">
            PaCE Seminar, Monday 1 december 2025.
          </h1>
          <p className="text-lg text-gray-700">
            <span className="italic"></span>
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-gray-900 mb-6 border-b border-gray-200 pb-2">Presentation Schedule</h2>
          <p className="text-gray-600 mb-6">Afternoon session starting at 14:00 (30-minute slots, including Q&amp;A and break).</p>
            <p>2 Clare St., 3rd floor conference room</p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">Speaker</th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700"></th>
                  <th scope="col" className="px-4 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">14:00–14:30</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Dr. Yohan Park (Research Fellow, PaCE)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">A Difference-in-Differences Estimator for Dynamic Treatment Effects in Time-Series Cross-Sectional Data</td>
                  <td className="px-4 py-3 text-sm text-gray-600">20 min talk + 10 min Q&amp;A</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">14:30–15:00</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Dr. Simon Polichinel von der Maase (Senior Researcher - Peace Research Institute Oslo (PRIO))</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Estimating Latent conflict Risk fields: and then what? A decision analysis perspective</td>
                  <td className="px-4 py-3 text-sm text-gray-600">20 min talk + 10 min Q&amp;A</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">15:00–15:30</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Dr. Chien Lu (Research Fellow, PaCE)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Hospitals Under Fire? Causal Evidence from Satellite Imagery in Ukraine</td>
                  <td className="px-4 py-3 text-sm text-gray-600">20 min talk + 10 min Q&amp;A</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">15:30–16:00</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Break</td>
                  <td className="px-4 py-3 text-sm text-gray-600">&nbsp;</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Coffee and informal discussion</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">16:00–16:30</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Junjie Liu (PhD Student, PaCE)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">A Foundation Model For Political News Analysis</td>
                  <td className="px-4 py-3 text-sm text-gray-600">20 min talk + 10 min Q&amp;A</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-900">16:30–17:00</td>
                  <td className="px-4 py-3 text-sm text-gray-900">Dr. Jungmin Han (Research Fellow, PaCE)</td>
                  <td className="px-4 py-3 text-sm text-gray-600">Patterns of Cooperative Signals and Public Opinion on Rapprochement</td>
                  <td className="px-4 py-3 text-sm text-gray-600">20 min talk + 10 min Q&amp;A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  )
}
