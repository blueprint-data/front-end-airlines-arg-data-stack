import type { RouteMetric } from "./types"

export const mockData: RouteMetric[] = [
  // AEP -> Brasil (São Paulo)
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "GRU",
    destination_airport_name: "Aeropuerto Internacional de Guarulhos",
    destination_city: "São Paulo",
    destination_country: "Brasil",
    airline_code: "AR",
    airline_name: "Aerolíneas Argentinas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 342,
    total_completed_flights: 328,
    total_cancelled_flights: 14,
    total_delayed_flights: 82,
    total_on_time_flights: 246,
    avg_delay_minutes: 23,
    on_time_percentage: 75.0,
    delayed_percentage: 25.0,
    cancellation_rate: 4.1,
  },
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "GRU",
    destination_airport_name: "Aeropuerto Internacional de Guarulhos",
    destination_city: "São Paulo",
    destination_country: "Brasil",
    airline_code: "LA",
    airline_name: "LATAM Airlines",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 298,
    total_completed_flights: 290,
    total_cancelled_flights: 8,
    total_delayed_flights: 58,
    total_on_time_flights: 232,
    avg_delay_minutes: 18,
    on_time_percentage: 80.0,
    delayed_percentage: 20.0,
    cancellation_rate: 2.7,
  },
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "GRU",
    destination_airport_name: "Aeropuerto Internacional de Guarulhos",
    destination_city: "São Paulo",
    destination_country: "Brasil",
    airline_code: "G3",
    airline_name: "Gol Linhas Aéreas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 186,
    total_completed_flights: 178,
    total_cancelled_flights: 8,
    total_delayed_flights: 32,
    total_on_time_flights: 146,
    avg_delay_minutes: 15,
    on_time_percentage: 82.0,
    delayed_percentage: 18.0,
    cancellation_rate: 4.3,
  },
  // AEP -> Brasil (Rio de Janeiro)
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "GIG",
    destination_airport_name: "Aeropuerto Internacional do Galeão",
    destination_city: "Rio de Janeiro",
    destination_country: "Brasil",
    airline_code: "AR",
    airline_name: "Aerolíneas Argentinas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 156,
    total_completed_flights: 148,
    total_cancelled_flights: 8,
    total_delayed_flights: 44,
    total_on_time_flights: 104,
    avg_delay_minutes: 28,
    on_time_percentage: 70.3,
    delayed_percentage: 29.7,
    cancellation_rate: 5.1,
  },
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "GIG",
    destination_airport_name: "Aeropuerto Internacional do Galeão",
    destination_city: "Rio de Janeiro",
    destination_country: "Brasil",
    airline_code: "LA",
    airline_name: "LATAM Airlines",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 124,
    total_completed_flights: 120,
    total_cancelled_flights: 4,
    total_delayed_flights: 24,
    total_on_time_flights: 96,
    avg_delay_minutes: 16,
    on_time_percentage: 80.0,
    delayed_percentage: 20.0,
    cancellation_rate: 3.2,
  },
  // AEP -> Chile (Santiago)
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "SCL",
    destination_airport_name: "Aeropuerto Internacional Comodoro Arturo Merino Benítez",
    destination_city: "Santiago",
    destination_country: "Chile",
    airline_code: "AR",
    airline_name: "Aerolíneas Argentinas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 412,
    total_completed_flights: 398,
    total_cancelled_flights: 14,
    total_delayed_flights: 72,
    total_on_time_flights: 326,
    avg_delay_minutes: 19,
    on_time_percentage: 81.9,
    delayed_percentage: 18.1,
    cancellation_rate: 3.4,
  },
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "SCL",
    destination_airport_name: "Aeropuerto Internacional Comodoro Arturo Merino Benítez",
    destination_city: "Santiago",
    destination_country: "Chile",
    airline_code: "LA",
    airline_name: "LATAM Airlines",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 524,
    total_completed_flights: 516,
    total_cancelled_flights: 8,
    total_delayed_flights: 62,
    total_on_time_flights: 454,
    avg_delay_minutes: 12,
    on_time_percentage: 88.0,
    delayed_percentage: 12.0,
    cancellation_rate: 1.5,
  },
  {
    origin_airport_code: "AEP",
    origin_airport_name: "Aeroparque Jorge Newbery",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "SCL",
    destination_airport_name: "Aeropuerto Internacional Comodoro Arturo Merino Benítez",
    destination_city: "Santiago",
    destination_country: "Chile",
    airline_code: "JA",
    airline_name: "JetSMART",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 186,
    total_completed_flights: 174,
    total_cancelled_flights: 12,
    total_delayed_flights: 52,
    total_on_time_flights: 122,
    avg_delay_minutes: 32,
    on_time_percentage: 70.1,
    delayed_percentage: 29.9,
    cancellation_rate: 6.5,
  },
  // EZE -> Estados Unidos (Miami)
  {
    origin_airport_code: "EZE",
    origin_airport_name: "Aeropuerto Internacional Ministro Pistarini",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "MIA",
    destination_airport_name: "Miami International Airport",
    destination_city: "Miami",
    destination_country: "Estados Unidos",
    airline_code: "AR",
    airline_name: "Aerolíneas Argentinas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 124,
    total_completed_flights: 118,
    total_cancelled_flights: 6,
    total_delayed_flights: 38,
    total_on_time_flights: 80,
    avg_delay_minutes: 34,
    on_time_percentage: 67.8,
    delayed_percentage: 32.2,
    cancellation_rate: 4.8,
  },
  {
    origin_airport_code: "EZE",
    origin_airport_name: "Aeropuerto Internacional Ministro Pistarini",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "MIA",
    destination_airport_name: "Miami International Airport",
    destination_city: "Miami",
    destination_country: "Estados Unidos",
    airline_code: "AA",
    airline_name: "American Airlines",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 186,
    total_completed_flights: 182,
    total_cancelled_flights: 4,
    total_delayed_flights: 28,
    total_on_time_flights: 154,
    avg_delay_minutes: 14,
    on_time_percentage: 84.6,
    delayed_percentage: 15.4,
    cancellation_rate: 2.2,
  },
  // EZE -> España (Madrid)
  {
    origin_airport_code: "EZE",
    origin_airport_name: "Aeropuerto Internacional Ministro Pistarini",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "MAD",
    destination_airport_name: "Aeropuerto Adolfo Suárez Madrid-Barajas",
    destination_city: "Madrid",
    destination_country: "España",
    airline_code: "AR",
    airline_name: "Aerolíneas Argentinas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 92,
    total_completed_flights: 88,
    total_cancelled_flights: 4,
    total_delayed_flights: 26,
    total_on_time_flights: 62,
    avg_delay_minutes: 42,
    on_time_percentage: 70.5,
    delayed_percentage: 29.5,
    cancellation_rate: 4.3,
  },
  {
    origin_airport_code: "EZE",
    origin_airport_name: "Aeropuerto Internacional Ministro Pistarini",
    origin_city: "Buenos Aires",
    origin_country: "Argentina",
    destination_airport_code: "MAD",
    destination_airport_name: "Aeropuerto Adolfo Suárez Madrid-Barajas",
    destination_city: "Madrid",
    destination_country: "España",
    airline_code: "IB",
    airline_name: "Iberia",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 124,
    total_completed_flights: 122,
    total_cancelled_flights: 2,
    total_delayed_flights: 18,
    total_on_time_flights: 104,
    avg_delay_minutes: 16,
    on_time_percentage: 85.2,
    delayed_percentage: 14.8,
    cancellation_rate: 1.6,
  },
  // COR (Córdoba) -> Brasil (São Paulo)
  {
    origin_airport_code: "COR",
    origin_airport_name: "Aeropuerto Internacional Ingeniero Aeronáutico Ambrosio L.V. Taravella",
    origin_city: "Córdoba",
    origin_country: "Argentina",
    destination_airport_code: "GRU",
    destination_airport_name: "Aeropuerto Internacional de Guarulhos",
    destination_city: "São Paulo",
    destination_country: "Brasil",
    airline_code: "AR",
    airline_name: "Aerolíneas Argentinas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 62,
    total_completed_flights: 58,
    total_cancelled_flights: 4,
    total_delayed_flights: 14,
    total_on_time_flights: 44,
    avg_delay_minutes: 21,
    on_time_percentage: 75.9,
    delayed_percentage: 24.1,
    cancellation_rate: 6.5,
  },
  {
    origin_airport_code: "COR",
    origin_airport_name: "Aeropuerto Internacional Ingeniero Aeronáutico Ambrosio L.V. Taravella",
    origin_city: "Córdoba",
    origin_country: "Argentina",
    destination_airport_code: "GRU",
    destination_airport_name: "Aeropuerto Internacional de Guarulhos",
    destination_city: "São Paulo",
    destination_country: "Brasil",
    airline_code: "G3",
    airline_name: "Gol Linhas Aéreas",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 48,
    total_completed_flights: 46,
    total_cancelled_flights: 2,
    total_delayed_flights: 8,
    total_on_time_flights: 38,
    avg_delay_minutes: 12,
    on_time_percentage: 82.6,
    delayed_percentage: 17.4,
    cancellation_rate: 4.2,
  },
  // MDZ (Mendoza) -> Chile (Santiago)
  {
    origin_airport_code: "MDZ",
    origin_airport_name: "Aeropuerto Internacional El Plumerillo",
    origin_city: "Mendoza",
    origin_country: "Argentina",
    destination_airport_code: "SCL",
    destination_airport_name: "Aeropuerto Internacional Comodoro Arturo Merino Benítez",
    destination_city: "Santiago",
    destination_country: "Chile",
    airline_code: "LA",
    airline_name: "LATAM Airlines",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 186,
    total_completed_flights: 180,
    total_cancelled_flights: 6,
    total_delayed_flights: 22,
    total_on_time_flights: 158,
    avg_delay_minutes: 11,
    on_time_percentage: 87.8,
    delayed_percentage: 12.2,
    cancellation_rate: 3.2,
  },
  {
    origin_airport_code: "MDZ",
    origin_airport_name: "Aeropuerto Internacional El Plumerillo",
    origin_city: "Mendoza",
    origin_country: "Argentina",
    destination_airport_code: "SCL",
    destination_airport_name: "Aeropuerto Internacional Comodoro Arturo Merino Benítez",
    destination_city: "Santiago",
    destination_country: "Chile",
    airline_code: "JA",
    airline_name: "JetSMART",
    window_start_date: "2025-11-23",
    window_end_date: "2026-01-22",
    total_flights: 124,
    total_completed_flights: 116,
    total_cancelled_flights: 8,
    total_delayed_flights: 34,
    total_on_time_flights: 82,
    avg_delay_minutes: 28,
    on_time_percentage: 70.7,
    delayed_percentage: 29.3,
    cancellation_rate: 6.5,
  },
]

