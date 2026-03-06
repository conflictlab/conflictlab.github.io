# PACE Forecast Data

This directory contains PACE conflict fatality forecasts and historical data.

## Structure

```
/data/forecasts/
├── latest/              # Always contains the most recent forecast run
│   ├── Hist.csv                    # Full historical time series
│   ├── forecasts_h6.csv            # 6-month ahead forecasts (mean)
│   ├── forecasts_h6_min.csv        # 6-month ahead (lower bound)
│   ├── forecasts_h6_max.csv        # 6-month ahead (upper bound)
│   ├── forecasts_h12.csv           # 12-month ahead forecasts (mean)
│   ├── forecasts_h12_min.csv       # 12-month ahead (lower bound)
│   ├── forecasts_h12_max.csv       # 12-month ahead (upper bound)
│   └── metadata.json               # Run metadata (dates, versions, etc.)
│
└── archive/             # Historical forecast runs
    └── YYYY-MM/         # Archived by year-month
        └── [same files as latest/]
```

## Data Access

### For Automated Scraping

Use the `/latest/` directory for consistent URLs:
```
https://conflictlab.github.io/data/forecasts/latest/Hist.csv
https://conflictlab.github.io/data/forecasts/latest/forecasts_h6.csv
https://conflictlab.github.io/data/forecasts/latest/forecasts_h12.csv
https://conflictlab.github.io/data/forecasts/latest/metadata.json
```

### For Historical Reference

Access archived forecasts by date:
```
https://conflictlab.github.io/data/forecasts/archive/2026-03/forecasts_h12.csv
```

## File Descriptions

### Historical Data
- **Hist.csv**: Complete historical time series of conflict fatalities, extending as far back as UCDP data allows

### Forecast Files
- **forecasts_h6.csv / forecasts_h12.csv**: Mean forecast values
- **forecasts_h6_min.csv / forecasts_h12_min.csv**: Lower bound (minimum) scenarios
- **forecasts_h6_max.csv / forecasts_h12_max.csv**: Upper bound (maximum) scenarios

### Metadata
- **metadata.json**: Contains run date, data version, forecast date ranges, and other metadata

## Update Schedule

Forecasts are automatically updated on the 1st of each month via GitHub Actions.

## Citation

If you use this data, please cite:
Schincariol et al. (2025). "Accounting for Variability in Conflict Dynamics: A Pattern-Based Predictive Model"
