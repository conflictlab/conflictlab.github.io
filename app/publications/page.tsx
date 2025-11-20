'use client'

import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import Breadcrumbs from '@/components/Breadcrumbs'

import { publications, Publication } from '@/content/publications'

export default function PublicationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [selectedAuthor, setSelectedAuthor] = useState('')
  const [showCitation, setShowCitation] = useState<number | null>(null)

  // Get unique years and authors
  const allYears = Array.from(new Set(publications.map(p => p.year))).sort((a, b) => b - a)
  const allAuthors = useMemo(() => {
    const authorSet = new Set<string>()
    publications.forEach(pub => {
      // Extract individual authors (splitting by '&', ',', and ' and ')
      const authors = pub.authors
        .split(/\s+and\s+|&|,/)
        .map(a => {
          // Remove content in parentheses, trim, and normalize punctuation
          let cleaned = a.replace(/\(.*?\)/g, '').trim()
          // Remove trailing punctuation like . or )
          cleaned = cleaned.replace(/[.)]+$/, '').trim()
          return cleaned
        })
        .filter(author => {
          // Filter out empty strings, "et al", and fragments that are too short (likely incomplete)
          if (!author || author.startsWith('et al') || author.startsWith('including')) {
            return false
          }
          // Filter out single letters or initials without a last name (likely fragments)
          // Valid format should have at least a space (e.g., "Chadefaux T" or "T. Chadefaux")
          // or be a full last name with at least 3 characters
          if (author.length < 3 || !author.includes(' ')) {
            return false
          }
          return true
        })

      authors.forEach(author => {
        authorSet.add(author)
      })
    })
    return Array.from(authorSet).sort()
  }, [])

  // Filter publications
  const filteredPublications = useMemo(() => {
    return publications.filter(pub => {
      // Search query filter (search in title, authors, venue, abstract)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = `${pub.title} ${pub.authors} ${pub.venue} ${pub.abstract}`.toLowerCase()
        if (!searchableText.includes(query)) return false
      }

      // Year filter
      if (selectedYears.length > 0 && !selectedYears.includes(pub.year)) {
        return false
      }

      // Author filter - normalize author names for comparison
      if (selectedAuthor) {
        const normalizedAuthors = pub.authors
          .split(/\s+and\s+|&|,/)
          .map(a => {
            let cleaned = a.replace(/\(.*?\)/g, '').trim()
            cleaned = cleaned.replace(/[.)]+$/, '').trim()
            return cleaned
          })
          .filter(author => author && author.length >= 3 && author.includes(' '))

        if (!normalizedAuthors.some(author => author === selectedAuthor)) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, selectedYears, selectedAuthor])

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

  const toggleYear = (year: number) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    )
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedYears([])
    setSelectedAuthor('')
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const hasActiveFilters = searchQuery || selectedYears.length > 0 || selectedAuthor

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
        </div>
      </section>

      {/* Publications by year */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Navigation */}
          <div className="mb-12 pb-6 border-b border-gray-200">
            <nav className="flex space-x-6 text-lg">
              <a href="#publications" className="text-pace-red hover:text-pace-red-dark">
                Academic Publications
              </a>
              <span className="text-gray-400">/</span>
              <a href="#reports-newsletters" className="text-pace-red hover:text-pace-red-dark">
                Reports and Newsletters
              </a>
            </nav>
          </div>

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

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Year Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Year:</span>
                <div className="flex flex-wrap gap-2">
                  {allYears.map(year => (
                    <button
                      key={year}
                      onClick={() => toggleYear(year)}
                      className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedYears.includes(year)
                          ? 'bg-pace-red text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Author Filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 font-medium">Author:</span>
                <select
                  value={selectedAuthor}
                  onChange={(e) => setSelectedAuthor(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pace-red focus:border-transparent"
                >
                  <option value="">All authors</option>
                  {allAuthors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="ml-auto px-4 py-1 text-sm text-pace-red hover:text-pace-red-dark transition-colors flex items-center gap-1"
                >
                  <X size={16} />
                  Clear filters
                </button>
              )}
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              Showing {filteredPublications.length} of {publications.length} publications
            </div>
          </div>

          <h2 id="publications" className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
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
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium text-gray-700">BibTeX Citation</span>
                              <button
                                onClick={() => copyToClipboard(generateBibTeX(pub, globalIndex))}
                                className="text-xs px-2 py-1 bg-pace-red text-white rounded hover:bg-pace-red-dark transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                              {generateBibTeX(pub, globalIndex)}
                            </pre>
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

          {/* Reports and Newsletters Section */}
          <div className="mt-16">
            <h2 id="reports-newsletters" className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Reports and Newsletters
            </h2>
            <div className="border border-gray-200 rounded-lg p-6 bg-white">
              <p className="text-gray-600">
                Coming soon: Research reports, newsletters, and policy briefs.
              </p>
            </div>
          </div>

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
