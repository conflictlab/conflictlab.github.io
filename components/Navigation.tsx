'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

type MenuSection = {
  label: string
  href: string
}

type MenuItem = {
  label: string
  href: string
  sections?: MenuSection[]
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  if (pathname?.startsWith('/test-map')) return null

  const handleMouseEnter = (href: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setOpenDropdown(href)
  }

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null)
    }, 150)
  }

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true
    if (path !== '/' && pathname?.startsWith(path)) return true
    return false
  }

  const isHomePage = pathname === '/'

  const menuItems: MenuItem[] = [
    {
      label: 'Forecasts',
      href: '/forecasts',
      sections: [
        { label: 'Dashboard', href: '/forecasts' },
        { label: 'Downloads', href: '/downloads' },
      ],
    },
    {
      label: 'Research',
      href: '/research',
      sections: [
        { label: 'Methodology', href: '/methodology' },
        { label: 'Publications', href: '/publications' },
        { label: 'Downloads', href: '/downloads' },
        { label: 'Dissemination', href: '/dissemination' },
      ],
    },
    {
      label: 'About',
      href: '/about',
      sections: [
        { label: 'Team', href: '/about#team' },
        { label: 'Contact', href: '/about#contact' },
      ],
    },
  ]

  return (
    <nav className="bg-pace-charcoal shadow-sm border-b border-pace-charcoal-light relative z-[2000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between ${isHomePage ? 'h-20' : 'h-16'}`}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src={`${base}/logo.png`}
                alt="PaCE"
                className={`mr-3 ${isHomePage ? 'h-14 w-14' : 'h-8 w-8'}`}
              />
              <span className={`font-light text-white ${isHomePage ? 'text-3xl' : 'text-2xl'}`}>PaCE</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <div
                key={item.href}
                className="relative"
                onMouseEnter={() => item.sections && handleMouseEnter(item.href)}
                onMouseLeave={handleMouseLeave}
              >
                {item.sections ? (
                  <>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-1 transition-colors font-light ${
                        isActive(item.href)
                          ? 'text-pace-red border-b-2 border-pace-red pb-1'
                          : 'text-gray-300 hover:text-pace-red-light'
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={16} className="mt-0.5" />
                    </Link>
                    {openDropdown === item.href && (
                      <div className="absolute top-full left-0 mt-1 pt-2 w-48">
                        <div className="bg-pace-charcoal-light border border-gray-600 rounded-lg shadow-lg py-2 z-[2001]">
                          {item.sections.map((section) => (
                            <Link
                              key={section.href}
                              href={section.href}
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-pace-red-light transition-colors"
                            >
                              {section.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`transition-colors font-light ${
                      isActive(item.href)
                        ? 'text-pace-red border-b-2 border-pace-red pb-1'
                        : 'text-gray-300 hover:text-pace-red-light'
                    }`}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-pace-red-light"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-pace-charcoal border-t border-pace-charcoal-light">
            {menuItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`block px-3 py-2 font-light ${
                    isActive(item.href)
                      ? 'text-pace-red bg-gray-800'
                      : 'text-gray-300 hover:text-pace-red-light'
                  }`}
                >
                  {item.label}
                </Link>
                {item.sections && (
                  <div className="pl-6 space-y-1 mt-1">
                    {item.sections.map((section) => (
                      <Link
                        key={section.href}
                        href={section.href}
                        className="block px-3 py-1.5 text-sm text-gray-400 hover:text-pace-red-light"
                      >
                        {section.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}
