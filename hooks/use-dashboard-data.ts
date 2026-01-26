"use client"

import { useEffect, useState } from "react"
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

async function fetchExport<T>(url: string): Promise<T[]> {
  const response = await fetch(url, { cache: "no-store" })
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
  // En GH Pages buscaremos el JSON estático generado en el build por sync-data.ts
  const response = await fetch("/data/manifest.json", { cache: "no-store" })
  if (!response.ok) {
    throw new Error("Failed to fetch manifest. Did you run npm run sync-data?")
  }
  return response.json()
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const manifest = await fetchManifest()
        const urls = manifest.urls

        const [headlineRows, airlines, tops, buckets, dailyStatus, routes, gates] =
          await Promise.all([
            fetchExport<HeadlineData>(urls.headline),
            fetchExport<AirlineBreakdown>(urls.airline_breakdown),
            fetchExport<TopRecord>(urls.tops),
            fetchExport<BucketDistribution>(urls.bucket_distribution),
            fetchExport<DailyStatus>(urls.daily_status),
            fetchExport<RouteMetric>(urls.routes_metrics),
            urls.gates_analysis
              ? fetchExport<GateMetrics>(urls.gates_analysis).catch(() => [])
              : Promise.resolve([]),
          ])

        const headline = headlineRows[0] ?? {
          total_flights: 0,
          cancelled_flights: 0,
          delayed_over_30min: 0,
          delayed_over_45min: 0,
          avg_delay_minutes: 0,
          lookback_days: 0,
          dbt_updated_at: new Date().toISOString(),
        }

        if (active) {
          setData({
            headline,
            airlines,
            tops,
            buckets,
            dailyStatus,
            routes,
            gates,
            generatedAt: manifest.generated_at,
            expiresAt: manifest.expires_at,
          })
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Unexpected error")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return { data, loading, error }
}