// Datos de tendencia histórica (simulados)
export const trendData = [
  { month: "Ago", avgDelay: 28 },
  { month: "Sep", avgDelay: 24 },
  { month: "Oct", avgDelay: 22 },
  { month: "Nov", avgDelay: 19 },
  { month: "Dic", avgDelay: 26 },
  { month: "Ene", avgDelay: 21 },
]

export function getUniqueOrigins(data: RouteMetric[]) {
  const origins = new Map<string, { code: string; name: string; city: string }>()
  for (const route of data) {
    if (!origins.has(route.origin_airport_code)) {
      origins.set(route.origin_airport_code, {
        code: route.origin_airport_code,
        name: route.origin_airport_name,
        city: route.origin_city,
      })
    }
  }
  return Array.from(origins.values())
}

export function getUniqueCountries(data: RouteMetric[], originCode?: string) {
  const filtered = originCode
    ? data.filter((r) => r.origin_airport_code === originCode)
    : data
  return [...new Set(filtered.map((r) => r.destination_country))].sort()
}

export function getUniqueCities(
  data: RouteMetric[],
  originCode?: string,
  country?: string
) {
  let filtered = data
  if (originCode) {
    filtered = filtered.filter((r) => r.origin_airport_code === originCode)
  }
  if (country) {
    filtered = filtered.filter((r) => r.destination_country === country)
  }
  return [...new Set(filtered.map((r) => r.destination_city))].sort()
}

