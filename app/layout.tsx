import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { GlobalErrorHandler } from '@/components/GlobalErrorHandler'

const bricolageGrotesque = Bricolage_Grotesque({ 
  subsets: ['latin'],
  variable: '--font-bricolage-grotesque',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AtmoWise - Air Quality Tracker',
  description: 'Track air quality and your health with AI-powered insights',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={bricolageGrotesque.className}>
        <GlobalErrorHandler />
              <Providers>
                {children}
              </Providers>
      </body>
    </html>
  )
}
