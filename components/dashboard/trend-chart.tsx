"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts"
import type { DailyStatus } from "@/lib/types"
import { formatNumber, formatDateForChart } from "@/lib/format"
import { useIsMobile } from "@/hooks/use-mobile"

interface TrendChartProps {
  data: DailyStatus[]
}

export function TrendChart({ data }: TrendChartProps) {
  const isMobile = useIsMobile()
  
  const chartData = useMemo(() => {
    return [...data]
      .sort(
        (a, b) =>
          new Date(a.flight_date).getTime() - new Date(b.flight_date).getTime()
      )
      .map((item) => {
        const date = new Date(item.flight_date)
        return {
          date: formatDateForChart(item.flight_date, isMobile),
          fullDate: date.toLocaleDateString("es-AR", {
            weekday: "short",
            day: "2-digit",
            month: "short"
          }),
          avgDelay: Math.round(item.avg_delay_minutes * 10) / 10,
          totalFlights: item.total_flights,
          timestamp: date.getTime(),
        }
      })
  }, [data, isMobile])

  // Calculate dynamic Y axis domain based on actual data
  const yAxisConfig = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 60, avg: 0 }
    const values = chartData.map(d => d.avgDelay)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    // Round up to next 10 for cleaner axis
    const roundedMax = Math.ceil((max + 5) / 10) * 10
    return { min: 0, max: Math.max(roundedMax, 30), avg: Math.round(avg * 10) / 10 }
  }, [chartData])

  // Show fewer ticks on X axis for readability
  const xAxisInterval = useMemo(() => {
    if (isMobile) {
      // For mobile: show maximum 4-5 labels
      if (chartData.length <= 4) return 0
      if (chartData.length <= 8) return 1
      return Math.floor(chartData.length / 4)
    }
    
    // Original logic for desktop
    if (chartData.length <= 10) return 0 // Show all
    if (chartData.length <= 20) return 1 // Every other
    if (chartData.length <= 40) return 3 // Every 4th
    return Math.floor(chartData.length / 10) // ~10 labels
  }, [chartData.length, isMobile])

  if (data.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground text-balance">
          Tendencia de demoras
        </h2>
        <p className="mt-1 text-sm font-mono text-muted-foreground">
          Evolución diaria del promedio de demoras en minutos
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-6 backdrop-blur-sm">
        {/* Stats summary */}
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Promedio del período:</span>
            <span className="font-mono font-semibold text-foreground">
              {formatNumber(yAxisConfig.avg, 1)} min
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Días analizados:</span>
            <span className="font-mono font-semibold text-foreground">
              {chartData.length}
            </span>
          </div>
        </div>

        <div className="h-[280px] sm:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ 
                top: 10, 
                right: 10, 
                left: -10, 
                bottom: isMobile ? 50 : 20 
              }}
            >
              <defs>
                <linearGradient id="delayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(187, 96%, 42%)" stopOpacity={0.3} />
                  <stop offset="50%" stopColor="hsl(187, 96%, 42%)" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="hsl(187, 96%, 42%)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(240, 5%, 20%)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{ 
                  fill: "hsl(240, 5%, 50%)", 
                  fontSize: isMobile ? 9 : 11
                }}
                axisLine={{ stroke: "hsl(240, 5%, 20%)" }}
                tickLine={false}
                interval={xAxisInterval}
                dy={isMobile ? 20 : 8}
                height={isMobile ? 60 : 30}
              />

              <YAxis
                domain={[yAxisConfig.min, yAxisConfig.max]}
                tickFormatter={(value) => `${value}`}
                tick={{ fill: "hsl(240, 5%, 50%)", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={35}
                tickCount={5}
              />

              {/* Average reference line */}
              <ReferenceLine
                y={yAxisConfig.avg}
                stroke="hsl(187, 96%, 42%)"
                strokeDasharray="5 5"
                strokeOpacity={0.5}
              />

              <Tooltip
                cursor={{ stroke: "hsl(187, 96%, 42%)", strokeOpacity: 0.3, strokeWidth: 1 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0].payload
                  return (
                    <div className="rounded-lg border border-primary/30 bg-card px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-md">
                      <p className="font-semibold text-foreground capitalize">
                        {item.fullDate}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">Demora promedio</span>
                          <span className="font-mono font-semibold text-primary">
                            {formatNumber(item.avgDelay, 1)} min
                          </span>
                        </p>
                        <p className="flex items-center justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">Total vuelos</span>
                          <span className="font-mono text-foreground">
                            {formatNumber(item.totalFlights)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )
                }}
              />

              <Area
                type="monotone"
                dataKey="avgDelay"
                stroke="hsl(187, 96%, 42%)"
                strokeWidth={2}
                fill="url(#delayGradient)"
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "hsl(187, 96%, 42%)",
                  stroke: "hsl(240, 10%, 4%)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 bg-primary" />
              <span>Demora diaria</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-primary/50" />
              <span>Promedio</span>
            </div>
          </div>
          <p className="text-xs font-mono text-muted-foreground/70">
            Valores en minutos
          </p>
        </div>
      </div>
    </motion.section>
  )
}
