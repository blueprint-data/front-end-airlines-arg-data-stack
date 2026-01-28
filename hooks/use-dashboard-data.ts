import { useCallback, useEffect, useRef, useState } from "react"
import type {
  AirlineBreakdown,
  BucketDistribution,
  DailyStatus,
  DashboardData,
  GateMetrics,
  HeadlineData,
  ManifestResponse,
  TopRecord,
  RouteMetric,
} from "@/lib/types"

type ExportPayload<T> = {
  metadata?: {
    exported_at?: string
    source?: string
    total_records?: number
  }
  data?: T[]
}

type DetailData = {
  airlines: AirlineBreakdown[]
  tops: TopRecord[]
  buckets: BucketDistribution[]
  dailyStatus: DailyStatus[]
  gates: GateMetrics[]
}

const STORAGE_KEY = "dashboard-data-cache-v1"
const STORAGE_VERSION = 1
const DEFAULT_CACHE: RequestCache =
  process.env.NODE_ENV === "production" ? "force-cache" : "no-store"

type StoredDashboardCache = {
  version: number
  savedAt: string
  expiresAt?: string
  data: DashboardData
}

const getDefaultHeadline = (): HeadlineData => ({
  total_flights: 0,
  cancelled_flights: 0,
  delayed_over_30min: 0,
  delayed_over_45min: 0,
  avg_delay_minutes: 0,
  lookback_days: 0,
  dbt_updated_at: new Date().toISOString(),
})

const normalizeDetails = (details?: Partial<DetailData>): DetailData => ({
  airlines: details?.airlines ?? [],
  tops: details?.tops ?? [],
  buckets: details?.buckets ?? [],
  dailyStatus: details?.dailyStatus ?? [],
  gates: details?.gates ?? [],
})

const buildDashboardData = (input: {
  headline: HeadlineData
  routes?: RouteMetric[]
  details?: Partial<DetailData>
  generatedAt?: string
  expiresAt?: string
}): DashboardData => {
  const details = normalizeDetails(input.details)
  return {
    headline: input.headline,
    airlines: details.airlines,
    tops: details.tops,
    buckets: details.buckets,
    dailyStatus: details.dailyStatus,
    routes: input.routes ?? [],
    gates: details.gates,
    generatedAt: input.generatedAt ?? "",
    expiresAt: input.expiresAt ?? "",
  }
}

const clearStoredDashboard = () => {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

const readStoredDashboard = (): DashboardData | null => {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDashboardCache
    if (!parsed?.data || parsed.version !== STORAGE_VERSION) {
      clearStoredDashboard()
      return null
    }
    const expiresAt = Date.parse(parsed.expiresAt ?? "")
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) {
      clearStoredDashboard()
      return null
    }
    return parsed.data
  } catch {
    return null
  }
}

