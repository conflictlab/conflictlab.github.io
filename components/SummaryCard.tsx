'use client'

import React from 'react'

interface SummaryCardProps {
  title: string
  value: string | number
  subtitle?: string
  delta?: number
  deltaLabel?: string
  deltaColors?: {
    positive: string
    negative: string
  }
}

export default function SummaryCard({
  title,
  value,
  subtitle,
  delta,
  deltaLabel = 'Δ vs previous month',
  deltaColors = { positive: 'text-emerald-500', negative: 'text-rose-500' }
}: SummaryCardProps) {
  const deltaEl = (delta !== undefined && delta !== null) ? (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <div className="text-sm text-gray-600">{deltaLabel}</div>
      <div className={`text-3xl font-medium ${delta >= 0 ? deltaColors.positive : deltaColors.negative}`}>
        {delta >= 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`}
      </div>
    </div>
  ) : null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm text-gray-700">{title}</div>
      <div className="text-3xl font-medium text-gray-900">{value}</div>
      {subtitle && <div className="text-xs text-gray-600 mt-1">{subtitle}</div>}
      {deltaEl}
    </div>
  )
}
