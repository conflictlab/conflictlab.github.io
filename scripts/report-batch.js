#!/usr/bin/env node
/**
 * Batch-generate monthly Forecasting Reports from archived predictions.
 *
 * For each file in content/forecasts/csv/YYYY-MM.csv:
 *  - Runs Python generator with ARCHIVE_PRED_FILE pointing at that CSV
 *  - Skips external benchmarks (SKIP_VIEWS=1, SKIP_CF=1)
 *  - Compiles LaTeX (if latexmk is available)
 *  - Copies PDF to public/newslettersAndReports/ForecastingReport_<Subtitle>.pdf
 *
 * Flags:
 *  --latest=N               Only run the last N eligible archives
 *  --no-latex               Skip LaTeX compile/publish
 *  --since=YYYY-MM          Only run archives from this month onward (inclusive)
 *  --force                  Do not filter by eligibility (i.e., allow partial truth)
 *  --title-source=X         X in {forecast, archive}; default 'forecast'
 */
const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

function listArchives(dir) {
  const files = fs.readdirSync(dir);
  return files
    .filter(f => /\d{4}-\d{2}\.csv$/.test(f))
    .sort();
}

function parseArgs() {
  // Default titleSource is 'archive' (publication month)
  const out = { latest: null, noLatex: false, since: null, force: false, titleSource: 'archive' };
  for (const a of process.argv.slice(2)) {
    const m = a.match(/^--latest=(\d+)$/);
    if (m) out.latest = parseInt(m[1], 10);
    if (a === '--no-latex') out.noLatex = true;
    const m2 = a.match(/^--since=(\d{4}-\d{2})$/);
    if (m2) out.since = m2[1];
    if (a === '--force') out.force = true;
    const m3 = a.match(/^--title-source=(forecast|archive)$/);
    if (m3) out.titleSource = m3[1];
  }
  return out;
}

function monthAdd(d, k) {
  const dd = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + k, 1));
  // set to end of month by moving to next month, subtracting 1 day? Here we only compare by month, so exact day is irrelevant
  return dd;
}

function lastDataMonth(histCsvPath) {
  const text = fs.readFileSync(histCsvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  // Last non-empty data line holds the last observed month
  if (lines.length < 2) throw new Error(`Not enough rows in ${histCsvPath}`);
  const last = lines[lines.length - 1];
  const dateStr = last.split(',')[0].trim();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new Error(`Unparseable date in ${histCsvPath}: ${dateStr}`);
  return d;
}

function firstForecastMonthFromCsv(csvPath) {
  const text = fs.readFileSync(csvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error(`No data rows in ${csvPath}`);
  const dateStr = lines[1].split(',')[0].trim();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new Error(`Unparseable date in ${csvPath}: ${dateStr}`);
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function archiveMonthFromFilename(fileName) {
  // fileName: YYYY-MM.csv
  const m = fileName.match(/^(\d{4})-(\d{2})\.csv$/);
  if (!m) throw new Error(`Invalid archive filename: ${fileName}`);
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${monthNames[month]} ${year}`;
}

function runPythonForArchive(archiveCsv) {
  const root = process.cwd();
  const genDir = path.join(root, 'reports', 'generator');
  const pythonBin = path.join(genDir, '.venv', 'bin', 'python');
  const env = {
    ...process.env,
    ARCHIVE_PRED_FILE: archiveCsv,
    SKIP_VIEWS: '1',
    SKIP_CF: '1',
    MPLCONFIGDIR: path.join(genDir, '.mpl'),
  };
  console.log(`Generating report figures/tables for ${path.basename(archiveCsv)} ...`);
  execFileSync(pythonBin, [path.join(genDir, 'report.py')], { stdio: 'inherit', env, cwd: genDir });
}

function latexmkAvailable() {
  try { execFileSync('latexmk', ['-v'], { stdio: 'ignore' }); return true; } catch { return false; }
}

function compileLatex() {
  const root = process.cwd();
  const overleafDir = path.join(root, 'reports', 'overleaf');
  console.log('Compiling LaTeX (main_Fall_2025.tex) ...');
  const res = spawnSync('latexmk', ['-pdf', 'main_Fall_2025.tex'], { cwd: overleafDir, stdio: 'inherit' });
  if (res.status !== 0) throw new Error('latexmk failed');
  return path.join(overleafDir, 'main_Fall_2025.pdf');
}

function publishPdf(subtitle, pdfPath) {
  const root = process.cwd();
  const destDir = path.join(root, 'public', 'newslettersAndReports');
  fs.mkdirSync(destDir, { recursive: true });
  const safe = subtitle.replace(/\s+/g, ' ');
  const dest = path.join(destDir, `ForecastingReport_${safe}.pdf`);
  fs.copyFileSync(pdfPath, dest);
  console.log(`Published -> ${dest}`);
}

function main() {
  const root = process.cwd();
  const archivesDir = path.join(root, 'content', 'forecasts', 'csv');
  let archives = listArchives(archivesDir);
  const { latest, noLatex, since, force, titleSource } = parseArgs();

  if (since) {
    // Keep archives from 'since' onward (string compare works with YYYY-MM)
    archives = archives.filter(f => f >= `${since}.csv`);
  }
  if (!archives.length) {
    console.error(`No archives found in ${archivesDir}`);
    process.exit(1);
  }
  // Ensure Hist.csv/Hist_true.csv are up to date for truth alignment
  try {
    execFileSync('node', ['scripts/report-prepare-data.js'], { stdio: 'inherit' });
  } catch (e) {
    console.warn('Warning: report:prepare failed or not needed:', e.message);
  }

  // Determine eligible archives
  let eligible = archives;
  let histMax = null;
  if (!force) {
    // Only keep archives whose 6 forecast months are fully observable in Hist.csv
    const histCsvPath = path.join(root, 'reports', 'generator', 'Hist.csv');
    histMax = lastDataMonth(histCsvPath);
    eligible = archives.filter(f => {
      try {
        const csvPath = path.join(archivesDir, f);
        // Re-parse first data date for range check
        const text = fs.readFileSync(csvPath, 'utf8');
        const lines = text.split(/\r?\n/).filter(Boolean);
        const firstData = lines[1];
        const dateStr = firstData.split(',')[0].trim();
        const d0 = new Date(dateStr);
        if (isNaN(d0.getTime())) return false;
        const d5 = monthAdd(d0, 5);
        return d5 <= histMax;
      } catch { return false; }
    });
  }

  const selected = latest ? eligible.slice(-latest) : eligible;
  const haveLatex = !noLatex && latexmkAvailable();
  const eligMsg = force ? `Found ${eligible.length} archives (force mode)` : `Found ${eligible.length} eligible archives (<= ${histMax.toISOString().slice(0,10)})`;
  console.log(`${eligMsg}. Running ${selected.length}...`);
  for (const f of selected) {
    try {
      const archiveCsv = path.join(archivesDir, f);
      const subtitle = (titleSource === 'archive') ? archiveMonthFromFilename(f) : firstForecastMonthFromCsv(archiveCsv);
      runPythonForArchive(archiveCsv);
      if (haveLatex) {
        const pdf = compileLatex();
        publishPdf(subtitle, pdf);
      } else {
        console.warn('latexmk not found; skipping PDF compile/publish for', f);
      }
    } catch (e) {
      console.error('Failed for', f, e.message);
    }
  }
}

main();
