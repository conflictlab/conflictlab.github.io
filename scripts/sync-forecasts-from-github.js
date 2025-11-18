#!/usr/bin/env node
/**
 * Sync forecast CSV files from a GitHub repo into content/forecasts as JSON snapshots.
 *
 * Usage:
 *   node scripts/sync-forecasts-from-github.js \
 *     --repo owner/repo --dir path/in/repo --branch main \
 *     [--token $GITHUB_TOKEN] [--latestOnly]
 *
 * CSV filename convention: YYYY-MM.csv (e.g., 2025-11.csv)
 * CSV schema: see scripts/csv-to-snapshot.js header for columns.
 */

const fs = require('fs')
const path = require('path')

function parseArgs(argv) {
  const out = {}
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const [k, v] = arg.split('=')
    const key = k.replace(/^--/, '')
    if (v !== undefined) out[key] = v
    else {
      const next = argv[i + 1]
      if (!next || next.startsWith('--')) out[key] = true
      else { out[key] = next; i++ }
    }
  }
  // fallback to env
  out.repo = out.repo || process.env.GITHUB_REPO
  out.dir = out.dir || process.env.GITHUB_DIR || ''
  out.branch = out.branch || process.env.GITHUB_BRANCH || 'main'
  out.token = out.token || process.env.GITHUB_TOKEN
  out.saveCsv = (out.saveCsv || process.env.SAVE_CSV) ? true : false
  out.rawDir = out.rawDir || process.env.RAW_DIR || path.join('content', 'forecasts', 'csv')
  // Optional column mappings
  out.idCol = out.idCol || process.env.ID_COL
  out.nameCol = out.nameCol || process.env.NAME_COL
  out.iso3Col = out.iso3Col || process.env.ISO3_COL
  out.indexCol = out.indexCol || process.env.INDEX_COL
  out.confCol = out.confCol || process.env.CONF_COL
  out.typeCol = out.typeCol || process.env.TYPE_COL
  out.indexScale = out.indexScale ? Number(out.indexScale) : (process.env.INDEX_SCALE ? Number(process.env.INDEX_SCALE) : 1)
  return out
}

function toNumber(v) { const n = Number(v); return Number.isFinite(n) ? n : 0 }

function splitCSVLine(line) {
  const out = []
  let cur = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++ } else { inQuotes = false }
      } else {
        cur += ch
      }
    } else {
      if (ch === ',') { out.push(cur); cur = '' }
      else if (ch === '"') { inQuotes = true }
      else { cur += ch }
    }
  }
  out.push(cur)
  return out.map(s => s.trim())
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0)
  const startIdx = lines[0]?.startsWith('#') ? 1 : 0
  const header = splitCSVLine(lines[startIdx] || '')
  const rows = []
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('#')) continue
    const cols = splitCSVLine(lines[i])
    if (!cols.length) continue
    const obj = {}
    header.forEach((h, idx) => { obj[h] = cols[idx] })
    rows.push(obj)
  }
  return { header, rows }
}

function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)) }

function buildSnapshotFromSchema(rows, meta) {
  const entities = rows.map(r => ({
    id: r.id,
    name: r.name,
    entityType: r.entityType,
    iso3: r.iso3 || undefined,
    index: toNumber(r.index),
    band: r.band || (toNumber(r.index) >= 66 ? 'high' : toNumber(r.index) >= 33 ? 'medium' : 'low'),
    confidence: toNumber(r.confidence || r.conf),
    deltaMoM: toNumber(r.deltaMoM),
    deltaYoY: toNumber(r.deltaYoY),
    horizons: {
      '1m': { index: toNumber(r['1m_index'] ?? r.index), p10: toNumber(r['1m_p10'] ?? r.index) - 5, p50: toNumber(r['1m_p50'] ?? r.index), p90: toNumber(r['1m_p90'] ?? r.index) + 5 },
      '3m': { index: toNumber(r['3m_index'] ?? r.index), p10: toNumber(r['3m_p10'] ?? r.index) - 7, p50: toNumber(r['3m_p50'] ?? r.index), p90: toNumber(r['3m_p90'] ?? r.index) + 7 },
      '6m': { index: toNumber(r['6m_index'] ?? r.index), p10: toNumber(r['6m_p10'] ?? r.index) - 10, p50: toNumber(r['6m_p50'] ?? r.index), p90: toNumber(r['6m_p90'] ?? r.index) + 10 }
    },
    drivers: String(r.drivers || '').split('|').filter(Boolean).map(pair => {
      const [category, impact] = pair.split(':')
      return { category, impact: toNumber(impact) }
    }),
    notes: r.notes || undefined,
  }))
  return {
    version: meta.version || '1.0',
    generatedAt: meta.generatedAt || new Date().toISOString(),
    period: meta.period,
    releaseNotes: meta.releaseNote && Array.isArray(meta.releaseNote) && meta.releaseNote.length ? meta.releaseNote : undefined,
    entities
  }
}

