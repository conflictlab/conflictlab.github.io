import type { Metadata } from 'next'
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
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'PaCE - Forecasting the Future of Conflict and Risk',
    description: 'Intelligence technology company focused on forecasting geopolitical conflict, civil unrest, and political instability.',
    type: 'website',
    locale: 'en_US',
  },
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
              .hero-background { background: linear-gradient(135deg, rgba(30, 64, 175, 0.03) 0%, rgba(255, 255, 255, 0.95) 50%, rgba(30, 64, 175, 0.03) 100%), url('${base}/hero-bg.svg') center/cover no-repeat; }
              .hero-background-satellite { background: linear-gradient(135deg, rgba(30, 64, 175, 0.02) 0%, rgba(255, 255, 255, 0.97) 50%, rgba(30, 64, 175, 0.02) 100%), url('${base}/hero-bg-satellite.svg') center/cover no-repeat; }
              .hero-background-minimal { background: linear-gradient(135deg, rgba(30, 64, 175, 0.01) 0%, rgba(255, 255, 255, 0.99) 50%, rgba(30, 64, 175, 0.01) 100%), url('${base}/hero-bg-minimal.svg') center/cover no-repeat; }
              .hero-background-topographic { background: linear-gradient(135deg, rgba(30, 64, 175, 0.02) 0%, rgba(255, 255, 255, 0.97) 50%, rgba(30, 64, 175, 0.02) 100%), url('${base}/hero-bg-topographic.svg') center/cover no-repeat; }
              .hero-background-data-viz { background: linear-gradient(135deg, rgba(30, 64, 175, 0.015) 0%, rgba(255, 255, 255, 0.98) 50%, rgba(30, 64, 175, 0.015) 100%), url('${base}/hero-bg-data-viz.svg') center/cover no-repeat; }
              .hero-background-globe { background: linear-gradient(135deg, rgba(30, 64, 175, 0.02) 0%, rgba(255, 255, 255, 0.97) 50%, rgba(30, 64, 175, 0.02) 100%), url('${base}/hero-bg-globe.svg') center/cover no-repeat; }
              .hero-background-map-light::before { background: url('${base}/accurate-world-map.svg') center/85% no-repeat; }
              .hero-background-network::before { background: url('${base}/hero-bg-network.svg') center/cover no-repeat; }
              .hero-background-network-image { background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%), url('${base}/hero-bg-network.svg') center/cover no-repeat; }
              .hero-background-network-image::before { background-image: url('${base}/network-minimalist.jpg'); }
              .hero-background-network-image::after { background-image: url('${base}/network-minimalist.jpg'); }
              .logo-watermark::after { background: url('${base}/logo.png') center/contain no-repeat; }
              .hero-background-floating { background: linear-gradient(135deg, rgba(30, 64, 175, 0.04) 0%, rgba(255, 255, 255, 0.96) 50%, rgba(30, 64, 175, 0.04) 100%), url('${base}/hero-bg-minimal.svg') center/cover no-repeat; }
              .hero-background-floating::after { background: url('${base}/logo.png') center/contain no-repeat; }
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
