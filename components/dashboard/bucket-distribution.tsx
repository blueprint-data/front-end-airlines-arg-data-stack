"use client"

import { motion } from "framer-motion"
import type { BucketDistribution } from "@/lib/types"
import { formatNumber, formatPercentage } from "@/lib/format"

const BUCKET_LABELS: Record<string, string> = {
  cancelled: "Cancelado",
  delay_over_45: "+45 min",
  delay_45_30: "45–30 min",
  delay_30_15: "30–15 min",
  delay_15_0: "15–0 min",
  on_time_or_early: "A tiempo / adelantado",
}

interface BucketDistributionProps {
  buckets: BucketDistribution[]
}

export function BucketDistributionChart({ buckets }: BucketDistributionProps) {
  const total = buckets.reduce((acc, bucket) => acc + bucket.total_flights, 0)

  if (buckets.length === 0 || total === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Distribución de demoras
        </h2>
        <p className="mt-1 text-sm font-mono text-muted-foreground">
          Cómo se distribuyen los vuelos según su nivel de demora
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
        <div className="space-y-4">
          {buckets.map((bucket) => {
            const percentage = (bucket.total_flights / total) * 100
            return (
              <div key={bucket.bucket} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">
                    {BUCKET_LABELS[bucket.bucket] ?? bucket.bucket}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {formatNumber(bucket.total_flights)} · {formatPercentage(percentage)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
