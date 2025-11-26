Forecasting Report (6‑month) — Workflow
======================================

This repo includes helper scripts to build the 6‑month Forecasting Report using Python code in `reports/generator` and the Overleaf LaTeX project in `reports/overleaf`.

Prerequisites
- Python 3 with venv and packages for `reports/generator/report.py`.
  - Quick setup: `(cd reports/generator && python3 -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt)`
  - You can also use the project venv: `../../.venv310/bin/python report.py`
- LaTeX toolchain (e.g., `latexmk`) if compiling locally.

Inputs and outputs
- Inputs prepared from website data:
  - `public/data/hist.csv` → `reports/generator/Hist.csv`
  - Last 6 rows of `hist.csv` → `reports/generator/Hist_true.csv`
  - `public/data/csv/latest.csv` → `reports/generator/Pred_df.csv`
  - `public/data/scenarios.denorm.json` → `reports/generator/scenarios.denorm.json` (reference)
- Python outputs:
  - Figures: `reports/overleaf/Fig_2025/` (the script saves directly to Overleaf)
  - Tables: `reports/overleaf/tables/` (e.g., `metrics.tex`, `top_errors.tex`)
  - Meta macros: `reports/overleaf/meta.tex` (e.g., `\ReportSubtitle`, observed/predicted ranges)

Environment and flags
- `SKIP_VIEWS`, `SKIP_CF` (default 1): skip external benchmarks (no network required).
- `ARCHIVE_PRED_FILE`: point to an archived 6‑month predictions CSV to generate a historical report.
- `MPLCONFIGDIR`: set to a writable folder (script uses `.mpl`).

Quick Steps
1) Prepare inputs
   - `npm run report:prepare`

2) Generate figures/tables/meta with Python
   - Using system Python:
     - `(cd reports/generator && python report.py)`
   - Using project venv:
     - `(cd reports/generator && ../../.venv310/bin/python report.py)`
   - Notes:
     - External benchmarks are skipped by default; set `SKIP_VIEWS=0 SKIP_CF=0` to enable.
     - Figures are written directly to `reports/overleaf/Fig_2025`.

3) (Optional) Sync figures
   - Only needed if you modify `report.py` to save outputs under `reports/generator/`.
   - `npm run report:sync-overleaf`

4) Compile the report PDF
   - Local: `(cd reports/overleaf && latexmk -pdf main_Fall_2025.tex)`
   - Or compile on Overleaf and place the resulting `main_Fall_2025.pdf` back in the same folder.

5) Publish to the website
   - `npm run report:publish`
   - Subtitle resolution order used for the destination filename:
     1) `reports/overleaf/meta.tex`: `\newcommand{\ReportSubtitle}{<Month Year>}`
     2) Literal `\subtitle{...}` in the `.tex` (ignored if it’s a macro name)
     3) First forecast month from `reports/generator/Pred_df.csv`
   - Output path: `public/newslettersAndReports/ForecastingReport_<Subtitle>.pdf`

6) Verify site
   - Reports page auto-discovers the latest `ForecastingReport_*.pdf` and links it as “Latest Report”.

Batch generation
- Process archived monthly predictions in `content/forecasts/csv/` and publish PDFs:
  - All eligible: `npm run report:batch`
  - Latest N: `npm run report:batch -- --latest=N`
  - Latest 1 (monthly): `npm run report:monthly`
- Eligibility: only archives whose 6 forecast months are fully observable in `Hist.csv` are processed.
- Requires `latexmk` unless run with `--no-latex` (publishing will be skipped in that case).

Troubleshooting
- Timeouts: Python can take a few minutes; re-run with `SKIP_VIEWS=1 SKIP_CF=1` to avoid network calls.
- Missing tables: ensure `reports/generator/report.py` runs with `unicodedata` imported (already fixed) so `top_errors.tex` is populated.
- Wrong subtitle in filename: ensure you ran Python to regenerate `meta.tex`, then run `npm run report:publish`.
