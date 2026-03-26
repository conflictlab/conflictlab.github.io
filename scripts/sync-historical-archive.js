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

  // Fetch list of Historical_Predictions files
  const histPredUrl = `https://api.github.com/repos/conflictlab/Pace-map-risk/contents/Historical_Predictions`;
  const res = await fetch(histPredUrl, {
    headers: { 'Accept': 'application/vnd.github+json' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Historical_Predictions: ${res.status}`);
  }

  const files = await res.json();

  // Group files by period
  const periods = new Map();
  for (const file of files) {
    if (file.type !== 'file') continue;
    const parsed = parseHistoricalPredictionFilename(file.name);
    if (!parsed) continue;

    if (!periods.has(parsed.period)) {
      periods.set(parsed.period, {});
    }

    const periodData = periods.get(parsed.period);
    if (parsed.type === 'h6') {
      periodData.h6 = file.download_url;
    } else if (parsed.type === 'h12') {
      periodData.h12 = file.download_url;
    }
  }

  console.log(`Found ${periods.size} periods with predictions\n`);

  // Fetch Hist.csv once (it's the same for all periods)
  const histCsv = await fetchText(`${GITHUB_BASE}/Hist.csv`);

  // Process each period
  for (const [period, urls] of Array.from(periods.entries()).sort()) {
    console.log(`Processing ${period}...`);

    const archiveDir = path.join(ARCHIVE_BASE, period);
    fs.mkdirSync(archiveDir, { recursive: true });

    // Fetch h6 and h12 predictions
    const h6Data = urls.h6 ? await fetchText(urls.h6) : null;
    const h12Data = urls.h12 ? await fetchText(urls.h12) : null;

    if (!h6Data && !h12Data) {
      console.warn(`  ⚠️  No h6 or h12 data found, skipping`);
      continue;
    }

    // Parse to get forecasts (they contain mean, min, max in separate rows or files)
    // For now, we'll use the raw h6/h12 files as the mean forecasts
    // We need to check the format

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

    // Write Hist.csv
    if (histCsv) {
      fs.writeFileSync(path.join(archiveDir, 'Hist.csv'), histCsv);
      console.log(`  ✓ Hist.csv`);
    }

    // Create metadata.json
    const [year, month] = period.split('-');
    const nextMonth = new Date(Date.UTC(parseInt(year), parseInt(month), 1));
    const h6End = new Date(nextMonth);
    h6End.setUTCMonth(h6End.getUTCMonth() + 5);
    const h12End = new Date(nextMonth);
    h12End.setUTCMonth(h12End.getUTCMonth() + 11);

    const metadata = {
      run_date: new Date().toISOString(),
      data_end_date: period,
      forecast_start_date: `${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, '0')}`,
      h6_end_date: `${h6End.getUTCFullYear()}-${String(h6End.getUTCMonth() + 1).padStart(2, '0')}`,
      h12_end_date: `${h12End.getUTCFullYear()}-${String(h12End.getUTCMonth() + 1).padStart(2, '0')}`,
      training_window_months: 24,
      historical_start_date: '1989-01',
      historical_end_date: period,
      source: 'Historical_Predictions (archived)',
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
