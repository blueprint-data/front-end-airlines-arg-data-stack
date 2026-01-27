import { memo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { BucketDistribution } from "@/lib/types"
import { formatNumber, formatPercentage } from "@/lib/format"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Clock, Ban, Timer, Info, Plane } from "lucide-react"

const BUCKET_CONFIG: Record<string, { label: string, icon: any, color: string, ring: string, text: string }> = {
  cancelled: {
    label: "Cancelados",
    icon: Ban,
    color: "bg-red-500",
    ring: "ring-red-500/20",
    text: "text-red-400"
  },
  delay_over_45: {
    label: "+45 min",
    icon: AlertCircle,
    color: "bg-orange-600",
    ring: "ring-orange-500/20",
    text: "text-orange-400"
  },
  delay_45_30: {
    label: "45-30 min",
    icon: Timer,
    color: "bg-orange-400",
    ring: "ring-orange-400/20",
    text: "text-orange-300"
  },
  delay_30_15: {
    label: "30-15 min",
    icon: Clock,
    color: "bg-amber-400",
    ring: "ring-amber-400/20",
    text: "text-amber-300"
  },
  delay_15_0: {
    label: "1-15 min",
    icon: Timer,
    color: "bg-cyan-500",
    ring: "ring-cyan-500/20",
    text: "text-cyan-400"
  },
  on_time_or_early: {
    label: "A tiempo",
    icon: CheckCircle2,
    color: "bg-emerald-500",
    ring: "ring-emerald-500/20",
    text: "text-emerald-400"
  },
}

interface BucketDistributionProps {
  buckets: BucketDistribution[]
  avgDelayMinutes: number
  lookbackDays?: number
}

