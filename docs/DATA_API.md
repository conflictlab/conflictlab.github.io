# PACE Forecasting Data API Documentation

This document describes how to systematically access PACE conflict forecasting data for operational use, research, and integration with external systems.

## Overview

The PACE forecasting system provides:
- **12-month ahead forecasts** of conflict fatalities by country
- **Complete historical time series** (1989-present)
- **Confidence intervals** (min/max predictions)
- **Monthly updates** with versioned archives

All data is accessible via predictable URLs on GitHub Pages - no authentication required.

---

## Base URL

```
https://forecastlab.org/data/forecasts/
```

---

## Data Structure

### Latest Forecasts (Always Current)

```
https://forecastlab.org/data/forecasts/latest/
```

**Available files:**
- `forecasts_h12.csv` - 12-month ahead forecasts (mean predictions)
- `forecasts_h12_min.csv` - 12-month ahead forecasts (10th percentile)
- `forecasts_h12_max.csv` - 12-month ahead forecasts (90th percentile)
- `forecasts_h6.csv` - 6-month ahead forecasts (mean predictions)
- `forecasts_h6_min.csv` - 6-month ahead forecasts (10th percentile)
- `forecasts_h6_max.csv` - 6-month ahead forecasts (90th percentile)
- `Hist.csv` - Complete historical time series (1989-present)
- `metadata.json` - Forecast metadata (run date, data period, etc.)

### Archived Forecasts (By Period)

```
https://forecastlab.org/data/forecasts/archive/{YYYY-MM}/
```

**Example:**
```
https://forecastlab.org/data/forecasts/archive/2026-03/forecasts_h12.csv
```

Each archive contains the same files as `/latest/`, frozen at the time of that forecast run.

**Available periods:** Monthly from 2018-01 to present

### Grid Forecasts (PRIO-GRID Spatial Data)

```
https://forecastlab.org/data/grid/{YYYY-MM}-m{1-6}.json
```

**Description:** Sub-national spatial forecasts at PRIO-GRID cell level (0.5° x 0.5° grid cells).

**Parameters:**
- `{YYYY-MM}` - Forecast period (e.g., `2026-03`)
- `{1-6}` - Forecast month (1 = first month ahead, 6 = sixth month ahead)

**Example:**
```
https://forecastlab.org/data/grid/2026-03-m1.json  # First month forecast
https://forecastlab.org/data/grid/2026-03-m6.json  # Sixth month forecast
```

**Available formats:**
- `{period}-m{1-6}.json` - Point data with lat/lon coordinates
- `{period}.geo.json` - Full GeoJSON with polygons for all 6 months
- `{period}.csv` - Tabular format with all months
- `centroids.csv` - PRIO-GRID cell centroids reference

**Note:** Grid forecasts are generated for the same periods as country-level forecasts. Currently available from 2023-12 to present.

---

## File Formats

### Forecasts CSV Format

**Structure:**
```csv
date,Afghanistan,Albania,Algeria,...,Zimbabwe
2026-03,150.5,0.2,5.8,...,12.3
2026-04,145.2,0.1,6.2,...,11.8
...
2027-02,160.1,0.3,5.5,...,13.1
```

- **First column:** `date` - Forecast period (YYYY-MM)
- **Subsequent columns:** Country names - Predicted fatalities for that month
- **Rows:** One per forecast month (6 rows for h6, 12 rows for h12)

### Historical Time Series Format

**Structure:**
```csv
date,Afghanistan,Albania,Algeria,...,Zimbabwe
1989-01-31,245,0,15,...,8
1989-02-28,198,0,12,...,5
...
2026-02-28,312,0,8,...,7
```

- **First column:** `date` - End of month timestamp (YYYY-MM-DD)
- **Subsequent columns:** Country names - Actual fatalities for that month
- **Rows:** One per historical month (1989-01 to present)

### Metadata JSON Format