export function getUniqueAirlines(
  data: RouteMetric[],
  originCode?: string,
  country?: string,
  city?: string
) {
  let filtered = data
  if (originCode) {
    filtered = filtered.filter((r) => r.origin_airport_code === originCode)
  }
  if (country) {
    filtered = filtered.filter((r) => r.destination_country === country)
  }
  if (city) {
    filtered = filtered.filter((r) => r.destination_city === city)
  }
  const airlines = new Map<string, { code: string; name: string }>()
  for (const route of filtered) {
    if (!airlines.has(route.airline_code)) {
      airlines.set(route.airline_code, {
        code: route.airline_code,
        name: route.airline_name,
      })
    }
  }
  return Array.from(airlines.values())
}

export function filterData(
  data: RouteMetric[],
  filters: {
    origin?: string
    country?: string
    city?: string
    airline?: string
  }
) {
  let filtered = data
  if (filters.origin) {
    filtered = filtered.filter(
      (r) => r.origin_airport_code === filters.origin
    )
  }
  if (filters.country) {
    filtered = filtered.filter(
      (r) => r.destination_country === filters.country
    )
  }
  if (filters.city) {
    filtered = filtered.filter((r) => r.destination_city === filters.city)
  }
  if (filters.airline) {
    filtered = filtered.filter((r) => r.airline_code === filters.airline)
  }
  return filtered
}

export function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPercentage(num: number): string {
  return `${formatNumber(num, 1)}%`
}
