#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function getFirstForecastMonth(predCsvPath) {
  const text = fs.readFileSync(predCsvPath, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error('Pred_df.csv missing data rows');
  const firstData = lines[1];
  const dateStr = firstData.split(',')[0].trim(); // e.g., 2025-11-30
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new Error(`Unparseable date: ${dateStr}`);
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${monthNames[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function updateSubtitle(texPath, subtitle) {
  let tex = fs.readFileSync(texPath, 'utf8');
  const re = /\\subtitle\{[^}]*\}/;
  if (!re.test(tex)) throw new Error('No \\subtitle{...} found');
  tex = tex.replace(re, `\\subtitle{${subtitle}}`);
  fs.writeFileSync(texPath, tex);
  console.log(`Updated subtitle in ${texPath} -> ${subtitle}`);
}

function main() {
  const root = process.cwd();
  const predCsv = path.join(root, 'reports', 'generator', 'Pred_df.csv');
  const overleafDir = path.join(root, 'reports', 'overleaf');
  const texCandidates = ['main_Fall_2025.tex', 'main.tex'].map(f => path.join(overleafDir, f));
  const texPath = texCandidates.find(p => fs.existsSync(p));
  if (!fs.existsSync(predCsv)) throw new Error(`Missing ${predCsv}`);
  if (!texPath) throw new Error(`No LaTeX main file in ${overleafDir}`);
  const subtitle = getFirstForecastMonth(predCsv);
  updateSubtitle(texPath, subtitle);
}

main();

