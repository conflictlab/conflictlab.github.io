import type { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://forecastlab.org'
  const now = new Date()

  const routes = [
    '/',
    '/forecasts',
    '/forecasts-grid',
    '/downloads',
    '/publications',
    '/methodology',
    '/research',
    '/dissemination',
    '/reports',
    '/contact',
    '/glossary',
    '/media-kit',
    '/acknowledgements',
    '/about',
  ]

  const items: MetadataRoute.Sitemap = routes.map((r) => ({
    url: new URL(r, site).toString(),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: r === '/' ? 1 : 0.6,
  }))

  try {
    const latestPath = path.join(process.cwd(), 'content', 'forecasts', 'latest.json')
    if (fs.existsSync(latestPath)) {
      const raw = fs.readFileSync(latestPath, 'utf-8')
      const json = JSON.parse(raw)
      const entities = Array.isArray(json?.entities) ? json.entities : []
      for (const e of entities) {
        if (!e?.id) continue
        const u = new URL(`/forecasts/${e.id}`, site).toString()
        items.push({ url: u, lastModified: now, changeFrequency: 'monthly', priority: 0.5 })
      }
    }
  } catch {}

  return items
}