function buildSnapshotFromMatrix(header, rows, meta, prevIndexMap) {
  const colNames = header.slice(1)
  const r1 = rows[0] || {}
  const r3 = rows[2] || rows[rows.length - 1] || {}
  const r6 = rows[5] || rows[rows.length - 1] || {}
  const derivedStart = parseYYYYMM(r1[header[0]]) || meta.period
  const entities = colNames.map(name => {
    const v1 = toNumber(r1[name])
    const v3 = toNumber(r3[name])
    const v6 = toNumber(r6[name])
    const scale = (v1 <= 1 && v3 <= 1 && v6 <= 1) ? 100 : 1
    const idx1 = clamp(Number((v1 * scale).toFixed(1)), 0, 10000)
    const idx3 = clamp(Number((v3 * scale).toFixed(1)), 0, 10000)
    const idx6 = clamp(Number((v6 * scale).toFixed(1)), 0, 10000)
    const id = (name || '').toString().toUpperCase()
    const prev = prevIndexMap ? toNumber(prevIndexMap[id] ?? prevIndexMap[name]) : undefined
    const deltaMoM = prev !== undefined ? Number((idx1 - prev).toFixed(1)) : 0
    const base = idx1
    const mkBand = (x) => (x >= 66 ? 'high' : x >= 33 ? 'medium' : 'low')
    return {
      id,
      name,
      entityType: 'country',
      index: base,
      band: mkBand(base),
      confidence: 0.75,
      deltaMoM,
      deltaYoY: 0,
      horizons: {
        '1m': { index: idx1, p10: clamp(idx1 - 5, 0, 10000), p50: idx1, p90: idx1 + 5 },
        '3m': { index: idx3, p10: clamp(idx3 - 7, 0, 10000), p50: idx3, p90: idx3 + 7 },
        '6m': { index: idx6, p10: clamp(idx6 - 10, 0, 10000), p50: idx6, p90: idx6 + 10 },
      },
      drivers: []
    }
  })
  return {
    version: meta.version || '1.0',
    generatedAt: meta.generatedAt || new Date().toISOString(),
    period: derivedStart,
    releaseNotes: meta.releaseNote && Array.isArray(meta.releaseNote) && meta.releaseNote.length ? meta.releaseNote : undefined,
    entities
  }
}

function guessKey(obj, candidates) {
  const keys = Object.keys(obj)
  for (const c of candidates) {
    const k = keys.find(k => k.toLowerCase() === c.toLowerCase())
    if (k) return k
  }
  // contains
  for (const c of candidates) {
    const k = keys.find(k => k.toLowerCase().includes(c.toLowerCase()))
    if (k) return k
  }
  return null
}

