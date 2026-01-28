import React from "react"
import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

const siteOrigin = 'https://infoaeropuertos.ar'
const basePath = ''
const siteUrl = siteOrigin
const title = 'Aeropuertos Blueprintdata'
const description = 'Compará aerolíneas y rutas con datos reales de puntualidad, demoras y cancelaciones en Argentina. Elegí mejor con insights claros.'
const ogImage = `${siteUrl}/og-image.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "puntualidad vuelos argentina",
    "demoras vuelos",
    "cancelaciones vuelos",
    "aerolineas argentinas",
    "rendimiento aerolineas",
    "aeropuertos argentina",
    "estado de vuelos",
    "datos de vuelos",
    "blueprintdata",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: 'Blueprintdata Aeropuertos',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@blueprintdata_',
    creator: '@blueprintdata_',
    title,
    description,
    images: [ogImage],
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
    apple: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
