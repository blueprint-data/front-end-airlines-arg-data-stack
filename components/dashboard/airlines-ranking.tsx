"use client"

import { useMemo } from "react"
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
import type { RouteMetric } from "@/lib/types"
import { formatPercentage, formatNumber } from "@/lib/format"

interface AirlinesRankingProps {
  data: RouteMetric[]
}

export function AirlinesRanking({ data }: AirlinesRankingProps) {
  const chartData = useMemo(() => {
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
      .sort((a, b) => b.onTimePercentage - a.onTimePercentage)
      .slice(0, 8)
  }, [data])

  const colors = ["#06b6d4", "#8b5cf6", "#22c55e", "#f59e0b", "#ec4899"]

  if (data.length === 0) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto max-w-5xl px-4 py-8"
      >
        <div className="rounded-xl border border-border bg-card/50 p-10 text-center backdrop-blur-sm">
          <p className="text-sm font-mono text-muted-foreground">
            No hay datos de aerolíneas para los filtros seleccionados.
          </p>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Ranking de puntualidad
        </h2>
        <p className="mt-1 text-sm font-mono text-muted-foreground">
          Aerolíneas ordenadas por porcentaje de vuelos a tiempo
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
              barCategoryGap="20%"
            >
              <defs>
                {colors.map((color, index) => (
                  <linearGradient
                    key={`gradient-${index}`}
                    id={`barGradient-${index}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis
                type="number"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: "#71717a", fontSize: 12 }}
                axisLine={{ stroke: "#27272a" }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: "#fafafa", fontSize: 13, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(6, 182, 212, 0.1)" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const item = payload[0].payload
                  return (
                    <div className="rounded-lg border border-primary/20 bg-card/90 px-4 py-3 shadow-lg shadow-primary/5 backdrop-blur-md">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <div className="mt-2 space-y-1 text-sm font-mono">
                        <p className="text-muted-foreground">
                          A tiempo:{" "}
                          <span className="font-medium text-primary">
                            {formatPercentage(item.onTimePercentage)}
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Demora prom.:{" "}
                          <span className="font-medium text-foreground">
                            {formatNumber(item.avgDelay, 0)} min
                          </span>
                        </p>
                        <p className="text-muted-foreground">
                          Vuelos:{" "}
                          <span className="font-medium text-foreground">
                            {formatNumber(item.totalFlights)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )
                }}
              />
              <Bar
                dataKey="onTimePercentage"
                radius={[0, 8, 8, 0]}
                animationBegin={0}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#barGradient-${index % colors.length})`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.section>
  )
}
