"use client"

import { formatDateShort } from "@/lib/format"

interface FooterProps {
  generatedAt?: string
  lookbackDays?: number
}

export function Footer({ generatedAt, lookbackDays }: FooterProps) {
  const dateLabel = generatedAt ? formatDateShort(generatedAt) : ""
  const windowLabel = lookbackDays ? `${lookbackDays} días` : "60 días"

  return (
    <footer className="border-t border-border/50 py-8">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <p className="text-sm font-mono text-muted-foreground">
          Los datos mostrados corresponden a una ventana móvil de {windowLabel} y son
          de carácter informativo.
        </p>
        <p className="mt-2 text-xs font-mono text-muted-foreground/70">
          FUENTE: Datos públicos de rutas aéreas // Blueprintdata
          {dateLabel ? ` // ÚLTIMA ACTUALIZACIÓN: ${dateLabel}` : ""}
        </p>
      </div>
    </footer>
  )
}
