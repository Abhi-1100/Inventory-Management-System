import type { Metadata } from 'next'
import React from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'CoreInventory',
  description: 'CoreInventory - Modern Inventory Management System',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
