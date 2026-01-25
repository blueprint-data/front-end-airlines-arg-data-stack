import type { RouteMetric, TopRecord } from "@/lib/types"

export interface TopDestination {
  destination_city: string
  destination_country: string
  total_flights: number
  avg_delay_minutes: number
  rank: number
}

export function getTopDestinations(tops: TopRecord[]): TopDestination[] {
  return tops
    .filter((record) => record.record_type === "top_destination")
    .map((record) => ({
      destination_city: record.destination_city ?? "",
      destination_country: record.destination_country ?? "",
      total_flights: record.total_flights ?? 0,
      avg_delay_minutes: record.avg_delay_minutes ?? 0,
      rank: record.rank,
    }))
    .filter((record) => record.destination_city && record.destination_country)
    .sort((a, b) => a.rank - b.rank)
}

export function getTopDestinationsFromRoutes(
  routes: RouteMetric[],
  limit = 10
): TopDestination[] {
  const map = new Map<string, TopDestination>()

  for (const route of routes) {
    const key = `${route.destination_city}__${route.destination_country}`
    const existing = map.get(key)
    if (existing) {
      const totalFlights = existing.total_flights + route.total_flights
      const weightedDelay =
        existing.avg_delay_minutes * existing.total_flights +
        route.avg_delay_minutes * route.total_flights
      existing.total_flights = totalFlights
      existing.avg_delay_minutes =
        totalFlights > 0 ? weightedDelay / totalFlights : 0
    } else {
      map.set(key, {
        destination_city: route.destination_city,
        destination_country: route.destination_country,
        total_flights: route.total_flights,
        avg_delay_minutes: route.avg_delay_minutes,
        rank: 0,
      })
    }
  }

  return Array.from(map.values())
    .filter((item) => item.destination_city && item.destination_country)
    .sort((a, b) => b.total_flights - a.total_flights)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }))
}

export function getTopDelays(tops: TopRecord[]) {
  return tops
    .filter((record) => record.record_type === "top_delay")
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
}

export function getTopEarly(tops: TopRecord[]) {
  return tops
    .filter((record) => record.record_type === "top_early")
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
}

export function getUniqueCountries(destinations: TopDestination[]) {
  return [...new Set(destinations.map((d) => d.destination_country))].sort()
}

export function getUniqueCities(
  destinations: TopDestination[],
  country?: string
) {
  const filtered = country
    ? destinations.filter((d) => d.destination_country === country)
    : destinations
  return [...new Set(filtered.map((d) => d.destination_city))].sort()
}
