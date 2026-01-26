"use client"

import { motion } from "framer-motion"
import { Clock, Plane, AlertTriangle, CheckCircle } from "lucide-react"
import { formatNumber, formatPercentage } from "@/lib/format"

interface KPICardsProps {
  totalFlights: number
  onTimePercentage: number
  cancellationRate: number
  avgDelayMinutes: number
}

export function KPICards({
  totalFlights,
  onTimePercentage,
  cancellationRate,
  avgDelayMinutes,
}: KPICardsProps) {

  const kpis = [
    {
      label: "Vuelos analizados",
      value: formatNumber(totalFlights),
      icon: Plane,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
    },
    {
      label: "A tiempo",
      value: formatPercentage(onTimePercentage),
      icon: CheckCircle,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Cancelaciones",
      value: formatPercentage(cancellationRate),
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      label: "Demora promedio",
      value: `${formatNumber(avgDelayMinutes, 0)} min`,
      icon: Clock,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  }

  if (!totalFlights) {
    return null
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <motion.div
            key={kpi.label}
            variants={cardVariants}
            className={`group relative overflow-hidden rounded-xl border ${kpi.borderColor} bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-primary/40`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-mono font-medium text-muted-foreground">
                  {kpi.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                  {kpi.value}
                </p>
              </div>
              <div className={`rounded-lg border ${kpi.borderColor} ${kpi.bgColor} p-3`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </div>
            {/* Subtle glow effect on hover */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
