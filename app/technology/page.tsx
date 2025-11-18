import Link from 'next/link'
import servicesData from '@/content/services.json'
import PrioGridAnimation from '@/components/PrioGridAnimation'
import dynamic from 'next/dynamic'
import { readSnapshot } from '@/lib/forecasts'
import { Activity, Users, TrendingUp, Vote, CloudSun, Map, Move, Shield, ShoppingBag, FileText, ExternalLink, Download } from 'lucide-react'
import fs from 'fs'
import path from 'path'

const PrioGridMap = dynamic(() => import('@/components/PrioGridMap'), { ssr: false })
const DTWTrajShowcase = dynamic(() => import('@/components/DTWTrajShowcase'), { ssr: false })

export default async function Technology() {
  const snap = readSnapshot('latest')
  // Discover academic papers placed under /public/academicPapers
  const papersDir = path.join(process.cwd(), 'public', 'academicPapers')
  let papers: Array<{ name: string; href: string; size: string; ext: string; title: string; year?: number; authors?: string[]; venue?: string }> = []
  try {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
    const files = fs.readdirSync(papersDir)

    // optional metadata JSON for precise citations
    const metaPath = path.join(papersDir, 'metadata.json')
    let metaIndex: Record<string, any> = {}
    try {
      if (fs.existsSync(metaPath)) {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as Array<any>
        for (const m of meta) {
          if (!m?.file) continue
          metaIndex[String(m.file)] = m
        }
      }
    } catch {}

    const lowerMinor = new Set(['and', 'or', 'of', 'in', 'on', 'for', 'to', 'a', 'an', 'the', 'with', 'by'])
    const titleCase = (s: string) => {
      const parts = s.split(/\s+/)
      return parts.map((w, i) => {
        const lw = w.toLowerCase()
        if (i > 0 && lowerMinor.has(lw)) return lw
        return lw.charAt(0).toUpperCase() + lw.slice(1)
      }).join(' ')
    }
    const deriveFromFilename = (f: string) => {
      const baseName = f.replace(/\.[^.]+$/, '')
      const clean = baseName.replace(/[\-_]+/g, ' ').replace(/\s+/g, ' ').trim()
      const ym = clean.match(/\b(19|20)\d{2}\b/)
      const year = ym ? Number(ym[0]) : undefined
      let pre = '', post = clean
      if (ym) {
        const idx = clean.indexOf(ym[0])
        pre = clean.slice(0, idx).trim()
        post = clean.slice(idx + ym[0].length).trim()
      }
      let authorsDisp: string | undefined
      if (pre) {
        // e.g., "schincariol et al"
        const norm = pre.replace(/\bet\s*al\b/gi, 'et al.').trim()
        const words = norm.split(/\s+/)
        if (words.length) {
          const cap = words.map(w => w.length <= 3 ? w.toUpperCase() : (w.charAt(0).toUpperCase() + w.slice(1))).join(' ')
          authorsDisp = cap
        }
      }
      const title = post ? titleCase(post) : titleCase(clean)
      return { year, authorsDisp, title }
    }

    const fmtSize = (n: number) => n > 1024 * 1024
      ? `${(n / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(n / 1024))} KB`
    for (const f of files) {
      const ext = (f.split('.').pop() || '').toLowerCase()
      if (!['pdf', 'html', 'htm'].includes(ext)) continue
      const stat = fs.statSync(path.join(papersDir, f))
      const meta = metaIndex[f] || metaIndex[f.replace(/\.[^.]+$/, '')]
      let title = '', year: number | undefined, authors: string[] | undefined, venue: string | undefined
      if (meta) {
        title = String(meta.title || '')
        authors = Array.isArray(meta.authors) ? meta.authors.map(String) : undefined
        year = meta.year ? Number(meta.year) : undefined
        venue = meta.venue ? String(meta.venue) : undefined
      } else {
        const d = deriveFromFilename(f)
        title = d.title
        year = d.year
        authors = d.authorsDisp ? [d.authorsDisp] : undefined
      }
      papers.push({ name: f, href: `${base}/academicPapers/${f}`, size: fmtSize(stat.size), ext, title, year, authors, venue })
    }
    papers.sort((a, b) => a.title.localeCompare(b.title))
  } catch {}
  return (
    <>
      {/* Hero Section */}
      <section className="py-24 hero-background-network-image">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-12 leading-tight">
            Technology
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed">
            <span className="word-emphasis">Machine learning models</span> that forecast geopolitical conflict and civil unrest. 
            Built for precision, transparency, and integration with existing systems.
          </p>
        </div>
      </section>

      {/* Removed animation section */}

      {/* PRIO-GRID Diffusion Model */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              <span className="word-emphasis">Conflict Diffusion</span> Modeling
            </h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              Our machine learning models predict how conflict spreads across space and time using 
              PRIO-GRID cellular analysis at 0.5° resolution.
            </p>
          </div>
          
          <div className="mb-12">
            <PrioGridAnimation />
          </div>
        </div>
      </section>

      {/* Pattern Discovery & Time‑Series AI */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Pattern Discovery & Time‑Series AI</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              We mine sequences for structure — motifs, anomalies, regime shifts — and learn compact embeddings that capture
              the shape and momentum of real‑world dynamics. Clustering similar trajectories and aligning asynchronous signals
              lets us surface recurring signatures, spot emerging look‑alikes, and rank what matters most — fast.
            </p>
          </div>
          <DTWTrajShowcase />
        </div>
      </section>

      {/* Rich Covariates for Forecasting */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">What We Feed The Models</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              Beyond past violence, our models ingest diverse signals on population, economy, politics, climate, access, and contagion. Below are examples of the kinds of covariates we use (non‑exhaustive).
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Activity size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Conflict history & contagion</h3>
              </div>
              <p className="text-sm text-gray-600">Lagged local fatalities; spatial lags from neighboring cells; distance to most recent events.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Users size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Demography & exposure</h3>
              </div>
              <p className="text-sm text-gray-600">Population density; urban–rural share; distance to capital or major city; settlement proximity.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><TrendingUp size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Economy & prices</h3>
              </div>
              <p className="text-sm text-gray-600">Night‑time lights; food & commodity prices; inflation; GDP per capita; local market activity.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Vote size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Governance & politics</h3>
              </div>
              <p className="text-sm text-gray-600">Election calendar; regime type & constraints; emergency measures; protest restrictions.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><CloudSun size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Climate & environment</h3>
              </div>
              <p className="text-sm text-gray-600">Rainfall anomalies; temperature anomalies; drought indices (e.g., SPEI); vegetation (NDVI).</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Map size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Infrastructure & access</h3>
              </div>
              <p className="text-sm text-gray-600">Road network & travel time; border proximity; remoteness; mobile & internet coverage.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Move size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Displacement & flows</h3>
              </div>
              <p className="text-sm text-gray-600">Refugee/IDP stocks & flows; cross‑border mobility; reception capacity and pressures.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><Shield size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Security & armed actors</h3>
              </div>
              <p className="text-sm text-gray-600">Presence of organized groups; known corridors & operating areas; arms trafficking routes.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 bg-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded bg-blue-50 text-clairient-blue"><ShoppingBag size={30} /></span>
                <h3 className="text-lg font-light text-gray-900">Market & livelihoods</h3>
              </div>
              <p className="text-sm text-gray-600">Local food prices; crop/harvest proxies; shocks to household purchasing power.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {servicesData.coreCapabilities.map((capability, index) => (
              <div key={index}>
                <h3 className="text-2xl font-light text-gray-900 mb-6">
                  {index === 0 && <span className="word-highlight">{capability.title}</span>}
                  {index === 1 && <span className="word-emphasis">{capability.title}</span>}
                  {index > 1 && capability.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {capability.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Forecast Demo (Grid-level map) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">
              Live <span className="word-highlight" data-text="Global Risk Intelligence"><span className="typing-text">Global Risk Intelligence</span></span>
            </h2>
            <p className="text-lg text-gray-600 font-light">
              Real-time conflict forecasts powered by our machine learning models
            </p>
          </div>
          
          <div className="mb-12">
            <PrioGridMap period={snap.period} />
          </div>
          
          <div className="text-center">
            <Link href="/forecasts" className="text-link">
              View our forecasts
            </Link>
          </div>
        </div>
      </section>

      {/* Academic References */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-6">Academic References</h2>
            <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
              Peer‑reviewed research and working papers underpinning our methodology and applications.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((p, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-12 h-12 rounded bg-blue-50 text-clairient-blue flex-shrink-0">
                    <FileText size={24} />
                  </span>
                  <div>
                    <div className="text-gray-900 font-light mb-1">{p.title}</div>
                    <div className="text-sm text-gray-600">
                      {p.authors && p.authors.length > 0 ? (
                        <span>{p.authors.length > 3 ? `${p.authors[0]} et al.` : p.authors.join(', ')}</span>
                      ) : null}
                      {p.year ? <span>{p.authors ? ' ' : ''}({p.year}).</span> : null}
                      {p.venue ? <span> {p.venue}.</span> : null}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">{p.ext.toUpperCase()} · {p.size}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <a href={p.href} target="_blank" rel="noopener noreferrer" className="text-clairient-blue hover:text-clairient-dark inline-flex items-center gap-1">
                    <ExternalLink size={16} /> View
                  </a>
                  <a href={p.href} download className="text-gray-600 hover:text-gray-800 inline-flex items-center gap-1">
                    <Download size={16} /> Download
                  </a>
                </div>
              </div>
            ))}
            {papers.length === 0 && (
              <div className="text-sm text-gray-600">Add PDFs or HTML files under <code>/public/academicPapers</code> to list them here.</div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
