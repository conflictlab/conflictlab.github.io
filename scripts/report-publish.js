#!/usr/bin/env node
/**
 * Publish the compiled Forecasting Report PDF to the website folder.
 *
 * Title selection (default: publication/archive month):
 *  --title-source=archive|forecast
 *    archive:
 *      a) --archive=YYYY-MM, else
 *      b) auto-detect by matching reports/generator/Pred_df.csv header+first row
 *         against content/forecasts/csv/YYYY-MM.csv, else
 *      c) fall back to forecast month (Pred_df.csv first row)
 *    forecast:
 *      a) reports/overleaf/meta.tex ReportSubtitle, else
 *      b) \subtitle{literal} in TeX, else
 *      c) Pred_df.csv first forecast month
 *
 * Copies main_Fall_2025.pdf to public/newslettersAndReports/ForecastingReport_<Title>.pdf
 */
const fs = require('fs');
const path = require('path');

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function parseArgs() {
  const out = { titleSource: 'archive', archive: null };
  for (const a of process.argv.slice(2)) {
    const m1 = a.match(/^--title-source=(archive|forecast)$/);
    if (m1) out.titleSource = m1[1];
    const m2 = a.match(/^--archive=(\d{4}-\d{2})$/);
    if (m2) out.archive = m2[1];
  }
  return out;
}

function parseSubtitle(texPath) {
  const text = fs.readFileSync(texPath, 'utf8');
  const m = text.match(/\\subtitle\{([^}]+)\}/);
  return m ? m[1].trim().replace(/\s+/g, ' ') : null;
}

function parseSubtitleFromMeta(metaPath) {
  try {
    const text = fs.readFileSync(metaPath, 'utf8');
    const m = text.match(/\\newcommand\{\\ReportSubtitle\}\{([^}]*)\}/);
    if (m && m[1]) return m[1].trim().replace(/\s+/g, ' ');
  } catch { /* ignore */ }
  return null;
}

function getFirstForecastMonth(predCsvPath) {
  try {
    const text = fs.readFileSync(predCsvPath, 'utf8');
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) return null;
    const firstData = lines[1];
    const dateStr = firstData.split(',')[0].trim();
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  } catch {
    return null;
  }
}

function detectArchiveMonthFromPred(predCsvPath, archivesDir) {
  try {
    const predText = fs.readFileSync(predCsvPath, 'utf8');
    const predLines = predText.split(/\r?\n/).filter(Boolean);
    if (predLines.length < 2) return null;
    const predHeader = predLines[0];
    const predFirst = predLines[1];
    const files = fs.readdirSync(archivesDir).filter(f => /\d{4}-\d{2}\.csv$/.test(f)).sort();
    for (const f of files) {
      const txt = fs.readFileSync(path.join(archivesDir, f), 'utf8');
      const lines = txt.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) continue;
      if (lines[0] === predHeader && lines[1] === predFirst) {
        return f.replace(/\.csv$/, ''); // YYYY-MM
      }
    }
  } catch {}
  return null;
}

function main() {
  const root = process.cwd();
  const { titleSource, archive } = parseArgs();
  const overleafDir = path.join(root, 'reports', 'overleaf');
  // prefer main_Fall_2025.tex, fallback to main.tex
  const candidates = ['main_Fall_2025.tex', 'main.tex'];
  const tex = candidates.map(f => path.join(overleafDir, f)).find(p => exists(p));
  if (!exists(tex)) {
    console.error(`Missing LaTeX main file (tried: ${candidates.join(', ')}) in ${overleafDir}`);
    process.exit(1);
  }
  let subtitle = null;
  const metaPath = path.join(overleafDir, 'meta.tex');
  const predCsv = path.join(root, 'reports', 'generator', 'Pred_df.csv');
  if (titleSource === 'archive') {
    let archiveMonth = archive; // YYYY-MM
    if (!archiveMonth) {
      const archivesDir = path.join(root, 'content', 'forecasts', 'csv');
      if (exists(archivesDir) && exists(predCsv)) {
        archiveMonth = detectArchiveMonthFromPred(predCsv, archivesDir);
      }
    }
    if (archiveMonth) {
      const [y, m] = archiveMonth.split('-').map(s => parseInt(s, 10));
      const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      subtitle = `${monthNames[m-1]} ${y}`;
    }
    if (!subtitle) {
      // Fallback to forecast path
      subtitle = parseSubtitleFromMeta(metaPath) || parseSubtitle(tex) || getFirstForecastMonth(predCsv) || 'Report';
    }
  } else {
    // forecast
    subtitle = parseSubtitleFromMeta(metaPath) || parseSubtitle(tex) || getFirstForecastMonth(predCsv) || 'Report';
  }
  const srcPdf = path.join(overleafDir, path.basename(tex).replace(/\.tex$/, '.pdf'));
  if (!exists(srcPdf)) {
    console.error(`Report PDF not found at ${srcPdf}. Compile LaTeX first (e.g., latexmk -pdf main_Fall_2025.tex).`);
    process.exit(1);
  }
  const destDir = path.join(root, 'public', 'newslettersAndReports');
  fs.mkdirSync(destDir, { recursive: true });
  const dest = path.join(destDir, `ForecastingReport_${subtitle}.pdf`);
  fs.copyFileSync(srcPdf, dest);
  console.log(`Published -> ${dest}`);
}

main();
