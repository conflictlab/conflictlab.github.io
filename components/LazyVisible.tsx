'use client'

import { useEffect, useRef, useState } from 'react'

export default function LazyVisible({ children, rootMargin = '200px', minHeight = '180px' }: { children: React.ReactNode; rootMargin?: string; minHeight?: string }) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setVisible(true)
        obs.disconnect()
      }
    }, { root: null, rootMargin, threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [visible, rootMargin])

  return (
    <div ref={ref} style={{ minHeight }}>
      {visible ? children : null}
    </div>
  )
}

