#!/usr/bin/env node
/**
 * Mirror forecast CSVs from conflictlab/Pace-map-risk and ensure a leading 'date' (YYYY-MM) column.
 * Writes to public/data/forecasts/latest/ in this repo.
 */
const fs = require('fs');
const path = require('path');

const BASE = 'https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main';
const OUT_DIR = path.join(process.cwd(), 'public', 'data', 'forecasts', 'latest');

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
  fs.mkdirSync(OUT_DIR, { recursive: true });
  // Mirror metadata as well
  fs.writeFileSync(path.join(OUT_DIR, 'metadata.json'), metaText);
  for (const f of files) {
    try {
      const text = await fetchText(`${BASE}/${f}`);
      const out = ensureDateColumn(text, startYM);
      fs.writeFileSync(path.join(OUT_DIR, f), out);
      console.log(`Wrote ${path.join('public','data','forecasts','latest', f)}`);
    } catch (e) {
      console.warn(`Skipping ${f}: ${e.message}`);
    }
  }
}

if (require.main === module) {
  main().catch(e => { console.error(e.message || e); process.exit(1); });
}