const writeStoredDashboard = (data: DashboardData) => {
  if (typeof window === "undefined") return
  try {
    const payload: StoredDashboardCache = {
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      expiresAt: data.expiresAt,
      data,
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {}
}

const isExpired = (expiresAt?: string) => {
  const expiresAtMs = Date.parse(expiresAt ?? "")
  if (!Number.isFinite(expiresAtMs)) return true
  return Date.now() > expiresAtMs
}

const initialCachedData = readStoredDashboard()

let cachedDashboardData: DashboardData | null = initialCachedData
let cachedManifest: ManifestResponse | null = null
let cachedHeadline: HeadlineData | null = initialCachedData?.headline ?? null
let cachedRoutes: RouteMetric[] | null =
  initialCachedData?.routes ?? null
let cachedDetails: DetailData | null = initialCachedData
  ? {
      airlines: initialCachedData.airlines,
      tops: initialCachedData.tops,
      buckets: initialCachedData.buckets,
      dailyStatus: initialCachedData.dailyStatus,
      gates: initialCachedData.gates,
    }
  : null
let cachedExpiresAt: string | null = initialCachedData?.expiresAt ?? null
let cachedGeneratedAt: string | null = initialCachedData?.generatedAt ?? null

let cachedManifestPromise: Promise<ManifestResponse> | null = null
let cachedHeadlinePromise: Promise<HeadlineData> | null = null
let cachedRoutesPromise: Promise<RouteMetric[]> | null = null
let cachedDetailsPromise: Promise<DetailData> | null = null

const clearMemoryCache = () => {
  cachedDashboardData = null
  cachedManifest = null
  cachedHeadline = null
  cachedRoutes = null
  cachedDetails = null
  cachedExpiresAt = null
  cachedGeneratedAt = null
  cachedManifestPromise = null
  cachedHeadlinePromise = null
  cachedRoutesPromise = null
  cachedDetailsPromise = null
}

const ensureCacheFreshness = () => {
  if (cachedExpiresAt && isExpired(cachedExpiresAt)) {
    clearMemoryCache()
    clearStoredDashboard()
  }
}

const maybePersistDashboard = () => {
  if (!cachedHeadline || cachedRoutes === null || !cachedDetails) {
    return
  }
  if (!cachedExpiresAt || !cachedGeneratedAt) {
    return
  }
  const payload = buildDashboardData({
    headline: cachedHeadline,
    routes: cachedRoutes,
    details: cachedDetails,
    generatedAt: cachedGeneratedAt,
    expiresAt: cachedExpiresAt,
  })
  cachedDashboardData = payload
  writeStoredDashboard(payload)
}

async function fetchExport<T>(url: string, cache = DEFAULT_CACHE): Promise<T[]> {
  const response = await fetch(url, { cache })
  if (!response.ok) {
    throw new Error(`Failed to fetch export: ${response.status}`)
  }
  const payload: ExportPayload<T> | T[] = await response.json()
  if (Array.isArray(payload)) {
    return payload
  }
  return payload.data ?? []
}

async function fetchManifest(): Promise<ManifestResponse> {
  const manifestPath = "./data/manifest.json"
  const response = await fetch(manifestPath, { cache: DEFAULT_CACHE })
  if (!response.ok) {
    console.error(
      `Failed to fetch manifest from ${manifestPath}: ${response.status} ${response.statusText}`
    )
    throw new Error(`Failed to fetch manifest: ${response.status}`)
  }
  return response.json()
}

const waitForIdle = () => {
  if (typeof window === "undefined") return Promise.resolve()
  if ("requestIdleCallback" in window) {
    return new Promise<void>((resolve) => {
      window.requestIdleCallback(() => resolve())
    })
  }
  return new Promise<void>((resolve) => setTimeout(resolve, 0))
}

const fetchManifestCached = async () => {
  ensureCacheFreshness()
  if (cachedManifest && cachedExpiresAt && !isExpired(cachedExpiresAt)) {
    return cachedManifest
  }
  if (cachedManifestPromise) return cachedManifestPromise

  cachedManifestPromise = fetchManifest()
    .then((manifest) => {
      cachedManifest = manifest
      cachedExpiresAt = manifest.expires_at
      cachedGeneratedAt = manifest.generated_at
      return manifest
    })
    .finally(() => {
      cachedManifestPromise = null
    })

  return cachedManifestPromise
}

const fetchHeadlineCached = async () => {
  ensureCacheFreshness()
  if (cachedHeadline && cachedExpiresAt && !isExpired(cachedExpiresAt)) {
    return cachedHeadline
  }
  if (cachedHeadlinePromise) return cachedHeadlinePromise

  cachedHeadlinePromise = (async () => {
    const manifest = await fetchManifestCached()
    const rows = await fetchExport<HeadlineData>(manifest.urls.headline)
    const headline = rows[0] ?? getDefaultHeadline()
    cachedHeadline = headline
    maybePersistDashboard()
    return headline
  })().finally(() => {
    cachedHeadlinePromise = null
  })

  return cachedHeadlinePromise
}

const fetchRoutesCached = async () => {
  ensureCacheFreshness()
  if (cachedRoutes !== null && cachedExpiresAt && !isExpired(cachedExpiresAt)) {
    return cachedRoutes
  }
  if (cachedRoutesPromise) return cachedRoutesPromise

  cachedRoutesPromise = (async () => {
    const manifest = await fetchManifestCached()
    const routes = await fetchExport<RouteMetric>(manifest.urls.routes_metrics)
    cachedRoutes = routes
    maybePersistDashboard()
    return routes
  })().finally(() => {
    cachedRoutesPromise = null
  })

  return cachedRoutesPromise
}

const fetchDetailsCached = async () => {
  ensureCacheFreshness()
  if (cachedDetails && cachedExpiresAt && !isExpired(cachedExpiresAt)) {
    return cachedDetails
  }
  if (cachedDetailsPromise) return cachedDetailsPromise

  cachedDetailsPromise = (async () => {
    const manifest = await fetchManifestCached()
    const [airlines, tops, buckets, dailyStatus, gates] = await Promise.all([
      fetchExport<AirlineBreakdown>(manifest.urls.airline_breakdown),
      fetchExport<TopRecord>(manifest.urls.tops),
      fetchExport<BucketDistribution>(manifest.urls.bucket_distribution),
      fetchExport<DailyStatus>(manifest.urls.daily_status),
      manifest.urls.gates_analysis
        ? fetchExport<GateMetrics>(manifest.urls.gates_analysis).catch(() => [])
        : Promise.resolve([]),
    ])

    const details = { airlines, tops, buckets, dailyStatus, gates }
    cachedDetails = details
    await fetchHeadlineCached()
    await fetchRoutesCached()
    maybePersistDashboard()
    return details
  })().finally(() => {
    cachedDetailsPromise = null
  })

  return cachedDetailsPromise
}

const getCachedFullData = () => {
  if (cachedDashboardData && !isExpired(cachedDashboardData.expiresAt)) {
    return cachedDashboardData
  }
  return null
}

const getCachedBaseData = () => {
  ensureCacheFreshness()
  if (!cachedHeadline || !cachedExpiresAt) return null
  return buildDashboardData({
    headline: cachedHeadline,
    routes: cachedRoutes ?? [],
    details: cachedDetails ?? undefined,
    generatedAt: cachedGeneratedAt ?? "",
    expiresAt: cachedExpiresAt,
  })
}

export function useDashboardData() {
  const initialData = getCachedFullData() ?? getCachedBaseData()
  const [data, setData] = useState<DashboardData | null>(initialData)
  const [loading, setLoading] = useState(() => !initialData)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsLoaded, setDetailsLoaded] = useState(() => Boolean(cachedDetails))
  const [routesLoading, setRoutesLoading] = useState(false)
  const [routesLoaded, setRoutesLoaded] = useState(() => cachedRoutes !== null)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadBase = async () => {
      try {
        setLoading(true)
        setError(null)
        const headline = await fetchHeadlineCached()
        const manifest = await fetchManifestCached()
        const baseData = buildDashboardData({
          headline,
          routes: cachedRoutes ?? [],
          details: cachedDetails ?? undefined,
          generatedAt: manifest.generated_at,
          expiresAt: manifest.expires_at,
        })

        if (!active) return
        setData(baseData)
        setLoading(false)
        if (cachedDetails) setDetailsLoaded(true)
        if (cachedRoutes !== null) setRoutesLoaded(true)
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unexpected error")
          setLoading(false)
        }
      }
    }

    if (!initialData) {
      loadBase()
    } else {
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [initialData])

  const loadRoutes = useCallback(async () => {
    if (routesLoaded || routesLoading) return
    if (!mountedRef.current) return

    setRoutesLoading(true)
    try {
      const routes = await fetchRoutesCached()
      if (!mountedRef.current) return
      setData((prev) => (prev ? { ...prev, routes } : prev))
      setRoutesLoaded(true)
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Unexpected error")
      }
    } finally {
      if (mountedRef.current) {
        setRoutesLoading(false)
      }
    }
  }, [routesLoaded, routesLoading])

  const loadDetails = useCallback(async () => {
    if (detailsLoaded || detailsLoading) return

    if (getCachedFullData()) {
      setDetailsLoaded(true)
      setDetailsLoading(false)
      if (mountedRef.current) {
        setData(getCachedFullData())
      }
      return
    }

    if (cachedDetails && cachedExpiresAt && !isExpired(cachedExpiresAt)) {
      if (mountedRef.current) {
        setData((prev) => (prev ? { ...prev, ...cachedDetails } : prev))
        setDetailsLoaded(true)
      }
      return
    }

    if (!mountedRef.current) return
    setDetailsLoading(true)

    try {
      const details = await fetchDetailsCached()
      if (!mountedRef.current) return
      setData((prev) => (prev ? { ...prev, ...details } : prev))
      setDetailsLoaded(true)
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Unexpected error")
      }
    } finally {
      if (mountedRef.current) {
        setDetailsLoading(false)
      }
    }
  }, [detailsLoaded, detailsLoading])

  return {
    data,
    loading,
    detailsLoading,
    detailsLoaded,
    routesLoading,
    routesLoaded,
    error,
    loadDetails,
    loadRoutes,
  }
}
