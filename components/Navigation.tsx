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
        { label: 'Reports & Newsletters', href: '/reports' },
        { label: 'Downloads', href: '/downloads' },
      ],
    },
    {
      label: 'Research',
      href: '/research',
      sections: [
        { label: 'Methodology', href: '/methodology' },
        { label: 'Publications', href: '/publications' },
        {
          label: 'Dissemination',
          href: '/dissemination',
          subsections: [
            { label: 'Workshops', href: '/dissemination#workshops' },
            { label: 'Presentations', href: '/dissemination#presentations' },
          ],
        },
      ],
    },
    {
      label: 'About',
      href: '/about',
      sections: [
        { label: 'PaCE', href: '/about' },
        { label: 'Team', href: '/about/team' },
        { label: 'Acknowledgements', href: '/acknowledgements' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ]

  return (
    <nav className="bg-railings border-b border-railings-light relative z-[2000] shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between" style={{ height: '53px' }}>
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              {(() => {
                const imgSize = 48
                return (
                  <div
                    className="mr-3 relative flex items-center justify-center"
                    style={{ width: '60px', height: '60px', marginTop: '5px' }}
                  >
                    <img
                      src="/logos/paceWhite.svg"
                      alt="PaCE"
                      width={imgSize}
                      height={imgSize}
                      className="relative drop-shadow-sm"
                    />
                  </div>
                )
              })()}
              <span className="font-light text-3xl" style={{ color: '#f9fafb' }}>PaCE</span>
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
                          : 'hover:text-pace-red-light'
                      }`}
                      style={!isActive(item.href) ? { color: '#f9fafb' } : {}}
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
                                className="block px-4 py-2 text-sm hover:bg-gray-700 hover:text-pace-red-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-red"
                                style={{ color: '#f9fafb' }}
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
                                        className="block px-4 py-2 text-sm hover:bg-gray-700 hover:text-pace-red-light transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pace-red"
                                        style={{ color: '#f9fafb' }}
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
                        : 'hover:text-pace-red-light'
                    }`}
                    style={!isActive(item.href) ? { color: '#f9fafb' } : {}}
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
                      : 'hover:text-pace-red-light'
                  }`}
                  style={!isActive(item.href) ? { color: '#f9fafb' } : {}}
                >
                  {item.label}
                </Link>
                {item.sections && (
                  <div className="pl-6 space-y-1 mt-1">
                    {item.sections.map((section) => (
                      <div key={section.href}>
                        <Link
                          href={section.href}
                          className="block px-3 py-1.5 text-sm hover:text-pace-red-light"
                          style={{ color: '#f9fafb', opacity: 0.9 }}
                        >
                          {section.label}
                        </Link>
                        {section.subsections && (
                          <div className="pl-6 space-y-1 mt-1">
                            {section.subsections.map((subsection) => (
                              <Link
                                key={subsection.href}
                                href={subsection.href}
                                className="block px-3 py-1.5 text-xs hover:text-pace-red-light"
                                style={{ color: '#f9fafb', opacity: 0.8 }}
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
