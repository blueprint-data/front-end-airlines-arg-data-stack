"use client"

import { motion } from "framer-motion"
import { AlertTriangle } from "lucide-react"
import type { TopRecord } from "@/lib/types"
import { formatNumber } from "@/lib/format"

interface TopEventsProps {
  topDelays: TopRecord[]
}

export function TopEvents({ topDelays }: TopEventsProps) {
  if (topDelays.length === 0) {
    return null
  }

  const formatDelayDuration = (value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0
    const totalMinutes = Math.round(Math.abs(safeValue))
    const minutesLabel = `${formatNumber(totalMinutes, 0)} min`

    if (totalMinutes < 60) {
      return minutesLabel
    }

    const minutesInDay = 60 * 24
    const days = Math.floor(totalMinutes / minutesInDay)
    const hours = Math.floor((totalMinutes % minutesInDay) / 60)
    const minutes = totalMinutes % 60
    const parts = []

    if (days > 0) {
      parts.push(`${formatNumber(days, 0)} d`)
    }
    if (hours > 0) {
      parts.push(`${formatNumber(hours, 0)} h`)
    }
    if (minutes > 0) {
      parts.push(`${formatNumber(minutes, 0)} min`)
    }

    const durationLabel = parts.join(" ") || minutesLabel
    return `${durationLabel} (${minutesLabel})`
  }

  const formatDepartureTime = (value?: string) => {
    if (!value) return null
    const match = value.match(/T(\d{2}:\d{2})/)
    if (match) return match[1]
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
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
          Mayores demoras
        </h2>
        <p className="mt-1 text-sm font-mono text-muted-foreground">
          Diferencia vs. horario programado en el período
        </p>
      </div>

      <div className="grid gap-4">
        <div className="rounded-xl border border-border bg-card/50 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            Mayores demoras
          </div>
          <div className="space-y-3">
            {topDelays.map((item) => {
              const scheduledTime = formatDepartureTime(
                item.scheduled_departure_time
              )
              const actualTime = formatDepartureTime(item.actual_departure_time)
              const showTimes = Boolean(scheduledTime || actualTime)

              return (
                <div
                  key={`delay-${item.rank}-${item.flight_number}`}
                  className="flex items-start justify-between gap-4 border-b border-border/60 pb-3 text-sm last:border-b-0 last:pb-0 min-w-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {item.flight_number ?? "Vuelo"} · {item.origin_airport_code} → {item.destination_airport_code}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.destination_city ?? item.destination_airport_code ?? "Sin destino"}, {item.destination_country ?? "Sin país"}
                    </p>
                    {showTimes && (
                      <p className="text-xs font-mono text-muted-foreground truncate">
                        <span className="sm:hidden">
                          {/* Layout compacto para móviles */}
                          {scheduledTime && <>P: {scheduledTime}</>}
                          {scheduledTime && actualTime && <> · </>}
                          {actualTime && <>S: {actualTime}</>}
                        </span>
                        <span className="hidden sm:inline">
                          {/* Layout completo para desktop */}
                          Programado {scheduledTime ?? "Sin horario"} · Salió {actualTime ?? "Sin horario"}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-amber-400">
                      Demora {formatDelayDuration(item.delay_minutes ?? 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">#{item.rank}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
