# PACE Forecast System - Implementation Summary

## Overview

This document describes the updated PACE forecast system that now generates both 6-month and 12-month ahead forecasts with automated monthly updates.

## What Was Implemented

### 1. Repository Setup ✅

- **Fork Status**: `conflictlab/Pace-map-risk` already exists and is properly configured
- **Remote Updated**: Pace-map-risk now points to conflictlab fork instead of ThomasSchinca's repo
- **Website Sync Updated**: `sync-forecasts.yml` now pulls from conflictlab fork

### 2. Forecast Generation Script ✅

**File**: `Pace-map-risk/generate_forecasts.py`

New Python script that:
- Generates both h=6 and h=12 month forecasts in a single run
- Uses 10-month training window (aligned with Thomas's newsletter panels)
- Saves full historical data (all available UCDP data)
- Creates standardized output files with clear naming
- Generates metadata JSON with dates and configuration

**Key Features:**
- Refactored into reusable function `generate_forecasts(h=6/12)`
- Maintains backward compatibility with existing website code
- Proper country name standardization
- Error handling and logging

### 3. Automated Monthly Updates ✅

**File**: `Pace-map-risk/.github/workflows/monthly-forecast-generation.yml`

GitHub Actions workflow that:
- Runs on the 1st of each month at 1:00 AM UTC
- Can be manually triggered anytime
- Installs dependencies automatically
- Generates forecasts
- Commits and pushes results
- Creates job summary with links

### 4. Output Organization ✅

**File**: `Pace-map-risk/scripts/prepare_historical_predictions.py`

Script that prepares outputs for website sync:
- Creates properly named files in Historical_Predictions/
- Maintains "latest" copies for easy access
- Follows existing naming conventions

### 5. Data Directory Structure ✅

**Location**: `public/data/forecasts/`

```
public/data/forecasts/
├── README.md           # Documentation for data access
├── latest/             # Most recent forecasts (synced automatically)
└── archive/            # Historical forecasts by month
    └── YYYY-MM/
```

### 6. Documentation ✅

Created comprehensive documentation:
- `Pace-map-risk/FORECAST_GENERATION.md` - Technical documentation for forecast system
- `public/data/forecasts/README.md` - Data access guide for users
- `FORECAST_SYSTEM_SETUP.md` - This implementation summary

## Data Access for Andrea

### Recommended Scraping URLs (Always Latest Data)

**Direct from GitHub (updates monthly on 1st):**
```
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h6.csv
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h6_min.csv
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h6_max.csv
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h12.csv
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h12_min.csv
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h12_max.csv
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/Hist.csv
https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecast_metadata.json
```

**Via Website (synced daily at 3 AM UTC):**
```
https://conflictlab.github.io/data/forecasts/latest/forecasts_h6.csv
https://conflictlab.github.io/data/forecasts/latest/forecasts_h12.csv
https://conflictlab.github.io/data/forecasts/latest/Hist.csv
https://conflictlab.github.io/data/forecasts/latest/metadata.json
```

### File Descriptions

- **Hist.csv**: Complete historical time series (back to UCDP data start)
- **forecasts_h6.csv**: 6-month ahead mean forecasts
- **forecasts_h6_min.csv**: 6-month ahead lower bound
- **forecasts_h6_max.csv**: 6-month ahead upper bound
- **forecasts_h12.csv**: 12-month ahead mean forecasts
- **forecasts_h12_min.csv**: 12-month ahead lower bound
- **forecasts_h12_max.csv**: 12-month ahead upper bound
- **metadata.json**: Run date, data range, forecast periods

## Update Schedule

1. **Forecast Generation**: 1st of each month, 1:00 AM UTC
   - Runs in `conflictlab/Pace-map-risk` repository
   - Generates h=6 and h=12 forecasts
   - Commits results automatically

2. **Website Sync**: Daily at 3:00 AM UTC
   - Pulls latest data from Pace-map-risk repo
   - Updates website visualizations
   - Publishes to conflictlab.github.io

## Next Steps

### Immediate Tasks

1. **Commit Changes** to both repositories:
   ```bash
   # In Pace-map-risk repo
   git add .
   git commit -m "feat: add h=12 forecasts and automated monthly generation"
   git push origin main

   # In website repo
   git add .
   git commit -m "feat: add h=12 forecast support and update data structure"
   git push origin main
   ```

2. **Test Workflow Manually**:
   - Go to GitHub Actions in Pace-map-risk repo
   - Run "Generate Monthly Forecasts" workflow manually
   - Verify outputs are created correctly
   - Check that website sync picks up the changes

3. **Update Website UI** (Future Enhancement):
   - Add toggle between h=6 and h=12 views
   - Update map and charts to support 12-month horizon
   - Add data source attribution

### Website Integration (To Be Done)

The website currently uses h=6 forecasts. To add h=12 support:

1. **Update Data Loading**:
   - Modify data fetching to load both h=6 and h=12
   - Add horizon selection state management

2. **UI Components**:
   - Add horizon selector (6-month vs 12-month toggle)
   - Update chart components to handle variable horizons
   - Update map legend and tooltips

3. **Visualization Updates**:
   - Extend time series charts to 12 months
   - Update risk indicators for longer horizon
   - Adjust color scales if needed

## Testing

### Manual Test Checklist

- [ ] Run `generate_forecasts.py` locally to verify syntax
- [ ] Trigger GitHub Action manually and verify outputs
- [ ] Check that Historical_Predictions directory is updated
- [ ] Verify website sync picks up new files
- [ ] Test data access URLs return correct CSV files
- [ ] Validate metadata.json contains expected fields

### Verification URLs (After First Run)

Check these URLs after the first automated run:
- https://github.com/conflictlab/Pace-map-risk/blob/main/forecasts_h12.csv
- https://github.com/conflictlab/Pace-map-risk/blob/main/Hist.csv
- https://github.com/conflictlab/Pace-map-risk/blob/main/forecast_metadata.json

## Troubleshooting

### Common Issues

1. **GitHub Actions Fails**:
   - Check Actions logs for detailed error
   - Verify Python dependencies are correctly specified
   - Ensure UCDP data source is accessible

2. **Website Not Updating**:
   - Verify sync-forecasts.yml is pulling from conflictlab/Pace-map-risk
   - Check that files are in correct directory
   - Review GitHub Actions logs for sync workflow

3. **Data Quality Issues**:
   - Check forecast_metadata.json for data date ranges
   - Verify UCDP source data completeness
   - Review pattern matching logs

## Files Modified/Created

### In Pace-map-risk Repository

**New Files:**
- `generate_forecasts.py` - Main forecast generation script
- `scripts/prepare_historical_predictions.py` - Output organization
- `.github/workflows/monthly-forecast-generation.yml` - Automation workflow
- `FORECAST_GENERATION.md` - Technical documentation

**Modified Files:**
- `.git/config` - Updated remote to conflictlab fork

**Output Files (Generated):**
- `forecasts_h6.csv`, `forecasts_h6_min.csv`, `forecasts_h6_max.csv`
- `forecasts_h12.csv`, `forecasts_h12_min.csv`, `forecasts_h12_max.csv`
- `Hist.csv`, `forecast_metadata.json`
- Backward compatible: `Pred_df.csv`, `perc.csv`, etc.

### In Website Repository

**New Files:**
- `public/data/forecasts/README.md` - Data access documentation
- `FORECAST_SYSTEM_SETUP.md` - This file

**Modified Files:**
- `.github/workflows/sync-forecasts.yml` - Updated to use conflictlab fork

**New Directories:**
- `public/data/forecasts/latest/`
- `public/data/forecasts/archive/`

## Contact & Support

For questions or issues:
1. Check documentation in FORECAST_GENERATION.md
2. Review GitHub Actions logs
3. Open issue in respective repository
4. Contact: andrea@conflictlab.org

## Acknowledgments

- Original forecasting code by Thomas Schincariol
- Implementation for automated system by Claude Code
- UCDP for conflict data
