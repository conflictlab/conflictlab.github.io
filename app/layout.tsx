import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PaCE - Forecasting the Future of Conflict and Risk',
  description: 'Intelligence technology company focused on forecasting geopolitical conflict, civil unrest, and political instability using machine learning and dynamic exposure modeling.',
  keywords: 'geopolitical risk, conflict forecasting, political instability, machine learning, ESG, portfolio risk',
  authors: [{ name: 'PaCE' }],
  robots: 'index, follow',
  icons: {
    icon: '/logos/logo.png',
    apple: '/logos/logo.png',
  },
  openGraph: {
    title: 'PaCE - Forecasting the Future of Conflict and Risk',
    description: 'Intelligence technology company focused on forecasting geopolitical conflict, civil unrest, and political instability.',
    type: 'website',
    locale: 'en_US',
    images: ['/logos/logo.png'],
  },
}

// Move viewport to the dedicated export to avoid Next.js warnings
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return (
    <html lang="en">
      <head>
        {/* Preload world geometry and warm up tile servers for faster map paint */}
        <link rel="preload" href={`${base}/data/world.topo.json`} as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href={`${base}/data/world.geojson`} as="fetch" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://a.basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://b.basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://c.basemaps.cartocdn.com" />
        <link rel="dns-prefetch" href="https://d.basemaps.cartocdn.com" />
        <link rel="preconnect" href="https://a.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://b.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://c.basemaps.cartocdn.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://d.basemaps.cartocdn.com" crossOrigin="anonymous" />
      </head>
      <body className={inter.className}>
        {base && (
          <style
            // Override image URLs to respect basePath on GitHub Pages
            dangerouslySetInnerHTML={{ __html: `
              .hero-background-network-image { background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%), url('${base}/backgrounds/hero-bg-network.svg') center/cover no-repeat; }
              .hero-background-network-image::before { background-image: url('${base}/backgrounds/network-minimalist.jpg'); }
              .hero-background-network-image::after { background-image: url('${base}/backgrounds/network-minimalist.jpg'); }
              .logo-watermark::after { background: url('${base}/logos/logo.png') center/contain no-repeat; }
            ` }}
          />
        )}
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
