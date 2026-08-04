import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'USCF Leaderboard',
  description: 'Track your chess friends ratings and tournament activity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
