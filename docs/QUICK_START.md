# Quick Start: Accessing PACE Forecasting Data

This guide provides a 5-minute introduction to systematically accessing PACE conflict forecasting data.

## The Simplest Way

**Get the latest 12-month forecasts:**
```bash
curl https://conflictlab.github.io/data/forecasts/latest/forecasts_h12.csv
```

**Get the complete historical time series (1989-present):**
```bash
curl https://conflictlab.github.io/data/forecasts/latest/Hist.csv
```

Done! You now have:
- 12-month ahead forecasts for 132 countries
- Complete historical data from 1989 to present

---

## Python (3 lines)

```python
import pandas as pd

forecasts = pd.read_csv("https://conflictlab.github.io/data/forecasts/latest/forecasts_h12.csv")
historical = pd.read_csv("https://conflictlab.github.io/data/forecasts/latest/Hist.csv")
print(f"Forecasting {len(forecasts.columns)-1} countries for {len(forecasts)} months")
```

**Output:**
```
Forecasting 132 countries for 12 months
```

---

## R (3 lines)

```r
forecasts <- read.csv("https://conflictlab.github.io/data/forecasts/latest/forecasts_h12.csv")
historical <- read.csv("https://conflictlab.github.io/data/forecasts/latest/Hist.csv")
cat(sprintf("Forecasting %d countries for %d months\n", ncol(forecasts)-1, nrow(forecasts)))
```

---

## What You Get

### Forecasts (forecasts_h12.csv)
12 rows (months), 133 columns (date + 132 countries):

```csv
date,Afghanistan,Albania,...,Zimbabwe
2026-03,150.5,0.2,...,12.3
2026-04,145.2,0.1,...,11.8
...
2027-02,160.1,0.3,...,13.1
```

### Historical Data (Hist.csv)
446 rows (months from 1989-01 to present), 133 columns:

```csv
date,Afghanistan,Albania,...,Zimbabwe
1989-01-31,245,0,...,8
1989-02-28,198,0,...,5
...
2026-02-28,312,0,...,7
```

---

## Monthly Updates

Forecasts are updated on the **1st-5th of each month** after UCDP data release.

**Check for updates:**
```python
import requests
metadata = requests.get("https://conflictlab.github.io/data/forecasts/latest/metadata.json").json()
print(f"Last update: {metadata['run_date']}")
print(f"Forecasting from: {metadata['forecast_start_date']}")
```

---

## Confidence Intervals

Get prediction uncertainty (10th/90th percentiles):

```python
mean = pd.read_csv("https://conflictlab.github.io/data/forecasts/latest/forecasts_h12.csv")
min_val = pd.read_csv("https://conflictlab.github.io/data/forecasts/latest/forecasts_h12_min.csv")
max_val = pd.read_csv("https://conflictlab.github.io/data/forecasts/latest/forecasts_h12_max.csv")

# Example: Ukraine forecast with uncertainty
print(f"Ukraine March 2026: {mean['Ukraine'][0]:.0f} ({min_val['Ukraine'][0]:.0f} - {max_val['Ukraine'][0]:.0f})")
```

**Output:**
```
Ukraine March 2026: 5944 (2315 - 9573)
```

---

## Historical Archives

Access any past forecast to evaluate accuracy:

```python
# Fetch June 2025 forecast (made in June, predicted Jul-Dec 2025)
june_2025 = pd.read_csv("https://conflictlab.github.io/data/forecasts/archive/2025-06/forecasts_h12.csv")
```

**Available periods:** 2023-12 to present (monthly)

---

## Automated Monthly Fetch

**Python with cron (runs 5th of month at 3am):**

```python
# save as: fetch_monthly.py
import pandas as pd
from datetime import datetime

# Fetch latest data
forecasts = pd.read_csv("https://conflictlab.github.io/data/forecasts/latest/forecasts_h12.csv")
historical = pd.read_csv("https://conflictlab.github.io/data/forecasts/latest/Hist.csv")

# Save to your database/storage
forecasts.to_csv(f"forecasts_{datetime.now():%Y%m}.csv", index=False)
historical.to_csv(f"historical_{datetime.now():%Y%m}.csv", index=False)

print(f"✅ Fetched {len(forecasts.columns)-1} countries")
```

**Crontab:**
```cron
0 3 5 * * /usr/bin/python3 /path/to/fetch_monthly.py
```

---

## Using the Example Scripts

We provide complete example scripts with validation:

### Python
```bash
python examples/fetch-forecasts.py
python examples/fetch-forecasts.py --period 2025-06
python examples/fetch-forecasts.py --save
```

### R
```bash
Rscript examples/fetch-forecasts.R
Rscript examples/fetch-forecasts.R --period 2025-06
```

---

## Next Steps

1. **Read the full API docs:** [DATA_API.md](DATA_API.md)
2. **Explore the examples:** [examples/](../examples/)
3. **Validate data quality:** `node scripts/validate-data-pipeline.js`
4. **See the website:** https://conflictlab.github.io

---

## Quick FAQ

**Q: How often are forecasts updated?**
A: Monthly, between 1st-5th of each month

**Q: How far back does historical data go?**
A: January 1989 to present (446+ months)

**Q: What's the forecast horizon?**
A: 6 months or 12 months ahead (both available)

**Q: How many countries are covered?**
A: 132 countries (all UCDP-covered countries)

**Q: Can I get sub-national forecasts?**
A: Yes, PRIO-GRID level forecasts available at `/api/v1/grid/{period}/points-m1.json`

**Q: Is this free?**
A: Yes, completely free and open for research/operational use

**Q: How do I cite this?**
```
PACE Conflict Forecasting System (2026). Monthly conflict fatality forecasts.
Retrieved from https://conflictlab.github.io/data/forecasts/
```

---

## Need Help?

- **Full documentation:** [DATA_API.md](DATA_API.md)
- **Issues/questions:** https://github.com/conflictlab/conflictlab.github.io/issues
- **Example code:** [examples/](../examples/)
