import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrintForge — Image to STL',
  description: 'Convert any image to a 3D-printable STL file in seconds. Stamp or emboss mode.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
