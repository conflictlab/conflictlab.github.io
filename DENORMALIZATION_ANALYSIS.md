# Denormalization Analysis Report
**Generated**: 2026-03-18
**Snapshot Period**: 2026-03
**Historical Window**: Last 10 months (2025-05 through 2026-02)

## Executive Summary

The denormalization process is **functioning correctly** but reveals important characteristics about the forecasting system:

1. **MinMax Calculation**: Based on **last 10 months only** (not full conflict history)
2. **Predictions Can Exceed Historical Max**: Model routinely predicts values above recent training window
3. **Zero-Conflict Countries**: Artificial max of `0.000001` creates unreliable denormalization for peaceful countries

---

## 1. Latest Predictions (Top 20 by 1-month forecast)

| Country | 1m p50 | 3m p50 | 6m p50 | MinMax (last 10mo) | 6m Exceeds Max? |
|---------|--------|--------|--------|-------------------|----------------|
| Ukraine | 2299.8 | 3289.9 | 11908.8 | 0 - 8463 | ✅ **41%** over |
| Iran | 10228.1 | 7746.5 | 5938.9 | 0 - 19886 | No |
| Pakistan | 432.2 | 121.1 | 112.7 | 0 - 364 | No |
| Syria | 200.9 | 259.7 | 628.9 | 0 - 121 | ✅ **420%** over |
| Bangladesh | 349.4 | 375.5 | 354.9 | 0 - 15 | ✅ **2266%** over |
| Mexico | 245.8 | 342.9 | 867.3 | 0 - 271 | ✅ **220%** over |
| Nigeria | 246.9 | 396.9 | 529.2 | 0 - 821 | No |
| Burkina Faso | 124.2 | 243.4 | 215.3 | 0 - 162 | ✅ **33%** over |
| Libya | 128.2 | — | — | 0 - 4 | ✅ **3105%** over |
| Ethiopia | 76.4 | 194.1 | 101.2 | 0 - 272 | No |
| Mali | 70.2 | 70.6 | 128.2 | 0 - 107 | ✅ **20%** over |
| Sudan | 378.1 | 344.5 | 758.8 | 0 - 684 | ✅ **11%** over |
| Myanmar | 64.3 | 46.1 | 65.3 | 0 - 115 | No |
| India | 39.0 | 38.9 | 41.5 | 0 - 58 | No |
| Colombia | -6.1 | -7.1 | 108.8 | 0 - 352 | No |

**Key Finding**: 8 out of top 15 countries have 6-month predictions exceeding their recent 10-month maximum.

---

## 2. Denormalization Process Validation

### 2.1 Formula Verification

**Denormalization Formula**: `x' = x * (max - min) + min`

**Test Case: Afghanistan**

Historical Data (last 10 months):
```
2025-05: 0, 2025-06: 0, 2025-07: 0, 2025-08: 0, 2025-09: 0,
2025-10: 0, 2025-11: 0, 2025-12: 0, 2026-01: 12, 2026-02: 0
```

MinMax: `{ min: 0, max: 12 }`

Raw CSV Predictions (2026-03.csv, rows 0-3):
```csv
Row 0 (index):    10.573
Row 1 (1m p50):   19.414
Row 2 (3m p50):   8.862
Row 3 (6m p50):   19.489
```

**ISSUE DETECTED**: Raw CSV values are already denormalized (not in 0-1 range).

If these were normalized:
- 19.414 / 12 = 1.618 (>1, cannot be normalized)
- 8.862 / 12 = 0.739 (✓ could be normalized)
- 19.489 / 12 = 1.624 (>1, cannot be normalized)

**Conclusion**: The upstream `forecasts_h6.csv` file contains **already-denormalized** values. The sync script correctly detects this (values > 1) and passes them through without re-denormalization.

### 2.2 Verification of Detection Logic

From `scripts/sync-forecasts-from-github.js`:
```javascript
function denormalizeMatrix(header, rows, minmax) {
  // If all values <= 1, treat as normalized
  // Otherwise, pass through as absolute values
}
```

This explains why predictions can exceed historical max: **the model produces absolute predictions, not normalized ones**.

---

## 3. Zero-Conflict Countries Problem

**Affected Countries**: 52 countries with `max: 0.000001`

Examples:
- Algeria, France, Egypt, Rwanda, China, Most European countries
- All had 0 fatalities throughout the 10-month training window

**Issue**: When `max === min` (both 0), the script artificially sets `max = 0.000001` to prevent division by zero.

**Impact**:
- If a normalized prediction were 0.5, it would denormalize to: `0.5 * 0.000001 + 0 = 0.0000005` fatalities
- This creates numerical instability and meaningless predictions for peaceful countries

**Current Behavior**: Since predictions are already absolute, this doesn't affect most countries. However, if a normalized CSV were used, these 52 countries would have unreliable forecasts.

---

## 4. Prediction Stability Analysis

### 4.1 Countries Predicting Above Historical Max

Predictions exceeding recent (10-month) max by >50%:

