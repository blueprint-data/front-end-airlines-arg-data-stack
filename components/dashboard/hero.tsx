"use client"

import { motion } from "framer-motion"
import { formatDateShort } from "@/lib/format"

interface HeroProps {
  generatedAt?: string
  lookbackDays?: number
}

export function Hero({ generatedAt, lookbackDays }: HeroProps) {
  const dateLabel = generatedAt ? formatDateShort(generatedAt) : "";
  const windowLabel = lookbackDays ? `${lookbackDays} días` : "60 días"

  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-24">
      {/* Futuristic grid background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-mono font-medium text-primary backdrop-blur-sm"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
          {dateLabel ? `ACTUALIZADO ${dateLabel}` : "DATOS EN VIVO"}
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl lg:text-6xl text-balance"
        >
          ¿Qué aerolínea rinde mejor para tu destino?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl text-pretty"
        >
          Compará el desempeño real de aerolíneas en rutas desde Argentina.
          Datos transparentes basados en una ventana móvil de {windowLabel}.
        </motion.p>
      </div>
    </section>
  )
}
