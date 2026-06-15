import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Rayver Music', template: '%s | Rayver Music' },
  description: 'DJ & Productor. Música electrónica, techno y más. Únete a la comunidad.',
  openGraph: {
    title: 'Rayver Music',
    description: 'DJ & Productor. Música electrónica, techno y más.',
    url: 'https://rayvermusic.com',
    siteName: 'Rayver Music',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Rayver Music' },
  metadataBase: new URL('https://rayvermusic.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  )
}
