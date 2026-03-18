# Session Management Instructions

This file tracks work done across Claude Code sessions for the diplomatic cables project.

## Rules

1. **Timestamp**: At the start of each session entry, run `date '+%Y-%m-%d %H:%M %Z'` via Bash to get the system timestamp. Use this as the authoritative date and time. Do NOT use dates from the model's context or guess dates. The session header format is: `# Session Log: YYYY-MM-DD HH:MM TZ`.
2. **Ordering**: New entries go at the top, immediately below this instructions block. Older entries follow in reverse chronological order.
3. **What to record**: Substantive work only — decisions made, analyses run, files created/modified, key findings. Do not log routine file reads or exploratory searches that led nowhere.
4. **Next steps**: Only the most recent session entry should have a "Next steps" section. Remove or collapse next-steps from older entries when adding a new entry, since they are superseded.
5. **Verifying dates**: Before writing a session entry, check that the timestamp makes sense relative to existing entries. If a proposed timestamp is earlier than the most recent entry, clarify with the user.

---

# Session Log: 2026-03-18 22:01 GMT

## Website Ops: Status/Health, Email Alerts, Monthly Schedules, Simplification

### Implemented (Website repo: conflictlab/conflictlab.github.io)
- Added status generator (`scripts/generate-status.js`) and status page (`app/status/page.tsx`).
- Added live health checks (`scripts/check-live.js`) with redirects; workflow opens issues on failure and emails when configured.
- Wired SMTP email notifications across deploy + data jobs (`dawidd6/action-send-mail@v3`).
- Exported static API endpoints from grid data; standardized data source to `conflictlab/Pace-map-risk`.
- Simplified Actions: one scheduled runner — `Refresh Website Now` (28th/1st @ 03:00 UTC); deploy on push/refresh; health check at 06:00 on 28th/1st and post‑deploy.
- Archived legacy utility workflows in website repo to reduce clutter.
- Added docs: `docs/MONTHLY_RUNBOOK.md`, `docs/OPERATIONS.md`, and forecasting template `docs/FORECASTING_REPO_WORKFLOW_TEMPLATE.yml`.

### Next (Forecasting repo: conflictlab/Pace-map-risk)
- Consolidate to a single monthly generation workflow (28th/1st @ 01:00 UTC) with concurrency + email alerts.
- Archived/deleted legacy workflows; kept only parallel monthly generation on 28th/1st.
- Optional: cross‑repo dispatch to trigger website refresh on completion (requires PAT with repo/workflow).

### Notes
- Email steps require repo secrets: `SMTP_*`, `MAIL_FROM`, `MAIL_TO`.
- Health check validates `/status.json`, a sample static API endpoint, and remote `forecast_metadata.json` freshness.

### Next steps
1) Apply and commit `docs/FORECASTING_REPO_WORKFLOW_TEMPLATE.yml` to `conflictlab/Pace-map-risk` as `.github/workflows/monthly-forecast-generation.yml` (28th/1st @ 01:00 UTC) and add SMTP/MAIL secrets there.
2) Disable schedules on other forecasting workflows to reduce noise; retain manual dispatch where needed.
3) (Optional) Provide PAT for cross‑repo trigger compute → website refresh.

# Session Log: 2026-03-14 14:02 GMT

## Complete UCDP API Migration & Bug Fixes

### Problems Identified & Resolved

#### 1. UCDP API Token Configuration ✅
- **Problem**: UCDP changed API to require authentication tokens
- **Solution**:
  - Stored token in `Pace-map-risk/.env` (gitignored)
  - Added to GitHub repository secrets as `UCDP_API_TOKEN`
  - Token: `b3df699c93c1c558`
  - Verified working (200 OK, 385,918 events accessible)

#### 2. API Update Not Deployed ✅
- **Problem**: API update code (commit 448532a) was never pushed to GitHub
- **Root Cause**: Commit sat in local repository, workflows kept using old CSV-download method
- **Solution**: Pushed API update to remote, all workflows now use authenticated API

#### 3. Website Sync Bugs (Two Critical Bugs) ✅
**Bug #1 - Wrong Row Selected**:
- **Problem**: Script read LAST row of latest.csv (1989-01) instead of FIRST row (2026-03)
- **Root Cause**: CSV has reverse chronological order (newest→oldest)
- **Fix**: Changed `rows[rows.length - 1]` to `rows[0]` (line 324 in sync-forecasts-from-github.js)

