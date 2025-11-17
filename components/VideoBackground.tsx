'use client'

import React, { useEffect, useRef, useState } from 'react'

interface VideoBackgroundProps {
  src: string
  className?: string
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({ src, className = '' }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setIsLoaded(true)
      // Ensure video plays
      video.play().catch(err => {
        console.log('Video autoplay failed:', err)
        // If autoplay fails, we'll show the fallback
        setHasError(true)
      })
    }

    const handleError = () => {
      console.error('Video failed to load')
      setHasError(true)
    }

    const handleLoadStart = () => {
      console.log('Video loading started')
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('error', handleError)
    video.addEventListener('loadstart', handleLoadStart)

    // Force load the video
    video.load()

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('error', handleError)
      video.removeEventListener('loadstart', handleLoadStart)
    }
  }, [])

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className={`w-full h-full object-cover transition-opacity duration-1000 ${
          isLoaded && !hasError ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ filter: 'brightness(0.6)' }}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Fallback background - always visible, fades out when video loads */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 transition-opacity duration-1000 ${
          isLoaded && !hasError ? 'opacity-20' : 'opacity-100'
        }`}
      >
        {/* Animated fallback pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/50 text-sm">Loading...</div>
        </div>
      )}
    </div>
  )
}

export default VideoBackground