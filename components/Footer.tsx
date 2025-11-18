"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/test-map')) return null
  return (
    <footer className="bg-white text-gray-600 border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="col-span-1 md:col-span-2">
            <p className="max-w-md text-xs">
              <span className="text-base font-light text-clairient-blue">Luscint.</span> Transforming uncertainty into strategic foresight
            </p>
          </div>
          <div className="justify-self-start md:justify-self-end">
            <h4 className="font-medium mb-0.5 text-gray-700 text-xs">Contact</h4>
            <ul className="space-y-0 text-gray-600 text-xs">
              <li>
                <a href="mailto:contact@luscint.com" className="hover:text-clairient-blue transition-colors">
                  contact@luscint.com
                </a>
              </li>
              <li><Link href="/contact" className="hover:text-clairient-blue transition-colors">Get in Touch</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-1 pt-1 text-center text-gray-400 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Luscint. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