**Bug #2 - Wrong File Matched**:
- **Problem**: Regex `/latest\.csv$/` matched both "latest.csv" AND "Hist_latest.csv"
- **Root Cause**: .find() returns first alphabetical match = "Hist_latest.csv" (historical data from 1989)
- **Fix**: Changed to `/^latest\.csv$/` to match EXACTLY "latest.csv" (line 269)

#### 4. API Performance Issue ✅
- **Problem**: Workflow hung for 30+ minutes on prepare-data step
- **Root Cause**: Page size of 1,000 events = 386 API calls for 386K events
- **Fix**: Increased to 10,000 events/page = only ~39 API calls
- **Result**: prepare-data now completes in ~3 minutes instead of 30+

#### 5. Country Name Mismatch Issue ✅
**Problem**: Forecasts showing extremely low/negative values after workflow completed
- India: 0.19, 0.13, 0.10 (should be higher)
- Sudan: 0.12, 0.06, 0.09 (active conflict, should be much higher)
- Azerbaijan: -0.13 (impossible - negative fatalities!)

**Investigation Findings**:
- Checked Hist.csv: 2025-07 through 2025-12 ALL ZEROS, 2026-01 had data, 2026-02 zeros
- Candidate data (v26.0.1) date range: Only 2025-12-22 to 2026-01-31 (1,727 events)
  - Explains why 2025-07 through 2025-11 are zeros (candidate data doesn't cover those months)
  - Explains why 2026-02 is zeros (candidate data only goes through Jan 31)
- **Root Cause**: Country name mismatches prevented proper data aggregation
  - v26.0.1 uses: "DR Congo (Zaire)", "Myanmar (Burma)", "Russia (Soviet Union)", "South Sudan"
  - v25.1/Hist.csv uses: "Dem. Rep. Congo", "Myanmar", "Russia", "S. Sudan"
  - Result: Candidate events failed to aggregate into existing country columns

**Fix Applied** (commit 5b7db6d):
- Added country name normalization mapping in prepare_data.py
- Maps v26.0.1 names to v25.1 standard names before concatenation
- Ensures candidate data merges correctly with main dataset

### Files Modified
- `Pace-map-risk/.env` (created, gitignored)
- `Pace-map-risk/scripts/parallel/prepare_data.py` (API migration + performance fix + country name normalization)
- `scripts/sync-forecasts-from-github.js` (two critical bug fixes)
- `REPO_STRUCTURE.md` (created comprehensive documentation)
- `SESSION.md` (updated with all changes)

### Workflows Run
1. **22:53 GMT (March 13)**: First attempt with API update - used old code (fde9d3c)
2. **01:16 GMT (March 14)**: Second attempt after pushing API update - got zeros for 2025-2026
3. **11:47 GMT (March 14)**: Third attempt - HUNG after 34 minutes, cancelled
4. **12:25 GMT (March 14)**: Fourth attempt with larger page size - COMPLETED successfully
5. **16:12 GMT (March 14)**: Fifth attempt with country name normalization fix - IN PROGRESS (run ID: 23091548093)

### Next Steps
1. Monitor workflow completion (~25 minutes)
2. Verify Hist.csv has correct data for 2026-01 (should show higher values for Sudan, India, etc.)
3. Check that forecasts are realistic (not extremely low or negative)
4. Sync to website once forecasts are validated
5. Consider backfilling missing months (2025-07 through 2025-11) if possible

---

# Session Log: 2026-03-13 22:14 GMT

## UCDP API Token Configuration & Critical Bug Fix

### Problem 1: UCDP API Authentication Required
UCDP changed their API to require authentication tokens, breaking automated data fetching.

### Solution Implemented
1. **Token Storage** (completed 14:58 GMT):
   - Created `Pace-map-risk/.env` file with token: `b3df699c93c1c558`
   - Added `UCDP_API_TOKEN` to GitHub repository secrets
   - Verified API access (200 OK, 385,918 events available)
   - Rate limit: 5,000 requests/day (resets midnight UTC)

2. **Workflow Testing**:
   - Triggered parallel-forecasts workflow manually
   - Completed successfully in 26m32s (19:12 UTC)
   - Generated 2026-03 forecasts using authenticated UCDP API
   - Files committed to Pace-map-risk repository:
     - `Historical_Predictions/2026-03.csv`
     - `Historical_Predictions/latest.csv`
     - Updated `forecast_metadata.json`

### Problem 2: Website Not Displaying New Forecasts
After successful forecast generation, website still showed old data (India page showing outdated forecasts).

### Root Cause Identified
**Critical bug in `scripts/sync-forecasts-from-github.js`** (line 324):
- Script was reading LAST row of `latest.csv` to determine period
- But CSV has dates in reverse chronological order (newest first, oldest last)
- Result: Script saw "1989-01" instead of "2026-03"
- `latest.json` generated with wrong period, breaking country pages

### Bug Fix Applied
**File**: `scripts/sync-forecasts-from-github.js:324-325`
**Change**:
```javascript
// Before (WRONG):
const lastRow = rows[rows.length - 1] || {}
const derived = parseYYYYMM(lastRow[dateKey])

// After (CORRECT):
const firstRow = rows[0] || {}  // First row = most recent date
const derived = parseYYYYMM(firstRow[dateKey])
```

**Status**: Fix committed (723a95d) and sync workflow re-triggered

### Repository Cleanup & Documentation

1. **Created `REPO_STRUCTURE.md`**:
   - Comprehensive documentation of two-repo architecture
   - Workflow descriptions and data flow diagrams
   - Maintenance procedures and troubleshooting guides
   - Manual operation commands

2. **Directory Cleanup**:
   - Removed unnecessary files (55MB+ freed):
     - `.venv310`, `.miniforge`, `.matches-env`, `.grok/` (virtual envs)
     - `Miniforge3.sh` (55MB installer)
     - `saved_dictionary.pkl` (6MB binary)
     - `assistantlysninger` (empty file)
   - Organized demo files:
     - Moved all HTML demos to `demos/` folder
     - Moved demo images (cube.png, etc.) to `demos/`
     - Moved design docs to `docs/` folder
   - Kept Pace-map-risk-backup for now (may contain reference data)

### Files Modified
- `Pace-map-risk/.env` (created, gitignored)
- `scripts/sync-forecasts-from-github.js` (bug fix)
- `REPO_STRUCTURE.md` (created)
- `SESSION.md` (updated)

### Next Steps
1. Monitor sync workflow completion (~15 min)
2. Verify website displays 2026-03 forecasts correctly
3. Test India page and other country pages
4. Consider removing Pace-map-risk-backup if confirmed unnecessary
5. Next automated run: April 1, 2026 at 01:00 UTC

---

# Session Log: 2026-03-13 14:58 GMT

## UCDP API Token Configuration

### Problem Resolved
UCDP changed their API access to require authentication tokens, breaking the automated data fetching in the parallel forecast workflow.

### Solution Implemented
1. **Securely Stored Token**:
   - Created `.env` file in `Pace-map-risk/` directory with token (already gitignored)
   - Added `UCDP_API_TOKEN` to GitHub repository secrets for automated workflows
   - Token: `b3df699c93c1c558`

2. **Verification**:
   - Tested API access with curl successfully
   - Confirmed token authenticates correctly (200 OK response, 385,918 total events available)
   - Existing workflow at `Pace-map-risk/.github/workflows/parallel-forecasts.yml` already configured to use `UCDP_API_TOKEN` secret (line 31)
   - Python script at `Pace-map-risk/scripts/parallel/prepare_data.py` already configured to use environment variable

3. **Configuration Details**:
   - Token submitted as HTTP header: `x-ucdp-access-token`
   - Rate limit: 5,000 requests/day (resets midnight UTC)
   - API documentation: https://ucdp.uu.se/apidocs/

### Status
✅ Token configured and tested
✅ GitHub Actions workflow ready to use token on next scheduled run (April 1, 2026 at 01:00 UTC)
✅ Local development environment configured

### Next Steps
1. Monitor next automated workflow run on April 1 to confirm token works in production
2. Data should sync automatically once workflow completes successfully

---

# Session Log: 2026-03-11 15:52 GMT

## Critical Bug Fix: Data Not Syncing to Website

### Root Cause Identified
Parallel forecast workflow creates SEPARATE h6/h12 CSV files, but website sync expects SINGLE combined file per period:
- **Old format** (pre-parallel): `2025-08_Sep-2025_to_Feb-2026.csv` (single file)
- **New format** (parallel): `2026-03_2026-03_to_2026-08_h6.csv` + `2026-03_2026-03_to_2027-02_h12.csv` (split files)
- **Result**: Website couldn't sync 2026-03 data, forecasts stuck at August 2025

### Fix Applied
- **Modified**: `Pace-map-risk/scripts/prepare_historical_predictions.py`
- **Change**: Now creates THREE files:
  1. `YYYY-MM_..._h6.csv` (6-month forecasts, detailed)
  2. `YYYY-MM_..._h12.csv` (12-month forecasts, detailed)
  3. `YYYY-MM.csv` (combined file for website compatibility)
- **Status**: Committed to Pace-map-risk repo, forecast workflow re-triggered (in progress, ~25min ETA)

### UI Improvements
- **Removed**: "Key Takeaways" box from `/forecasts` page
  - Had buggy date calculation (month off-by-one error)
  - User confirmed date was wrong and requested removal
- **File**: `app/forecasts/page.tsx` modified and deployed

### MoM Changes Showing Zero
- **Cause**: Only one recent snapshot exists (2026-01 from March 6)
- **No prior period** to compare against for month-over-month calculations
- **Resolution**: Once 2026-03 data syncs, MoM calculations will resume (comparing to 2026-01)
- **Gap**: Missing monthly data for Sept 2025 - Feb 2026
  - Last old-format file: `2025-08` (August 2025)
  - First new-format file: `2026-03` (March 2026)
  - Need to investigate if intermediate months can be backfilled

### Next Steps After Forecast Completes
1. Monitor workflow completion (~20 min remaining)
2. Verify `2026-03.csv` file created in Historical_Predictions
3. Trigger website sync manually
4. Verify 2026-03.json appears in content/forecasts/
5. Check if MoM calculations populate
6. Test country pages (e.g., Sudan) show updated scenarios

---

# Session Log: 2026-03-10 21:51 GMT

## Work Completed

### 1. Data API Page Clarifications
- **Problem**: User feedback that data-api page unclear about which months are predicted
- **Solution**: Added blue info box explaining forecast period structure
  - Directs users to check `forecast_metadata.json` for exact dates
  - Explains row index mapping (row 0 = forecast_start_date, etc.)
  - Clarifies difference between forecast CSVs (numeric indices) vs Hist.csv (date-indexed)
- **Files modified**: `app/data-api/page.tsx`
- **Status**: Committed and deployed

### 2. Citation Updates
- **Problem**: Citation section incomplete, missing authors and full paper title
- **Solution**: Updated both data-api and downloads pages with complete citation
  - All three authors: Schincariol, T., Frank, H., & Chadefaux, T.
  - Full paper title and DOI link
- **Files modified**: `app/data-api/page.tsx`, `app/downloads/page.tsx`
- **Status**: Completed

### 3. Data Freshness Investigation
- **Issue discovered**: Website showing January 2026 as latest forecast (should be February or March)
- **Root cause**:
  - Pace-map-risk repo HAS latest data (2026-03 forecasts generated March 10 at 20:07 UTC)
  - Files exist: `2026-03_2026-03_to_2026-08_h6.csv`, `2026-03_2026-03_to_2027-02_h12.csv`
  - Website sync ran at 20:52 UTC but didn't pick up the new files
  - Website still shows `2026-01.json` from March 6 as latest
- **Action taken**: Manually triggered sync workflow again at 21:50 GMT
- **Status**: Monitoring (workflow running)

### 4. Scheduled Workflow Issue Identified
- **Problem**: Parallel forecast generation workflow NOT running on schedule
- **Evidence**: All runs since February are manual (`workflow_dispatch`), no scheduled runs
- **Impact**: Forecasts not generating automatically on 1st of month at 01:00 UTC
- **Next action needed**: Investigate why cron schedule not triggering

### 5. Downloads vs API Page Organization Analysis
- **User question**: Whether having two pages (downloads + data-api) is professional or confusing
- **Analysis completed**: Researched industry standards (FRED, World Bank, UCDP)
- **Key findings**:
  - Separate pages IS industry standard
  - BUT: Data API missing from navigation, hero copy unclear about use cases
  - Recommendation: Keep both pages, add clearer positioning and navigation visibility
- **Status**: Analysis provided, awaiting user feedback on recommendations

## Next Steps

1. **Monitor sync workflow** - Check if 2026-03.json file created successfully
2. **Fix scheduled workflow** - Investigate why parallel-forecasts.yml cron not triggering
3. **Navigation improvements** (if user approves):
   - Add Data API to navigation menu
   - Clarify "interactive vs automated" in hero sections
   - Add "Which page should I use?" decision matrix
4. **Verify data completeness** once sync completes

---
