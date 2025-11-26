#!/usr/bin/env node
/**
 * Prepare inputs for the 6‑month Forecasting Report generator (tmp/Jan_2025).
 * - Hist.csv: copy from public/data/hist.csv
 * - Hist_true.csv: last 6 rows of hist.csv (with header)
 * - Pred_df.csv: copy from public/data/csv/latest.csv
 * - scenarios.denorm.json: copy from public/data/scenarios.denorm.json (for reference)
 */
const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`Copied ${src} -> ${dest}`);
}

function lastNLinesWithHeader(srcFile, n) {
  const text = fs.readFileSync(srcFile, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error(`Not enough lines in ${srcFile}`);
  const header = lines[0];
  const data = lines.slice(1);
  const tail = data.slice(-n);
  return [header, ...tail].join('\n') + '\n';
}

function main() {
  const root = process.cwd();
  const janDir = path.join(root, 'reports', 'generator');
  if (!fs.existsSync(janDir)) {
    console.error(`Missing directory: ${janDir}`);
    process.exit(1);
  }

  const histSrc = path.join(root, 'public', 'data', 'hist.csv');
  const latestPredSrc = path.join(root, 'public', 'data', 'csv', 'latest.csv');
  const scenariosSrc = path.join(root, 'public', 'data', 'scenarios.denorm.json');

  const histDest = path.join(janDir, 'Hist.csv');
  const histTrueDest = path.join(janDir, 'Hist_true.csv');
  const predDest = path.join(janDir, 'Pred_df.csv');
  const scenDest = path.join(janDir, 'scenarios.denorm.json');

  // 1) Hist.csv
  copyFile(histSrc, histDest);

  // 2) Hist_true.csv (last 6 rows)
  const last6 = lastNLinesWithHeader(histSrc, 6);
  fs.writeFileSync(histTrueDest, last6);
  console.log(`Wrote ${histTrueDest} (last 6 rows)`);

  // 3) Pred_df.csv
  copyFile(latestPredSrc, predDest);

  // 4) scenarios.denorm.json (for reference)
  if (fs.existsSync(scenariosSrc)) {
    copyFile(scenariosSrc, scenDest);
  } else {
    console.warn(`Warning: scenarios not found at ${scenariosSrc}`);
  }

  console.log('Report data preparation complete.');
}

main();