function normalizeRows(rows, opts, prevIndexMap) {
  if (!rows.length) return []
  const sample = rows[0]
  const idKey = opts.idCol || guessKey(sample, ['id','iso3','code','country_iso3','country_code'])
  const nameKey = opts.nameCol || guessKey(sample, ['name','country','entity','region'])
  const indexKey = opts.indexCol || guessKey(sample, ['index','risk','score','value','risk_score','prediction'])
  const confKey = opts.confCol || guessKey(sample, ['confidence','conf','prob','probability'])
  const typeKey = opts.typeCol || guessKey(sample, ['entityType','type'])

  return rows.map(r => {
    const id = r[idKey] || r[nameKey] || 'UNK'
    const iso3 = (r[opts.iso3Col] || (id && id.length === 3 ? id : undefined))
    let idx = toNumber(r[indexKey])
    if (opts.indexScale && opts.indexScale !== 1) idx = idx * opts.indexScale
    // clamp 0..100 if looks like percent
    if (idx > 1 && idx <= 100) idx = Number(idx.toFixed(1))
    const prev = prevIndexMap ? toNumber(prevIndexMap[id] ?? prevIndexMap[iso3] ?? prevIndexMap[(r[nameKey]||'')]) : undefined
    const deltaMoM = prev !== undefined ? Number((idx - prev).toFixed(1)) : 0
    return {
      id: String(id).toUpperCase(),
      name: (r[nameKey] || id || 'Unknown').toString(),
      entityType: (r[typeKey] || 'country').toString(),
      iso3: iso3 ? String(iso3).toUpperCase() : undefined,
      index: idx,
      confidence: confKey ? toNumber(r[confKey]) : 0.75,
      deltaMoM,
      deltaYoY: 0,
    }
  })
}

