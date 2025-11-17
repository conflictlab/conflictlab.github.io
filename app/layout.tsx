import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Luscint - Forecasting the Future of Conflict and Risk',
  description: 'Intelligence technology company focused on forecasting geopolitical conflict, civil unrest, and political instability using machine learning and dynamic exposure modeling.',
  keywords: 'geopolitical risk, conflict forecasting, political instability, machine learning, ESG, portfolio risk',
  authors: [{ name: 'Luscint' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Luscint - Forecasting the Future of Conflict and Risk',
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
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}