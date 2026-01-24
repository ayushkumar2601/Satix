import React from "react"
import type { Metadata } from 'next'
import { Space_Grotesk, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700']
});
const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Satix - Alternative Credit Scoring for Everyone',
  description: 'No credit score? No problem. Get micro-loans based on your financial behavior, not traditional credit history.',
  generator: 'Ayush',
  icons: {
    icon: [
      {
        url: '/',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/',
        type: 'image/svg+xml',
      },
    ],
    apple: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
