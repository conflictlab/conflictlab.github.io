'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (pathname?.startsWith('/test-map')) return null
  
  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }

  const isHomePage = pathname === '/'

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between ${isHomePage ? 'h-20' : 'h-16'}`}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src={`${base}/logo.png`}
                alt="PaCE"
                className={`mr-3 ${isHomePage ? 'h-14 w-14' : 'h-8 w-8'}`}
              />
              <span className={`font-light text-clairient-blue ${isHomePage ? 'text-3xl' : 'text-2xl'}`}>PaCE</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            <Link
              href="/forecasts"
              className={`transition-colors font-light ${
                isActive('/forecasts')
                  ? 'text-clairient-blue border-b-2 border-clairient-blue pb-1'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/methodology"
              className={`transition-colors font-light ${
                isActive('/methodology')
                  ? 'text-clairient-blue border-b-2 border-clairient-blue pb-1'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Methodology
            </Link>
            <Link
              href="/data"
              className={`transition-colors font-light ${
                isActive('/data')
                  ? 'text-clairient-blue border-b-2 border-clairient-blue pb-1'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Data
            </Link>
            <Link
              href="/publications"
              className={`transition-colors font-light ${
                isActive('/publications')
                  ? 'text-clairient-blue border-b-2 border-clairient-blue pb-1'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Publications
            </Link>
            <Link
              href="/events"
              className={`transition-colors font-light ${
                isActive('/events')
                  ? 'text-clairient-blue border-b-2 border-clairient-blue pb-1'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Events
            </Link>
            <Link
              href="/team"
              className={`transition-colors font-light ${
                isActive('/team')
                  ? 'text-clairient-blue border-b-2 border-clairient-blue pb-1'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Team
            </Link>
            <Link
              href="/contact"
              className={`transition-colors font-light ${
                isActive('/contact')
                  ? 'text-clairient-blue border-b-2 border-clairient-blue pb-1'
                  : 'text-clairient-blue hover:text-clairient-dark'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-clairient-blue"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            <Link
              href="/forecasts"
              className={`block px-3 py-2 font-light ${
                isActive('/forecasts')
                  ? 'text-clairient-blue bg-blue-50'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/methodology"
              className={`block px-3 py-2 font-light ${
                isActive('/methodology')
                  ? 'text-clairient-blue bg-blue-50'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Methodology
            </Link>
            <Link
              href="/data"
              className={`block px-3 py-2 font-light ${
                isActive('/data')
                  ? 'text-clairient-blue bg-blue-50'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Data
            </Link>
            <Link
              href="/publications"
              className={`block px-3 py-2 font-light ${
                isActive('/publications')
                  ? 'text-clairient-blue bg-blue-50'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Publications
            </Link>
            <Link
              href="/events"
              className={`block px-3 py-2 font-light ${
                isActive('/events')
                  ? 'text-clairient-blue bg-blue-50'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Events
            </Link>
            <Link
              href="/team"
              className={`block px-3 py-2 font-light ${
                isActive('/team')
                  ? 'text-clairient-blue bg-blue-50'
                  : 'text-gray-600 hover:text-clairient-blue'
              }`}
            >
              Team
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 font-light ${
                isActive('/contact')
                  ? 'text-clairient-blue bg-blue-50'
                  : 'text-clairient-blue hover:text-clairient-dark'
              }`}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