export const BucketDistributionChart = memo(function BucketDistributionChart({
  buckets,
  avgDelayMinutes,
  lookbackDays
}: BucketDistributionProps) {
  const total = buckets.reduce((acc: number, bucket: BucketDistribution) => acc + (bucket.total_flights || 0), 0)
  const windowLabel = lookbackDays ? `${lookbackDays} días` : "60 días"

  if (buckets.length === 0 || total === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-3xl border border-white/5 bg-card/40 p-16 text-center backdrop-blur-3xl shadow-2xl">
          <div className="mx-auto h-16 w-16 bg-muted/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <Info className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Sin datos operativos</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">No hay registros de vuelos para los filtros seleccionados en este periodo.</p>
        </div>
      </section>
    )
  }

  // Sort buckets by severity (on_time first, then delays, then cancelled)
  const sortedBuckets = [...buckets].sort((a, b) => {
    const order = ["on_time_or_early", "delay_15_0", "delay_30_15", "delay_45_30", "delay_over_45", "cancelled"]
    return order.indexOf(a.bucket) - order.indexOf(b.bucket)
  })

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-5xl px-4 py-12"
    >
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10 lg:mb-12">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-3 lg:mb-4">
            <div className="flex h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-lg bg-primary/20 ring-1 ring-primary/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Plane className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-primary" />
            </div>
            <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Monitor Operativo Histórico</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            Estado de la <br /><span className="text-primary text-glow-primary">Operación</span>
          </h2>
          <p className="mt-4 lg:mt-6 text-sm lg:text-base text-muted-foreground font-medium max-w-md leading-relaxed">
            Mirá cómo viene la puntualidad y las demoras en los últimos {windowLabel}. <span className="text-foreground/80">Chequeá los datos</span> según los filtros que elijas arriba.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Primary KPI 1: Total Flights */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-xl hover:bg-white/10 transition-colors duration-500">
            <div className="text-[9px] font-black tracking-widest text-muted-foreground/60 uppercase mb-1.5 lg:mb-2">Vuelos Totales</div>
            <div className="flex items-end gap-1.5 lg:gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tighter text-foreground">{formatNumber(total)}</span>
              <span className="text-[9px] font-bold text-primary mb-1 lg:mb-1.5 uppercase tracking-tighter">Vuelos</span>
            </div>
          </div>

          {/* Primary KPI 2: Avg Delay */}
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-amber-500/5 border border-amber-500/10 backdrop-blur-xl shadow-xl hover:bg-amber-500/10 transition-colors duration-500">
            <div className="text-[9px] font-black tracking-widest text-amber-400/60 uppercase mb-1.5 lg:mb-2 text-nowrap">Demora Promedio</div>
            <div className="flex items-end gap-1.5 lg:gap-2">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-black font-mono tracking-tighter text-amber-400">{formatNumber(avgDelayMinutes, 0)}</span>
              <span className="text-[9px] font-bold text-amber-500/80 mb-1 lg:mb-1.5 uppercase tracking-tighter">Minutos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bucket Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 relative">
        <AnimatePresence mode="popLayout">
          {sortedBuckets.map((bucket, index) => {
            const config = BUCKET_CONFIG[bucket.bucket] || BUCKET_CONFIG.on_time_or_early
            const percentage = (bucket.total_flights / total) * 100
            const Icon = config.icon

            return (
              <motion.div
                key={bucket.bucket}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08, ease: "circOut" }}
                className="group relative flex flex-col items-center p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/5 bg-card/10 backdrop-blur-2xl transition-all duration-500 hover:bg-card/30 hover:border-white/20 hover:shadow-2xl hover:translate-y-[-4px]"
              >
                {/* Status Icon */}
                <div className={cn(
                  "mb-3 sm:mb-5 flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl ring-2 sm:ring-4 shadow-lg transition-all duration-700 group-hover:rotate-[10deg] group-hover:scale-110",
                  config.color,
                  config.ring
                )}>
                  <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>

                {/* Quantitative Data */}
                <div className="text-center w-full">
                  <p className={cn(
                    "text-[9px] sm:text-[10px] font-black uppercase tracking-widest mb-2 sm:mb-3 block drop-shadow-[0_0_8px_currentColor] brightness-125",
                    config.text
                  )}>
                    {config.label}
                  </p>
                  <div className="flex flex-col items-center gap-1 sm:gap-1.5">
                    <span className="text-xl sm:text-2xl font-black font-mono tabular-nums tracking-tighter">
                      {Math.round(percentage)}%
                    </span>
                    <div className="px-1.5 py-0.5 rounded-full bg-white/5 border border-white/5">
                      <span className="text-[8px] sm:text-[9px] font-bold text-muted-foreground/60 group-hover:text-primary/80 transition-colors">
                        {formatNumber(bucket.total_flights)} <span className="hidden sm:inline">OPS</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Aesthetic Indicator */}
                <div className="mt-4 sm:mt-6 w-8 sm:w-12 h-1 bg-white/5 rounded-full overflow-hidden hidden xs:block">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 1 + index * 0.1 }}
                    className={cn("h-full opacity-30", config.color)}
                  />
                </div>

                <div className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-b from-white to-transparent" />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Composition Timeline Bar */}
      <div className="mt-10 group relative p-1 rounded-b-3xl bg-black/20 border border-white/5 backdrop-blur-md">
        <div className="relative h-2 sm:h-3 w-full rounded-full overflow-hidden flex shadow-2xl">
          {sortedBuckets.map((bucket) => {
            const percentage = (bucket.total_flights / total) * 100
            const config = BUCKET_CONFIG[bucket.bucket] || BUCKET_CONFIG.on_time_or_early
            return (
              <motion.div
                key={`stacked-v2-${bucket.bucket}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1.5, delay: 0.8, ease: "circOut" }}
                className={cn("h-full relative group/segment cursor-pointer", config.color)}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover/segment:opacity-30 transition-opacity" />
              </motion.div>
            )
          })}
        </div>

        {/* Legendary Legend */}
        <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-x-3 sm:gap-x-6 gap-y-2">
          {sortedBuckets.map((bucket) => {
            const config = BUCKET_CONFIG[bucket.bucket] || BUCKET_CONFIG.on_time_or_early
            return (
              <div key={`legend-${bucket.bucket}`} className="flex items-center gap-1.5 sm:gap-2 transition-all duration-300">
                <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)]", config.color)} />
                <span className={cn(
                  "text-[8px] sm:text-[10px] font-black uppercase tracking-widest drop-shadow-[0_0_8px_currentColor] brightness-125",
                  config.text
                )}>
                  {config.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
})

BucketDistributionChart.displayName = "BucketDistributionChart"
