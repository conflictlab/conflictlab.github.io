'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const DynamicMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full mx-auto mb-4"></div>
        </div>
        <p className="text-gray-500 font-light">Loading interactive world map...</p>
      </div>
    </div>
  )
})

export default function InteractiveMap() {
  return (
    <div className="relative w-full">
      <DynamicMap />
    </div>
  )
}

