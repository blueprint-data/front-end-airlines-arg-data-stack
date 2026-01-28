"use client"

import { memo, useMemo } from "react"
import { motion } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ArrowUpDown, ArrowUp, ArrowDown, ArrowUpRight, Clock, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { TopDestination } from "@/lib/dashboard-utils"
import { formatNumber } from "@/lib/format"

type SortKey = "destination_city" | "avg_delay_minutes" | "total_flights"
type SortOrder = "asc" | "desc"

function SortIcon({
  columnKey,
  activeKey,
  sortOrder,
}: {
  columnKey: SortKey
  activeKey: SortKey
  sortOrder: SortOrder
}) {
  if (activeKey !== columnKey) {
    return <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" aria-hidden="true" />
  }
  return sortOrder === "asc"
    ? <ArrowUp className="ml-1 inline h-4 w-4" aria-hidden="true" />
    : <ArrowDown className="ml-1 inline h-4 w-4" aria-hidden="true" />
}

interface RoutesTableProps {
  data: TopDestination[]
}

export const TopDestinationsTable = memo(function TopDestinationsTable({ data }: RoutesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const sortKey = (searchParams.get("sortKey") as SortKey) || "total_flights"
  const sortOrder = (searchParams.get("sortOrder") as SortOrder) || "desc"

  const handleSort = (key: SortKey) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sortKey === key) {
      params.set("sortOrder", sortOrder === "asc" ? "desc" : "asc")
    } else {
      params.set("sortKey", key)
      params.set("sortOrder", key === "destination_city" ? "asc" : "desc")
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortOrder === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })
  }, [data, sortKey, sortOrder])

  const isMobile = useIsMobile()
  const displayLimit = isMobile ? 5 : 12

  if (data.length === 0) {
    return (
      <section className="cv-auto mx-auto max-w-5xl px-4 py-12">
        <div className="rounded-[2.5rem] border border-white/5 bg-card/10 p-16 text-center backdrop-blur-3xl shadow-2xl">
          <div className="mx-auto h-16 w-16 bg-muted/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <ArrowUpRight className="h-8 w-8 text-muted-foreground/40 rotate-45" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-bold text-foreground">No hay rutas por acá</h3>
          <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
            Probá ajustando los filtros de arriba (Origen, Destino o Aerolínea) para ver qué aparece.
          </p>
        </div>
      </section>
    )
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="cv-auto mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Rutas más <span className="text-primary text-glow-primary">Movidas</span>
          </h2>
          <p className="mt-1 text-sm font-medium text-muted-foreground leading-relaxed">
            Las rutas con más vuelos del período. <span className="text-foreground/80">Filtrá y ordená</span> para encontrar lo que buscás.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/30 p-1.5 border border-border/50 backdrop-blur-sm">
          {[
            { id: "total_flights", label: "Vuelos" },
            { id: "avg_delay_minutes", label: "Demora" },
            { id: "destination_city", label: "Ciudad" },
          ].map((option) => (
            <Button
              key={option.id}
              variant="ghost"
              size="sm"
              onClick={() => handleSort(option.id as SortKey)}
              className={cn(
                "h-8 px-4 text-xs font-bold transition-[background-color,color,box-shadow] rounded-lg motion-reduce:transition-none",
                sortKey === option.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              {option.label}
              {sortKey === option.id && (
                <SortIcon columnKey={option.id as SortKey} activeKey={sortKey} sortOrder={sortOrder} />
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedData.slice(0, displayLimit).map((route, index) => {
          const isHighDelay = route.avg_delay_minutes > 15;
          const isLowDelay = route.avg_delay_minutes < 5;

          return (
            <motion.div
              key={`${route.origin_airport_code}-${route.destination_country}-${route.destination_city}-${route.rank}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-card/40 p-5 backdrop-blur-xl shadow-lg hover:border-primary/30 transition-[transform,box-shadow,border-color,background-color] duration-500 hover:shadow-primary/5 hover:translate-y-[-2px] motion-reduce:transition-none motion-reduce:transform-none"
            >
              {/* Performance Indicator Strip */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1 transition-[width] duration-500 group-hover:w-1.5 motion-reduce:transition-none",
                  isHighDelay ? "bg-red-500" : isLowDelay ? "bg-emerald-500" : "bg-primary"
                )}
              />

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-[10px] font-black text-primary ring-1 ring-primary/30">
                    {route.rank}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Ruta #{route.rank}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
                  <span className="text-[10px] font-mono font-bold text-foreground">
                    {formatNumber(route.total_flights)} <span className="text-muted-foreground opacity-60">OPS</span>
                  </span>
                </div>
              </div>

              <div className="mb-6">
                {/* Route Visualization */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-none">
                      <div className="text-2xl font-black tracking-tighter text-foreground uppercase leading-none">
                        {route.origin_airport_code}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1 truncate max-w-[80px]">
                        {route.origin_city}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col items-center">
                      <div className="w-full h-px border-t border-dashed border-muted-foreground/30 relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-transparent">
                          <ArrowUpRight className="h-3.5 w-3.5 text-primary/60 group-hover:translate-x-1 group-hover:translate-y-[-4px] transition-transform duration-500 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-none text-right">
                      <div className="text-2xl font-black tracking-tighter text-foreground uppercase leading-none">
                        {route.destination_city.substring(0, 3)}
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight mt-1 truncate max-w-[80px]">
                        {route.destination_city}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3 text-muted-foreground/60" aria-hidden="true" />
                    <span className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-wider">Demora Promedio</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-xl font-black font-mono tracking-tight",
                      isHighDelay ? "text-red-500" : isLowDelay ? "text-emerald-500" : "text-primary"
                    )}>
                      {formatNumber(route.avg_delay_minutes, 1)}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">min</span>
                  </div>
                </div>

                {/* Decorative element instead of a button */}
                <div className="h-11 w-11 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:bg-primary/5 group-hover:border-primary/10 transition-[background-color,border-color] duration-300 motion-reduce:transition-none">
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary/40 transition-[color,transform] duration-500 motion-reduce:transition-none motion-reduce:transform-none" aria-hidden="true" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  )
})

TopDestinationsTable.displayName = "TopDestinationsTable"
