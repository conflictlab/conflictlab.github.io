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
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'PaCE - Forecasting the Future of Conflict and Risk',
    description: 'Intelligence technology company focused on forecasting geopolitical conflict, civil unrest, and political instability.',
    type: 'website',
    locale: 'en_US',
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
      <body className={inter.className}>
        {base && (
          <style
            // Override image URLs to respect basePath on GitHub Pages
            dangerouslySetInnerHTML={{ __html: `
              .hero-background-network-image { background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%), url('${base}/hero-bg-network.svg') center/cover no-repeat; }
              .hero-background-network-image::before { background-image: url('${base}/network-minimalist.jpg'); }
              .hero-background-network-image::after { background-image: url('${base}/network-minimalist.jpg'); }
              .logo-watermark::after { background: url('${base}/logo.png') center/contain no-repeat; }
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
