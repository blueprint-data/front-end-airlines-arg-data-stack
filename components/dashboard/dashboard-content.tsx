"use client"

import dynamic from "next/dynamic"
import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Hero } from "@/components/dashboard/hero"
import { Header } from "@/components/dashboard/header"
import { Filters } from "@/components/dashboard/filters"
import { Footer } from "@/components/dashboard/footer"
import { ChartSkeleton, KPISkeleton, TableSkeleton, Skeleton } from "@/components/dashboard/dashboard-skeleton"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import {
    getTopDestinationsFromRoutes,
    getTopDelays,
} from "@/lib/dashboard-utils"
import { aggregateRoutes, filterRoutes } from "@/lib/route-utils"
import { asset } from "@/lib/utils"

const AirlinesRanking = dynamic(() => import("@/components/dashboard/airlines-ranking").then(mod => mod.AirlinesRanking), {
    loading: () => <ChartSkeleton />
})
const TopDestinationsTable = dynamic(() => import("@/components/dashboard/routes-table").then(mod => mod.TopDestinationsTable), {
    loading: () => <TableSkeleton />
})
const TrendChart = dynamic(() => import("@/components/dashboard/trend-chart").then(mod => mod.TrendChart), {
    loading: () => <ChartSkeleton />
})
const GatesAnalysis = dynamic(() => import("@/components/dashboard/gates-analysis").then(mod => mod.GatesAnalysis), {
    loading: () => <ChartSkeleton />
})
const SmartInsights = dynamic(() => import("@/components/dashboard/smart-insights").then(mod => mod.SmartInsights), {
    loading: () => <TableSkeleton />
})
const BucketDistributionChart = dynamic(() => import("@/components/dashboard/bucket-distribution").then(mod => mod.BucketDistributionChart), {
    loading: () => <ChartSkeleton />
})

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

    const isInitialMount = useRef(true)
    const hasSetDefaultOrigin = useRef(false)

    const [filters, setFilters] = useState<FilterState>(() => ({
        origin: searchParams.get("origin") || "",
        country: searchParams.get("country") || "",
        city: searchParams.get("city") || "",
        airline: searchParams.get("airline") || "",
        windowDays: searchParams.get("windowDays") || "60",
    }))

    useEffect(() => {
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

    const updateFilters = useCallback((updates: Partial<FilterState>) => {
        setFilters(prev => ({ ...prev, ...updates }))
    }, [])

    useEffect(() => {
        if (!hasSetDefaultOrigin.current && !filters.origin && data?.routes?.length) {
            const originsList = new Set(
                data.routes
                    .map((route) => route.origin_airport_code)
                    .filter((origin): origin is string => Boolean(origin))
            )

            if (originsList.size === 1) {
                const [onlyOrigin] = Array.from(originsList)
                if (onlyOrigin) {
                    // eslint-disable-next-line react-hooks/set-state-in-effect
                    setFilters(prev => ({ ...prev, origin: onlyOrigin }))
                }
            }

            hasSetDefaultOrigin.current = true
        }
    }, [data?.routes, filters.origin])

    useEffect(() => {
        if (data?.headline?.lookback_days) {
            const days = String(data.headline.lookback_days)
            if (!searchParams.has("windowDays") && filters.windowDays !== days) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setFilters(prev => ({ ...prev, windowDays: days }))
            }
        }
    }, [data?.headline?.lookback_days, searchParams, filters.windowDays])

    const filteredRoutes = useMemo(() => {
        if (!data?.routes) return []
        return filterRoutes(data.routes, {
            origin: filters.origin || undefined,
            country: filters.country || undefined,
            city: filters.city || undefined,
            airline: filters.airline || undefined,
        })
    }, [data, filters.origin, filters.country, filters.city, filters.airline])

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

    const filteredBuckets = useMemo(() => {
        if (!data) return []

        const { totalOnTime, totalCancelled, totalDelayed } = routeMetrics

        if (filters.airline) {
            const airlineData = data.airlines.find(a => a.airline_name === filters.airline)
            if (airlineData) {
                return [
                    { bucket: "on_time_or_early", total_flights: airlineData.on_time_or_early },
                    { bucket: "delay_15_0", total_flights: airlineData.delay_15_0 },
                    { bucket: "delay_30_15", total_flights: airlineData.delay_30_15 },
                    { bucket: "delay_45_30", total_flights: airlineData.delay_45_30 },
                    { bucket: "delay_over_45", total_flights: airlineData.delay_over_45 },
                    { bucket: "cancelled", total_flights: airlineData.cancelled_flights },
                ]
            }
        }

        const globalBuckets = data.buckets
        const globalDelayedTotal = globalBuckets
            .filter(b => b.bucket.includes("delay_"))
            .reduce((sum, b) => sum + b.total_flights, 0)

        return [
            { bucket: "on_time_or_early", total_flights: totalOnTime },
            ...globalBuckets
                .filter(b => b.bucket.includes("delay_"))
                .map(b => ({
                    bucket: b.bucket,
                    total_flights: globalDelayedTotal > 0
                        ? Math.round((b.total_flights / globalDelayedTotal) * totalDelayed)
                        : 0
                })),
            { bucket: "cancelled", total_flights: totalCancelled },
        ]
    }, [data, filters.airline, routeMetrics])

    const handleSetOrigin = useCallback((val: string) => {
        updateFilters({
            origin: val,
            country: "",
            city: "",
            airline: "",
        })
    }, [updateFilters])

    const handleSetCountry = useCallback((val: string) => {
        updateFilters({
            country: val,
            city: "",
            airline: "",
        })
    }, [updateFilters])

    const handleSetCity = useCallback((val: string) => {
        updateFilters({
            city: val,
            airline: "",
        })
    }, [updateFilters])

    const handleSetAirline = useCallback((val: string) => {
        updateFilters({ airline: val })
    }, [updateFilters])

    const handleSetWindowDays = useCallback((val: string) => {
        updateFilters({ windowDays: val })
    }, [updateFilters])

    return (
        <main className="min-h-screen bg-background">
            <Header />

            {loading ? (
                <div className="pt-20">
                    <div className="mx-auto max-w-5xl px-4 py-8">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <KPISkeleton />
                </div>
            ) : error ? (
                <section className="mx-auto max-w-5xl px-4 py-32 text-center">
                    <p className="text-sm font-mono text-red-400">
                        No pudimos cargar los datos. Intentá nuevamente en unos minutos.
                    </p>
                </section>
            ) : data ? (
                <>
                    <div className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden">
                        <div className="absolute inset-0 z-0 overflow-hidden">
                            <video
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="h-full w-full object-cover scale-105 brightness-[0.35] saturate-[0.7]"
                            >
                                <source
                                    src={asset("/hero-video.mp4")}
                                    type="video/mp4"
                                />
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_70%)]" />
                        </div>

                        <div className="relative z-10">
                            <Hero
                                generatedAt={data.generatedAt}
                                lookbackDays={data.headline.lookback_days}
                            />
                            <Filters
                                routes={data.routes}
                                origin={filters.origin}
                                setOrigin={handleSetOrigin}
                                country={filters.country}
                                setCountry={handleSetCountry}
                                city={filters.city}
                                setCity={handleSetCity}
                                airline={filters.airline}
                                setAirline={handleSetAirline}
                                windowDays={filters.windowDays}
                                setWindowDays={handleSetWindowDays}
                            />
                        </div>
                    </div>

                    <div className="space-y-12 sm:space-y-20 pb-20 mt-12 sm:mt-20">
                        <BucketDistributionChart
                            buckets={filteredBuckets}
                            avgDelayMinutes={routeMetrics.avgDelayMinutes}
                        />
                        <AirlinesRanking data={filteredRoutes} />
                        <TopDestinationsTable data={topDestinations} />
                        <SmartInsights
                            topDelays={topDelays}
                            gates={data.gates}
                        />
                        <TrendChart data={data.dailyStatus} />
                        <GatesAnalysis gates={data.gates} />
                    </div>
                </>
            ) : null}

            {data && (
                <Footer
                    generatedAt={data.generatedAt}
                    lookbackDays={data.headline.lookback_days}
                />
            )}
        </main>
    )
}
