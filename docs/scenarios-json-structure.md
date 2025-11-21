# Scenarios JSON Structure

## Overview
The `public/data/scenarios.json` file contains historical conflict scenario data for 124 countries, with 72 countries having actual scenario data and 52 being empty.

## File Information
- **Source**: Converted from `sce_dictionary.pkl`
- **Size**: 1.1 MB
- **Lines**: 48,213
- **Format**: JSON

## Structure

### Top Level
```json
{
  "CountryName": [
    {/* Scenario Metadata */},
    {/* Temporal Probability Data */}
  ],
  ...
}
```

### Country Data Array
Each country has an array with 2 elements:

1. **Element 0: Scenario Metadata** - Dictionary with scenario characteristics
2. **Element 1: Temporal Data** - Dictionary with probability values over time

### Scenario Metadata Structure
```json
{
  "Sce": {
    "0": 1,
    "1": 1,
    ...
  },
  "Region": {
    "0": "Africa",
    "1": "Europe",
    ...
  },
  "Decade": {
    "0": "2000-2010",
    "1": "90-2000",
    ...
  },
  "Scale": {
    "0": ">1000",
    "1": "10-100",
    ...
  }
}
```

**Fields:**
- **Sce**: Scenario ID (all appear to be 1)
- **Region**: Geographic region of the historical conflict
  - Values: Africa, Asia, Europe, Middle East, Americas
- **Decade**: Time period of the historical conflict
  - Values: "90-2000", "2000-2010", "2010-2020", "2020-Now"
- **Scale**: Fatality scale of the historical conflict
  - Values: "<10", "10-100", "100-1000", ">1000"

Each field uses string keys ("0", "1", "2", ...) representing the scenario index.

### Temporal Data Structure
```json
{
  "2025-10-31 00:00:00": {
    "1.0": 0.1627635894052518
  },
  "2025-11-30 00:00:00": {
    "1.0": 0.1949211228092275
  },
  ...
}
```

**Format:**
- **Keys**: Date strings in format "YYYY-MM-DD HH:MM:SS"
- **Values**: Dictionary with scenario ID as key and probability as value
- **Date Range**: October 2025 to March 2026 (6 months)
- **Scenario ID**: Always "1.0" in the observed data
- **Probability**: Float value between 0 and 1

## Example Countries

### Afghanistan (8 scenarios)
- **Regions**: Asia, Europe, Africa, Middle East
- **Decades**: 90-2000, 2000-2010, 2010-2020, 2020-Now
- **Scales**: 10-100, 100-1000, >1000
- **Time Points**: 6 (Oct 2025 - Mar 2026)

### Syria (9 scenarios)
- **Regions**: Middle East, Asia, Africa
- **Decades**: 90-2000, 2000-2010, 2010-2020
- **Scales**: <10, 10-100, 100-1000, >1000
- **Time Points**: 6

### Ukraine (4 scenarios)
- **Regions**: Asia, Africa
- **Decades**: 90-2000, 2000-2010, 2010-2020
- **Scales**: 100-1000, >1000
- **Time Points**: 6

### Yemen (14 scenarios)
- **Regions**: Americas, Asia, Africa
- **Decades**: 90-2000, 2000-2010, 2010-2020, 2020-Now
- **Scales**: 10-100, 100-1000, >1000
- **Time Points**: 6

## Usage Notes

1. **Scenario Interpretation**: Each scenario (indexed 0, 1, 2, ...) represents a historical conflict with similar characteristics (region, time period, scale) that could be used as an analog for forecasting.

2. **Probability Values**: The temporal data appears to show probability values for scenario "1.0" at different time points.

3. **Empty Countries**: 52 countries have empty arrays `[[], []]`, indicating no historical scenarios are available for those countries.

4. **Data Coverage**: 72 out of 124 countries (58%) have scenario data.

## Accessing the Data

### JavaScript/TypeScript Example
```typescript
import scenariosData from '@/public/data/scenarios.json'

// Get scenarios for a country
const countryScenarios = scenariosData['Afghanistan']
const metadata = countryScenarios[0]
const temporalData = countryScenarios[1]

// Access specific scenario
const scenario0Region = metadata.Region['0'] // "Africa"
const scenario0Decade = metadata.Decade['0'] // "2000-2010"
const scenario0Scale = metadata.Scale['0']   // ">1000"

// Access temporal probabilities
const firstDate = Object.keys(temporalData)[0]
const probability = temporalData[firstDate]['1.0']
```

### Python Example
```python
import json

with open('public/data/scenarios.json', 'r') as f:
    scenarios = json.load(f)

# Get Afghanistan scenarios
afg = scenarios['Afghanistan']
metadata = afg[0]
temporal = afg[1]

# Number of scenarios
num_scenarios = len(metadata['Sce'])

# Iterate through scenarios
for i in range(num_scenarios):
    region = metadata['Region'][str(i)]
    decade = metadata['Decade'][str(i)]
    scale = metadata['Scale'][str(i)]
    print(f"Scenario {i}: {region}, {decade}, {scale}")
```

## Statistics

- **Total Countries**: 124
- **Countries with Scenarios**: 72 (58%)
- **Countries without Scenarios**: 52 (42%)
- **Scenarios per Country**: Ranges from 0 to 844
  - Afghanistan: 8 scenarios in 1 cluster
  - Syria: 9 scenarios in 2 clusters
  - Ukraine: 4 scenarios in 1 cluster
  - Yemen: 14 scenarios in 3 clusters
  - Iran: 844 scenarios in 7 clusters (most scenarios)
- **Time Points per Country**: 6 months (Oct 2025 - Mar 2026)
- **Unique Regions**: 5 (Africa, Asia, Europe, Middle East, Americas)
- **Unique Decades**: 4 (90-2000, 2000-2010, 2010-2020, 2020-Now)
- **Unique Scales**: 4 (<10, 10-100, 100-1000, >1000)

## Understanding Cluster Weights

The `weight` field in each cluster represents the **probability** that the country's conflict will follow the pattern of that cluster's historical scenarios.

### Example: Iran with 7 Clusters

```json
{
  "Iran": {
    "clusters": {
      "1": { "count": 161, "weight": 0.19 },  // 19% probability
      "2": { "count": 533, "weight": 0.63 },  // 63% probability - dominant cluster
      "3": { "count": 24, "weight": 0.03 },   // 3% probability
      "4": { "count": 19, "weight": 0.02 },   // 2% probability
      "5": { "count": 43, "weight": 0.05 },   // 5% probability
      "6": { "count": 28, "weight": 0.03 },   // 3% probability
      "7": { "count": 36, "weight": 0.04 }    // 4% probability
    }
  }
}
```

**Interpretation**:
- The model has identified 7 distinct patterns (clusters) based on 844 historical conflicts worldwide
- There's a **63% probability** that Iran's conflict will evolve like Cluster 2's 533 scenarios
- Cluster 2 includes conflicts from all regions, all time periods, and all scales (including >1000 fatalities)
- Each cluster has its own temporal trajectory showing how risk evolves over 6 months
- The weights sum to approximately 1.0 (100%)

### Visualization

In the forecast pages, each cluster is plotted as a separate time series line:
- **7 lines** for Iran (one per cluster)
- **Line color intensity** or highlighting indicates the cluster weight
- **Legend** shows: "Cluster X — Y% probability" with scenario details
- **Temporal values** show the forecasted risk metric for each month if that cluster's pattern occurs
