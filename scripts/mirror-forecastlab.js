#!/usr/bin/env node
/**
 * Mirror a website locally using website-scraper.
 * Defaults:
 *   URL: https://forecastlab.org/
 *   OUT: tmp/forecastlab-mirror
 *
 * Usage:
 *   node scripts/mirror-forecastlab.js [--url https://forecastlab.org/] [--out tmp/forecastlab-mirror] [--maxDepth 5]
 */

const path = require('path')
const fs = require('fs')

function parseArgs() {
  const args = process.argv.slice(2)
  const out = { url: 'https://forecastlab.org/', out: 'tmp/forecastlab-mirror', maxDepth: 6, sitemap: null }
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--url') out.url = args[++i]
    else if (a === '--out') out.out = args[++i]
    else if (a === '--maxDepth') out.maxDepth = Number(args[++i] || '6')
    else if (a === '--sitemap') out.sitemap = args[++i]
  }
  return out
}

async function main() {
  const { url, out, maxDepth, sitemap } = parseArgs()
  // Lazy load ESM module
  const { default: scrape } = await import('website-scraper')

  let urls = [url]
  if (sitemap) {
    try {
      const res = await fetch(sitemap)
      const xml = await res.text()
      const locs = Array.from(xml.matchAll(/<loc>([^<]+)<\/loc>/g)).map(m => m[1])
      if (locs.length) urls = locs
      console.log(`Loaded ${locs.length} URLs from sitemap: ${sitemap}`)
    } catch (e) {
      console.warn(`Failed to load sitemap ${sitemap}: ${e?.message || e}`)
    }
  }

  console.log(`Mirroring ${urls.length} page(s) -> ${out} (maxDepth=${maxDepth})`)

  const seedHost = new URL(url).hostname
  const allowedHosts = new Set([
    seedHost,
    'www.' + seedHost,
    'static.wixstatic.com',
    'video.wixstatic.com',
    'static.parastorage.com',
    'viewer-assets.parastorage.com',
    'pages.parastorage.com',
  ])

  await scrape({
    urls,
    directory: out,
    recursive: true,
    maxDepth,
    requestConcurrency: 4,
    prettifyUrls: true,
    urlFilter: (resourceUrl) => {
      try {
        const u = new URL(resourceUrl)
        return allowedHosts.has(u.hostname)
      } catch { return false }
    },
    subdirectories: [
      { directory: 'images', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'] },
      { directory: 'js', extensions: ['.js'] },
      { directory: 'css', extensions: ['.css'] },
      { directory: 'fonts', extensions: ['.woff', '.woff2', '.ttf', '.eot', '.otf'] },
    ],
    sources: [
      { selector: 'img', attr: 'src' },
      { selector: 'link[rel="stylesheet"]', attr: 'href' },
      { selector: 'script', attr: 'src' },
      { selector: 'a', attr: 'href' },
      { selector: 'link[rel="icon"], link[rel="shortcut icon"]', attr: 'href' },
    ],
  })

  console.log('Mirror complete.')
}

main().catch((err) => { console.error(err?.stack || err?.message || String(err)); process.exit(1) })
