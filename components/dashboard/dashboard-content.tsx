"use client"

import dynamic from "next/dynamic"
import { useState, useMemo, useEffect, useCallback, useRef, useDeferredValue, useTransition, type ReactNode } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Hero } from "@/components/dashboard/hero"
import { Header } from "@/components/dashboard/header"
import { Filters } from "@/components/dashboard/filters"
import { Footer } from "@/components/dashboard/footer"
import { FAQ } from "@/components/dashboard/faq"
import { ChartSkeleton, KPISkeleton, TableSkeleton, Skeleton } from "@/components/dashboard/dashboard-skeleton"
import { useDashboardData } from "@/hooks/use-dashboard-data"
import { useIsMobile } from "@/hooks/use-mobile"
import { useInView } from "@/hooks/use-in-view"
import { usePrefersReducedData } from "@/hooks/use-reduced-data"
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

interface LazySectionProps {
    children: ReactNode
    fallback: ReactNode
    rootMargin?: string
    onVisible?: () => void
}

const LazySection = ({ children, fallback, rootMargin, onVisible }: LazySectionProps) => {
    const { ref, inView } = useInView<HTMLDivElement>({ rootMargin })
    const hasTriggered = useRef(false)

    useEffect(() => {
        if (!inView || hasTriggered.current) return
        hasTriggered.current = true
        onVisible?.()
    }, [inView, onVisible])

    return (
        <div ref={ref}>
            {inView ? children : fallback}
        </div>
    )
}

