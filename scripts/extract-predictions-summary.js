#!/usr/bin/env node
/**
 * Extract and validate latest predictions with denormalization parameters
 */

const fs = require('fs')
const path = require('path')

function main() {
  const latestPath = path.join(process.cwd(), 'content/forecasts/latest.json')
  const minmaxPath = path.join(process.cwd(), 'public/data/minmax.json')

  const latest = JSON.parse(fs.readFileSync(latestPath, 'utf-8'))
  const minmax = JSON.parse(fs.readFileSync(minmaxPath, 'utf-8'))

  const analysis = {
    metadata: {
      period: latest.period,
      generatedAt: latest.generatedAt,
      totalCountries: latest.entities.length,
      analysisDate: new Date().toISOString()
    },
    predictions: [],
    issues: {
      negativeValues: [],
      exceedHistoricalMax: [],
      zeroConflictCountries: []
    },
    statistics: {
      avgPrediction1m: 0,
      avgPrediction6m: 0,
      maxPrediction1m: 0,
      maxPrediction6m: 0,
      totalExceedingMax: 0,
      totalWithNegatives: 0
    }
  }

  let sum1m = 0, sum6m = 0

  for (const entity of latest.entities) {
    const mm = minmax[entity.name] || { min: 0, max: 0 }
    const pred1m = entity.horizons['1m'].p50
    const pred6m = entity.horizons['6m'].p50

    const exceedsMax = pred6m > mm.max
    const hasNegative = pred1m < 0 || pred6m < 0
    const isZeroConflict = mm.max < 0.00001

    sum1m += pred1m
    sum6m += pred6m

    if (pred1m > analysis.statistics.maxPrediction1m) {
      analysis.statistics.maxPrediction1m = pred1m
    }
    if (pred6m > analysis.statistics.maxPrediction6m) {
      analysis.statistics.maxPrediction6m = pred6m
    }

    const record = {
      country: entity.name,
      index: entity.index,
      band: entity.band,
      predictions: {
        "1m_p10": entity.horizons['1m'].p10,
        "1m_p50": entity.horizons['1m'].p50,
        "1m_p90": entity.horizons['1m'].p90,
        "3m_p50": entity.horizons['3m'].p50,
        "6m_p50": entity.horizons['6m'].p50,
        "6m_p90": entity.horizons['6m'].p90
      },
      denormalization: {
        min: mm.min,
        max: mm.max,
        range: mm.max - mm.min
      },
      flags: {
        exceedsHistoricalMax: exceedsMax,
        hasNegativeValue: hasNegative,
        zeroConflictCountry: isZeroConflict,
        percentOverMax: exceedsMax ? ((pred6m - mm.max) / mm.max * 100).toFixed(1) : 0
      }
    }

    analysis.predictions.push(record)

    if (hasNegative) {
      analysis.issues.negativeValues.push({
        country: entity.name,
        value1m: pred1m,
        value6m: pred6m
      })
      analysis.statistics.totalWithNegatives++
    }

    if (exceedsMax && !isZeroConflict) {
      analysis.issues.exceedHistoricalMax.push({
        country: entity.name,
        prediction6m: pred6m,
        historicalMax: mm.max,
        percentOver: ((pred6m - mm.max) / mm.max * 100).toFixed(1)
      })
      analysis.statistics.totalExceedingMax++
    }

    if (isZeroConflict) {
      analysis.issues.zeroConflictCountries.push(entity.name)
    }
  }

  analysis.statistics.avgPrediction1m = (sum1m / latest.entities.length).toFixed(2)
  analysis.statistics.avgPrediction6m = (sum6m / latest.entities.length).toFixed(2)

  // Sort predictions by 1m p50 descending
  analysis.predictions.sort((a, b) => b.predictions["1m_p50"] - a.predictions["1m_p50"])

  // Sort issues by severity
  analysis.issues.exceedHistoricalMax.sort((a, b) =>
    parseFloat(b.percentOver) - parseFloat(a.percentOver)
  )

  const outputPath = path.join(process.cwd(), 'PREDICTIONS_SUMMARY.json')
  fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2))

  console.log(`\n✅ Analysis complete!`)
  console.log(`📊 Analyzed ${latest.entities.length} countries for period ${latest.period}`)
  console.log(`⚠️  ${analysis.statistics.totalWithNegatives} countries with negative predictions`)
  console.log(`📈 ${analysis.statistics.totalExceedingMax} countries exceeding historical max`)
  console.log(`🕊️  ${analysis.issues.zeroConflictCountries.length} zero-conflict countries`)
  console.log(`\n💾 Saved to: ${outputPath}`)
  console.log(`\nTop 5 predictions (1m):`)
  for (let i = 0; i < 5; i++) {
    const p = analysis.predictions[i]
    console.log(`  ${i+1}. ${p.country}: ${p.predictions["1m_p50"].toFixed(1)} (band: ${p.band})`)
  }
}

if (require.main === module) main()
