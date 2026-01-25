import type { RouteMetric } from "@/lib/types"

export interface RouteOrigin {
  code: string
  name: string
  city: string
}

export interface RouteAirline {
  code: string
  name: string
}

export interface RouteTotals {
  totalFlights: number
  totalOnTime: number
  totalDelayed: number
  totalCancelled: number
  avgDelayMinutes: number
}

const normalizeText = (value?: string) => value?.trim().toLowerCase() ?? ""
const normalizeCode = (value?: string) => value?.trim().toUpperCase() ?? ""

export function getUniqueOrigins(routes: RouteMetric[]) {
  const origins = new Map<string, RouteOrigin>()
  for (const route of routes) {
    const code = normalizeCode(route.origin_airport_code)
    if (!code) {
      continue
    }
    if (!origins.has(code)) {
      origins.set(code, {
        code,
        name: route.origin_airport_name,
        city: route.origin_city,
      })
    }
  }
  return Array.from(origins.values())
}

export function getUniqueCountries(routes: RouteMetric[], originCode?: string) {
  const originFilter = normalizeCode(originCode)
  const filtered = originFilter
    ? routes.filter(
        (route) => normalizeCode(route.origin_airport_code) === originFilter
      )
    : routes
  return [...new Set(filtered.map((route) => route.destination_country?.trim()))]
    .filter((country): country is string => Boolean(country?.length))
    .sort()
}

export function getUniqueCities(
  routes: RouteMetric[],
  originCode?: string,
  country?: string
) {
  let filtered = routes
  const originFilter = normalizeCode(originCode)
  const countryFilter = normalizeText(country)
  if (originFilter) {
    filtered = filtered.filter(
      (route) => normalizeCode(route.origin_airport_code) === originFilter
    )
  }
  if (countryFilter) {
    filtered = filtered.filter(
      (route) => normalizeText(route.destination_country) === countryFilter
    )
  }
  return [...new Set(filtered.map((route) => route.destination_city?.trim()))]
    .filter((city): city is string => Boolean(city?.length))
    .sort()
}

export function getUniqueAirlines(
  routes: RouteMetric[],
  originCode?: string,
  country?: string,
  city?: string
) {
  let filtered = routes
  const originFilter = normalizeCode(originCode)
  const countryFilter = normalizeText(country)
  const cityFilter = normalizeText(city)
  if (originFilter) {
    filtered = filtered.filter(
      (route) => normalizeCode(route.origin_airport_code) === originFilter
    )
  }
  if (countryFilter) {
    filtered = filtered.filter(
      (route) => normalizeText(route.destination_country) === countryFilter
    )
  }
  if (cityFilter) {
    filtered = filtered.filter(
      (route) => normalizeText(route.destination_city) === cityFilter
    )
  }
  const airlines = new Map<string, RouteAirline>()
  for (const route of filtered) {
    if (!route.airline_code) {
      continue
    }
    if (!airlines.has(route.airline_code)) {
      airlines.set(route.airline_code, {
        code: route.airline_code,
        name: route.airline_name,
      })
    }
  }
  return Array.from(airlines.values())
}

export function filterRoutes(
  routes: RouteMetric[],
  filters: {
    origin?: string
    country?: string
    city?: string
    airline?: string
  }
) {
  let filtered = routes
  const originFilter = normalizeCode(filters.origin)
  const countryFilter = normalizeText(filters.country)
  const cityFilter = normalizeText(filters.city)
  const airlineFilter = normalizeCode(filters.airline)

  if (originFilter) {
    filtered = filtered.filter(
      (route) => normalizeCode(route.origin_airport_code) === originFilter
    )
  }
  if (countryFilter) {
    filtered = filtered.filter(
      (route) => normalizeText(route.destination_country) === countryFilter
    )
  }
  if (cityFilter) {
    filtered = filtered.filter(
      (route) => normalizeText(route.destination_city) === cityFilter
    )
  }
  if (airlineFilter) {
    filtered = filtered.filter(
      (route) => normalizeCode(route.airline_code) === airlineFilter
    )
  }
  return filtered
}

export function aggregateRoutes(routes: RouteMetric[]): RouteTotals {
  const totals = routes.reduce(
    (acc, route) => {
      acc.totalFlights += route.total_flights
      acc.totalOnTime += route.total_on_time_flights
      acc.totalDelayed += route.total_delayed_flights
      acc.totalCancelled += route.total_cancelled_flights
      acc.totalDelayMinutes += route.avg_delay_minutes * route.total_flights
      return acc
    },
    {
      totalFlights: 0,
      totalOnTime: 0,
      totalDelayed: 0,
      totalCancelled: 0,
      totalDelayMinutes: 0,
    }
  )

  const avgDelayMinutes =
    totals.totalFlights > 0
      ? totals.totalDelayMinutes / totals.totalFlights
      : 0

  return {
    totalFlights: totals.totalFlights,
    totalOnTime: totals.totalOnTime,
    totalDelayed: totals.totalDelayed,
    totalCancelled: totals.totalCancelled,
    avgDelayMinutes,
  }
}
