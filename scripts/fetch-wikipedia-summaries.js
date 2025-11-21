#!/usr/bin/env node
/**
 * Fetch concise Wikipedia summaries for entities (countries) and store to public/data/context.json
 * Usage: node scripts/fetch-wikipedia-summaries.js [--entities "Ukraine,Afghanistan"]
 */
const https = require('https')
const fs = require('fs')
const path = require('path')

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'PaCE-Website/0.1 (contact: research@pace-lab.org) WikipediaSummaryFetcher',
        'Accept': 'application/json'
      }
    }, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        if (res.statusCode && res.statusCode !== 200) {
          return resolve(null)
        }
        try { resolve(JSON.parse(data)) } catch (e) { resolve(null) }
      })
    })
    req.on('error', reject)
  })
}

function titleFor(name) {
  const map = {
    "Côte d'Ivoire": 'Ivory Coast',
    'DR Congo': 'Democratic Republic of the Congo',
    'Congo': 'Republic of the Congo',
    'Eswatini': 'Eswatini',
    'eSwatini': 'Eswatini',
    'Myanmar': 'Myanmar',
    'North Macedonia': 'North Macedonia',
  }
  return encodeURIComponent(map[name] || name)
}

async function getSummary(name) {
  const title = titleFor(name)
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
  try {
    const json = await fetchJson(url)
    if (json && json.extract) {
      const summary = String(json.extract).replace(/\s+/g, ' ').trim()
      return { summary, url: json.content_urls?.desktop?.page, source: 'wikipedia', updatedAt: new Date().toISOString() }
    }
  } catch {}
  return null
}

function sleep(ms) { return new Promise(res => setTimeout(res, ms)) }

async function main() {
  const args = process.argv.slice(2).join(' ')
  const m = /--entities\s+"([^"]+)"/.exec(args)
  let entities = []
  if (m) entities = m[1].split(',').map(s => s.trim()).filter(Boolean)
  if (!entities.length) {
    // try to read latest snapshot to get names
    try {
      const latestPath = path.join(process.cwd(), 'content', 'forecasts', 'latest.json')
      const raw = fs.readFileSync(latestPath, 'utf-8')
      const snap = JSON.parse(raw)
      entities = snap.entities.map(e => e.name)
    } catch {
      console.error('No entities provided and could not read content/forecasts/latest.json')
      process.exit(1)
    }
  }
  const out = {}
  for (const name of entities) {
    const ctx = await getSummary(name)
    if (ctx) out[name] = ctx
    await sleep(150)
  }
  const outPath = path.join(process.cwd(), 'public', 'data', 'context.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${outPath} with ${Object.keys(out).length} entries`)
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
