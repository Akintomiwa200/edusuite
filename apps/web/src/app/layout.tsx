import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from '../components/providers'
import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'EduSuite — School Management Platform',
    template: '%s | EduSuite',
  },
  description:
    'Complete multi-branch school management ecosystem with AI-powered features, live classes, and real-time analytics.',
  keywords: ['school management', 'education', 'EduSuite', 'learning management system'],
  authors: [{ name: 'EduSuite Team' }],
  creator: 'EduSuite',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    title: 'EduSuite — School Management Platform',
    description: 'Complete multi-branch school management ecosystem',
    siteName: 'EduSuite',
  },
  robots: { index: false, follow: false }, // Private app
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              classNames: {
                toast: 'font-sans',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
