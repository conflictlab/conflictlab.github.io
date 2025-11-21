#!/usr/bin/env node
/**
 * Generate per-country grid JSON files from global grid data.
 *
 * For each country in the forecasts, this script:
 * 1. Loads the country boundary from world.geojson
 * 2. Filters grid points that fall within (or overlap) the country
 * 3. Writes a compact JSON file per country per month
 *
 * Output: public/data/grid/country/{COUNTRY_ID}-m{1-6}.json
 *
 * Run: node scripts/generate-country-grids.js
 */

const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'data')
const GRID_DIR = path.join(PUBLIC_DIR, 'grid')
const OUTPUT_DIR = path.join(GRID_DIR, 'country')
const WORLD_GEOJSON = path.join(PUBLIC_DIR, 'world.geojson')
const FORECASTS_DIR = path.join(__dirname, '..', 'content', 'forecasts')

// Grid cell half-size in degrees (0.5° cells)
const CELL_HALF = 0.25

// Normalize country name for matching
function norm(s) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[^a-z\s\-']/g, '').trim()
}

// Point in polygon (ray casting)
function pointInRing(lon, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1]
    const xj = ring[j][0], yj = ring[j][1]
    const intersect = ((yi > lat) !== (yj > lat)) && (lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

function pointInPolygon(lon, lat, polygon) {
  if (!polygon || !polygon.length) return false
  // Check outer ring
  if (!pointInRing(lon, lat, polygon[0])) return false
  // Check holes
  for (let i = 1; i < polygon.length; i++) {
    if (pointInRing(lon, lat, polygon[i])) return false
  }
  return true
}

function pointInMultiPolygon(lon, lat, multiPolygon) {
  for (const polygon of multiPolygon) {
    if (pointInPolygon(lon, lat, polygon)) return true
  }
  return false
}

// Check if a grid cell overlaps a country (any corner or center inside)
function cellOverlapsCountry(lon, lat, multiPolygon) {
  // Test center and all 4 corners
  const testPoints = [
    [lon, lat],                           // center
    [lon - CELL_HALF, lat - CELL_HALF],   // SW
    [lon + CELL_HALF, lat - CELL_HALF],   // SE
    [lon + CELL_HALF, lat + CELL_HALF],   // NE
    [lon - CELL_HALF, lat + CELL_HALF],   // NW
  ]
  for (const [x, y] of testPoints) {
    if (pointInMultiPolygon(x, y, multiPolygon)) return true
  }
  return false
}

// Get bounding box of a multi-polygon
function getBounds(multiPolygon) {
  let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90
  for (const polygon of multiPolygon) {
    for (const ring of polygon) {
      for (const [lon, lat] of ring) {
        if (lon < minLon) minLon = lon
        if (lon > maxLon) maxLon = lon
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    }
  }
  return { minLon, maxLon, minLat, maxLat }
}

async function main() {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Load world.geojson for country boundaries
  if (!fs.existsSync(WORLD_GEOJSON)) {
    console.error('Error: world.geojson not found at', WORLD_GEOJSON)
    process.exit(1)
  }
  const worldGeoJson = JSON.parse(fs.readFileSync(WORLD_GEOJSON, 'utf-8'))

  // Build country name -> geometry map
  const countryGeometries = new Map()
  for (const feature of worldGeoJson.features || []) {
    const name = feature?.properties?.name
    if (!name) continue
    const geom = feature.geometry
    let multiPoly = []
    if (geom?.type === 'Polygon') {
      multiPoly = [geom.coordinates]
    } else if (geom?.type === 'MultiPolygon') {
      multiPoly = geom.coordinates
    }
    if (multiPoly.length) {
      countryGeometries.set(norm(name), { name, multiPoly })
    }
  }
  console.log(`Loaded ${countryGeometries.size} country boundaries`)

  // Get latest forecast period
  const latestPath = path.join(FORECASTS_DIR, 'latest.json')
  if (!fs.existsSync(latestPath)) {
    console.error('Error: latest.json not found')
    process.exit(1)
  }
  const latestForecast = JSON.parse(fs.readFileSync(latestPath, 'utf-8'))
  const period = latestForecast.period
  console.log(`Processing period: ${period}`)

  // Get list of countries from forecast
  const countries = (latestForecast.entities || [])
    .filter(e => e.entityType === 'country')
    .map(e => ({ id: e.id, name: e.name }))
  console.log(`Found ${countries.length} countries in forecast`)

  // Process each month
  for (let month = 1; month <= 6; month++) {
    const gridFile = path.join(GRID_DIR, `${period}-m${month}.json`)
    if (!fs.existsSync(gridFile)) {
      console.warn(`Warning: Grid file not found: ${gridFile}`)
      continue
    }

    const gridData = JSON.parse(fs.readFileSync(gridFile, 'utf-8'))
    const points = gridData.points || []
    console.log(`Month ${month}: ${points.length} global points`)

    // Process each country
    for (const country of countries) {
      const normName = norm(country.name)
      const geo = countryGeometries.get(normName)

      if (!geo) {
        // Try alternate names
        let found = null
        for (const [key, val] of countryGeometries) {
          if (key.includes(normName) || normName.includes(key)) {
            found = val
            break
          }
        }
        if (!found) {
          // Skip countries without boundaries (small states, etc.)
          continue
        }
      }

      const { multiPoly } = geo || countryGeometries.get(normName) || {}
      if (!multiPoly) continue

      // Get bounding box for quick filtering
      const bounds = getBounds(multiPoly)

      // Filter points that overlap this country
      const countryPoints = points.filter(p => {
        // Quick bounding box check first
        if (p.lon < bounds.minLon - CELL_HALF || p.lon > bounds.maxLon + CELL_HALF) return false
        if (p.lat < bounds.minLat - CELL_HALF || p.lat > bounds.maxLat + CELL_HALF) return false
        // Detailed overlap check
        return cellOverlapsCountry(p.lon, p.lat, multiPoly)
      })

      if (countryPoints.length === 0) continue

      // Write country-specific file
      const outFile = path.join(OUTPUT_DIR, `${country.id}-m${month}.json`)
      const output = {
        period,
        month,
        country: country.name,
        countryId: country.id,
        points: countryPoints,
      }
      fs.writeFileSync(outFile, JSON.stringify(output))

      if (month === 1) {
        console.log(`  ${country.name}: ${countryPoints.length} points`)
      }
    }
  }

  console.log('Done generating country grid files')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
