'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import TimeSeriesChart from './TimeSeriesChart'
import FinancialPerformanceChart from './FinancialPerformanceChart'
import Link from 'next/link'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Mock data for conflict risk levels by country - using ISO 3166-1 alpha-3 codes
const countryRiskData = {
  'AFG': { 
    name: 'Afghanistan', 
    risk: 85, 
    level: 'Very High',
    trend: [82, 84, 86, 85, 87, 85],
    forecast: [85, 83, 81, 78, 76],
    drivers: ['Political instability', 'Economic crisis', 'Security concerns'],
    confidence: 0.92
  },
  'SYR': { 
    name: 'Syria', 
    risk: 78, 
    level: 'Very High',
    trend: [85, 82, 80, 78, 76, 78],
    forecast: [78, 75, 72, 70, 68],
    drivers: ['Ongoing conflict', 'Economic sanctions', 'Refugee crisis'],
    confidence: 0.88
  },
  'YEM': { 
    name: 'Yemen', 
    risk: 82, 
    level: 'Very High',
    trend: [88, 85, 84, 82, 80, 82],
    forecast: [82, 80, 78, 75, 73],
    drivers: ['Civil war', 'Humanitarian crisis', 'Economic collapse'],
    confidence: 0.90
  },
  'UKR': { 
    name: 'Ukraine', 
    risk: 70, 
    level: 'High',
    trend: [45, 52, 68, 75, 72, 70],
    forecast: [70, 68, 65, 62, 58],
    drivers: ['Armed conflict', 'Territorial disputes', 'Economic pressure'],
    confidence: 0.95
  },
  'USA': { 
    name: 'United States', 
    risk: 25, 
    level: 'Low',
    trend: [22, 24, 26, 28, 26, 25],
    forecast: [25, 23, 22, 20, 19],
    drivers: ['Political polarization', 'Social tensions', 'Economic inequality'],
    confidence: 0.85
  },
  'CHN': { 
    name: 'China', 
    risk: 30, 
    level: 'Low',
    trend: [28, 29, 31, 32, 31, 30],
    forecast: [30, 29, 28, 27, 26],
    drivers: ['Economic slowdown', 'Social control', 'Regional tensions'],
    confidence: 0.82
  },
  'RUS': { 
    name: 'Russia', 
    risk: 55, 
    level: 'Medium',
    trend: [48, 52, 58, 62, 58, 55],
    forecast: [55, 53, 50, 48, 45],
    drivers: ['International sanctions', 'Economic pressure', 'Political tensions'],
    confidence: 0.87
  },
  'IND': { 
    name: 'India', 
    risk: 45, 
    level: 'Medium',
    trend: [42, 43, 46, 48, 47, 45],
    forecast: [45, 43, 41, 39, 37],
    drivers: ['Border tensions', 'Internal security', 'Economic challenges'],
    confidence: 0.83
  },
}

const getRiskColor = (risk: number) => {
  if (risk >= 75) return '#8B0000' // Very High - Dark Red
  if (risk >= 60) return '#DC143C' // High - Crimson
  if (risk >= 45) return '#FF6347' // Medium - Tomato
  if (risk >= 30) return '#FFA500' // Low - Orange
  return '#90EE90' // Very Low - Light Green
}

