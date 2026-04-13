import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Optimal Source',
  description: 'Independent lab testing. Full chain of custody. Real data.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-black text-white">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