async function fetchJSON(url, token) {
  const headers = { 'User-Agent': 'pace-sync-script' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`)
  return res.json()
}

async function fetchText(url, token) {
  const headers = { 'User-Agent': 'pace-sync-script' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`Fetch failed ${res.status} ${url}`)
  return res.text()
}

function parseYYYYMM(dateStr) {
  // Accept formats like YYYY-MM-DD or YYYY/MM/DD; return YYYY-MM
  if (!dateStr) return null
  const m = String(dateStr).match(/(\d{4})[-/](\d{2})/)
  return m ? `${m[1]}-${m[2]}` : null
}

async function main() {
  const args = parseArgs(process.argv)
  if (!args.repo) {
    console.error('Missing --repo owner/repo (or env GITHUB_REPO)')
    process.exit(1)
  }
  const apiUrl = `https://api.github.com/repos/${args.repo}/contents/${args.dir}?ref=${encodeURIComponent(args.branch || 'main')}`
  console.log(`Listing CSVs from ${apiUrl}`)
  const listing = await fetchJSON(apiUrl, args.token)
  if (!Array.isArray(listing)) {
    console.error('Unexpected listing response')
    process.exit(1)
  }
  // Accept any CSV; derive period from first YYYY-MM in filename
  const files = listing.filter(item => item.type === 'file' && /\.csv$/i.test(item.name))
  if (!files.length) {
    console.warn('No CSV files matching YYYY-MM.csv found')
    process.exit(0)
  }
  // Sort by detected period ascending
  files.sort((a, b) => {
    const ma = a.name.match(/(\d{4})-(\d{2})/)
    const mb = b.name.match(/(\d{4})-(\d{2})/)
    if (!ma || !mb) return a.name.localeCompare(b.name)
    const ya = Number(ma[1]); const maNum = Number(ma[2])
    const yb = Number(mb[1]); const mbNum = Number(mb[2])
    if (ya !== yb) return ya - yb
    return maNum - mbNum
  })
  const targets = args.latestOnly ? [files[files.length - 1]] : files
  const latestCsv = listing.find(item => item.type === 'file' && /latest\.csv$/i.test(item.name))

  const outDir = path.join(process.cwd(), 'content', 'forecasts')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })
  if (args.saveCsv) {
    const rawAbs = path.join(process.cwd(), args.rawDir)
    if (!fs.existsSync(rawAbs)) fs.mkdirSync(rawAbs, { recursive: true })
    // also ensure public mirror exists
    const pubCsv = path.join(process.cwd(), 'public', 'data', 'csv')
    if (!fs.existsSync(pubCsv)) fs.mkdirSync(pubCsv, { recursive: true })
  }

  let lastPeriod = null
  let prevIndexMap = {}
  for (const f of targets) {
    const m = f.name.match(/(\d{4}-\d{2})/)
    const period = m ? m[1] : null
    if (!period) { console.warn(`Skip ${f.name} (no YYYY-MM in name)`); continue }
    console.log(`Fetching ${period} from ${f.download_url}`)
    const csv = await fetchText(f.download_url, args.token)
    const { header, rows } = parseCSV(csv)
    let snapshot
    // If CSV matches our schema, build directly; else try matrix (date + country columns); else normalize
    const headerLower = rows.length ? Object.keys(rows[0]).map(k => k.toLowerCase()) : []
    const looksStandard = ['id','name','entitytype','index'].every(k => headerLower.includes(k))
    if (looksStandard) {
      snapshot = buildSnapshotFromSchema(rows, { period, version: '1.0' })
    } else if ((header?.length || 0) > 5 && (!header[0] || /date/i.test(header[0]))) {
      snapshot = buildSnapshotFromMatrix(header, rows, { period, version: '1.0' }, prevIndexMap)
      prevIndexMap = Object.fromEntries((snapshot.entities || []).map(e => [e.id, e.index]))
    } else {
      const norm = normalizeRows(rows, args, prevIndexMap)
      // propagate previous values map for deltas
      prevIndexMap = Object.fromEntries(norm.map(e => [e.id || e.iso3 || e.name, e.index]))
      snapshot = buildSnapshotFromSchema(norm, { period, version: '1.0' })
    }
    const outPeriod = snapshot?.period || period
    const outFile = path.join(outDir, `${outPeriod}.json`)
    fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2))
    if (args.saveCsv) {
      const rawFile = path.join(process.cwd(), args.rawDir, `${outPeriod}.csv`)
      fs.writeFileSync(rawFile, csv)
      const pubFile = path.join(process.cwd(), 'public', 'data', 'csv', `${outPeriod}.csv`)
      fs.writeFileSync(pubFile, csv)
    }
    lastPeriod = outPeriod
  }

  // Process latest.csv if present (derive period from last date row)
  if (latestCsv) {
    try {
      console.log(`Processing latest.csv from ${latestCsv.download_url}`)
      const csv = await fetchText(latestCsv.download_url, args.token)
      const { header, rows } = parseCSV(csv)
      const dateKey = header[0]
      const lastRow = rows[rows.length - 1] || {}
      const derived = parseYYYYMM(lastRow[dateKey])
      if (derived) {
        const snapshot = buildSnapshotFromMatrix(header, rows, { period: derived, version: '1.0' }, prevIndexMap)
        const outFile = path.join(outDir, `${derived}.json`)
        fs.writeFileSync(outFile, JSON.stringify(snapshot, null, 2))
        if (args.saveCsv) {
          const rawDirAbs = path.join(process.cwd(), args.rawDir)
          if (!fs.existsSync(rawDirAbs)) fs.mkdirSync(rawDirAbs, { recursive: true })
          fs.writeFileSync(path.join(rawDirAbs, `${derived}.csv`), csv)
          fs.writeFileSync(path.join(rawDirAbs, `latest.csv`), csv)
        }
        lastPeriod = derived
      } else {
        console.warn('Could not derive period from latest.csv (no date cell found)')
      }
    } catch (e) {
      console.warn('Failed processing latest.csv:', e?.message || e)
    }
  }

  if (lastPeriod) {
    const latestFile = path.join(outDir, 'latest.json')
    const latestContent = fs.readFileSync(path.join(outDir, `${lastPeriod}.json`), 'utf-8')
    fs.writeFileSync(latestFile, latestContent)
    // latest.csv already written above if needed; if not present, copy from lastPeriod
    if (args.saveCsv) {
      const rawDirAbs = path.join(process.cwd(), args.rawDir)
      const src = path.join(rawDirAbs, `${lastPeriod}.csv`)
      const dst = path.join(rawDirAbs, `latest.csv`)
      if (fs.existsSync(src) && !fs.existsSync(dst)) fs.copyFileSync(src, dst)
      const pubCsv = path.join(process.cwd(), 'public', 'data', 'csv')
      if (!fs.existsSync(pubCsv)) fs.mkdirSync(pubCsv, { recursive: true })
      fs.copyFileSync(src, path.join(pubCsv, `${lastPeriod}.csv`))
      fs.copyFileSync(src, path.join(pubCsv, `latest.csv`))
    }
    console.log(`Synced ${targets.length} snapshot(s). Latest: ${lastPeriod}`)
  }
}

if (require.main === module) {
  // Ensure global fetch (Node 18+)
  if (typeof fetch !== 'function') {
    console.error('This script requires Node 18+ (global fetch).')
    process.exit(1)
  }
  main().catch(err => { console.error(err.message || err); process.exit(1) })
}
