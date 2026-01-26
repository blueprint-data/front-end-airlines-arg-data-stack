// Manifest response from /api/manifest
export interface ManifestResponse {
  generated_at: string
  expires_at: string
  expiration_days: number
  urls: {
    headline: string
    airline_breakdown: string
    tops: string
    bucket_distribution: string
    daily_status: string
    routes_metrics: string
    gates_analysis?: string
  }
}

// headline.json
export interface HeadlineData {
  total_flights: number
  cancelled_flights: number
  delayed_over_30min: number
  delayed_over_45min: number
  avg_delay_minutes: number
  lookback_days: number
  dbt_updated_at: string
}

// airline_breakdown.json
export interface AirlineBreakdown {
  airline_name: string
  total_flights: number
  cancelled_flights: number
  avg_delay_minutes: number
  hours_lost: number
  delay_over_45: number
  delay_45_30: number
  delay_30_15: number
  delay_15_0: number
  on_time_or_early: number
  dbt_updated_at: string
}

// tops.json row
export interface TopRecord {
  record_type: "top_destination" | "top_delay" | "top_early"
  rank: number
  // For destinations
  destination_city?: string
  destination_country?: string
  total_flights?: number
  avg_delay_minutes?: number
  // For delays/early
  flight_number?: string
  origin_airport_code?: string
  destination_airport_code?: string
  delay_minutes?: number
  scheduled_departure_time?: string
  actual_departure_time?: string
}

// bucket_distribution.json
export interface BucketDistribution {
  bucket: string
  total_flights: number
}

// daily_status.json
export interface DailyStatus {
  flight_date: string
  total_flights: number
  cancelled_flights: number
  delayed_over_30min: number
  avg_delay_minutes: number
  top_destination_city: string | null
  top_destination_country: string | null
  dbt_updated_at: string
}

// gates_analysis.json
export interface GateMetrics {
  gate: string
  total_flights: number
  avg_delay_minutes: number
  delayed_flights: number
  on_time_flights: number
  on_time_percentage: number
  max_delay_minutes: number
  time_distribution: number[]
}

// Legacy types (keeping for backwards compatibility)
export interface RouteMetric {
  origin_airport_code: string
  origin_airport_name: string
  origin_city: string
  origin_country: string
  destination_airport_code: string
  destination_airport_name: string
  destination_city: string
  destination_country: string
  airline_code: string
  airline_name: string
  window_start_date: string
  window_end_date: string
  total_flights: number
  total_completed_flights: number
  total_cancelled_flights: number
  total_delayed_flights: number
  total_on_time_flights: number
  avg_delay_minutes: number
  on_time_percentage: number
  delayed_percentage: number
  cancellation_rate: number
}

export interface FilterState {
  origin: string
  destinationCountry: string
  destinationCity: string
  airline: string
  windowDays: 30 | 60 | 90
}

// Dashboard combined data
export interface DashboardData {
  headline: HeadlineData
  airlines: AirlineBreakdown[]
  tops: TopRecord[]
  buckets: BucketDistribution[]
  dailyStatus: DailyStatus[]
  routes: RouteMetric[]
  gates: GateMetrics[]
  generatedAt: string
  expiresAt: string
}