**Structure:**
```json
{
  "run_date": "2026-03-29T20:45:50.190475",
  "data_end_date": "2026-02",
  "forecast_start_date": "2026-03",
  "h6_end_date": "2026-08",
  "h12_end_date": "2027-02",
  "training_window_months": 10,
  "historical_start_date": "1989-01",
  "historical_end_date": "2026-02",
  "total_historical_months": 446
}
```

**Fields:**
- `run_date` - When the forecast was generated (ISO 8601)
- `data_end_date` - Last month of historical data used (YYYY-MM)
- `forecast_start_date` - First month being forecasted (YYYY-MM)
- `h6_end_date` - Last month of 6-month forecast (YYYY-MM)
- `h12_end_date` - Last month of 12-month forecast (YYYY-MM)
- `training_window_months` - Number of months used for pattern matching (10)
- `historical_start_date` - First month of historical data (1989-01)
- `historical_end_date` - Last month of historical data (YYYY-MM)
- `total_historical_months` - Total months in Hist.csv

---

## Systematic Data Access

### Monthly Fetch Pattern

To fetch the latest forecasts every month:

**Python Example:**
```python
import pandas as pd
from datetime import datetime

BASE_URL = "https://forecastlab.org/data/forecasts"

def fetch_latest_forecasts():
    """Fetch the latest 12-month forecasts and historical data."""
    # Get metadata first to know the forecast period
    metadata = pd.read_json(f"{BASE_URL}/latest/metadata.json", typ='series')

    # Fetch 12-month forecasts (mean, min, max)
    forecasts_mean = pd.read_csv(f"{BASE_URL}/latest/forecasts_h12.csv")
    forecasts_min = pd.read_csv(f"{BASE_URL}/latest/forecasts_h12_min.csv")
    forecasts_max = pd.read_csv(f"{BASE_URL}/latest/forecasts_h12_max.csv")

    # Fetch historical time series
    historical = pd.read_csv(f"{BASE_URL}/latest/Hist.csv", parse_dates=[0])

    return {
        'metadata': metadata,
        'forecasts_mean': forecasts_mean,
        'forecasts_min': forecasts_min,
        'forecasts_max': forecasts_max,
        'historical': historical
    }

# Usage
data = fetch_latest_forecasts()
print(f"Forecasting from {data['metadata']['forecast_start_date']}")
print(f"Historical data: {len(data['historical'])} months")
print(f"Countries: {len(data['forecasts_mean'].columns) - 1}")
```

**R Example:**
```r
library(httr)
library(jsonlite)

BASE_URL <- "https://forecastlab.org/data/forecasts"

fetch_latest_forecasts <- function() {
  # Fetch metadata
  metadata <- fromJSON(sprintf("%s/latest/metadata.json", BASE_URL))

  # Fetch 12-month forecasts
  forecasts_mean <- read.csv(sprintf("%s/latest/forecasts_h12.csv", BASE_URL))
  forecasts_min <- read.csv(sprintf("%s/latest/forecasts_h12_min.csv", BASE_URL))
  forecasts_max <- read.csv(sprintf("%s/latest/forecasts_h12_max.csv", BASE_URL))

  # Fetch historical data
  historical <- read.csv(sprintf("%s/latest/Hist.csv", BASE_URL))
  historical$date <- as.Date(historical$date)

  list(
    metadata = metadata,
    forecasts_mean = forecasts_mean,
    forecasts_min = forecasts_min,
    forecasts_max = forecasts_max,
    historical = historical
  )
}

# Usage
data <- fetch_latest_forecasts()
cat(sprintf("Forecasting from %s\n", data$metadata$forecast_start_date))
```

### Fetching Specific Historical Periods

**Data Availability:** Archived forecasts are available from **January 2018** (2018-01) to present, with monthly updates.

To fetch a specific historical forecast (e.g., to compare accuracy):

