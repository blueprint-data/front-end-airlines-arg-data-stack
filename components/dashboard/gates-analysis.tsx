import { useMemo, useState, memo } from "react"
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
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"

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
    gates?: GateMetrics[]
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

export const GatesAnalysis = memo(function GatesAnalysis({ className, gates = [] }: GatesAnalysisProps) {
    const isMobile = useIsMobile()
    const [viewMode, setViewMode] = useState<ViewMode>("delay")

    const chartData = useMemo(() => {
        return gates
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
    }, [gates, viewMode])

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
        gates.forEach(g => {
            if (g.time_distribution) {
                g.time_distribution.forEach(val => {
                    if (val > maxVal) maxVal = val
                })
            }
        })

        return { hours, maxVal, gates: chartData }
    }, [gates, viewMode, chartData])

    if (chartData.length === 0) {
        return null
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`cv-auto mx-auto max-w-5xl px-4 py-8 ${className || ""}`}
        >
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-foreground text-balance">
                        Uso de <span className="text-primary">Puertas</span> de Arribo
                    </h2>
                    <p className="mt-1 text-sm font-medium text-muted-foreground leading-relaxed">
                        Chequeá qué tan saturados están los gates y cómo viene el cumplimiento por puerta.
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
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-[background-color,color,box-shadow] whitespace-nowrap motion-reduce:transition-none ${viewMode === mode.id
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
                    <div className="relative mt-2">
                        <div className="overflow-x-auto pb-4 pt-10 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                            <div className="min-w-[800px]">
                                {/* Timeline Header */}
                                <div className="ml-24 mb-4 grid grid-cols-24 gap-1">
                                    {heatmapData.hours.map((h) => (
                                        <div key={h} className="group relative flex flex-col items-center">
                                            <span className="text-[10px] font-bold font-mono text-muted-foreground/60 transition-colors group-hover:text-primary">
                                                {h.toString().padStart(2, '0')}
                                            </span>
                                            <div className="mt-1 h-1.5 w-px bg-border/50 group-hover:bg-primary/50 transition-colors" />
                                        </div>
                                    ))}
                                </div>

                                {/* Heatmap Rows */}
                                <div className="space-y-1.5">
                                    {heatmapData.gates.map((g) => (
                                        <div key={g.rawGate} className="group flex items-center gap-3">
                                            {/* Gate Label */}
                                            <div className="flex w-24 flex-none items-center justify-end pr-3">
                                                <span className="text-[11px] font-black uppercase tracking-tighter text-muted-foreground/80 group-hover:text-foreground transition-colors">
                                                    GATE {g.rawGate}
                                                </span>
                                            </div>

                                            {/* Hour Cells */}
                                            <div className="grid flex-1 grid-cols-24 gap-1">
                                                {g.timeDistribution?.map((val, idx) => {
                                                    const intensity = val / (heatmapData.maxVal || 1);
                                                    const isEmpty = val === 0;

                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={cn(
                                                                "group/cell relative h-10 rounded-sm transition-[transform,box-shadow] duration-300 motion-reduce:transition-none motion-reduce:transform-none",
                                                                !isEmpty && "hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:z-20 hover:scale-[1.2] active:scale-[1.1] cursor-help"
                                                            )}
                                                            style={{
                                                                backgroundColor: isEmpty
                                                                    ? "rgba(255, 255, 255, 0.02)"
                                                                    : `rgba(6, 182, 212, ${Math.max(0.1, intensity)})`,
                                                                border: isEmpty
                                                                    ? "1px solid rgba(255, 255, 255, 0.03)"
                                                                    : "1px solid rgba(6, 182, 212, 0.3)"
                                                            }}
                                                        >
                                                            {!isEmpty && (
                                                                <>
                                                                    {/* Center value - always visible with low opacity on mobile, full on hover/tap */}
                                                                    <div className={cn(
                                                                        "absolute inset-0 flex items-center justify-center transition-opacity bg-cyan-950/90 rounded-sm pointer-events-none z-10",
                                                                        isMobile ? "opacity-40" : "opacity-0 group-hover/cell:opacity-100"
                                                                    )}>
                                                                        <span className="text-[11px] font-black text-white">
                                                                            {val}
                                                                        </span>
                                                                    </div>
                                                                    {/* Floating label - visible on hover or active (tap) */}
                                                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1.5 bg-foreground text-background text-[10px] font-bold rounded-lg opacity-0 group-hover/cell:opacity-100 group-active/cell:opacity-100 pointer-events-none transition-[opacity,transform] duration-200 whitespace-nowrap z-30 shadow-2xl border border-white/10 scale-90 group-hover/cell:scale-100 group-active/cell:scale-100 origin-bottom motion-reduce:transition-none motion-reduce:transform-none">
                                                                        {val} {val === 1 ? 'vuelo' : 'vuelos'} · {idx}:00h
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Overlay Hint */}
                        <div className="md:hidden mt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground animate-pulse motion-reduce:animate-none">
                            <span>← Desliza para ver cronograma completo →</span>
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
                                    cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
                                    content={({ active, payload }) => {
                                        if (!active || !payload?.length) return null
                                        const item = payload[0].payload
                                        return (
                                            <div className="rounded-xl border border-white/10 bg-card/90 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-xl ring-1 ring-white/10">
                                                <p className="text-sm font-bold text-foreground">
                                                    Gate {item.rawGate}
                                                </p>
                                                <div className="mt-3 space-y-2 text-sm">
                                                    <div className="flex items-center justify-between gap-6">
                                                        <span className="text-muted-foreground whitespace-nowrap">Vuelos totales</span>
                                                        <span className="font-mono font-bold text-foreground">
                                                            {formatNumber(item.totalFlights)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6">
                                                        <span className="text-muted-foreground whitespace-nowrap">Demora prom.</span>
                                                        <span
                                                            className={`font-mono font-bold ${item.avgDelay < 0
                                                                ? "text-green-500"
                                                                : item.avgDelay > 15
                                                                    ? "text-amber-500"
                                                                    : "text-primary"
                                                                }`}
                                                        >
                                                            {item.avgDelay > 0 ? "+" : ""}
                                                            {formatNumber(item.avgDelay, 1)} <span className="text-[10px] uppercase opacity-60">min</span>
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/5">
                                                        <span className="text-muted-foreground whitespace-nowrap">Puntualidad</span>
                                                        <span
                                                            className={`font-mono font-bold ${item.onTimePercentage >= 70
                                                                ? "text-green-500"
                                                                : item.onTimePercentage >= 50
                                                                    ? "text-primary"
                                                                    : "text-amber-500"
                                                                }`}
                                                        >
                                                            {formatNumber(item.onTimePercentage, 1)}%
                                                        </span>
                                                    </div>
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
        </motion.section >
    )
})

GatesAnalysis.displayName = "GatesAnalysis"
