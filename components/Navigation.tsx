'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

type MenuSubSection = {
  label: string
  href: string
}

type MenuSection = {
  label: string
  href: string
  subsections?: MenuSubSection[]
}

type MenuItem = {
  label: string
  href: string
  sections?: MenuSection[]
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const submenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
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
      setOpenSubmenu(null)
    }, 150)
  }

  const handleSubmenuEnter = (href: string) => {
    if (submenuTimeoutRef.current) {
      clearTimeout(submenuTimeoutRef.current)
      submenuTimeoutRef.current = null
    }
    setOpenSubmenu(href)
  }

  const handleSubmenuLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => {
      setOpenSubmenu(null)
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
        {
          label: 'Publications',
          href: '/publications',
          subsections: [
            { label: 'Academic Publications', href: '/publications#publications' },
            { label: 'Reports & Newsletters', href: '/publications#reports-newsletters' },
          ],
        },
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
    <nav className="bg-railings border-b border-railings-light relative z-[2000] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between ${isHomePage ? 'h-20' : 'h-16'}`}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {(() => {
                const containerSize = isHomePage ? 'h-14 w-14' : 'h-8 w-8'
                const imgSize = isHomePage ? 44 : 24
                return (
                  <div
                    className={`mr-3 ${containerSize} rounded-full relative overflow-hidden flex items-center justify-center ring-1 ring-black/10 shadow-lg`} 
                    style={{
                      background: 'linear-gradient(145deg, rgba(255,255,255,0.98), rgba(245,245,245,0.98))',
                      boxShadow: '0 8px 18px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)'
                    }}
                  >
                    {/* subtle inner highlights for depth */}
                    <div
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06), inset 0 -2px 4px rgba(0,0,0,0.04)' }}
                    />
                    <div
                      className="absolute inset-x-1 top-1 h-1/3 rounded-full opacity-60 pointer-events-none"
                      style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))' }}
                    />
                    <Image
                      src={`/logo.png`}
                      alt="PaCE"
                      width={imgSize}
                      height={imgSize}
                      priority={isHomePage}
                      className="relative drop-shadow-sm"
                    />
                  </div>
                )
              })()}
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
                      className={`flex items-center gap-1 transition-colors font-light focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-red ${
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
                        <div className="bg-railings border border-railings-light rounded-lg shadow-lg py-2 z-[2001]">
                          {item.sections.map((section) => (
                            <div
                              key={section.href}
                              className="relative"
                              onMouseEnter={() => section.subsections && handleSubmenuEnter(section.href)}
                              onMouseLeave={() => section.subsections && handleSubmenuLeave()}
                            >
                              <Link
                                href={section.href}
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-pace-red-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-red"
                              >
                                {section.label}
                                {section.subsections && <span className="float-right">›</span>}
                              </Link>
                              {section.subsections && openSubmenu === section.href && (
                                <div className="absolute left-full top-0 ml-1 w-56">
                                  <div className="bg-railings border border-railings-light rounded-lg shadow-lg py-2 z-[2002]">
                                    {section.subsections.map((subsection) => (
                                      <Link
                                        key={subsection.href}
                                        href={subsection.href}
                                        className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-pace-red-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-red"
                                      >
                                        {subsection.label}
                                      </Link>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`transition-colors font-light focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-red ${
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-railings border-t border-railings-light">
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
                      <div key={section.href}>
                        <Link
                          href={section.href}
                          className="block px-3 py-1.5 text-sm text-gray-400 hover:text-pace-red-light"
                        >
                          {section.label}
                        </Link>
                        {section.subsections && (
                          <div className="pl-6 space-y-1 mt-1">
                            {section.subsections.map((subsection) => (
                              <Link
                                key={subsection.href}
                                href={subsection.href}
                                className="block px-3 py-1.5 text-xs text-gray-500 hover:text-pace-red-light"
                              >
                                {subsection.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
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
