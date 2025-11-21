import Link from 'next/link'
import Breadcrumbs from '@/components/Breadcrumbs'
import { publications } from '@/content/publications'

export const metadata = {
  title: 'Acknowledgements — PaCE',
  description: 'Thanks to collaborators and sources whose work informs parts of this project.'
}

function filterPubsByAuthor(name: string) {
  const n = name.toLowerCase()
  return publications.filter(p => (p.authors || '').toLowerCase().includes(n))
}

export default function AcknowledgementsPage() {
  const thomasPubs = filterPubsByAuthor('Schincariol')
  const hannahPubs = filterPubsByAuthor('Frank')

  const repoLinks = [
    { label: 'Pace-map-risk (historical predictions)', href: 'https://github.com/ThomasSchinca/Pace-map-risk' },
    { label: 'Live_3D_forecast (grid data feed)', href: 'https://github.com/ThomasSchinca/Live_3D_forecast' },
  ]

  return (
    <>
      {/* Hero */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-3">Acknowledgements</h1>
          <p className="text-lg text-gray-600 font-light max-w-3xl">
            We gratefully acknowledge contributions and public resources by collaborators whose work informs parts of this project. Any adaptations and errors remain our own.
          </p>
        </div>
      </section>

      {/* Contributors */}
      <section className="py-10 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Thomas Schincariol</h2>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Public repositories and datasets supporting conflict‑fatality forecasting.</li>
                <li>Historical predictions and grid‑level resources used in parts of our pipelines.</li>
                <li>
                  Selected repositories:{' '}
                  {repoLinks.map((r, i) => (
                    <span key={r.href}>
                      <a href={r.href} target="_blank" rel="noopener noreferrer" className="text-link">{r.label}</a>
                      {i < repoLinks.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <h2 className="text-2xl font-light text-gray-900 mb-2">Hannah Frank</h2>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Research and methodological contributions relevant to forecasting and evaluation.</li>
                <li>Co‑authorship and collaboration on related scholarly work.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Selected works */}
      <section className="py-6 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-gray-900 mb-4">Selected Publications</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Works with Schincariol</h4>
              {thomasPubs.length === 0 ? (
                <p className="text-sm text-gray-600">No items indexed yet.</p>
              ) : (
                <ul className="space-y-3">
                  {thomasPubs.slice(0, 5).map((p, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-pace-red">{p.title}</a>
                      ) : (
                        <span className="text-gray-900">{p.title}</span>
                      )}
                      <div className="text-xs text-gray-500">{p.authors} — {p.venue} ({p.year})</div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 text-sm">
                <Link href={{ pathname: '/publications', query: { author: 'Schincariol' } }} className="text-link">View all</Link>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">Works with Frank</h4>
              {hannahPubs.length === 0 ? (
                <p className="text-sm text-gray-600">No items indexed yet.</p>
              ) : (
                <ul className="space-y-3">
                  {hannahPubs.slice(0, 5).map((p, i) => (
                    <li key={i} className="text-sm text-gray-700">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-pace-red">{p.title}</a>
                      ) : (
                        <span className="text-gray-900">{p.title}</span>
                      )}
                      <div className="text-xs text-gray-500">{p.authors} — {p.venue} ({p.year})</div>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 text-sm">
                <Link href={{ pathname: '/publications', query: { author: 'Frank' } }} className="text-link">View all</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-8 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500">
            Acknowledgement does not imply endorsement. Public datasets and repositories referenced here are credited to their respective authors; any transformations applied for this site are the responsibility of the PaCE team.
          </p>
        </div>
      </section>
    </>
  )
}

