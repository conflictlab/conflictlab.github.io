#!/usr/bin/env node
/**
 * Fetch recent country updates from ReliefWeb API and store to public/data/context-reliefweb.json
 * Docs: https://apidoc.reliefweb.int/
 */
const https = require('https')
const fs = require('fs')
const path = require('path')

function fetchJson(url, payload) {
  return new Promise((resolve, reject) => {
    const opts = new URL(url)
    const req = https.request({
      ...opts,
      method: payload ? 'POST' : 'GET',
      headers: {
        'User-Agent': 'PaCE-Website/0.1 (contact: research@pace-lab.org) ReliefWebFetcher',
        'Accept': 'application/json',
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      }
    }, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) return resolve(null)
        try { resolve(JSON.parse(data)) } catch (e) { resolve(null) }
      })
    })
    req.on('error', reject)
    if (payload) req.write(JSON.stringify(payload))
    req.end()
  })
}

function stripHtml(html) {
  try {
    return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  } catch { return '' }
}

async function fetchCountryUpdates(name, limit = 3) {
  const body = {
    limit,
    profile: 'full',
    sort: ['date.created:desc'],
    filter: {
      operator: 'AND',
      conditions: [
        { field: 'country.name', value: name },
        { field: 'type', value: ['Report','Update'] },
        { field: 'format.name', value: ['Situation Report','Flash Update'] },
        // Optional theme filter could be enabled if needed:
        // { field: 'theme.name', value: ['Peace and Security','Conflict'] }
      ]
    },
    fields: {
      include: [
        'title',
        'url',
        'date.created',
        'source',
        'body'
      ]
    }
  }
  const res = await fetchJson('https://api.reliefweb.int/v1/reports?appname=pace', body)
  if (!res || !Array.isArray(res.data)) return []
  const out = []
  for (const item of res.data) {
    const f = item.fields || {}
    const title = String(f.title || '').trim()
    const url = String(f.url || '').trim()
    const date = f.date?.created || ''
    const source = Array.isArray(f.source) && f.source.length ? (f.source[0].shortname || f.source[0].name || '') : ''
    let excerpt = ''
    if (f.body) {
      const text = stripHtml(Array.isArray(f.body) ? f.body.join(' ') : f.body)
      excerpt = text.split('. ').slice(0, 2).join('. ').slice(0, 200)
    }
    out.push({ title, url, date, source, excerpt })
  }
  return out
}

async function main() {
  const latestPath = path.join(process.cwd(), 'content', 'forecasts', 'latest.json')
  const raw = fs.readFileSync(latestPath, 'utf-8')
  const snap = JSON.parse(raw)
  const names = snap.entities.map(e => e.name)
  const out = {}
  for (const name of names) {
    try {
      const updates = await fetchCountryUpdates(name, 3)
      if (updates && updates.length) out[name] = { updates, updatedAt: new Date().toISOString() }
      await new Promise(r => setTimeout(r, 200))
    } catch {}
  }
  const outPath = path.join(process.cwd(), 'public', 'data', 'context-reliefweb.json')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2))
  console.log(`Wrote ${outPath} with ${Object.keys(out).length} countries`)
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1) })
}
