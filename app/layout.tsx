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
})

const siteUrl = 'https://blueprint-data.github.io/front-end-airlines-arg-data-stack'
const title = 'Blueprintdata Aeropuertos'
const description = 'Monitor de puntualidad y demoras de aerolíneas en Argentina. Datos en tiempo real sobre cancelaciones y retrasos promedio por ruta y gate.'
const basePath = process.env.NODE_ENV === 'production' ? '/front-end-airlines-arg-data-stack' : ''
const ogImage = '/og-image.png'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: ["aerolíneas argentina", "puntualidad vuelos", "demoras aeropuertos", "retrasos aerolíneas", "blueprintdata", "aeropuertos argentina", "estado de vuelos"],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: title,
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