export function DashboardContent() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const {
        data,
        loading,
        detailsLoading,
        detailsLoaded,
        routesLoaded,
        error,
        loadDetails,
        loadRoutes,
    } = useDashboardData()
    const [, startTransition] = useTransition()
    const [isHydrated, setIsHydrated] = useState(false)
    const isMobile = useIsMobile()
    const prefersReducedData = usePrefersReducedData()
    const showHeroVideo = isHydrated
    const lazyMargin = isMobile ? "0px 0px" : "240px 0px"

    const isInitialMount = useRef(true)
    const hasSetDefaultOrigin = useRef(false)

    const [filters, setFilters] = useState<FilterState>(() => ({
        origin: searchParams.get("origin") || "",
        country: searchParams.get("country") || "",
        city: searchParams.get("city") || "",
        airline: searchParams.get("airline") || "",
        windowDays: searchParams.get("windowDays") || "60",
    }))

    const fallbackLookbackDays = Number(filters.windowDays || "60")
    const heroLookbackDays = data?.headline?.lookback_days ?? fallbackLookbackDays

    const deferredFilters = useDeferredValue(filters)
    const [detailsRequested, setDetailsRequested] = useState(false)
    const hasRoutes = routesLoaded
    const showDetailContent = detailsLoaded && !detailsLoading

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsHydrated(true)
    }, [])

    useEffect(() => {
        if (!isMobile) {
            loadRoutes()
            return
        }
        if (routesLoaded) return

        let triggered = false
        const handleUserIntent = () => {
            if (triggered) return
            triggered = true
            loadRoutes()
            cleanup()
        }

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === "Tab" || event.key === "Enter" || event.key === " ") {
                handleUserIntent()
            }
        }

        const cleanup = () => {
            window.removeEventListener("scroll", handleUserIntent)
            window.removeEventListener("pointerdown", handleUserIntent)
            window.removeEventListener("keydown", handleKeydown)
        }

        window.addEventListener("scroll", handleUserIntent, { passive: true })
        window.addEventListener("pointerdown", handleUserIntent, { passive: true })
        window.addEventListener("keydown", handleKeydown)

        return cleanup
    }, [isMobile, routesLoaded, loadRoutes])

    const handleDetailsVisible = useCallback(() => {
        if (detailsLoaded || detailsRequested) return
        setDetailsRequested(true)
        loadRoutes()
        loadDetails()
    }, [detailsLoaded, detailsRequested, loadDetails, loadRoutes])

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        const currentQueryString = searchParams.toString()
        const params = new URLSearchParams(currentQueryString)
        const syncParam = (key: keyof FilterState, value: string) => {
            const currentValue = searchParams.get(key) || ""
            if (value) {
                if (currentValue !== value) {
                    params.set(key, value)
                }
            } else if (currentValue) {
                params.delete(key)
            }
        }

        syncParam("origin", filters.origin)
        syncParam("country", filters.country)
        syncParam("city", filters.city)
        syncParam("airline", filters.airline)
        syncParam(
            "windowDays",
            filters.windowDays && filters.windowDays !== "60" ? filters.windowDays : ""
        )

        const queryString = params.toString()
        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname
        const currentUrl = currentQueryString ? `${pathname}?${currentQueryString}` : pathname

        if (nextUrl === currentUrl) {
            return
        }

        startTransition(() => {
            router.replace(nextUrl, {
                scroll: false
            })
        })
    }, [filters, router, pathname, searchParams, startTransition])

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

    const shouldComputeRoutes = (detailsRequested || detailsLoaded) && hasRoutes
    const showRouteDetails = shouldComputeRoutes

    const filteredRoutes = useMemo(() => {
        if (!shouldComputeRoutes || !data?.routes?.length) return []
        return filterRoutes(data.routes, {
            origin: deferredFilters.origin || undefined,
            country: deferredFilters.country || undefined,
            city: deferredFilters.city || undefined,
            airline: deferredFilters.airline || undefined,
        })
    }, [shouldComputeRoutes, data, deferredFilters.origin, deferredFilters.country, deferredFilters.city, deferredFilters.airline])

    const routeMetrics = useMemo(() => {
        if (!shouldComputeRoutes) {
            return {
                totalFlights: 0,
                totalOnTime: 0,
                totalDelayed: 0,
                totalCancelled: 0,
                avgDelayMinutes: 0,
            }
        }
        return aggregateRoutes(filteredRoutes)
    }, [filteredRoutes, shouldComputeRoutes])

    const topDestinations = useMemo(() => {
        if (!shouldComputeRoutes) return []
        return getTopDestinationsFromRoutes(filteredRoutes, 15)
    }, [filteredRoutes, shouldComputeRoutes])

    const topDelays = useMemo(() => {
        if (!detailsLoaded) return []
        const records = data ? getTopDelays(data.tops) : []
        return records.filter((record) => {
            if (deferredFilters.origin && record.origin_airport_code !== deferredFilters.origin) return false
            if (deferredFilters.country && record.destination_country !== deferredFilters.country) return false
            if (deferredFilters.city && record.destination_city !== deferredFilters.city) return false
            return true
        })
    }, [data, deferredFilters.origin, deferredFilters.country, deferredFilters.city, detailsLoaded])

    const filteredBuckets = useMemo(() => {
        if (!data || !shouldComputeRoutes) return []

        const { totalOnTime, totalCancelled, totalDelayed } = routeMetrics

        if (deferredFilters.airline) {
            const airlineData = data.airlines.find(a => a.airline_name === deferredFilters.airline)
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
    }, [data, deferredFilters.airline, routeMetrics, shouldComputeRoutes])

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
        <main id="main-content" className="min-h-screen bg-background">
            <Header />

            <div className="relative min-h-[85vh] flex flex-col justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {showHeroVideo ? (
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            preload="metadata"
                            poster={asset("/imagen.jpg")}
                            aria-hidden="true"
                            className="h-full w-full object-cover scale-105 brightness-[0.35] saturate-[0.7]"
                        >
                            <source
                                src={asset("/hero-video.mp4")}
                                type="video/mp4"
                            />
                        </video>
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/40 to-background" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_70%)]" />
                </div>

                <div className="relative z-10">
                    <Hero
                        generatedAt={data?.generatedAt}
                        lookbackDays={heroLookbackDays}
                    />
                    <Filters
                        routes={data?.routes ?? []}
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

            {error && !data && (
                <section className="mx-auto max-w-5xl px-4 py-16 text-center">
                    <p className="text-sm font-mono text-red-400">
                        No pudimos cargar los datos. Intentá nuevamente en unos minutos.
                    </p>
                </section>
            )}

            {!data && loading ? (
                <div className="pt-12">
                    <div className="mx-auto max-w-5xl px-4 py-6">
                        <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <KPISkeleton />
                </div>
            ) : data ? (
                <div className="space-y-12 sm:space-y-20 pb-20 mt-12 sm:mt-20">
                    <LazySection fallback={<ChartSkeleton />} rootMargin={lazyMargin} onVisible={handleDetailsVisible}>
                        {showRouteDetails ? (
                            <BucketDistributionChart
                                buckets={filteredBuckets}
                                avgDelayMinutes={routeMetrics.avgDelayMinutes}
                                lookbackDays={data.headline.lookback_days}
                            />
                        ) : (
                            <ChartSkeleton />
                        )}
                    </LazySection>
                    <LazySection fallback={<ChartSkeleton />} rootMargin={lazyMargin} onVisible={handleDetailsVisible}>
                        {showRouteDetails ? <AirlinesRanking data={filteredRoutes} /> : <ChartSkeleton />}
                    </LazySection>
                    <LazySection fallback={<TableSkeleton />} rootMargin={lazyMargin} onVisible={handleDetailsVisible}>
                        {showRouteDetails ? <TopDestinationsTable data={topDestinations} /> : <TableSkeleton />}
                    </LazySection>
                    <LazySection fallback={<TableSkeleton />} rootMargin={lazyMargin} onVisible={handleDetailsVisible}>
                        {showDetailContent ? (
                            <SmartInsights
                                topDelays={topDelays}
                                gates={data.gates}
                            />
                        ) : (
                            <TableSkeleton />
                        )}
                    </LazySection>
                    <LazySection fallback={<ChartSkeleton />} rootMargin={lazyMargin} onVisible={handleDetailsVisible}>
                        {showDetailContent ? <TrendChart data={data.dailyStatus} /> : <ChartSkeleton />}
                    </LazySection>
                    <LazySection fallback={<ChartSkeleton />} rootMargin={lazyMargin} onVisible={handleDetailsVisible}>
                        {showDetailContent ? <GatesAnalysis gates={data.gates} /> : <ChartSkeleton />}
                    </LazySection>
                </div>
            ) : null}

            <FAQ />

            {data && (
                <Footer
                    generatedAt={data.generatedAt}
                    lookbackDays={data.headline.lookback_days}
                />
            )}
        </main>
    )
}