```python
def fetch_forecast_by_period(period):
    """
    Fetch archived forecast for a specific period.

    Args:
        period: Forecast period in YYYY-MM format (e.g., '2025-06')
                Available from 2018-01 onwards

    Returns:
        Dictionary with forecast data
    """
    base = f"{BASE_URL}/archive/{period}"

    return {
        'metadata': pd.read_json(f"{base}/metadata.json", typ='series'),
        'forecasts_h12': pd.read_csv(f"{base}/forecasts_h12.csv"),
        'historical': pd.read_csv(f"{base}/Hist.csv", parse_dates=[0])
    }

# Example: Fetch June 2025 forecast
june_2025 = fetch_forecast_by_period('2025-06')
```

---

## Update Schedule

**Forecasts are updated monthly:**
- **Timing:** Between the 1st-5th of each month (after UCDP data release)
- **Frequency:** Once per month
- **Archive retention:** Indefinite (all monthly forecasts since 2018-01)

**To detect new updates:**
1. Check `/latest/metadata.json` for `run_date`
2. Compare to your last fetch timestamp
3. If newer, fetch latest data

**Python monitoring example:**
```python
import requests
from datetime import datetime

def check_for_update(last_fetch_date):
    """Check if forecasts have been updated since last fetch."""
    url = f"{BASE_URL}/latest/metadata.json"
    metadata = requests.get(url).json()

    run_date = datetime.fromisoformat(metadata['run_date'])

    if run_date > last_fetch_date:
        return True, run_date
    return False, last_fetch_date

# Usage
last_fetch = datetime(2026, 3, 1)
updated, new_date = check_for_update(last_fetch)
if updated:
    print(f"New forecasts available from {new_date}")
    data = fetch_latest_forecasts()
```

---

## Data Quality & Validation

### Country Coverage
- **Total countries:** 132 (as of 2026-03)
- **Active conflicts:** ~30-40 countries with >100 fatalities/year
- **Geographic coverage:** Global (all UCDP-covered countries)

### Data Lineage
- **Source:** Uppsala Conflict Data Program (UCDP) Georeferenced Event Dataset (GED)
- **Methodology:** Dynamic Time Warping (DTW) pattern matching
- **Training window:** 10 months
- **Update lag:** ~1 month (UCDP release schedule)

### Known Limitations
1. **UCDP release delays:** Forecasts for month N are generated with data through month N-1
2. **Zero forecasts:** Countries with no recent conflict activity (all-zero training data) receive zero forecasts
3. **High-variance conflicts:** Predictions for highly volatile conflicts have wider confidence intervals
4. **Data quality:** UCDP data quality varies by region and conflict type

### Validation
To validate data integrity, run:
```bash
node scripts/validate-data-pipeline.js
```

This checks:
- No missing/corrupted files
- No unrealistic zero forecasts for active countries
- Metadata consistency
- Reasonable forecast ranges for key countries

---

## Recommended Integration Patterns

### Pattern 1: Monthly Automated Fetch
```python
# cron: 0 3 5 * * (5th of month, 3am)
import schedule

def monthly_update():
    data = fetch_latest_forecasts()

    # Store in your database
    store_forecasts(data['forecasts_mean'])
    store_historical(data['historical'])

    # Trigger downstream workflows
    notify_stakeholders(data['metadata'])

schedule.every().month.at("03:00").do(monthly_update)
```

### Pattern 2: Real-time Monitoring Dashboard
```python
# Check for updates every 6 hours
def refresh_dashboard():
    updated, date = check_for_update(last_fetch)
    if updated:
        data = fetch_latest_forecasts()
        update_visualizations(data)
        last_fetch = date

schedule.every(6).hours.do(refresh_dashboard)
```

### Pattern 3: Batch Historical Analysis
```python
def analyze_forecast_accuracy():
    """Compare historical forecasts to actual outcomes."""
    periods = ['2024-06', '2024-09', '2024-12', '2025-03']

    results = []
    for period in periods:
        forecast = fetch_forecast_by_period(period)
        actual = fetch_latest_forecasts()['historical']

        accuracy = compute_mae(forecast, actual)
        results.append({
            'period': period,
            'mae': accuracy
        })

    return pd.DataFrame(results)
```

