"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/test-map')) return null
  return (
    <footer className="bg-railings text-gray-200 border-t border-railings-light shadow-[0_-4px_6px_-1px_rgb(0_0_0_/_0.1)]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="col-span-1 md:col-span-2">
            <p className="max-w-md text-xs flex items-center gap-2">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white/95 ring-1 ring-black/10 shadow">
                  <Image src="/logo.png" alt="PaCE" width={16} height={16} className="drop-shadow-sm" />
                </span>
                <span className="text-base font-light text-white">PaCE</span>
              </span>
            </p>
          </div>
          <div className="justify-self-start md:justify-self-end">
            <h4 className="font-medium mb-0.5 text-gray-200 text-xs">Contact</h4>
            <ul className="space-y-0 text-gray-300 text-xs">
              <li>
                <a href="mailto:info@forecastlab.org" className="hover:text-pace-red-light transition-colors">
                  info@forecastlab.org
                </a>
              </li>
              <li><Link href="/contact" className="hover:text-pace-red-light transition-colors">Get in Touch</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-1 pt-1 text-center text-gray-500 text-[11px]">
          <p>&copy; {new Date().getFullYear()} PaCE. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
