import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { Inter } from 'next/font/google'
import Navbar from './Navbar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PetFinder MVP',
  description: 'Missing Pet Vector-Matching Network',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      {/* Explicitly attach dark mode root class if strictly needed, though globals.css forces #050505 styling natively */}
      <html lang="en" className="dark">
        <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
          <Navbar />
          <main className="w-full flex-1">
            {children}
          </main>
          <Toaster theme="dark" richColors position="bottom-right" />
        </body>
      </html>
    </ClerkProvider>
  )
}
