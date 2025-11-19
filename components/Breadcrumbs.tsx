'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Breadcrumbs() {
  const pathname = usePathname() || '/'
  const parts = pathname.split('/').filter(Boolean)
  const crumbs = [{ href: '/', label: 'Home' }]
  let acc = ''
  for (const p of parts) {
    acc += '/' + p
    crumbs.push({ href: acc, label: decodeURIComponent(p) })
  }
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mt-2">
      {crumbs.map((c, i) => (
        <span key={c.href}>
          {i > 0 && <span className="mx-1">/</span>}
          {i < crumbs.length - 1 ? (
            <Link href={c.href} className="text-pace-red hover:text-pace-red-dark">{c.label}</Link>
          ) : (
            <span className="text-gray-700">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