export default function LeafletMap() {
  const [geoJsonData, setGeoJsonData] = useState<any>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGeoJsonData = async () => {
      try {
        console.log('Loading GeoJSON data...')
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
        if (!response.ok) {
          throw new Error('Failed to fetch country boundaries')
        }
        const data = await response.json()
        console.log('GeoJSON data loaded, features count:', data.features?.length)
        setGeoJsonData(data)
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading GeoJSON:', err)
        setError(err instanceof Error ? err.message : 'Failed to load country data')
        setIsLoading(false)
      }
    }

    loadGeoJsonData()
  }, [])

  const getCountryCode = (feature: any) => {
    const countryName = feature.properties.name || feature.properties.NAME || ''
    
    // Simple name-to-code mapping for countries with risk data
    const nameToCodeMapping: { [key: string]: string } = {
      'Afghanistan': 'AFG',
      'Syria': 'SYR', 
      'Yemen': 'YEM',
      'Ukraine': 'UKR',
      'United States': 'USA',
      'China': 'CHN',
      'Russia': 'RUS',  
      'India': 'IND'
    }
    
    return nameToCodeMapping[countryName] || countryName
  }

  const onEachFeature = (feature: any, layer: any) => {
    const countryName = feature.properties.name || feature.properties.NAME || 'Unknown Country'
    const countryCode = getCountryCode(feature)
    const countryData = countryRiskData[countryCode as keyof typeof countryRiskData]
    
    layer.on({
      mouseover: (e: any) => {
        const targetLayer = e.target
        const hoverColor = countryData ? getRiskColor(countryData.risk) : '#60a5fa'
        targetLayer.setStyle({
          weight: 2,
          color: '#ffffff',
          fillOpacity: 0.8,
          fillColor: hoverColor,
          filter: 'brightness(1.2)'
        })
        targetLayer.bringToFront()
      },
      mouseout: (e: any) => {
        const originalColor = countryData ? getRiskColor(countryData.risk) : '#e5e7eb'
        e.target.setStyle({
          fillColor: originalColor,
          weight: 1,
          opacity: 1,
          color: '#ffffff',
          fillOpacity: 0.7
        })
      },
      click: (e: any) => {
        setSelectedCountry(countryData ? countryCode : countryName)
        
        const popup = L.popup()
          .setLatLng(e.latlng)
          .setContent(`
            <div style="padding: 12px; min-width: 200px;">
              <h3 style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: #1f2937;">${countryName}</h3>
              ${countryData ? `
                <p style="color: ${getRiskColor(countryData.risk)}; font-weight: 600; margin-bottom: 8px;">
                  Risk Level: ${countryData.level} (${countryData.risk}/100)
                </p>
              ` : ''}
              <p style="color: #6b7280; font-size: 14px; margin-bottom: 12px;">
                ${countryData ? 'Click to view detailed analysis below' : 'More info coming soon...'}
              </p>
              <div style="font-size: 12px; color: #9ca3af;">
                <p>Click anywhere on the map to close this popup</p>
              </div>
            </div>
          `)
          .openOn(e.target._map)
      }
    })
  }

  const geoJsonStyle = (feature: any) => {
    const countryCode = getCountryCode(feature)
    const countryData = countryRiskData[countryCode as keyof typeof countryRiskData]
    const fillColor = countryData ? getRiskColor(countryData.risk) : '#e5e7eb'
    
    return {
      fillColor: fillColor,
      weight: 1,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: 0.7
    }
  }

  if (error) {
    return (
      <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-2">Failed to load interactive map</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4"></div>
          </div>
          <p className="text-gray-500 font-light">Loading interactive world map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      <div className="w-full h-[600px] rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          minZoom={1}
          maxZoom={10}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            subdomains='abcd'
          />
          
          {geoJsonData && (
            <GeoJSON
              data={geoJsonData}
              style={geoJsonStyle}
              onEachFeature={onEachFeature}
            />
          )}
        </MapContainer>
      </div>
      <div className="mt-4 text-center">
        <Link href="/data" className="btn-primary inline-flex items-center justify-center">
          Data downloads
        </Link>
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Risk Level</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#8B0000' }}></div>
            <span>Very High (75+)</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#DC143C' }}></div>
            <span>High (60-74)</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#FF6347' }}></div>
            <span>Medium (45-59)</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#FFA500' }}></div>
            <span>Low (30-44)</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#90EE90' }}></div>
            <span>Very Low (&lt;30)</span>
          </div>
        </div>
      </div>

      {/* Data Panel */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm border border-gray-200 min-w-48">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          {selectedCountry ? 'Country Details' : 'Global Overview'}
        </h4>
        
        {selectedCountry && countryRiskData[selectedCountry as keyof typeof countryRiskData] ? (
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500">Country</div>
              <div className="font-medium">{countryRiskData[selectedCountry as keyof typeof countryRiskData].name}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Risk Score</div>
              <div className="font-medium">{countryRiskData[selectedCountry as keyof typeof countryRiskData].risk}/100</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Risk Level</div>
              <div className="font-medium" style={{ color: getRiskColor(countryRiskData[selectedCountry as keyof typeof countryRiskData].risk) }}>
                {countryRiskData[selectedCountry as keyof typeof countryRiskData].level}
              </div>
            </div>
            <div className="text-xs text-gray-500 pt-2">
              Click country to deselect
            </div>
          </div>
        ) : selectedCountry ? (
          <div className="space-y-2">
            <div>
              <div className="text-xs text-gray-500">Country</div>
              <div className="font-medium">{selectedCountry}</div>
            </div>
            <div className="text-xs text-gray-600 pt-2">
              More information coming soon...
            </div>
          </div>
        ) : (
          <div className="text-xs text-gray-600 space-y-1">
            <div>Active Monitoring: 195 countries</div>
            <div>High Risk Areas: {Object.values(countryRiskData).filter(d => d.risk >= 60).length}</div>
            <div>Last Updated: Live</div>
            <div className="pt-2 text-blue-600">Click any country for details</div>
          </div>
        )}
      </div>

      {/* Detailed Country Analysis Panel */}
      {selectedCountry && countryRiskData[selectedCountry as keyof typeof countryRiskData] && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              {countryRiskData[selectedCountry as keyof typeof countryRiskData].name} - Detailed Analysis
            </h3>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Time Series Chart */}
            <div>
              <TimeSeriesChart 
                data={{
                  historical: countryRiskData[selectedCountry as keyof typeof countryRiskData].trend,
                  forecast: countryRiskData[selectedCountry as keyof typeof countryRiskData].forecast,
                  country: countryRiskData[selectedCountry as keyof typeof countryRiskData].name
                }}
              />
            </div>

            {/* Risk Analysis */}
            <div className="space-y-6">
              {/* Current Risk Score */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Current Risk Score</h4>
                  <div className="text-2xl font-bold" style={{ color: getRiskColor(countryRiskData[selectedCountry as keyof typeof countryRiskData].risk) }}>
                    {countryRiskData[selectedCountry as keyof typeof countryRiskData].risk}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${countryRiskData[selectedCountry as keyof typeof countryRiskData].risk}%`,
                      backgroundColor: getRiskColor(countryRiskData[selectedCountry as keyof typeof countryRiskData].risk)
                    }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Risk Level: {countryRiskData[selectedCountry as keyof typeof countryRiskData].level}
                </div>
              </div>

              {/* Model Confidence */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Model Confidence</h4>
                <div className="flex items-center">
                  <div className="text-xl font-bold text-blue-600">
                    {(countryRiskData[selectedCountry as keyof typeof countryRiskData].confidence * 100).toFixed(0)}%
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${countryRiskData[selectedCountry as keyof typeof countryRiskData].confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Risk Drivers */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Key Risk Drivers</h4>
                <div className="space-y-2">
                  {countryRiskData[selectedCountry as keyof typeof countryRiskData].drivers.map((driver, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                      <span>{driver}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Forecast Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">5-Month Outlook</h4>
                <div className="text-sm text-gray-600">
                  {countryRiskData[selectedCountry as keyof typeof countryRiskData].forecast[4] < countryRiskData[selectedCountry as keyof typeof countryRiskData].risk ? (
                    <span className="text-green-600">
                      ↓ Risk expected to decrease to {countryRiskData[selectedCountry as keyof typeof countryRiskData].forecast[4]} 
                      ({Math.round(countryRiskData[selectedCountry as keyof typeof countryRiskData].risk - countryRiskData[selectedCountry as keyof typeof countryRiskData].forecast[4])} point decline)
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ↑ Risk expected to increase to {countryRiskData[selectedCountry as keyof typeof countryRiskData].forecast[4]}
                      ({Math.round(countryRiskData[selectedCountry as keyof typeof countryRiskData].forecast[4] - countryRiskData[selectedCountry as keyof typeof countryRiskData].risk)} point increase)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
