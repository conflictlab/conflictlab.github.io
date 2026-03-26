#!/usr/bin/env node
/**
 * Sync all Historical_Predictions from Pace-map-risk to website archive.
 * Creates public/data/forecasts/archive/YYYY-MM/ directories with:
 * - forecasts_h6.csv, forecasts_h6_min.csv, forecasts_h6_max.csv
 * - forecasts_h12.csv, forecasts_h12_min.csv, forecasts_h12_max.csv
 * - Hist.csv (from GitHub)
 * - metadata.json
 * - forecasts-YYYY-MM.zip bundle
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GITHUB_BASE = 'https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main';
const ARCHIVE_BASE = path.join(process.cwd(), 'public', 'data', 'forecasts', 'archive');
const LOCAL_CSV_DIR = path.join(process.cwd(), 'content', 'forecasts', 'csv');

async function fetchText(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    console.warn(`Failed to fetch ${url}:`, e.message);
    return null;
  }
}

function parseHistoricalPredictionFilename(filename) {
  // New format: YYYY-MM_h6.csv or YYYY-MM_h12.csv
  let match = filename.match(/^(\d{4}-\d{2})_(h6|h12)\.csv$/);
  if (match) {
    return { period: match[1], type: match[2], filename };
  }

  // Old format: YYYY-MM_MonthYYYY_to_MonthYYYY.csv (these are h6 forecasts)
  match = filename.match(/^(\d{4}-\d{2})_[A-Z][a-z]+-\d{4}_to_[A-Z][a-z]+-\d{4}\.csv$/);
  if (match) {
    return { period: match[1], type: 'h6', filename };
  }

  // Alternative format: YYYY-MM_YYYY-MM_to_YYYY-MM_h6.csv
  match = filename.match(/^(\d{4}-\d{2})_\d{4}-\d{2}_to_\d{4}-\d{2}_(h6|h12)\.csv$/);
  if (match) {
    return { period: match[1], type: match[2], filename };
  }

  return null;
}

async function main() {
  console.log('Syncing Historical_Predictions to website archive...\n');

  // Fetch list of Historical_Predictions files from GitHub
  const periods = new Map();
  try {
    const histPredUrl = `https://api.github.com/repos/conflictlab/Pace-map-risk/contents/Historical_Predictions`;
    const res = await fetch(histPredUrl, { headers: { 'Accept': 'application/vnd.github+json' } });
    if (res.ok) {
      const files = await res.json();
      for (const file of files) {
        if (file.type !== 'file') continue;
        const parsed = parseHistoricalPredictionFilename(file.name);
        if (!parsed) continue;
        if (!periods.has(parsed.period)) periods.set(parsed.period, {});
        const periodData = periods.get(parsed.period);
        if (parsed.type === 'h6') periodData.h6 = file.download_url;
        else if (parsed.type === 'h12') periodData.h12 = file.download_url;
      }
    } else {
      console.warn(`Failed to fetch Historical_Predictions: ${res.status}`);
    }
  } catch (e) {
    console.warn('Skipping GitHub Historical_Predictions fetch:', e?.message || e);
  }

  // Also include locally available CSV snapshots for missing periods (content/forecasts/csv/YYYY-MM.csv)
  try {
    if (fs.existsSync(LOCAL_CSV_DIR)) {
      const files = fs.readdirSync(LOCAL_CSV_DIR).filter(f => /^(\d{4}-\d{2})\.csv$/.test(f));
      for (const f of files) {
        const m = f.match(/^(\d{4}-\d{2})\.csv$/);
        if (!m) continue;
        const period = m[1];
        if (!periods.has(period)) periods.set(period, {});
        const pd = periods.get(period);
        pd.local = path.join(LOCAL_CSV_DIR, f);
      }
    }
  } catch (e) {
    console.warn('Skipping local CSV inclusion:', e?.message || e);
  }

  console.log(`Found ${periods.size} periods with predictions (GitHub + local)\n`);

  // Fetch Hist.csv once; we'll truncate per period to match historical_end_date
  const histCsv = await fetchText(`${GITHUB_BASE}/Hist.csv`);
  function truncateHistCsv(csvText, period) {
    if (!csvText) return null;
    try {
      const [yyyy, mm] = period.split('-').map(n => parseInt(n, 10));
      const end = new Date(Date.UTC(yyyy, mm, 0)); // last day of month
      const lines = String(csvText).split(/\r?\n/).filter(l => l.length > 0);
      if (!lines.length) return null;
      const header = lines[0];
      const out = [header];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        const d = parts[0];
        if (!d) continue;
        const dt = new Date(d);
        if (!Number.isFinite(dt.getTime())) continue;
        if (dt.getTime() <= end.getTime()) out.push(lines[i]);
      }
      return out.join('\n') + '\n';
    } catch { return csvText }
  }

  // Process each period
  for (const [period, urls] of Array.from(periods.entries()).sort()) {
    console.log(`Processing ${period}...`);

    const archiveDir = path.join(ARCHIVE_BASE, period);
    fs.mkdirSync(archiveDir, { recursive: true });

    // Fetch h6 and h12 predictions
    let h6Data = urls.h6 ? await fetchText(urls.h6) : null;
    let h12Data = urls.h12 ? await fetchText(urls.h12) : null;

    // If not available from GitHub, try local content CSV (YYYY-MM.csv)
    // Local CSVs contain a header plus 6 or 12 rows starting from the forecast start month.
    if ((!h6Data || !h12Data) && urls.local) {
      try {
        const local = fs.readFileSync(urls.local, 'utf-8');
        const lines = String(local).trim().split(/\r?\n/);
        if (lines.length > 1) {
          // Ensure first column header is 'date'
          const headParts = lines[0].split(',');
          if (!headParts[0] || headParts[0].toLowerCase() === '') headParts[0] = 'date';
          const header = headParts.join(',');
          const dataLines = lines.slice(1);
          // h6 = first 6 rows
          const h6Lines = [header, ...dataLines.slice(0, 6)];
          h6Data = h6Data || (h6Lines.join('\n') + '\n');
          // h12 = first 12 if available
          if (dataLines.length >= 12) {
            const h12Lines = [header, ...dataLines.slice(0, 12)];
            h12Data = h12Data || (h12Lines.join('\n') + '\n');
          }
        }
      } catch (e) {
        console.warn(`  ⚠️  Could not use local CSV for ${period}: ${e?.message || e}`);
      }
    }

    if (!h6Data && !h12Data) {
      console.warn(`  ⚠️  No h6 or h12 data found, skipping`);
      continue;
    }

    // Parse to get forecasts (we treat provided CSVs as mean forecasts)

    if (h6Data) {
      // Check if it has min/max columns or is just mean
      const lines = h6Data.split('\n');
      const header = lines[0];

      // Simple format: just write as forecasts_h6.csv
      fs.writeFileSync(path.join(archiveDir, 'forecasts_h6.csv'), h6Data);
      console.log(`  ✓ forecasts_h6.csv`);

      // Create placeholder min/max (these might not exist in old format)
      // We'll generate them by assuming mean ± some factor
      const dataLines = lines.slice(1).filter(l => l.trim());
      const minCsv = [header, ...dataLines.map(line => {
        const parts = line.split(',');
        return parts.map((val, idx) => {
          if (idx === 0) return val; // row index or date
          const num = parseFloat(val);
          return isNaN(num) ? val : (num * 0.7).toFixed(6);
        }).join(',');
      })].join('\n');

      const maxCsv = [header, ...dataLines.map(line => {
        const parts = line.split(',');
        return parts.map((val, idx) => {
          if (idx === 0) return val;
          const num = parseFloat(val);
          return isNaN(num) ? val : (num * 1.3).toFixed(6);
        }).join(',');
      })].join('\n');

      fs.writeFileSync(path.join(archiveDir, 'forecasts_h6_min.csv'), minCsv);
      fs.writeFileSync(path.join(archiveDir, 'forecasts_h6_max.csv'), maxCsv);
      console.log(`  ✓ forecasts_h6_min/max.csv (estimated)`);
    }

    if (h12Data) {
      fs.writeFileSync(path.join(archiveDir, 'forecasts_h12.csv'), h12Data);
      console.log(`  ✓ forecasts_h12.csv`);

      // Create min/max for h12 as well
      const lines = h12Data.split('\n');
      const header = lines[0];
      const dataLines = lines.slice(1).filter(l => l.trim());

      const minCsv = [header, ...dataLines.map(line => {
        const parts = line.split(',');
        return parts.map((val, idx) => {
          if (idx === 0) return val;
          const num = parseFloat(val);
          return isNaN(num) ? val : (num * 0.7).toFixed(6);
        }).join(',');
      })].join('\n');

      const maxCsv = [header, ...dataLines.map(line => {
        const parts = line.split(',');
        return parts.map((val, idx) => {
          if (idx === 0) return val;
          const num = parseFloat(val);
          return isNaN(num) ? val : (num * 1.3).toFixed(6);
        }).join(',');
      })].join('\n');

      fs.writeFileSync(path.join(archiveDir, 'forecasts_h12_min.csv'), minCsv);
      fs.writeFileSync(path.join(archiveDir, 'forecasts_h12_max.csv'), maxCsv);
      console.log(`  ✓ forecasts_h12_min/max.csv (estimated)`);
    }

    // Write Hist.csv (truncated to period end)
    if (histCsv) {
      const histForPeriod = truncateHistCsv(histCsv, period) || histCsv;
      fs.writeFileSync(path.join(archiveDir, 'Hist.csv'), histForPeriod);
      console.log(`  ✓ Hist.csv (through ${period})`);
    }

    // Create metadata.json (use correct period semantics)
    const [yy, mm] = period.split('-').map(n => parseInt(n, 10));
    // start = forecast_start_date (period)
    const start = new Date(Date.UTC(yy, mm - 1, 1));
    // data_end_date = previous month
    const dataEnd = new Date(Date.UTC(yy, mm - 1, 1));
    dataEnd.setUTCMonth(dataEnd.getUTCMonth() - 1);
    // h6 end = start + 5 months; h12 end = start + 11 months
    const h6End = new Date(start); h6End.setUTCMonth(h6End.getUTCMonth() + 5);
    const h12End = new Date(start); h12End.setUTCMonth(h12End.getUTCMonth() + 11);

    const ym = (d) => `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    const metadata = {
      run_date: new Date().toISOString(),
      data_end_date: ym(dataEnd),
      forecast_start_date: ym(start),
      h6_end_date: ym(h6End),
      h12_end_date: ym(h12End),
      training_window_months: 24,
      historical_start_date: '1989-01',
      historical_end_date: ym(dataEnd),
      source: urls.local ? 'content/forecasts/csv (local snapshot)' : 'Historical_Predictions (archived)',
      note: 'Min/max values are estimated at ±30% where not explicitly available'
    };

    fs.writeFileSync(
      path.join(archiveDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    console.log(`  ✓ metadata.json`);

    // Create ZIP bundle
    try {
      const zipPath = path.join(archiveDir, `forecasts-${period}.zip`);
      const files = [
        'forecasts_h6.csv', 'forecasts_h6_min.csv', 'forecasts_h6_max.csv',
        'forecasts_h12.csv', 'forecasts_h12_min.csv', 'forecasts_h12_max.csv',
        'Hist.csv', 'metadata.json'
      ].filter(f => fs.existsSync(path.join(archiveDir, f)));

      execSync(`cd "${archiveDir}" && zip -q -9 "forecasts-${period}.zip" ${files.join(' ')}`, {
        stdio: 'inherit'
      });
      console.log(`  ✓ forecasts-${period}.zip`);
    } catch (e) {
      console.warn(`  ⚠️  Failed to create ZIP: ${e.message}`);
    }

    console.log('');
  }

  console.log(`\n✅ Synced ${periods.size} periods to ${ARCHIVE_BASE}`);
}

if (require.main === module) {
  main().catch(e => {
    console.error('Error:', e.message || e);
    process.exit(1);
  });
}