---

## Suggested Improvements for Operational Use

### Current Gaps & Recommendations

1. **Explicit API versioning**
   - Add `/api/v1/` prefix to all endpoints
   - Maintain backward compatibility across versions
   - Provide deprecation notices 6 months in advance

2. **Machine-readable catalog**
   - Add `/api/v1/catalog.json` listing all available periods
   - Include data quality flags per period
   - Provide file checksums for integrity verification

3. **Expanded metadata**
   - Add per-country confidence scores
   - Include model diagnostics (DTW match quality, pattern count)
   - Provide data provenance (UCDP version, download date)

4. **Additional data formats**
   - JSON API endpoints (currently CSV only)
   - Parquet files for efficient bulk downloads
   - Country-specific endpoints (e.g., `/api/v1/countries/Ukraine.json`)

5. **Scenario forecasts**
   - Currently only mean/min/max
   - Could add scenario-based forecasts (escalation, de-escalation, status quo)
   - Already computed internally (dict_sce.pkl) but not exposed

6. **Sub-national forecasts**
   - PRIO-GRID level forecasts (already computed for website)
   - Could expose via `/api/v1/grid/{period}/points.json`

7. **Change notifications**
   - RSS feed for new forecast releases
   - Webhook support for automated integrations
   - Email notifications for data quality issues

8. **Data quality indicators**
   - Per-country forecast quality scores
   - Historical accuracy metrics
   - Data freshness indicators

---

## Expanding to Refugees & Other Indicators

### Current Infrastructure
The existing pipeline architecture supports expanding to additional outcome variables:

1. **Data ingestion:** Modular download scripts (UNHCR, IDMC, etc.)
2. **Forecasting:** Same DTW algorithm applicable to refugee flows
3. **Archival:** Same versioned structure (`/data/refugees/archive/{YYYY-MM}/`)
4. **API:** Same URL patterns

### Suggested Structure for Refugees

```
https://conflictlab.github.io/data/refugees/latest/
  ├── forecasts_h12.csv          # 12-month refugee forecast
  ├── forecasts_h12_origin.csv   # By country of origin
  ├── forecasts_h12_asylum.csv   # By asylum country
  ├── historical.csv             # UNHCR historical data
  └── metadata.json

https://conflictlab.github.io/data/idps/latest/
  ├── forecasts_h12.csv          # 12-month IDP forecast
  ├── historical.csv             # IDMC historical data
  └── metadata.json
```

### Multi-indicator Integration

For integrated analysis:
```python
def fetch_all_indicators(period='latest'):
    """Fetch all available indicators for a given period."""
    base = f"{BASE_URL}/../"

    return {
        'fatalities': fetch_data(f"{base}/forecasts/{period}"),
        'refugees': fetch_data(f"{base}/refugees/{period}"),
        'idps': fetch_data(f"{base}/idps/{period}"),
    }
```

---

## Contact & Support

**Questions or issues?**
- GitHub Issues: https://github.com/conflictlab/conflictlab.github.io/issues
- Documentation: https://github.com/conflictlab/conflictlab.github.io/blob/main/docs/DATA_API.md

**Data citation:**
```
PACE Conflict Forecasting System (2026). Monthly conflict fatality forecasts.
Retrieved from https://forecastlab.org/data/forecasts/
```

---

## Changelog

### 2026-04
- ✅ Fixed trailing zero-month bug (no longer includes unreleased UCDP months)
- ✅ Added 8 missing countries (Belize, Costa Rica, Dominican Rep., etc.)
- ✅ Improved forecast quality for high-intensity conflicts
- ✅ Added comprehensive data validation script

### 2024-09
- Added 12-month forecasts (previously only 6-month)
- Expanded historical archive retention
- Improved metadata completeness

### 2023-12
- Initial systematic data API
- Monthly forecast archives
- Standardized URL structure
