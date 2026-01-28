"use client"

import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { Zap, Clock, AlertCircle, TrendingUp, Sparkles, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatNumber } from "@/lib/format"
import type { TopRecord, GateMetrics } from "@/lib/types"

interface SmartInsightsProps {
    topDelays: TopRecord[]
    gates: GateMetrics[]
}

export const SmartInsights = memo(function SmartInsights({ topDelays, gates }: SmartInsightsProps) {
    const insights = useMemo(() => {
        // 1. Peak Hour Calculation
        const hourlyTotals = new Array(24).fill(0)
        gates.forEach(g => {
            g.time_distribution?.forEach((count, hour) => {
                hourlyTotals[hour] += count
            })
        })

        const peakHour = hourlyTotals.indexOf(Math.max(...hourlyTotals))
        const peakCount = hourlyTotals[peakHour]

        // 2. Worst Delay (Critical Alert)
        const worstFlight = topDelays[0] // topDelays are sorted by rank/minutes

        // 3. Best Gate (Smooth Operator)
        const bestGate = [...gates]
            .filter(g => g.total_flights > 10)
            .sort((a, b) => b.on_time_percentage - a.on_time_percentage)[0]

        return {
            peakHour,
            peakCount,
            worstFlight,
            bestGate
        }
    }, [topDelays, gates])

    if (gates.length === 0 && topDelays.length === 0) return null

    return (
        <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cv-auto mx-auto max-w-5xl px-4 py-12"
        >
            <div className="flex flex-col gap-1 mb-8">
                <h2 className="text-2xl font-bold text-foreground">
                    Cerebro de <span className="text-primary text-glow-primary">Operaciones</span>
                </h2>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Insights clave detectados por nuestro motor de datos para que entiendas <span className="text-foreground/80">qué está pasando</span> ahora.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Insight 1: Hora Pico */}
                <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-card/10 p-7 backdrop-blur-3xl shadow-xl transition-all duration-700 hover:border-primary/20 hover:bg-card/20">
                    <div className="flex items-start justify-between mb-5">
                        <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary shadow-inner">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div className="flex gap-1">
                            <span className="h-1 w-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                            <span className="h-1 w-1 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                            <span className="h-1 w-1 rounded-full bg-primary/40 animate-bounce" />
                        </div>
                    </div>
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60 mb-3">Hora Pico Operativa</h3>
                    <p className="text-xl font-bold text-foreground leading-snug">
                        Ojo, el momento más saturado es a las <span className="text-primary text-glow-primary">{insights.peakHour}:00hs</span>.
                    </p>
                    <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                        Se detectó un pico concentrado de <b>{insights.peakCount} vuelos</b> coordinados en esta franja horaria.
                    </p>
                    <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                </div>

                {/* Insight 2: Alerta Crítica */}
                {insights.worstFlight && (
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-red-500/10 bg-red-500/5 p-7 backdrop-blur-3xl shadow-xl transition-all duration-700 hover:border-red-500/30 hover:bg-red-500/10">
                        <div className="flex items-start justify-between mb-5">
                            <div className="p-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-inner">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Crítico</span>
                            </div>
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/60 mb-3">Máxima Demora Detectada</h3>
                        <p className="text-xl font-bold text-foreground leading-snug">
                            El vuelo <span className="text-red-400">{insights.worstFlight.flight_number}</span> a {insights.worstFlight.destination_city} se demoró feo.
                        </p>
                        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                            Registró una demora de <b>{Math.round(insights.worstFlight.delay_minutes || 0)} minutos</b> respecto a su horario.
                        </p>
                        <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-red-500/5 rounded-full blur-3xl group-hover:bg-red-500/10 transition-colors duration-700" />
                    </div>
                )}

                {/* Insight 3: Gate Eficiente */}
                {insights.bestGate && (
                    <div className="group relative overflow-hidden rounded-[2.5rem] border border-emerald-500/10 bg-emerald-500/5 p-7 backdrop-blur-3xl shadow-xl transition-all duration-700 hover:border-emerald-500/30 hover:bg-emerald-500/10">
                        <div className="flex items-start justify-between mb-5">
                            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner">
                                <MapPin className="h-6 w-6" />
                            </div>
                            <TrendingUp className="h-5 w-5 text-emerald-500/40 group-hover:text-emerald-500 transition-colors duration-700" />
                        </div>
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/60 mb-3">Rendimiento Destacado</h3>
                        <p className="text-xl font-bold text-foreground leading-snug">
                            El <span className="text-emerald-400 text-glow-primary">Gate {insights.bestGate.gate}</span> es un relojito hoy.
                        </p>
                        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                            Mantiene un <b>{Math.round(insights.bestGate.on_time_percentage)}%</b> de efectividad en puntualidad total.
                        </p>
                        <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-700" />
                    </div>
                )}
            </div>
        </motion.section>
    )
})

SmartInsights.displayName = "SmartInsights"
