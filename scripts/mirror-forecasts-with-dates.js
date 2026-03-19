#!/usr/bin/env node
/**
 * Mirror forecast CSVs from conflictlab/Pace-map-risk and ensure a leading 'date' (YYYY-MM) column.
 * Writes to public/data/forecasts/latest/ in this repo.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main';
const LATEST_DIR = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest');

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return await res.text();
}

function yyyymmAdd(start, idx) {
  // start: 'YYYY-MM', idx: 0..N-1
  const [y, m] = start.split('-').map(n => parseInt(n, 10));
  const date = new Date(Date.UTC(y, m - 1 + idx, 1));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
}

function ensureDateColumn(csv, startYM) {
  const lines = String(csv).split(/\r?\n/).filter(l => l.length > 0);
  if (lines.length < 2) return csv;
  const header = lines[0];
  const cols = header.split(',');
  if (cols[0].toLowerCase() === 'date') return csv; // already has date
  const out = [];
  out.push(['date', ...cols].join(','));
  const rows = lines.slice(1);
  for (let i = 0; i < rows.length; i++) {
    const ym = yyyymmAdd(startYM, i);
    out.push([ym, rows[i]].join(','));
  }
  return out.join('\n') + '\n';
}

async function main() {
  const metaText = await fetchText(`${BASE}/forecast_metadata.json`);
  const meta = JSON.parse(metaText);
  const startYM = meta.forecast_start_date || meta.h6_start_date || meta.data_end_date;
  if (!startYM) throw new Error('Missing forecast_start_date in metadata');
  const files = [
    'forecasts_h6.csv','forecasts_h6_min.csv','forecasts_h6_max.csv',
    'forecasts_h12.csv','forecasts_h12_min.csv','forecasts_h12_max.csv'
  ];
  fs.mkdirSync(LATEST_DIR, { recursive: true });
  // Mirror metadata as well
  fs.writeFileSync(path.join(LATEST_DIR, 'metadata.json'), metaText);
  // Also write an archive snapshot for this period
  const period = meta.forecast_start_date || meta.data_end_date;
  const ARCH_DIR = path.join(process.cwd(), 'public', 'data', 'forecasts', 'archive', period);
  fs.mkdirSync(ARCH_DIR, { recursive: true });
  fs.writeFileSync(path.join(ARCH_DIR, 'metadata.json'), metaText);
  // Mirror Hist.csv (historical series) as well
  try {
    const histText = await fetchText(`${BASE}/Hist.csv`)
    fs.writeFileSync(path.join(LATEST_DIR, 'Hist.csv'), histText)
    fs.writeFileSync(path.join(ARCH_DIR, 'Hist.csv'), histText)
    console.log('Wrote latest and archive for Hist.csv')
  } catch (e) {
    console.warn('Skipping Hist.csv mirror:', e?.message || e)
  }
  for (const f of files) {
    try {
      const text = await fetchText(`${BASE}/${f}`);
      const out = ensureDateColumn(text, startYM);
      fs.writeFileSync(path.join(LATEST_DIR, f), out);
      fs.writeFileSync(path.join(ARCH_DIR, f), out);
      console.log(`Wrote latest and archive for ${f}`);
    } catch (e) {
      console.warn(`Skipping ${f}: ${e.message}`);
    }
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e.message || e); process.exit(1); });
}
