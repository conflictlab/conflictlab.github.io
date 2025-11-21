// Centralized configuration for risk thresholds and colors

export const RISK_THRESHOLDS = {
  // High risk threshold for country classification
  HIGH_RISK: 100,

  // Risk level thresholds for color mapping
  LEVELS: [10, 50, 100, 500] as const,

  // Hotspot minimum threshold (only show on map if above this value)
  HOTSPOT_MIN: 100,

  // Grid-level thresholds (for PRIO-GRID maps)
  GRID_LEVELS: [5, 10, 50, 100] as const,
} as const

// Risk color palette - consistent across the application
export const RISK_COLORS = {
  zero: '#f5f5f5',       // Very light gray for zero values
  veryLow: '#fee8c8',    // Light orange
  low: '#fdbb84',        // Medium orange
  medium: '#ef6548',     // Orange-red
  high: '#d7301f',       // Dark red
  veryHigh: '#b30000',   // Deep red
} as const

/**
 * Get risk color based on fatality value using country-level thresholds
 */
export function getRiskColor(value: number): string {
  const [t1, t2, t3, t4] = RISK_THRESHOLDS.LEVELS

  if (value === 0) return RISK_COLORS.zero
  if (value <= t1) return RISK_COLORS.veryLow
  if (value <= t2) return RISK_COLORS.low
  if (value <= t3) return RISK_COLORS.medium
  if (value <= t4) return RISK_COLORS.high
  return RISK_COLORS.veryHigh
}

/**
 * Get risk color for grid-level values (uses different thresholds)
 */
export function getGridRiskColor(value: number): string {
  const [t1, t2, t3, t4] = RISK_THRESHOLDS.GRID_LEVELS

  if (value === 0) return RISK_COLORS.zero
  if (value <= t1) return RISK_COLORS.veryLow
  if (value <= t2) return RISK_COLORS.low
  if (value <= t3) return RISK_COLORS.medium
  if (value <= t4) return RISK_COLORS.high
  return RISK_COLORS.veryHigh
}

/**
 * Get human-readable risk level label
 */
export function getRiskLevel(value: number): string {
  const [t1, t2, t3, t4] = RISK_THRESHOLDS.LEVELS

  if (value === 0) return 'None'
  if (value <= t1) return 'Very Low'
  if (value <= t2) return 'Low'
  if (value <= t3) return 'Medium'
  if (value <= t4) return 'High'
  return 'Very High'
}
