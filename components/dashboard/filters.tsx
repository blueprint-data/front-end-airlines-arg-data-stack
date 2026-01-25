"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { RouteMetric } from "@/lib/types"
import {
  getUniqueAirlines,
  getUniqueCities,
  getUniqueCountries,
  getUniqueOrigins,
} from "@/lib/route-utils"

interface FiltersProps {
  routes: RouteMetric[]
  origin: string
  setOrigin: (value: string) => void
  country: string
  setCountry: (value: string) => void
  city: string
  setCity: (value: string) => void
  airline: string
  setAirline: (value: string) => void
  windowDays: string
  setWindowDays: (value: string) => void
}

export function Filters({
  routes,
  origin,
  setOrigin,
  country,
  setCountry,
  city,
  setCity,
  airline,
  setAirline,
  windowDays,
  setWindowDays,
}: FiltersProps) {
  // Memoize options to prevent recalculation on every render
  const origins = useMemo(
    () => getUniqueOrigins(routes).filter((o) => o.code),
    [routes]
  )

  const countries = useMemo(
    () => getUniqueCountries(routes, origin).filter((v) => v.trim().length > 0),
    [routes, origin]
  )

  const cities = useMemo(
    () => getUniqueCities(routes, origin, country).filter((v) => v.trim().length > 0),
    [routes, origin, country]
  )

  const airlines = useMemo(
    () => getUniqueAirlines(routes, origin, country, city).filter((a) => a.code),
    [routes, origin, country, city]
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="rounded-xl border border-border bg-card/50 p-4 sm:p-6 backdrop-blur-sm">
        {/* Header - Stack on mobile */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-foreground">
            Filtrar rutas
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ventana:</span>
            <ToggleGroup
              type="single"
              value={windowDays}
              onValueChange={(value) => value && setWindowDays(value)}
              className="gap-1"
              disabled
            >
              <ToggleGroupItem
                value="30"
                aria-label="30 días"
                className="h-10 min-w-[44px] rounded-full px-3 text-sm touch-manipulation data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                disabled
              >
                30d
              </ToggleGroupItem>
              <ToggleGroupItem
                value="60"
                aria-label="60 días"
                className="h-10 min-w-[44px] rounded-full px-3 text-sm touch-manipulation data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                disabled
              >
                60d
              </ToggleGroupItem>
              <ToggleGroupItem
                value="90"
                aria-label="90 días"
                className="h-10 min-w-[44px] rounded-full px-3 text-sm touch-manipulation data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                disabled
              >
                90d
              </ToggleGroupItem>
            </ToggleGroup>
            <span className="text-xs text-muted-foreground">(fijo)</span>
          </div>
        </div>

        {/* Filter Grid - 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Origen */}
          <div className="space-y-2">
            <Label htmlFor="filter-origin" className="text-sm font-medium">
              Aeropuerto de origen
            </Label>
            <Select
              value={origin}
              onValueChange={setOrigin}
              disabled={origins.length === 0}
            >
              <SelectTrigger
                id="filter-origin"
                className="w-full h-11 min-h-[44px] touch-manipulation"
              >
                <SelectValue placeholder="Seleccionar origen…" />
              </SelectTrigger>
              <SelectContent>
                {origins.length === 0 ? (
                  <SelectItem value="__empty_origin" disabled>
                    Sin opciones disponibles
                  </SelectItem>
                ) : (
                  origins.map((o, index) => (
                    <SelectItem
                      key={`origin-${o.code}-${index}`}
                      value={o.code}
                      className="py-3 touch-manipulation"
                    >
                      {o.code} – {o.city}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* País destino */}
          <div className="space-y-2">
            <Label htmlFor="filter-country" className="text-sm font-medium">
              País de destino
            </Label>
            <Select
              value={country}
              onValueChange={setCountry}
              disabled={countries.length === 0}
            >
              <SelectTrigger
                id="filter-country"
                className="w-full h-11 min-h-[44px] touch-manipulation"
              >
                <SelectValue placeholder="Seleccionar país…" />
              </SelectTrigger>
              <SelectContent>
                {countries.length === 0 ? (
                  <SelectItem value="__empty_country" disabled>
                    Sin opciones disponibles
                  </SelectItem>
                ) : (
                  countries.map((c) => (
                    <SelectItem
                      key={`country-${c}`}
                      value={c}
                      className="py-3 touch-manipulation"
                    >
                      {c}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Ciudad destino */}
          <div className="space-y-2">
            <Label htmlFor="filter-city" className="text-sm font-medium">
              Ciudad de destino
            </Label>
            <Select
              value={city}
              onValueChange={setCity}
              disabled={!country || cities.length === 0}
            >
              <SelectTrigger
                id="filter-city"
                className="w-full h-11 min-h-[44px] touch-manipulation"
              >
                <SelectValue
                  placeholder={country ? "Seleccionar ciudad…" : "Elegí un país primero"}
                />
              </SelectTrigger>
              <SelectContent>
                {cities.length === 0 ? (
                  <SelectItem value="__empty_city" disabled>
                    Sin opciones disponibles
                  </SelectItem>
                ) : (
                  cities.map((c) => (
                    <SelectItem
                      key={`city-${c}`}
                      value={c}
                      className="py-3 touch-manipulation"
                    >
                      {c}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Aerolínea */}
          <div className="space-y-2">
            <Label htmlFor="filter-airline" className="text-sm font-medium">
              Aerolínea (opcional)
            </Label>
            <Select
              value={airline || "all"}
              onValueChange={(value) => setAirline(value === "all" ? "" : value)}
              disabled={airlines.length === 0}
            >
              <SelectTrigger
                id="filter-airline"
                className="w-full h-11 min-h-[44px] touch-manipulation"
              >
                <SelectValue placeholder="Todas las aerolíneas" />
              </SelectTrigger>
              <SelectContent>
                {airlines.length === 0 ? (
                  <SelectItem value="__empty_airline" disabled>
                    Sin opciones disponibles
                  </SelectItem>
                ) : (
                  <>
                    <SelectItem value="all" className="py-3 touch-manipulation">
                      Todas las aerolíneas
                    </SelectItem>
                    {airlines.map((a) => (
                      <SelectItem
                        key={`airline-${a.code}`}
                        value={a.code}
                        className="py-3 touch-manipulation"
                      >
                        {a.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
