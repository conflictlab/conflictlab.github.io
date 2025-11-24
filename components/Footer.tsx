"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
// import Image from 'next/image'

export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/test-map')) return null
  return (
    <footer className="bg-railings text-gray-200 border-t border-railings-light shadow-[0_-4px_6px_-1px_rgb(0_0_0_/_0.1)]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* Left: Logo */}
          <div className="justify-self-start">
            <p className="max-w-md text-xs flex items-center gap-2">
              <span className="inline-flex items-center gap-2">
                <img src="/logos/paceWhite.svg" alt="PaCE" width={20} height={20} className="drop-shadow-sm" />
                <span className="text-base font-light text-white">PaCE</span>
              </span>
            </p>
          </div>

          {/* Middle: Copyright */}
          <div className="text-[11px] text-gray-400 justify-self-start md:justify-self-center">
            <p>&copy; {new Date().getFullYear()} PaCE. All rights reserved.</p>
          </div>

          {/* Right: Contact */}
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
      </div>
    </footer>
  )
}
