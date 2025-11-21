Min–Max Denormalization Pipeline

Overview
- Historical raw fatalities are provided as a wide CSV (Hist.csv) hosted at:
  https://github.com/ThomasSchinca/Pace-map-risk/blob/main/Hist.csv
- For each country, the last 10 months were previously min–max scaled. Scenarios are based on that normalized series.
- This repo now fetches Hist.csv monthly, computes per‑country min/max over the last 10 months, and uses it to denormalize scenario temporal values for plotting.

Artifacts
- public/data/hist.csv — cached copy of Hist.csv (downloaded)
- public/data/minmax.json — { [country]: { min, max } } from the last 10 rows
- public/data/scenarios.denorm.json — scenarios.json with temporal values denormalized when they look normalized

Commands
- npm run data:minmax — downloads Hist.csv and writes public/data/minmax.json
- npm run scenarios:denorm — denormalizes public/data/scenarios.json → public/data/scenarios.denorm.json using minmax.json
- npm run data:update — runs both steps above

Automation
- .github/workflows/update-minmax.yml runs monthly and on demand to refresh hist.csv, minmax.json, and scenarios.denorm.json, then commits the results.

Plotting
- lib/scenarios.ts prefers `public/data/scenarios.denorm.json` when present; otherwise it falls back to `scenarios.json`.
- components/ScenariosChart.tsx assumes values are already denormalized and only clamps to a small positive epsilon for log safety. The y‑axis uses a log scale with a rounded upper bound and clear major/minor gridlines.

Notes
- The denormalization always applies for countries found in `minmax.json` (we assume normalized inputs). Countries without a matching min/max entry are copied as-is.
- If a country has constant values across the 10‑month window (min == max), a tiny epsilon is added to avoid zero span.
