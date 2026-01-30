import React from "react"
import type { Metadata } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { MotionProvider } from "@/components/motion-provider"

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
const brand = 'InfoAeropuertos'
const title = 'InfoAeropuertos Argentina | Análisis de Puntualidad y Demoras de Vuelos'
const description =
  'InfoAeropuertos Argentina: analizá puntualidad, demoras y cancelaciones de vuelos con datos reales actualizados cada 6 horas. Compará aerolíneas y rutas para elegir mejor.'
const ogImage = `${siteUrl}/og-imagen.jpg`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: `%s · ${brand}`,
  },
  description,
  keywords: [
    "puntualidad vuelos argentina",
    "demoras vuelos argentina",
    "cancelaciones vuelos argentina",
    "ranking aerolineas argentina",
    "aerolineas mas puntuales",
    "vuelos demorados hoy",
    "estado de vuelos argentina",
    "estadisticas de vuelos",
    "comparar aerolineas",
    "aeropuertos argentina",
  ],
  alternates: {
    canonical: siteUrl,
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
        <MotionProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 z-[100] rounded-md bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-lg ring-1 ring-border"
          >
            Saltar al contenido
          </a>
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
