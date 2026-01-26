"use client"

import { motion } from "framer-motion"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
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
    return <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />
  }
  return sortOrder === "asc"
    ? <ArrowUp className="ml-1 inline h-4 w-4" />
    : <ArrowDown className="ml-1 inline h-4 w-4" />
}

interface RoutesTableProps {
  data: TopDestination[]
}

type SortKey = "destination_city" | "avg_delay_minutes" | "total_flights"
type SortOrder = "asc" | "desc"



export function TopDestinationsTable({ data }: RoutesTableProps) {
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

  const sortedData = [...data].sort((a, b) => {
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

  if (data.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-xl border border-border bg-card/50 p-12 text-center backdrop-blur-sm">
          <p className="text-lg text-muted-foreground">
            No hay datos disponibles para los filtros seleccionados.
          </p>
          <p className="mt-2 text-sm font-mono text-muted-foreground">
            Probá ajustando el aeropuerto de origen o el destino.
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
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">
          Top rutas del período
        </h2>
        <p className="mt-1 text-sm font-mono text-muted-foreground">
          Ranking por volumen de vuelos según filtros activos
        </p>
      </div>

      {/* Mobile cards */}
      <div className="grid gap-3 md:hidden">
        {sortedData.map((route, index) => (
          <motion.div
            key={`${route.origin_airport_code}-${route.destination_country}-${route.destination_city}-${route.rank}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className="rounded-lg border border-border bg-card/60 p-4 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-mono text-muted-foreground">Destino</p>
                <p className="text-base font-semibold text-foreground leading-snug">
                  {route.destination_city || "Sin ciudad"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {route.destination_country || "Sin país"}
                </p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                #{route.rank}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-mono text-muted-foreground">Origen</p>
                <p className="font-semibold text-foreground">
                  {route.origin_airport_code || "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {route.origin_city || "Sin ciudad"}
                </p>
              </div>
              <div className="flex flex-col items-end justify-center gap-1 text-right">
                <p className="text-xs font-mono text-muted-foreground">Demora prom.</p>
                <p className="font-semibold text-foreground">
                  {formatNumber(route.avg_delay_minutes)} min
                </p>
                <p className="text-xs font-mono text-muted-foreground">Vuelos {formatNumber(route.total_flights)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card/50 backdrop-blur-sm md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">
                  <span className="text-sm font-semibold text-foreground">
                    Origen
                  </span>
                </TableHead>
                <TableHead className="w-[260px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("destination_city")}
                    className="h-auto px-0 font-semibold hover:bg-transparent"
                  >
                    Destino
                    <SortIcon columnKey="destination_city" activeKey={sortKey} sortOrder={sortOrder} />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("avg_delay_minutes")}
                    className="h-auto px-0 font-semibold hover:bg-transparent"
                  >
                    Demora prom.
                    <SortIcon columnKey="avg_delay_minutes" activeKey={sortKey} sortOrder={sortOrder} />
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("total_flights")}
                    className="h-auto px-0 font-semibold hover:bg-transparent"
                  >
                    Total vuelos
                    <SortIcon columnKey="total_flights" activeKey={sortKey} sortOrder={sortOrder} />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((route, index) => (
                <motion.tr
                  key={`${route.origin_airport_code}-${route.destination_country}-${route.destination_city}-${route.rank}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group border-b border-border transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">
                    <div>
                      <span className="text-foreground">
                        {route.origin_airport_code || "—"}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {route.origin_city || "Sin ciudad"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <span className="text-foreground">
                        {route.destination_city || "Sin ciudad"}
                      </span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {route.destination_country || "Sin país"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ranking #{route.rank}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(route.avg_delay_minutes)} min
                  </TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {formatNumber(route.total_flights)}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.section>
  )
}
