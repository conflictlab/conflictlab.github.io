import Breadcrumbs from '@/components/Breadcrumbs'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import MailchimpEmbed from '@/components/MailchimpEmbed'
import companyData from '@/content/company.json'

import fs from 'fs'
import path from 'path'

type NewsletterItem = { title: string; file: string; sort: number; year: number }

function parseNewsletter(fileName: string): NewsletterItem | null {
  const base = fileName.replace(/[_-]+/g, ' ')
  const lower = base.toLowerCase()
  if (!lower.endsWith('.pdf')) return null
  if (!lower.includes('newsletter')) return null

  const monthMap: Record<string, number> = {
    january: 0, jan: 0,
    february: 1, feb: 1,
    march: 2, mar: 2,
    april: 3, apr: 3,
    may: 4,
    june: 5, jun: 5,
    july: 6, jul: 6,
    august: 7, aug: 7,
    september: 8, sept: 8, sep: 8, septemeber: 8,
    october: 9, oct: 9,
    november: 10, nov: 10,
    december: 11, dec: 11,
  }

  // find month and year in filename
  const match = lower.match(/(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|temeber|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s*(\d{4})/)
  if (!match) return null
  const monthStr = match[1]
  const year = parseInt(match[2], 10)
  const monthIndex = monthMap[monthStr]
  if (monthIndex === undefined || !Number.isFinite(year)) return null
  const sort = new Date(Date.UTC(year, monthIndex, 1)).getTime()
  const title = `${monthStr.charAt(0).toUpperCase()}${monthStr.slice(1)} ${year}`.replace('septemeber', 'September').replace('Sep ', 'Sep ').replace('Sept ', 'Sept ')
  return { title, file: `/newslettersAndReports/${fileName}`, sort, year }
}

function getNewsletters(): NewsletterItem[] {
  try {
    const dir = path.join(process.cwd(), 'public', 'newslettersAndReports')
    const files = fs.readdirSync(dir)
    const items = files
      .filter(f => f.toLowerCase().endsWith('.pdf'))
      .map(parseNewsletter)
      .filter((n): n is NewsletterItem => !!n)
      .sort((a, b) => b.sort - a.sort)
    return items
  } catch {
    return []
  }
}

export default function ReportsPage() {
  const newsletters = getNewsletters()

  // Discover the latest Forecasting Report dynamically by filename
  function getLatestForecastReport(): { href: string, label: string } | null {
    try {
      const dir = path.join(process.cwd(), 'public', 'newslettersAndReports')
      const files = fs.readdirSync(dir)
      const reports = files
        .filter(f => f.toLowerCase().endsWith('.pdf') && /^forecastingreport_/i.test(f))
        .map(f => ({ file: f, ts: parseMonthYearFromName(f) }))
        .filter(r => r.ts > 0)
        .sort((a, b) => b.ts - a.ts)
      if (!reports.length) return null
      const top = reports[0]
      const label = extractLabel(top.file)
      return { href: `/newslettersAndReports/${top.file}`, label }
    } catch {
      return null
    }
  }

  function extractLabel(file: string): string {
    const m = file.match(/^ForecastingReport_(.*)\.pdf$/)
    return m ? m[1] : file
  }

  function parseMonthYearFromName(file: string): number {
    // Expect: ForecastingReport_<Month> <Year>.pdf
    const monthMap: Record<string, number> = {
      january: 0, jan: 0,
      february: 1, feb: 1,
      march: 2, mar: 2,
      april: 3, apr: 3,
      may: 4,
      june: 5, jun: 5,
      july: 6, jul: 6,
      august: 7, aug: 7,
      september: 8, sept: 8, sep: 8,
      october: 9, oct: 9,
      november: 10, nov: 10,
      december: 11, dec: 11,
    }
    const m = file.toLowerCase().match(/forecastingreport_([a-z]+)\s+(\d{4})/) 
    if (!m) return 0
    const month = monthMap[m[1]]
    const year = parseInt(m[2], 10)
    if (month === undefined || !Number.isFinite(year)) return 0
    return Date.UTC(year, month, 1)
  }

  const latestReport = getLatestForecastReport()

  // Use generic symbol covers rather than generated previews

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 hero-background-network-image">
        <div className="absolute top-2 left-2 md:top-3 md:left-3 z-[1000]"><Breadcrumbs /></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 leading-tight">
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
              href={latestReport ? latestReport.href : "/newslettersAndReports/ForecastingReport_March 2025.pdf"}
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
                  <p className="text-sm text-gray-600 mb-2">{latestReport ? latestReport.label : 'March 2025'}</p>
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
            {newsletters.length > 0 ? (
              <Link href={newsletters[0].file} target="_blank" className="group">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-lg transition-shadow">
                {/* Generic symbol cover */}
                <div className="bg-gray-100 flex items-center justify-center h-80 md:h-auto">
                  <div className="text-center p-8">
                    <FileText size={80} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500">Newsletter</p>
                  </div>
                </div>
                <div className="md:col-span-2 p-6">
                  <p className="text-sm text-gray-600 mb-2">{newsletters[0].title}</p>
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
            ) : (
              <div className="text-gray-600">No newsletters available yet.</div>
            )}
          </div>

          {/* Email Signup Section */}
          <div className="mb-16">
            {(((companyData as any).contact?.newsletterMailchimpAction || '').trim()) ? (
              <MailchimpEmbed sourceMergeTag="MMERGE9" sourceValue="reports_page" />
            ) : (((companyData as any).contact?.newsletterUrl || '').trim()) ? (
              <a
                href={(companyData as any).contact.newsletterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center"
              >
                Subscribe to Newsletter
              </a>
            ) : (
              <a
                href={`mailto:${(companyData as any).contact?.email || 'info@forecastlab.org'}?subject=${encodeURIComponent('Subscribe to Newsletter')}`}
                className="btn-secondary inline-flex items-center"
              >
                Subscribe via Email
              </a>
            )}
          </div>

          {/* Past Newsletters Archive */}
          <div className="mb-16">
            <h2 className="text-3xl font-light text-gray-900 mb-8 border-b border-gray-200 pb-2">
              Newsletter Archive
            </h2>

            {/* Group newsletters by year */}
            {(() => {
              const newslettersByYear: Record<string, NewsletterItem[]> = {}
              newsletters.slice(1).forEach(n => {
                const y = String(n.year)
                if (!newslettersByYear[y]) newslettersByYear[y] = []
                newslettersByYear[y].push(n)
              })
              return Object.keys(newslettersByYear)
                .sort((a, b) => Number(b) - Number(a))
                .map(year => (
                  <div key={year} className="mb-8">
                    <h3 className="text-xl font-medium text-gray-900 mb-3">{year}</h3>
                    <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg bg-white">
                      {newslettersByYear[year].map((n, index) => (
                        <li key={index} className="p-0">
                          <Link href={n.file} target="_blank" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                            <FileText size={20} className="text-gray-400 flex-shrink-0" />
                            <span className="text-gray-900 font-light">{n.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
            })()}
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
