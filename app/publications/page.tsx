'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'

import { publications, nonPeerPublications, workingPapers, Publication } from '@/content/publications'

export default function PublicationsPage() {
  const searchParams = useSearchParams()
  const initialAuthor = (searchParams?.get('author') || '').trim()
  const [searchQuery, setSearchQuery] = useState(initialAuthor)
  const [showCitation, setShowCitation] = useState<number | null>(null)

  // Filter publications
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      // Search query filter (search in title, authors, venue, abstract)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = `${pub.title} ${pub.authors} ${pub.venue} ${pub.abstract}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      return true
    })
  }, [searchQuery])

  const filteredNonPeer = useMemo(() => {
    return nonPeerPublications.filter(pub => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = `${pub.title} ${pub.authors} ${pub.venue} ${pub.abstract}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }
      return true
    })
  }, [searchQuery])

  const filteredWorking = useMemo(() => {
    return workingPapers.filter(pub => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = `${pub.title} ${pub.authors} ${pub.venue} ${pub.abstract}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }
      return true
    })
  }, [searchQuery])

  // Group filtered publications by year
  const publicationsByYear = filteredPublications.reduce((acc, pub) => {
    if (!acc[pub.year]) {
      acc[pub.year] = []
    }
    acc[pub.year].push(pub)
    return acc
  }, {} as Record<number, Publication[]>)

  const years = Object.keys(publicationsByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const nonPeerByYear = filteredNonPeer.reduce((acc, pub) => {
    if (!acc[pub.year]) acc[pub.year] = []
    acc[pub.year].push(pub)
    return acc
  }, {} as Record<number, Publication[]>)

  const nonPeerYears = Object.keys(nonPeerByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const workingByYear = filteredWorking.reduce((acc, pub) => {
    if (!acc[pub.year]) acc[pub.year] = []
    acc[pub.year].push(pub)
    return acc
  }, {} as Record<number, Publication[]>)

  const workingYears = Object.keys(workingByYear)
    .map(Number)
    .sort((a, b) => b - a)

  const clearFilters = () => {
    setSearchQuery('')
  }

  const generateBibTeX = (pub: Publication, index: number) => {
    // Clean authors for BibTeX format
    const authors = pub.authors.replace(/ and /g, ' AND ').replace(/&/g, 'AND')
    // Generate a citation key
    const firstAuthor = pub.authors.split(/[&,]/)[0].trim().split(' ').pop()
    const citationKey = `${firstAuthor}${pub.year}`

    return `@article{${citationKey},
  author = {${authors}},
  title = {${pub.title}},
  journal = {${pub.venue}},
  year = {${pub.year}}${pub.url ? `,\n  url = {${pub.url}}` : ''}
}`
  }

  const generateAPACitation = (pub: Publication) => {
    // Simple APA-like one-liner: Authors (Year). Title. Venue. URL
    const authors = pub.authors
      .replace(/\s{2,}/g, ' ')
      .replace(/\s*&\s*/g, ' & ')
      .replace(/\s*,\s*/g, ', ')
    const parts = [
      `${authors} (${pub.year}).`,
      `${pub.title}.`,
      pub.venue ? `${pub.venue}.` : undefined,
      pub.url ? `${pub.url}` : undefined,
    ].filter(Boolean)
    return parts.join(' ')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Silently fail if clipboard API not available
    }
  }

  const hasActiveFilters = searchQuery.length > 0

  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Publications
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            Research publications from the <span className="word-emphasis">PaCE Conflict Research Lab</span>.
            Peer-reviewed papers on conflict forecasting, pattern recognition, and computational methods.
          </p>
          <div className="mt-4 text-sm text-gray-600">
            Quick filters:
            <Link href={{ pathname: '/publications', query: { author: 'Schincariol' } }} className="ml-2 text-link">Schincariol</Link>
            <span className="mx-1 text-gray-400">·</span>
            <Link href={{ pathname: '/publications', query: { author: 'Frank' } }} className="text-link">Frank</Link>
          </div>
        </div>
      </section>

      {/* Publications by year */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search and Filter Section */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search publications by keyword, author, or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Clear search and Results count */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between">
                <button
                  onClick={clearFilters}
                  className="px-4 py-1 text-sm text-pace-red hover:text-pace-red-dark transition-colors flex items-center gap-1"
                >
                  <X size={16} />
                  Clear search
                </button>
              </div>
            )}

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Academic: {filteredPublications.length}/{publications.length} · Working papers: {filteredWorking.length}/{workingPapers.length} · Non‑peer reviewed: {filteredNonPeer.length}/{nonPeerPublications.length}
            </div>
          </div>

          <h2 className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
            Academic Publications
          </h2>

          {filteredPublications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No publications found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-pace-red text-white rounded-lg hover:bg-pace-red-dark transition-colors"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {years.map((year) => (
              <div key={year}>
                {publicationsByYear[year].map((pub, pubIndex) => {
                  // Create a unique index for each publication across all years
                  const globalIndex = publications.findIndex(p => p === pub)
                  return (
                    <div key={pubIndex} className="grid grid-cols-[100px_1fr] gap-6 mb-6">
                      {/* Year column - only show for first publication of each year */}
                      <div className="text-right">
                        {pubIndex === 0 && (
                          <span className="text-2xl font-light text-gray-900">{year}</span>
                        )}
                      </div>

                      {/* Publication content */}
                      <div>
                        <div className="mb-2">
                          {pub.url ? (
                            <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-base font-light text-gray-900 hover:text-pace-red transition-colors">
                              {pub.title}
                            </a>
                          ) : (
                            <span className="text-base font-light text-gray-900">{pub.title}</span>
                          )}
                          <span className="text-sm text-gray-600"> — {pub.authors}</span>
                          <span className="text-sm text-pace-red italic"> — {pub.venue}</span>
                        </div>

                        <div className="flex gap-3 mb-2">
                          {/* Abstract */}
                          <details className="group">
                            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors list-none">
                              <span className="inline-flex items-center">
                                <span className="mr-2 group-open:rotate-90 transition-transform">▶</span>
                                Abstract
                              </span>
                            </summary>
                            <p className="mt-2 text-sm text-gray-600 leading-relaxed pl-6">
                              {pub.abstract}
                            </p>
                          </details>

                          {/* Cite button */}
                          <button
                            onClick={() => setShowCitation(showCitation === globalIndex ? null : globalIndex)}
                            className="text-xs px-2 py-0.5 border border-pace-red text-pace-red rounded hover:bg-pace-red hover:text-white transition-colors h-fit"
                          >
                            Cite
                          </button>
                        </div>

                        {/* Citation display */}
                        {showCitation === globalIndex && (
                          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            {/* APA-like */}
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-700">Citation (APA‑like)</span>
                              <button
                                onClick={() => copyToClipboard(generateAPACitation(pub))}
                                className="text-xs px-2 py-1 bg-pace-red text-white rounded hover:bg-pace-red-dark transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <div className="text-xs text-gray-800 whitespace-pre-wrap mb-3">
                              {generateAPACitation(pub)}
                            </div>

                            {/* BibTeX */}
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-700">BibTeX</span>
                              <button
                                onClick={() => copyToClipboard(generateBibTeX(pub, globalIndex))}
                                className="text-xs px-2 py-1 bg-pace-red text-white rounded hover:bg-pace-red-dark transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">{generateBibTeX(pub, globalIndex)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
            </div>
          )}

          {/* Working papers */}
          <h2 id="working-papers" className="text-3xl font-light text-gray-900 mt-16 mb-8 border-b border-gray-200 pb-2">
            Working Papers
          </h2>
          {filteredWorking.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No working papers match your search.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {workingYears.map((year) => (
                <div key={`wp-${year}`}>
                  <span className="text-2xl font-light text-gray-900">{year}</span>
                  <div className="mt-4 space-y-6">
                    {workingByYear[year].map((pub, pubIndex) => (
                      <div key={`wp-${year}-${pubIndex}`} className="grid grid-cols-[100px_1fr] gap-6">
                        <div className="text-right"></div>
                        <div>
                          <div className="mb-2">
                            {pub.url ? (
                              <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-base font-light text-gray-900 hover:text-pace-red transition-colors">
                                {pub.title}
                              </a>
                            ) : (
                              <span className="text-base font-light text-gray-900">{pub.title}</span>
                            )}
                            <span className="text-sm text-gray-600"> — {pub.authors}</span>
                            <span className="text-sm text-pace-red italic"> — {pub.venue}</span>
                          </div>
                          {pub.abstract && (
                            <details className="group">
                              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors list-none">
                                <span className="inline-flex items-center">
                                  <span className="mr-2 group-open:rotate-90 transition-transform">▶</span>
                                  Summary
                                </span>
                              </summary>
                              <p className="mt-2 text-sm text-gray-600 leading-relaxed pl-6">{pub.abstract}</p>
                            </details>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Non‑peer reviewed publications */}
          <h2 className="text-3xl font-light text-gray-900 mt-16 mb-8 border-b border-gray-200 pb-2">
            Non‑Peer Reviewed Publications
          </h2>
          {filteredNonPeer.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No non‑peer reviewed items match your search.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {nonPeerYears.map((year) => (
                <div key={`np-${year}`}>
                  <span className="text-2xl font-light text-gray-900">{year}</span>
                  <div className="mt-4 space-y-6">
                    {nonPeerByYear[year].map((pub, pubIndex) => {
                      const globalIndex = nonPeerPublications.findIndex(p => p === pub)
                      return (
                        <div key={`np-${year}-${pubIndex}`} className="grid grid-cols-[100px_1fr] gap-6">
                          <div className="text-right"></div>
                          <div>
                            <div className="mb-2">
                              {pub.url ? (
                                <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-base font-light text-gray-900 hover:text-pace-red transition-colors">
                                  {pub.title}
                                </a>
                              ) : (
                                <span className="text-base font-light text-gray-900">{pub.title}</span>
                              )}
                              <span className="text-sm text-gray-600"> — {pub.authors}</span>
                              <span className="text-sm text-pace-red italic"> — {pub.venue}</span>
                              {pub.url && pub.url.includes('github.com') && (
                                <>
                                  <span className="mx-1">·</span>
                                  <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-link text-sm">GitHub</a>
                                </>
                              )}
                            </div>
                            {pub.abstract && (
                              <details className="group">
                                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 transition-colors list-none">
                                  <span className="inline-flex items-center">
                                    <span className="mr-2 group-open:rotate-90 transition-transform">▶</span>
                                    Summary
                                  </span>
                                </summary>
                                <p className="mt-2 text-sm text-gray-600 leading-relaxed pl-6">{pub.abstract}</p>
                              </details>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer note */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              The views, thoughts, and opinions expressed on this page belong solely to the authors and do not necessarily reflect the views of their employers, organizations, or institutions.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
