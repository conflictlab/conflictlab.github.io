#!/usr/bin/env node
/**
 * Sync generated figures from tmp/Jan_2025 into the Overleaf project folder.
 * - Copies known outputs if present (pred_map, true_map, Fore_map, Fore_all, Heatmap, dtw_best, Views)
 * - Targets tmp/ForecastingReport_fromOverleaf/Fig_2025/
 * - Does not convert formats; copies as-is (.png/.pdf). Overleaf will use what's present.
 */
const fs = require('fs');
const path = require('path');

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function copyIfExists(src, dest) {
  if (exists(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} -> ${dest}`);
    return true;
  }
  return false;
}

function main() {
  const root = process.cwd();
  const janDir = path.join(root, 'reports', 'generator');
  const overleafDir = path.join(root, 'reports', 'overleaf');
  if (!exists(janDir) || !exists(overleafDir)) {
    console.error('Missing tmp/Jan_2025 or tmp/ForecastingReport_fromOverleaf');
    process.exit(1);
  }
  const figDir = ['Fig_2025', 'Fig'].map(d => path.join(overleafDir, d)).find(exists) || path.join(overleafDir, 'Fig');
  ensureDir(figDir);

  // Known figure base names expected by main_Fall_2025.tex
  const names = ['pred_map', 'true_map', 'Fore_map', 'Fore_all', 'Heatmap', 'dtw_best', 'Views'];
  const exts = ['.png', '.pdf'];

  let copiedAny = false;
  for (const base of names) {
    let done = false;
    for (const ext of exts) {
      const src = path.join(janDir, `${base}${ext}`);
      const dest = path.join(figDir, `${base}${ext}`);
      if (copyIfExists(src, dest)) { done = true; copiedAny = true; break; }
    }
    if (!done) console.warn(`Note: did not find ${base}.{png|pdf} in ${janDir}`);
  }

  if (!copiedAny) {
    console.log('No figures were copied. Ensure tmp/Jan_2025/report.py saved expected outputs.');
  } else {
    console.log(`Figures synced into ${figDir}`);
  }
}

main();
