"use client"

import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Hero } from "@/components/dashboard/hero"
import { Header } from "@/components/dashboard/header"
import { Filters } from "@/components/dashboard/filters"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { AirlinesRanking } from "@/components/dashboard/airlines-ranking"
import { TopDestinationsTable } from "@/components/dashboard/routes-table"
import { TrendChart } from "@/components/dashboard/trend-chart"
import { GatesAnalysis } from "@/components/dashboard/gates-analysis"
import { TopEvents } from "@/components/dashboard/top-events"
import { BucketDistributionChart } from "@/components/dashboard/bucket-distribution"
import { Footer } from "@/components/dashboard/footer"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import {
    getTopDestinationsFromRoutes,
    getTopDelays,
} from "@/lib/dashboard-utils"
import { aggregateRoutes, filterRoutes } from "@/lib/route-utils"

interface FilterState {
    origin: string
    country: string
    city: string
    airline: string
    windowDays: string
}

export function DashboardContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const { data, loading, error } = useDashboardData()

    // Track if this is initial mount to avoid URL sync on first render
    const isInitialMount = useRef(true)
    const hasSetDefaultOrigin = useRef(false)

    // Initialize local state from URL
    const [filters, setFilters] = useState<FilterState>(() => ({
        origin: searchParams.get("origin") || "",
        country: searchParams.get("country") || "",
        city: searchParams.get("city") || "",
        airline: searchParams.get("airline") || "",
        windowDays: searchParams.get("windowDays") || "60",
    }))

    // Sync filters to URL via useEffect (runs AFTER render, not during)
    useEffect(() => {
        // Skip initial mount to avoid unnecessary URL update
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        const params = new URLSearchParams()
        if (filters.origin) params.set("origin", filters.origin)
        if (filters.country) params.set("country", filters.country)
        if (filters.city) params.set("city", filters.city)
        if (filters.airline) params.set("airline", filters.airline)
        if (filters.windowDays && filters.windowDays !== "60") {
            params.set("windowDays", filters.windowDays)
        }

        const queryString = params.toString()
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
            scroll: false
        })
    }, [filters, router, pathname])

    // Single update function that handles all filter changes atomically
    const updateFilters = useCallback((updates: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...updates }))
    }, [])

    // Set default origin only when there's a single option
    useEffect(() => {
        if (!hasSetDefaultOrigin.current && !filters.origin && data?.routes?.length) {
            const origins = new Set(
                data.routes
                    .map((route) => route.origin_airport_code)
                    .filter((origin): origin is string => Boolean(origin))
            )

            if (origins.size === 1) {
                const [onlyOrigin] = origins
                if (onlyOrigin) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setFilters(prev => ({ ...prev, origin: onlyOrigin }))
                }
            }

            hasSetDefaultOrigin.current = true
        }
    }, [data?.routes, filters.origin])

    // Update windowDays from data (only if user hasn't manually set it)
    useEffect(() => {
        if (data?.headline?.lookback_days) {
            const days = String(data.headline.lookback_days)
            if (!searchParams.has("windowDays") && filters.windowDays !== days) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFilters(prev => ({ ...prev, windowDays: days }))
            }
        }
    }, [data?.headline?.lookback_days, searchParams, filters.windowDays])

    // Memoized filtered data
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const filteredRoutes = useMemo(() => {
        if (!data?.routes?.length) return []
        return filterRoutes(data.routes, {
            origin: filters.origin || undefined,
            country: filters.country || undefined,
            city: filters.city || undefined,
            airline: filters.airline || undefined,
        })
    }, [data?.routes, filters.origin, filters.country, filters.city, filters.airline])

    const routeMetrics = useMemo(
        () => aggregateRoutes(filteredRoutes),
        [filteredRoutes]
    )

    const topDestinations = useMemo(
        () => getTopDestinationsFromRoutes(filteredRoutes, 15),
        [filteredRoutes]
    )

    const topDelays = useMemo(() => {
        const records = data ? getTopDelays(data.tops) : []
        return records.filter((record) => {
            if (filters.origin && record.origin_airport_code !== filters.origin) return false
            if (filters.country && record.destination_country !== filters.country) return false
            if (filters.city && record.destination_city !== filters.city) return false
            return true
        })
    }, [data, filters.origin, filters.country, filters.city])

    return (
        <main className="min-h-screen bg-background">
            <Header />
            <Hero
                generatedAt={data?.generatedAt}
                lookbackDays={data?.headline.lookback_days}
            />

            {loading ? (
                <section className="mx-auto max-w-5xl px-4 py-16 text-center">
                    <p className="text-sm font-mono text-muted-foreground">
                        Cargando datos públicos…
                    </p>
                </section>
            ) : error ? (
                <section className="mx-auto max-w-5xl px-4 py-16 text-center">
                    <p className="text-sm font-mono text-red-400">
                        No pudimos cargar los datos. Intentá nuevamente en unos minutos.
                    </p>
                </section>
            ) : data ? (
                <>
                    <Filters
                        routes={data.routes}
                        origin={filters.origin}
                        setOrigin={(val) => {
                            // Reset dependents atomically
                            updateFilters({
                                origin: val,
                                country: "",
                                city: "",
                                airline: "",
                            })
                        }}
                        country={filters.country}
                        setCountry={(val) => {
                            updateFilters({
                                country: val,
                                city: "",
                                airline: "",
                            })
                        }}
                        city={filters.city}
                        setCity={(val) => {
                            updateFilters({
                                city: val,
                                airline: "",
                            })
                        }}
                        airline={filters.airline}
                        setAirline={(val) => updateFilters({ airline: val })}
                        windowDays={filters.windowDays}
                        setWindowDays={(val) => updateFilters({ windowDays: val })}
                    />

                    <KPICards
                        totalFlights={routeMetrics.totalFlights}
                        onTimePercentage={
                            routeMetrics.totalFlights > 0
                                ? (routeMetrics.totalOnTime / routeMetrics.totalFlights) * 100
                                : 0
                        }
                        cancellationRate={
                            routeMetrics.totalFlights > 0
                                ? (routeMetrics.totalCancelled / routeMetrics.totalFlights) * 100
                                : 0
                        }
                        avgDelayMinutes={routeMetrics.avgDelayMinutes}
                    />

                    <BucketDistributionChart buckets={data.buckets} />

                    <AirlinesRanking data={filteredRoutes} />

                    <TopDestinationsTable data={topDestinations} />

                    <TopEvents topDelays={topDelays} />

                    <TrendChart data={data.dailyStatus} />

                    <GatesAnalysis gates={data.gates} />

                    <Footer
                        generatedAt={data.generatedAt}
                        lookbackDays={data.headline.lookback_days}
                    />
                </>
            ) : null}
        </main>
    )
}
