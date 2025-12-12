import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'RentHaus - Event Equipment Rentals in Nigeria',
    template: '%s | RentHaus',
  },
  description: 'Rent event equipment from trusted equipment owners in Nigeria. Find furniture, AV equipment, decorations, and more for your next event. Secure booking with escrow protection.',
  keywords: ['event equipment rental', 'Nigeria', 'furniture rental', 'AV equipment', 'event decorations', 'equipment rental marketplace'],
  authors: [{ name: 'RentHaus' }],
  creator: 'RentHaus',
  publisher: 'RentHaus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    siteName: 'RentHaus',
    title: 'RentHaus - Event Equipment Rentals in Nigeria',
    description: 'Rent event equipment from trusted equipment owners in Nigeria. Find furniture, AV equipment, decorations, and more for your next event.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RentHaus - Event Equipment Rentals',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RentHaus - Event Equipment Rentals in Nigeria',
    description: 'Rent event equipment from trusted equipment owners in Nigeria.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
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
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(220, 38, 38, 0.3)',
            },
          }}
        />
      </body>
    </html>
  )
}