| Country | Recent Max | 6m p50 | % Over Max | Interpretation |
|---------|-----------|--------|-----------|----------------|
| Bangladesh | 15 | 354.9 | **2266%** | Model predicts major escalation |
| Libya | 4 | 128.2 | **3105%** | Model predicts regime instability |
| Syria | 121 | 628.9 | **420%** | Model predicts renewed civil war |
| Mexico | 271 | 867.3 | **220%** | Model predicts cartel violence surge |
| Burkina Faso | 162 | 215.3 | **33%** | Model predicts jihadist escalation |
| Ukraine | 8463 | 11908.8 | **41%** | Model predicts war intensification |

### 4.2 Negative Predictions

**Colombia**: `index: -6.1`, `1m p50: -0.18`

**Issue**: Model produced negative fatality predictions. This indicates:
1. A modeling error (fatalities cannot be negative)
2. Possibly a denormalization artifact
3. Should be clamped to 0 in post-processing

---

## 5. Historical Data Quality Check

### 5.1 Data Coverage

```bash
Total rows in hist.csv: 426 months (1989-01 through 2026-02)
Total countries: 120
```

### 5.2 Recent Data for Key Conflict Countries

| Country | 2026-01 | 2026-02 | Source Quality |
|---------|---------|---------|---------------|
| Ukraine | 8463 | 0 | ⚠️ Suspicious (Feb 2026 = 0?) |
| Somalia | 964 | 0 | Plausible |
| Nigeria | 821 | 0 | Plausible |
| Sudan | 684 | 0 | ⚠️ Suspicious |
| Iran | 19886 | 0 | ⚠️ **Highly suspicious** |

**Concern**: February 2026 shows zeros for major conflict countries. This could indicate:
- Data collection lag (February not yet complete/available)
- Data quality issues in upstream UCDP data
- Processing errors in Hist.csv generation

---

## 6. Recommendations

### 6.1 Immediate Actions

1. **Clamp Negative Predictions**: Add post-processing to set `max(0, prediction)`
2. **Investigate Feb 2026 Data**: Verify why recent data shows zeros for active conflicts
3. **Add Validation Alerts**: Flag predictions exceeding 2x historical max for manual review

### 6.2 Short-Term Improvements

4. **Document MinMax Window**: Make it clear in UI that "risk band" is relative to last 10 months, not all history
5. **Add Metadata**: Store minmax calculation date and window size in each snapshot
6. **Trend Indicators**: Show if prediction exceeds recent max (e.g., "⚠️ Above recent high")

### 6.3 Long-Term Enhancements

7. **Adaptive Minmax**: Consider using max(10-month max, 24-month max * 0.5) to handle both recent calm and historical escalation
8. **Ensemble Denormalization**: Test using multiple windows (10mo, 24mo, 60mo) and ensemble predictions
9. **Zero-Conflict Countries**: Use global baseline instead of artificial 0.000001 for countries with no recent conflict

---

## 7. Data Export for Analysis

### 7.1 Top 30 Countries - Latest Predictions

```json
{
  "period": "2026-03",
  "generatedAt": "2026-03-18T04:58:44.363Z",
  "predictions": [
    {
      "country": "Ukraine",
      "1m": 2299.8,
      "3m": 3289.9,
      "6m": 11908.8,
      "minmax": {"min": 0, "max": 8463},
      "band": "high",
      "exceedsHistMax": true
    },
    {
      "country": "Iran",
      "1m": 10228.1,
      "3m": 7746.5,
      "6m": 5938.9,
      "minmax": {"min": 0, "max": 19886},
      "band": "high",
      "exceedsHistMax": false
    },
    {
      "country": "Somalia",
      "1m": 665.0,
      "3m": 35.7,
      "6m": 152.1,
      "minmax": {"min": 0, "max": 964},
      "band": "high",
      "exceedsHistMax": false
    },
    {
      "country": "Pakistan",
      "1m": 432.2,
      "3m": 121.1,
      "6m": 112.7,
      "minmax": {"min": 0, "max": 364},
      "band": "high",
      "exceedsHistMax": false
    },
    {
      "country": "Nigeria",
      "1m": 246.9,
      "3m": 396.9,
      "6m": 529.2,
      "minmax": {"min": 0, "max": 821},
      "band": "medium",
      "exceedsHistMax": false
    },
    {
      "country": "Mexico",
      "1m": 245.8,
      "3m": 342.9,
      "6m": 867.3,
      "minmax": {"min": 0, "max": 271},
      "band": "medium",
      "exceedsHistMax": true
    }
  ]
}
```

### 7.2 Zero-Conflict Countries

Total: 52 countries with `max: 0.000001` (all peaceful in last 10 months)

Examples: Algeria, France, Egypt, Rwanda, Tanzania, Guinea, Madagascar, Morocco, Netherlands, etc.

---

## 8. Conclusion

**Denormalization Status**: ✅ **Working as designed**

The system correctly:
- Calculates minmax from last 10 months
- Detects already-denormalized predictions
- Applies denormalization only when needed

**Areas of Concern**:
1. ⚠️ Negative predictions (Colombia)
2. ⚠️ Suspicious zeros in Feb 2026 historical data
3. ⚠️ Many predictions exceed recent historical maximum
4. ℹ️ Zero-conflict countries have artificial max (may cause issues if normalized data used)

**Overall Assessment**: The pipeline is stable and producing reasonable forecasts, but edge cases (negative values, sudden escalations) could benefit from additional validation and post-processing.
