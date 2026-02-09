import { useMemo, memo, useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Trophy, Plane, TrendingUp, Award, Info } from "lucide-react"
import type { RouteMetric } from "@/lib/types"
import { formatPercentage, formatNumber } from "@/lib/format"
import { useIsMobile } from "@/hooks/use-mobile"

interface AirlineRankingItem {
  name: string
  onTimePercentage: number
  totalFlights: number
  avgDelay: number
}

interface AirlinesRankingProps {
  data: RouteMetric[]
}

export const AirlinesRanking = memo(function AirlinesRanking({ data }: AirlinesRankingProps) {
  const isMobile = useIsMobile()

  const chartData = useMemo<AirlineRankingItem[]>(() => {
    const airlineMap = new Map<
      string,
      {
        name: string
        totalFlights: number
        onTimeFlights: number
        delayMinutes: number
      }
    >()

    for (const route of data) {
      const existing = airlineMap.get(route.airline_code)
      if (existing) {
        existing.totalFlights += route.total_flights
        existing.onTimeFlights += route.total_on_time_flights
        existing.delayMinutes += route.avg_delay_minutes * route.total_flights
      } else {
        airlineMap.set(route.airline_code, {
          name: route.airline_name,
          totalFlights: route.total_flights,
          onTimeFlights: route.total_on_time_flights,
          delayMinutes: route.avg_delay_minutes * route.total_flights,
        })
      }
    }

    return Array.from(airlineMap.values())
      .map((airline) => ({
        name: airline.name,
        onTimePercentage:
          airline.totalFlights > 0
            ? (airline.onTimeFlights / airline.totalFlights) * 100
            : 0,
        totalFlights: airline.totalFlights,
        avgDelay:
          airline.totalFlights > 0
            ? airline.delayMinutes / airline.totalFlights
            : 0,
      }))
      .filter((airline) => airline.totalFlights > 30)
      .sort((a, b) => b.onTimePercentage - a.onTimePercentage)
      .slice(0, 8)
  }, [data])

  const colors = ["#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899"]

  const topAirlines = chartData // already limited to airlines with > 30 flights

  const [selectedAirlineName, setSelectedAirlineName] = useState<string | null>(null)

  if (chartData.length === 0) {
    return (
      <section className="cv-auto mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-3xl border border-white/5 bg-card/20 p-16 text-center backdrop-blur-3xl shadow-2xl">
          <div className="mx-auto h-16 w-16 bg-muted/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <Info className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Sin datos de ranking</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">Ninguna aerolínea supera los 30 vuelos con los filtros actuales.</p>
        </div>
      </section>
    )
  }

  const activeName =
    selectedAirlineName && chartData.some((item) => item.name === selectedAirlineName)
      ? selectedAirlineName
      : chartData[0]?.name ?? null
  const selectedAirline = chartData.find((item) => item.name === activeName) ?? null
  const winner = chartData[0]

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="cv-auto mx-auto max-w-5xl px-4 py-12"
    >
      {/* Header with Top Performer Reveal */}
      <div className="flex flex-col lg:flex-row gap-8 mb-12 lg:items-end justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 ring-1 ring-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Trophy className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/80">Rating de Puntualidad</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-foreground text-balance">
            Ranking de <br /><span className="text-primary text-glow-primary">Aerolíneas</span>
          </h2>
          <p className="mt-6 text-base text-muted-foreground font-medium max-w-md leading-relaxed">
            Mirá quiénes son los más cumplidores. <span className="text-foreground/80">Este ranking</span> se ordena por el porcentaje de vuelos a tiempo.
          </p>
        </div>

        {/* Winner Highlight Card */}
        {winner && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="relative lg:w-80 overflow-hidden rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 p-6 backdrop-blur-3xl shadow-2xl group/winner"
          >
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/80">La más puntual</span>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none shadow-[0_0_10px_rgba(16,185,129,1)]" />
              </div>

              <h3 className="text-2xl font-black text-white italic truncate tracking-tight mb-4 group-hover/winner:text-emerald-400 transition-colors duration-500">
                {winner.name}
              </h3>

              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Puntualidad</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tabular-nums tracking-tighter text-emerald-400">
                      {Math.round(winner.onTimePercentage)}%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-4">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Vuelos</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black tabular-nums tracking-tighter text-white/90">
                      {formatNumber(winner.totalFlights)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Aesthetic Background Accents */}
            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <Plane className="absolute top-1/2 -right-4 h-24 w-24 text-emerald-400/5 -translate-y-1/2 rotate-[15deg] group-hover/winner:rotate-0 transition-transform duration-1000 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
          </motion.div>
        )}
      </div>

      {/* Main Chart Card */}
      <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-card/10 backdrop-blur-3xl p-6 lg:p-10 shadow-3xl hover:border-white/10 transition-colors duration-700">
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          <TrendingUp className="h-32 w-32 text-primary/10" aria-hidden="true" />
        </div>

        <div className="h-[420px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topAirlines}
              layout="vertical"
              margin={{ top: 10, right: 60, left: 0, bottom: 10 }}
              barGap={12}
              barCategoryGap="25%"
            >
              <defs>
                {colors.map((color, index) => (
                  <linearGradient
                    key={`bar-grad-${index}`}
                    id={`bar-grad-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>

              <XAxis
                type="number"
                domain={[0, 100]}
                hide
              />

              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={-12}
                      y={4}
                      fill="currentColor"
                      textAnchor="end"
                      className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground fill-current"
                    >
                      {payload.value.length > 18 ? `${payload.value.substring(0, 15)}…` : payload.value}
                    </text>
                  </g>
                )}
                axisLine={false}
                tickLine={false}
              />

              {!isMobile && (
                <Tooltip
                  cursor={{ fill: "rgba(255, 255, 255, 0.03)", radius: 12 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const item = payload[0].payload
                    return (
                      <div className="rounded-2xl border border-white/10 bg-black/80 px-5 py-4 shadow-3xl backdrop-blur-2xl ring-1 ring-white/20">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">
                            {item.name}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-10">
                            <span className="text-sm font-medium text-white/50">Puntualidad</span>
                            <span className="text-xl font-black text-primary tabular-nums">
                              {formatPercentage(item.onTimePercentage)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-10 pt-2 border-t border-white/5">
                            <span className="text-sm font-medium text-white/50">Vuelos</span>
                            <span className="text-sm font-black text-white tabular-nums">
                              {formatNumber(item.totalFlights)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-10">
                            <span className="text-sm font-medium text-white/50">Demora media</span>
                            <span className="text-sm font-black text-amber-400 tabular-nums">
                              {formatNumber(item.avgDelay, 0)}m
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              )}

              <Bar
                dataKey="onTimePercentage"
                radius={[0, 10, 10, 0]}
                animationDuration={1500}
                animationEasing="ease-out"
                barSize={32}
                onClick={(_, index) => {
                  const airline = topAirlines[index]
                  if (airline) {
                    setSelectedAirlineName(airline.name)
                  }
                }}
              >
                {topAirlines.map((_, index) => (
                  <Cell
                    key={`cell-v2-${index}`}
                    fill={`url(#bar-grad-${index % colors.length})`}
                    className="filter drop-shadow-[0_0_8px_rgba(6,182,212,0.2)] transition-[filter] duration-500 hover:brightness-110 motion-reduce:transition-none"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {isMobile && (
          <div className="mt-6 space-y-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {topAirlines.map((airline) => (
                <button
                  key={airline.name}
                  type="button"
                  onClick={() => setSelectedAirlineName(airline.name)}
                  className={`flex-shrink-0 rounded-2xl border px-4 py-2 text-xs font-semibold transition ${
                    activeName === airline.name
                      ? "border-primary bg-primary/10 text-white"
                      : "border-white/10 text-muted-foreground"
                  }`}
                >
                  <span className="block leading-tight">{airline.name}</span>
                  <span className="text-[10px] font-black text-primary tabular-nums">
                    {Math.round(airline.onTimePercentage)}%
                  </span>
                </button>
              ))}
            </div>
            {selectedAirline && (
              <div className="rounded-[2rem] border border-white/5 bg-card/90 p-5 text-sm text-foreground shadow-2xl backdrop-blur-2xl">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">Seleccionado</p>
                    <h3 className="text-xl font-black text-white">{selectedAirline.name}</h3>
                  </div>
                  <p className="text-2xl font-black text-primary tabular-nums">
                    {Math.round(selectedAirline.onTimePercentage)}%
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Vuelos</span>
                    <span className="text-lg font-black">{formatNumber(selectedAirline.totalFlights)}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">Demora media</span>
                    <span className="text-lg font-black text-amber-400">{formatNumber(selectedAirline.avgDelay, 0)}m</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.section>
  )
})

AirlinesRanking.displayName = "AirlinesRanking"
