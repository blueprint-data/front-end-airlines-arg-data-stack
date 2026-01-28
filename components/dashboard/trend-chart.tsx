import { useMemo, memo } from "react"
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

export const TrendChart = memo(function TrendChart({ data }: TrendChartProps) {
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
      className="cv-auto mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Tendencia de <span className="text-primary text-glow-primary">Demoras</span>
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground leading-relaxed">
          Evolución del tiempo de espera promedio día tras día. <span className="text-foreground/80">Mirá cómo cambia</span> la puntualidad.
        </p>
      </div>

      <div className="rounded-[2.5rem] border border-white/5 bg-card/10 p-6 sm:p-8 backdrop-blur-3xl shadow-2xl">
        {/* Stats summary */}
        <div className="mb-8 grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Promedio Operacional</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-primary font-mono tracking-tighter">
                {formatNumber(yAxisConfig.avg, 1)}
              </span>
              <span className="text-[10px] font-bold text-primary/60 uppercase">min</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 sm:pl-8 sm:border-l sm:border-white/5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Días Medidos</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-foreground font-mono tracking-tighter">
                {chartData.length}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase">días</span>
            </div>
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
                  <stop offset="5%" stopColor="hsl(187, 96%, 42%)" stopOpacity={0.4} />
                  <stop offset="30%" stopColor="hsl(187, 96%, 42%)" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="hsl(187, 96%, 42%)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                stroke="hsl(240, 5%, 15%)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tick={{
                  fill: "hsl(240, 5%, 40%)",
                  fontSize: isMobile ? 9 : 11,
                  fontWeight: 500
                }}
                axisLine={{ stroke: "hsl(240, 5%, 15%)" }}
                tickLine={false}
                interval={xAxisInterval}
                dy={isMobile ? 20 : 8}
                height={isMobile ? 60 : 30}
              />

              <YAxis
                domain={[yAxisConfig.min, yAxisConfig.max]}
                tickFormatter={(value) => `${value} min`}
                tick={{ fill: "hsl(240, 5%, 40%)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={50}
                tickCount={5}
              />

              {/* Average reference line */}
              <ReferenceLine
                y={yAxisConfig.avg}
                stroke="hsl(187, 96%, 42%)"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{
                  value: 'PROMEDIO',
                  position: 'right',
                  fill: 'hsl(187, 96%, 42%)',
                  fontSize: 10,
                  fontWeight: 700
                }}
              />

              <Tooltip
                cursor={{ stroke: "hsl(187, 96%, 42%)", strokeOpacity: 0.4, strokeWidth: 1.5, strokeDasharray: "4 4" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0].payload
                  return (
                    <div className="rounded-xl border border-primary/20 bg-card/90 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl ring-1 ring-white/10">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {item.fullDate}
                      </p>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between gap-6">
                          <span className="text-sm text-foreground/80">Demora promedio</span>
                          <span className="font-mono text-base font-bold text-primary">
                            {formatNumber(item.avgDelay, 1)} <span className="text-[10px] font-normal opacity-70">min</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/5">
                          <span className="text-sm text-foreground/80">Total vuelos</span>
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {formatNumber(item.totalFlights)}
                          </span>
                        </div>
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
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/5 pt-6">
          <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            <div className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-4 rounded-full bg-primary shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              <span>Demora Diaria</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-0 w-4 border-t border-dashed border-primary" />
              <span>Valor Promedio</span>
            </div>
          </div>
          <p className="text-[10px] font-mono font-medium text-muted-foreground/30 uppercase tracking-[0.2em]">
            Valores expresados en minutos
          </p>
        </div>
      </div>
    </motion.section>
  )
})

TrendChart.displayName = "TrendChart"
