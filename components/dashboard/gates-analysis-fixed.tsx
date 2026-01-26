"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    Cell,
    ReferenceLine,
} from "recharts"
import { formatNumber } from "@/lib/format"
import type { GateMetrics } from "@/lib/types"

interface GatesAnalysisProps {
    className?: string
    gates?: GateMetrics[]
}

type ViewMode = "delay" | "flights" | "ontime" | "concurrency"

type HeatmapHover = {
    gate: string
    hour: number
    value: number
}

interface HeatmapData {
    hours: number[]
    maxVal: number
    gates: Array<{
        gate: string
        rawGate: string
        timeDistribution: number[]
    }>
}

const HOURS = Array.from({ length: 24 }, (_, index) => index)
const HEATMAP_GRID_TEMPLATE = "var(--heatmap-label) repeat(24, minmax(0, 1fr))"

const normalizeDistribution = (distribution?: number[]) =>
    HOURS.map((_, index) => Number(distribution?.[index] ?? 0))

export function GatesAnalysisFixed({ className, gates }: GatesAnalysisProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("delay")
    const [hoveredCell, setHoveredCell] = useState<HeatmapHover | null>(null)
    const gatesData = useMemo(() => gates ?? [], [gates])

    const chartData = useMemo(() => {
        return gatesData
            .map((gate) => {
                const rawGate = String(gate.gate ?? "").trim()
                const label = rawGate ? `Gate ${rawGate}` : "Gate N/A"

                return {
                    gate: label,
                    rawGate: rawGate || "N/A",
                    avgDelay: Math.round(gate.avg_delay_minutes * 10) / 10,
                    totalFlights: gate.total_flights,
                    onTimePercentage: gate.on_time_percentage,
                    delayedFlights: gate.delayed_flights,
                    onTimeFlights: gate.on_time_flights,
                    maxDelay: gate.max_delay_minutes,
                    timeDistribution: normalizeDistribution(gate.time_distribution),
                }
            })
            .sort((a, b) => {
                if (viewMode === "delay") return b.avgDelay - a.avgDelay
                if (viewMode === "flights" || viewMode === "concurrency")
                    return b.totalFlights - a.totalFlights
                return b.onTimePercentage - a.onTimePercentage
            })
    }, [gatesData, viewMode])

    const stats = useMemo(() => {
        if (chartData.length === 0)
            return { avgDelay: 0, totalFlights: 0, avgOnTime: 0 }

        const avgDelay =
            chartData.reduce((sum, g) => sum + g.avgDelay, 0) / chartData.length
        const totalFlights = chartData.reduce((sum, g) => sum + g.totalFlights, 0)
        const avgOnTime =
            chartData.reduce((sum, g) => sum + g.onTimePercentage, 0) /
            chartData.length

        return {
            avgDelay: Math.round(avgDelay * 10) / 10,
            totalFlights,
            avgOnTime: Math.round(avgOnTime * 10) / 10,
        }
    }, [chartData])

    // Color scale based on performance
    const getBarColor = (value: number, mode: ViewMode) => {
        if (mode === "delay") {
            if (value < 0) return "hsl(160, 84%, 39%)" // Green for early
            if (value < 15) return "hsl(187, 96%, 42%)" // Cyan for acceptable
            if (value < 30) return "hsl(45, 93%, 47%)" // Yellow for warning
            return "hsl(0, 72%, 51%)" // Red for bad
        }
        if (mode === "ontime") {
            if (value >= 80) return "hsl(160, 84%, 39%)" // Green
            if (value >= 60) return "hsl(187, 96%, 42%)" // Cyan
            if (value >= 40) return "hsl(45, 93%, 47%)" // Yellow
            return "hsl(0, 72%, 51%)" // Red
        }
        return "hsl(187, 96%, 42%)" // Default cyan for flights
    }

    // Generate heatmap grid data
    const heatmapData = useMemo<HeatmapData | null>(() => {
        if (viewMode !== "concurrency") return null
        let maxVal = 0
        chartData.forEach((gate) => {
            gate.timeDistribution.forEach((val) => {
                if (val > maxVal) maxVal = val
            })
        })

        return {
            hours: HOURS,
            maxVal: Math.max(maxVal, 1),
            gates: chartData,
        }
    }, [chartData, viewMode])

    if (chartData.length === 0) {
        return null
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`mx-auto max-w-5xl px-4 py-8 ${className || ""}`}
        >
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground text-balance">
                        Análisis por Gate de Aterrizaje
                    </h2>
                    <p className="mt-1 text-sm font-mono text-muted-foreground">
                        Performance operacional y concurrencia por puerta
                    </p>
                </div>

                {/* View mode toggle */}
                <div className="flex max-w-full flex-wrap items-center gap-1 rounded-lg bg-muted/50 p-1">
                    {[
                        { id: "delay", label: "Demoras" },
                        { id: "flights", label: "Vuelos" },
                        { id: "ontime", label: "Puntualidad" },
                        { id: "concurrency", label: "Concurrencia" },
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as ViewMode)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${viewMode === mode.id
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-6 backdrop-blur-sm">
                {/* Stats summary */}
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    <div className="rounded-lg bg-muted/30 p-3 text-left sm:text-center flex items-center justify-between sm:block">
                        <p className="text-xs text-muted-foreground">Gates Analizados</p>
                        <p className="text-lg font-bold font-mono text-foreground sm:mt-1 sm:text-xl">
                            {chartData.length}
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-left sm:text-center flex items-center justify-between sm:block">
                        <p className="text-xs text-muted-foreground">Demora Prom.</p>
                        <p
                            className={`text-lg font-bold font-mono sm:mt-1 sm:text-xl ${stats.avgDelay < 0
                                ? "text-green-500"
                                : stats.avgDelay > 15
                                    ? "text-amber-500"
                                    : "text-primary"
                                }`}
                        >
                            {stats.avgDelay > 0 ? "+" : ""}
                            {formatNumber(stats.avgDelay, 1)} min
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-left sm:text-center flex items-center justify-between sm:block">
                        <p className="text-xs text-muted-foreground">Puntualidad Prom.</p>
                        <p
                            className={`text-lg font-bold font-mono sm:mt-1 sm:text-xl ${stats.avgOnTime >= 70
                                ? "text-green-500"
                                : stats.avgOnTime >= 50
                                    ? "text-primary"
                                    : "text-amber-500"
                                }`}
                        >
                            {formatNumber(stats.avgOnTime, 1)}%
                        </p>
                    </div>
                </div>

                {/* Chart Area */}
                {viewMode === "concurrency" && heatmapData ? (
                    <div className="w-full overflow-x-auto">
                        <div
                            className="min-w-[600px] space-y-2 rounded-lg bg-muted/20 p-2 sm:min-w-[700px]"
                            onMouseLeave={() => setHoveredCell(null)}
                        >
                            <div className="flex flex-col gap-1 px-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                                <span>Distribución horaria por gate</span>
                                <span className="font-mono text-foreground/80">
                                    {hoveredCell
                                        ? `${hoveredCell.gate} · ${String(hoveredCell.hour).padStart(2, "0")}h · ${hoveredCell.value} vuelos`
                                        : "Hover en una celda para ver detalle"}
                                </span>
                            </div>
                            <p className="px-1 text-[11px] text-muted-foreground sm:hidden">
                                Deslizá horizontalmente para ver las 24 horas.
                            </p>
                            <div
                                className="grid items-end gap-[2px] [--heatmap-label:4rem] sm:[--heatmap-label:5rem]"
                                style={{ gridTemplateColumns: HEATMAP_GRID_TEMPLATE }}
                            >
                                <div className="text-xs font-medium text-muted-foreground text-right pr-2">
                                    Hora
                                </div>
                                {heatmapData.hours.map((hour) => (
                                    <div
                                        key={hour}
                                        className="text-center text-[10px] font-mono text-muted-foreground"
                                    >
                                        {String(hour).padStart(2, "0")}h
                                    </div>
                                ))}
                            </div>

                            {heatmapData.gates.map((gateItem) => (
                                <div
                                    key={gateItem.rawGate}
                                    className="grid items-center gap-[2px] group [--heatmap-label:4rem] sm:[--heatmap-label:5rem]"
                                    style={{ gridTemplateColumns: HEATMAP_GRID_TEMPLATE }}
                                >
                                    <div
                                        className="text-xs font-medium text-foreground text-right pr-2 truncate"
                                        title={gateItem.gate}
                                    >
                                        {gateItem.gate}
                                    </div>
                                    {gateItem.timeDistribution.map((val, idx) => {
                                        const intensity = Math.sqrt(val / heatmapData.maxVal)
                                        const opacity = val === 0 ? 0 : 0.12 + intensity * 0.88
                                        const backgroundColor =
                                            val === 0
                                                ? "transparent"
                                                : `hsla(187, 96%, 42%, ${opacity})`
                                        const textClassName =
                                            val === 0
                                                ? "text-muted-foreground/70"
                                                : "text-white/90 drop-shadow-sm"

                                        return (
                                            <div
                                                key={idx}
                                                className="h-7 rounded-[2px] border border-border/30 transition-transform hover:scale-105 hover:z-10 relative sm:h-8"
                                                style={{
                                                    backgroundColor,
                                                }}
                                                title={`${val} vuelos a las ${String(idx).padStart(2, "0")}:00`}
                                                onMouseEnter={() =>
                                                    setHoveredCell({
                                                        gate: gateItem.gate,
                                                        hour: idx,
                                                        value: val,
                                                    })
                                                }
                                            >
                                                <span
                                                    className={`absolute inset-0 flex items-center justify-center text-[8px] font-semibold sm:text-[9px] ${textClassName}`}
                                                >
                                                    {val}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}

                            <div className="mt-3 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                <span>Menos vuelos</span>
                                <div
                                    className="h-2 w-20 rounded"
                                    style={{
                                        background:
                                            "linear-gradient(to right, hsla(187, 96%, 42%, 0.06), hsla(187, 96%, 42%, 1))",
                                    }}
                                ></div>
                                <span>Más vuelos</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[280px] sm:h-[380px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={chartData}
                                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="hsl(240, 5%, 20%)"
                                    horizontal={true}
                                    vertical={false}
                                />

                                <XAxis
                                    type="number"
                                    tick={{ fill: "hsl(240, 5%, 50%)", fontSize: 11 }}
                                    axisLine={{ stroke: "hsl(240, 5%, 20%)" }}
                                    tickLine={false}
                                    domain={
                                        viewMode === "delay"
                                            ? ["dataMin - 10", "dataMax + 10"]
                                            : [0, "dataMax + 10"]
                                    }
                                    tickFormatter={(value) => {
                                        const numericValue =
                                            typeof value === "number" ? value : Number(value)
                                        if (viewMode === "ontime") {
                                            return `${formatNumber(numericValue, 1)}%`
                                        }
                                        if (viewMode === "delay") {
                                            return `${formatNumber(numericValue, 1)} min`
                                        }
                                        return formatNumber(numericValue, 0)
                                    }}
                                />

                                <YAxis
                                    type="category"
                                    dataKey="gate"
                                    tick={{ fill: "hsl(240, 5%, 60%)", fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                    width={70}
                                />

                                {viewMode === "delay" && (
                                    <ReferenceLine
                                        x={0}
                                        stroke="hsl(240, 5%, 40%)"
                                        strokeWidth={1}
                                    />
                                )}

                                <Tooltip
                                    cursor={{ fill: "hsl(187, 96%, 42%)", fillOpacity: 0.1 }}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null
                                        const item = payload[0].payload
                                        return (
                                            <div className="rounded-lg border border-primary/30 bg-card px-4 py-3 shadow-xl shadow-black/20 backdrop-blur-md">
                                                <p className="font-semibold text-foreground">
                                                    Gate {item.rawGate}
                                                </p>
                                                <div className="mt-2 space-y-1.5">
                                                    <p className="flex items-center justify-between gap-4 text-sm">
                                                        <span className="text-muted-foreground">
                                                            Total vuelos
                                                        </span>
                                                        <span className="font-mono font-semibold text-foreground">
                                                            {formatNumber(item.totalFlights)}
                                                        </span>
                                                    </p>
                                                    <p className="flex items-center justify-between gap-4 text-sm">
                                                        <span className="text-muted-foreground">
                                                            Demora prom.
                                                        </span>
                                                        <span
                                                            className={`font-mono font-semibold ${item.avgDelay < 0
                                                                ? "text-green-500"
                                                                : item.avgDelay > 15
                                                                    ? "text-amber-500"
                                                                    : "text-primary"
                                                                }`}
                                                        >
                                                            {item.avgDelay > 0 ? "+" : ""}
                                                            {formatNumber(item.avgDelay, 1)} min
                                                        </span>
                                                    </p>
                                                    <p className="flex items-center justify-between gap-4 text-sm">
                                                        <span className="text-muted-foreground">
                                                            Puntualidad
                                                        </span>
                                                        <span
                                                            className={`font-mono font-semibold ${item.onTimePercentage >= 70
                                                                ? "text-green-500"
                                                                : item.onTimePercentage >= 50
                                                                    ? "text-primary"
                                                                    : "text-amber-500"
                                                                }`}
                                                        >
                                                            {formatNumber(item.onTimePercentage, 1)}%
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    }}
                                />

                                <Bar
                                    dataKey={
                                        viewMode === "delay"
                                            ? "avgDelay"
                                            : viewMode === "flights"
                                                ? "totalFlights"
                                                : "onTimePercentage"
                                    }
                                    radius={[0, 4, 4, 0]}
                                    animationBegin={0}
                                    animationDuration={800}
                                    animationEasing="ease-out"
                                >
                                    {chartData.map((entry, index) => {
                                        const value =
                                            viewMode === "delay"
                                                ? entry.avgDelay
                                                : viewMode === "flights"
                                                    ? entry.totalFlights
                                                    : entry.onTimePercentage
                                        return (
                                            <Cell key={`cell-${index}`} fill={getBarColor(value, viewMode)} />
                                        )
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Legend */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-4">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {viewMode === "delay" && (
                            <>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded-sm bg-green-500" />
                                    <span>Temprano</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
                                    <span>Aceptable</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded-sm bg-amber-500" />
                                    <span>Demora moderada</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded-sm bg-red-500" />
                                    <span>Demora alta</span>
                                </div>
                            </>
                        )}
                        {viewMode === "concurrency" && (
                            <span>Intensidad de color indica mayor cantidad de vuelos en ese horario</span>
                        )}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground/70">
                        {viewMode === "concurrency"
                            ? "Distribución horaria (00h-23h)"
                            : viewMode === "delay"
                                ? "Valores en minutos (negativos = temprano)"
                                : viewMode === "ontime"
                                    ? "Porcentaje de vuelos a tiempo o temprano"
                                    : "Total de vuelos por gate"}
                    </p>
                </div>
            </div>
        </motion.section>
    )
}
