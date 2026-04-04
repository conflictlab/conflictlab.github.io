#!/usr/bin/env node
/**
 * Comprehensive validation script for PACE forecasting pipeline
 *
 * Checks:
 * 1. No trailing all-zero months in Hist.csv
 * 2. All countries with significant activity have forecasts
 * 3. Forecast metadata is consistent
 * 4. Website status is OK
 * 5. Key countries (Ukraine, Myanmar, Sudan, etc.) have realistic forecasts
 *
 * Usage: node scripts/validate-data-pipeline.js
 * Exit code: 0 if all checks pass, 1 if any fail
 */

const https = require('https')
const { execSync } = require('child_process')

async function fetchCSV(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const lines = data.split('\n').filter(l => l.trim())
        const header = lines[0].split(',')
        const rows = lines.slice(1).map(line => {
          const values = line.split(',')
          const row = {}
          header.forEach((h, i) => row[h] = values[i])
          return row
        })
        resolve({ header, rows })
      })
    }).on('error', reject)
  })
}

async function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => resolve(JSON.parse(data)))
    }).on('error', reject)
  })
}

async function main() {
  console.log('='
.repeat(70))
  console.log('PACE DATA PIPELINE VALIDATION')
  console.log('='.repeat(70))

  let passed = 0
  let failed = 0

  // 1. Check Hist.csv for trailing all-zero months
  console.log('\n1. Checking Hist.csv for trailing all-zero months...')
  try {
    const hist = await fetchCSV('https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/Hist.csv')
    const lastRow = hist.rows[hist.rows.length - 1]
    const total = hist.header.slice(1).reduce((sum, col) => {
      if (col && !col.includes('Unnamed')) {
        return sum + (parseFloat(lastRow[col]) || 0)
      }
      return sum
    }, 0)

    const lastDate = lastRow[hist.header[0]]
    if (total === 0) {
      console.log(`   ❌ FAIL: Last month (${lastDate}) has all zeros!`)
      failed++
    } else {
      console.log(`   ✅ PASS: Last month (${lastDate}) has ${total.toFixed(0)} total fatalities`)
      passed++
    }
  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`)
    failed++
  }

  // 2. Check for unrealistic zero forecasts
  console.log('\n2. Checking for unrealistic zero forecasts...')
  try {
    const hist = await fetchCSV('https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/Hist.csv')
    const forecasts = await fetchCSV('https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h6.csv')

    const last12 = hist.rows.slice(-12)
    const histSums = {}
    hist.header.slice(1).forEach(col => {
      if (col && !col.includes('Unnamed')) {
        histSums[col] = last12.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0)
      }
    })

    const forecastSums = {}
    forecasts.header.slice(1).forEach(col => {
      if (col && !col.includes('Unnamed')) {
        forecastSums[col] = forecasts.rows.reduce((sum, row) => sum + (parseFloat(row[col]) || 0), 0)
      }
    })

    const ACTIVE_THRESHOLD = 100
    const zeroForecasts = []
    Object.keys(histSums).forEach(country => {
      const histTotal = histSums[country]
      const forecastTotal = forecastSums[country] || 0
      if (histTotal > ACTIVE_THRESHOLD && forecastTotal === 0) {
        zeroForecasts.push({ country, histTotal })
      }
    })

    if (zeroForecasts.length > 0) {
      console.log(`   ❌ FAIL: ${zeroForecasts.length} active countries have zero forecasts:`)
      zeroForecasts.slice(0, 5).forEach(({ country, histTotal }) => {
        console.log(`      - ${country}: ${histTotal.toFixed(0)} fatalities in last 12 months`)
      })
      failed++
    } else {
      console.log(`   ✅ PASS: No active countries (>${ACTIVE_THRESHOLD} fatalities) have zero forecasts`)
      passed++
    }
  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`)
    failed++
  }

  // 3. Check forecast metadata consistency
  console.log('\n3. Checking forecast metadata consistency...')
  try {
    const metadata = await fetchJSON('https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecast_metadata.json')
    const dataEnd = metadata.data_end_date
    const forecastStart = metadata.forecast_start_date

    console.log(`   Data ends: ${dataEnd}`)
    console.log(`   Forecasts start: ${forecastStart}`)

    const [endYear, endMonth] = dataEnd.split('-').map(Number)
    let expectedMonth = endMonth + 1
    let expectedYear = endYear
    if (expectedMonth > 12) {
      expectedMonth = 1
      expectedYear++
    }

    const [startYear, startMonth] = forecastStart.split('-').map(Number)
    if (startYear === expectedYear && startMonth === expectedMonth) {
      console.log(`   ✅ PASS: Forecast start date is correct (data_end + 1 month)`)
      passed++
    } else {
      console.log(`   ❌ FAIL: Forecast start should be ${expectedYear}-${String(expectedMonth).padStart(2, '0')}, got ${forecastStart}`)
      failed++
    }
  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`)
    failed++
  }

  // 4. Check website status
  console.log('\n4. Checking website status...')
  try {
    const status = await fetchJSON('https://raw.githubusercontent.com/conflictlab/conflictlab.github.io/main/public/status.json')

    if (status.ok) {
      console.log(`   ✅ PASS: Website status is OK`)
      console.log(`      Latest period: ${status.summary.latestPeriod}`)
      console.log(`      Missing active countries: ${status.summary.missingActiveCount || 0}`)

      if (status.summary.missingActiveCount > 0) {
        console.log(`   ⚠️  WARNING: ${status.summary.missingActiveCount} countries missing:`)
        status.missingActiveEntities.slice(0, 5).forEach(country => {
          console.log(`      - ${country}`)
        })
      }
      passed++
    } else {
      console.log(`   ❌ FAIL: Website status is NOT OK`)
      console.log(`      Errors: ${status.errors}`)
      failed++
    }
  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`)
    failed++
  }

  // 5. Check key countries have realistic forecasts
  console.log('\n5. Checking key countries have realistic forecasts...')
  try {
    const forecasts = await fetchCSV('https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/forecasts_h6.csv')
    const hist = await fetchCSV('https://raw.githubusercontent.com/conflictlab/Pace-map-risk/main/Hist.csv')

    const keyCountries = ['Ukraine', 'Myanmar', 'Sudan', 'Palestine', 'Syria']
    const last12 = hist.rows.slice(-12)

    let allRealistic = true
    keyCountries.forEach(country => {
      if (forecasts.header.includes(country)) {
        const forecastTotal = forecasts.rows.reduce((sum, row) => sum + (parseFloat(row[country]) || 0), 0)
        const histTotal = last12.reduce((sum, row) => sum + (parseFloat(row[country]) || 0), 0)
        const histAvg = histTotal / 12

        // Forecast should be in reasonable range of historical average (not 0, not 100x off)
        if (forecastTotal === 0 && histAvg > 100) {
          console.log(`   ❌ ${country}: Zero forecast but ${histAvg.toFixed(0)} avg monthly fatalities`)
          allRealistic = false
        } else if (forecastTotal / 6 > histAvg * 10 || forecastTotal / 6 < histAvg / 10) {
          console.log(`   ⚠️  ${country}: Forecast avg ${(forecastTotal/6).toFixed(0)} vs historical avg ${histAvg.toFixed(0)} (>10x difference)`)
        } else {
          console.log(`   ✅ ${country}: ${forecastTotal.toFixed(0)} total (${(forecastTotal/6).toFixed(0)} avg/month vs ${histAvg.toFixed(0)} historical)`)
        }
      }
    })

    if (allRealistic) {
      passed++
    } else {
      failed++
    }
  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`)
    failed++
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('VALIDATION SUMMARY')
  console.log('='.repeat(70))
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)

  if (failed === 0) {
    console.log('\n✅ All validation checks passed!')
    process.exit(0)
  } else {
    console.log('\n❌ Some validation checks failed!')
    process.exit(1)
  }
}

main().catch(e => {
  console.error('Fatal error:', e)
  process.exit(1)
})
