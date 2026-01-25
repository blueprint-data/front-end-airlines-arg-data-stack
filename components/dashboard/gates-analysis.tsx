"use client"

import { useMemo, useState, useEffect } from "react"
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

interface GateMetrics {
    gate: string
    total_flights: number
    avg_delay_minutes: number
    delayed_flights: number
    on_time_flights: number
    on_time_percentage: number
    max_delay_minutes: number
    time_distribution: number[]
}

interface GatesAnalysisProps {
    className?: string
}

type ViewMode = "delay" | "flights" | "ontime" | "concurrency"

interface HeatmapData {
    hours: number[]
    maxVal: number
    gates: Array<{
        gate: string
        rawGate: string
        timeDistribution: number[]
    }>
}

export function GatesAnalysis({ className }: GatesAnalysisProps) {
    const [gatesData, setGatesData] = useState<GateMetrics[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>("delay")

    useEffect(() => {
        async function fetchGates() {
            setLoading(true)
            setError(null)
            try {
                const response = await fetch("/api/gates?limit=15")
                if (!response.ok) {
                    throw new Error(`Failed to fetch gates: ${response.status}`)
                }
                const result = await response.json()
                setGatesData(result.data || [])
            } catch (err) {
                setError(err instanceof Error ? err.message : "Error desconocido")
            } finally {
                setLoading(false)
            }
        }
        fetchGates()
    }, [])

    const chartData = useMemo(() => {
        return gatesData
            .map((gate) => ({
                gate: `Gate ${gate.gate}`,
                rawGate: gate.gate,
                avgDelay: Math.round(gate.avg_delay_minutes * 10) / 10,
                totalFlights: gate.total_flights,
                onTimePercentage: gate.on_time_percentage,
                delayedFlights: gate.delayed_flights,
                onTimeFlights: gate.on_time_flights,
                maxDelay: gate.max_delay_minutes,
                timeDistribution: gate.time_distribution,
            }))
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
        const hours = Array.from({ length: 24 }, (_, i) => i)
        // Find max value for normalization
        let maxVal = 0
        gatesData.forEach(g => {
            g.time_distribution.forEach(val => {
                if (val > maxVal) maxVal = val
            })
        })

        return { hours, maxVal, gates: chartData }
    }, [gatesData, viewMode, chartData])

    if (loading) {
        return (
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`mx-auto max-w-5xl px-4 py-8 ${className || ""}`}
            >
                <div className="rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
                    <div className="animate-pulse space-y-4">
                        <div className="h-6 w-1/3 rounded bg-muted"></div>
                        <div className="h-[320px] rounded bg-muted/50"></div>
                    </div>
                </div>
            </motion.section>
        )
    }

    if (error) {
        return null
    }

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
                <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 overflow-x-auto max-w-full">
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
                <div className="mb-6 grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Gates Analizados</p>
                        <p className="mt-1 text-xl font-bold font-mono text-foreground">
                            {chartData.length}
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Demora Prom.</p>
                        <p
                            className={`mt-1 text-xl font-bold font-mono ${stats.avgDelay < 0
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
                    <div className="rounded-lg bg-muted/30 p-3 text-center">
                        <p className="text-xs text-muted-foreground">Puntualidad Prom.</p>
                        <p
                            className={`mt-1 text-xl font-bold font-mono ${stats.avgOnTime >= 70
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
                        <div className="min-w-[600px] space-y-2">
                            <div className="flex items-end gap-1 mb-2">
                                <div className="w-20 text-xs font-medium text-muted-foreground text-right pr-2">
                                    Hora
                                </div>
                                {heatmapData.hours.map((h) => (
                                    <div key={h} className="flex-1 text-center text-[10px] text-muted-foreground font-mono">
                                        {h}h
                                    </div>
                                ))}
                            </div>

                            {heatmapData.gates.map((g) => (
                                <div key={g.rawGate} className="flex items-center gap-1 group">
                                    <div className="w-20 text-xs font-medium text-foreground text-right pr-2 truncate" title={g.gate}>
                                        Gate {g.rawGate}
                                    </div>
                                    {g.timeDistribution.map((val, idx) => {
                                        const intensity = val / (heatmapData.maxVal || 1);
                                        return (
                                            <div
                                                key={idx}
                                                className="flex-1 h-8 rounded-sm transition-all hover:scale-110 hover:z-10 relative"
                                                style={{
                                                    backgroundColor: `hsla(187, 96%, 42%, ${Math.max(0.12, intensity)})`,
                                                }}
                                                title={`${val} vuelos a las ${idx}:00`}
                                            >
                                                {val > 0 && intensity > 0.45 && (
                                                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white drop-shadow-md">
                                                        {val}
                                                    </span>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}

                            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-muted-foreground">
                                <span>Menos uso</span>
                                <div className="h-2 w-16 rounded" style={{ background: 'linear-gradient(to right, hsla(187, 96%, 42%, 0.1), hsla(187, 96%, 42%, 1))' }}></div>
                                <span>Más uso</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-[320px] sm:h-[380px] w-full">
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
                                    tickFormatter={(value) =>
                                        viewMode === "ontime"
                                            ? `${value}%`
                                            : viewMode === "delay"
                                                ? `${value} min`
                                                : String(value)
                                    }
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
                        {/* ... other legends ... already handled somewhat above or default */}
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
