"use client"

import { motion } from "framer-motion"
import { AlertTriangle, ArrowUpRight } from "lucide-react"
import type { TopRecord } from "@/lib/types"
import { formatNumber } from "@/lib/format"

interface TopEventsProps {
  topDelays: TopRecord[]
  topEarly: TopRecord[]
}

export function TopEvents({ topDelays, topEarly }: TopEventsProps) {
  if (topDelays.length === 0 && topEarly.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Vuelos destacados
        </h2>
        <p className="mt-1 text-sm font-mono text-muted-foreground">
          Los mayores atrasos y salidas adelantadas del período
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Mayores demoras
          </div>
          <div className="space-y-3">
            {topDelays.map((item) => (
              <div
                key={`delay-${item.rank}-${item.flight_number}`}
                className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 text-sm last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {item.flight_number ?? "Vuelo"} · {item.origin_airport_code} → {item.destination_airport_code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.destination_city}, {item.destination_country}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-amber-400">
                    +{formatNumber(item.delay_minutes ?? 0, 0)} min
                  </p>
                  <p className="text-xs text-muted-foreground">#{item.rank}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ArrowUpRight className="h-4 w-4 text-emerald-400" />
            Salidas adelantadas
          </div>
          <div className="space-y-3">
            {topEarly.map((item) => (
              <div
                key={`early-${item.rank}-${item.flight_number}`}
                className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 text-sm last:border-b-0 last:pb-0"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {item.flight_number ?? "Vuelo"} · {item.origin_airport_code} → {item.destination_airport_code}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.destination_city}, {item.destination_country}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-emerald-400">
                    {formatNumber(item.delay_minutes ?? 0, 0)} min
                  </p>
                  <p className="text-xs text-muted-foreground">#{item.rank}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
