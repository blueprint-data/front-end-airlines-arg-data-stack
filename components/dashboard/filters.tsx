"use client"

import { useMemo, memo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  PlaneTakeoff,
  MapPin,
  Building2,
  Calendar,
  X,
  SlidersHorizontal,
  RotateCcw
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import type { RouteMetric } from "@/lib/types"
import {
  getUniqueAirlines,
  getUniqueCities,
  getUniqueCountries,
  getUniqueOrigins,
  filterRoutes,
} from "@/lib/route-utils"
import { cn } from "@/lib/utils"

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

export const Filters = memo(function Filters({
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
  const isMobile = useIsMobile()
  const [isOpen, setIsOpen] = useState(false)

  // Memoize options
  const origins = useMemo(
    () => getUniqueOrigins(routes).filter((o) => o.code),
    [routes]
  )

  const routesForCountries = useMemo(
    () =>
      filterRoutes(routes, {
        origin: origin || undefined,
        // No filtramos por aerolínea aquí para permitir ver todos los destinos posibles
      }),
    [routes, origin]
  )

  const countries = useMemo(
    () =>
      getUniqueCountries(routesForCountries).filter((v) => v.trim().length > 0),
    [routesForCountries]
  )

  const routesForCities = useMemo(
    () =>
      filterRoutes(routes, {
        origin: origin || undefined,
        country: country || undefined,
      }),
    [routes, origin, country]
  )

  const cities = useMemo(
    () =>
      getUniqueCities(routesForCities, origin, country, routes).filter(
        (v) => v.trim().length > 0
      ),
    [routesForCities, origin, country, routes]
  )

  const airlines = useMemo(
    () => getUniqueAirlines(routes, origin, country, city).filter((a) => a.code),
    [routes, origin, country, city]
  )

  const hasActiveFilters = Boolean(origin || country || city || airline)

  const clearFilters = () => {
    setOrigin("")
    setCountry("")
    setCity("")
    setAirline("")
  }

  return (
    <section aria-labelledby="filter-heading" className="mx-auto max-w-5xl px-4 py-6 md:py-10">
      <h2 id="filter-heading" className="sr-only">Filtros de búsqueda</h2>

      <div className="md:rounded-2xl md:border md:border-border md:bg-card/30 md:p-8 md:backdrop-blur-xl md:shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">Configuración</h3>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest leading-none mt-1">
                Personaliza la vista
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-9 px-3 text-xs font-bold hover:bg-red-500/10 hover:text-red-500 transition-colors group"
              >
                <RotateCcw className="mr-2 h-3.5 w-3.5 group-hover:rotate-[-45deg] transition-transform" />
                LIMPIAR
              </Button>
            )}

            <div className="hidden md:flex items-center gap-3 rounded-full bg-muted/50 p-1 border border-border/50">
              {["30", "60", "90"].map((days) => (
                <button
                  key={days}
                  disabled
                  className={cn(
                    "flex h-8 px-4 items-center justify-center rounded-full text-xs font-bold transition-all",
                    windowDays === days
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground opacity-50 cursor-not-allowed"
                  )}
                >
                  {days}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {isMobile ? (
          <div className="space-y-4">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full h-14 justify-between text-base border-primary/20 bg-primary/5 hover:bg-primary/10 group">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-primary" />
                    Filtros de ruta
                  </span>
                  <div className="flex items-center gap-2">
                    {hasActiveFilters && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {[origin, country, city, airline].filter(Boolean).length}
                      </span>
                    )}
                    <span className="text-muted-foreground text-sm font-normal group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh] rounded-t-[2rem] border-t-primary/20 px-6 pt-10">
                <SheetHeader className="mb-8 p-0 text-left">
                  <SheetTitle className="text-2xl font-black">Filtros</SheetTitle>
                  <SheetDescription className="text-base">
                    Ajusta los parámetros para analizar rutas específicas.
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pb-20">
                  <FilterForm
                    origin={origin}
                    setOrigin={setOrigin}
                    country={country}
                    setCountry={setCountry}
                    city={city}
                    setCity={setCity}
                    airline={airline}
                    setAirline={setAirline}
                    origins={origins}
                    countries={countries}
                    cities={cities}
                    airlines={airlines}
                  />
                </div>

                <div className="absolute bottom-10 left-6 right-6 flex flex-col gap-3">
                  <Button onClick={() => setIsOpen(false)} className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                    Aplicar Filtros
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        clearFilters()
                        setIsOpen(false)
                      }}
                      className="text-muted-foreground h-12"
                    >
                      Restablecer configuración
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
            <ActiveFiltersSummary
              origin={origin}
              country={country}
              city={city}
              airline={airline}
              setOrigin={setOrigin}
              setCountry={setCountry}
              setCity={setCity}
              setAirline={setAirline}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        ) : (
          <>
            <FilterForm
              className="grid-cols-2 lg:grid-cols-4"
              origin={origin}
              setOrigin={setOrigin}
              country={country}
              setCountry={setCountry}
              city={city}
              setCity={setCity}
              airline={airline}
              setAirline={setAirline}
              origins={origins}
              countries={countries}
              cities={cities}
              airlines={airlines}
            />
            <ActiveFiltersSummary
              origin={origin}
              country={country}
              city={city}
              airline={airline}
              setOrigin={setOrigin}
              setCountry={setCountry}
              setCity={setCity}
              setAirline={setAirline}
              hasActiveFilters={hasActiveFilters}
            />
          </>
        )}
      </div>
    </section>
  )
})

Filters.displayName = "Filters"

interface FilterFormProps {
  className?: string
  origin: string
  setOrigin: (v: string) => void
  country: string
  setCountry: (v: string) => void
  city: string
  setCity: (v: string) => void
  airline: string
  setAirline: (v: string) => void
  origins: { code: string; city: string }[]
  countries: string[]
  cities: string[]
  airlines: { code: string; name: string }[]
}

const FilterForm = ({
  className,
  origin,
  setOrigin,
  country,
  setCountry,
  city,
  setCity,
  airline,
  setAirline,
  origins,
  countries,
  cities,
  airlines
}: FilterFormProps) => (
  <div className={cn("grid gap-6", className)}>
    {/* Origen */}
    <div className="space-y-2">
      <Label htmlFor="filter-origin" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <PlaneTakeoff className="h-3 w-3" /> Origen
      </Label>
      <Select
        value={origin || "all"}
        onValueChange={(value) => setOrigin(value === "all" ? "" : value)}
        disabled={origins.length === 0}
      >
        <SelectTrigger
          id="filter-origin"
          className={cn(
            "h-12 transition-all hover:border-primary/50 bg-background/50 backdrop-blur-sm",
            origin && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          )}
        >
          <SelectValue placeholder="Todos los orígenes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los orígenes</SelectItem>
          {origins.map((o) => (
            <SelectItem key={o.code} value={o.code}>
              {o.code} – {o.city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* País destino */}
    <div className="space-y-2">
      <Label htmlFor="filter-country" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <MapPin className="h-3 w-3" /> País Destino
      </Label>
      <Select
        value={country || "all"}
        onValueChange={(value) => setCountry(value === "all" ? "" : value)}
        disabled={countries.length === 0}
      >
        <SelectTrigger
          id="filter-country"
          className={cn(
            "h-12 transition-all hover:border-primary/50 bg-background/50 backdrop-blur-sm",
            country && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          )}
        >
          <SelectValue placeholder="Todos los países" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los países</SelectItem>
          {countries.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Ciudad destino */}
    <div className="space-y-2">
      <Label htmlFor="filter-city" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <MapPin className="h-3 w-3" /> Ciudad Destino
      </Label>
      <Select
        value={city || "all"}
        onValueChange={(value) => setCity(value === "all" ? "" : value)}
        disabled={!country || cities.length === 0}
      >
        <SelectTrigger
          id="filter-city"
          className={cn(
            "h-12 transition-all hover:border-primary/50 bg-background/50 backdrop-blur-sm",
            city && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          )}
        >
          <SelectValue placeholder={country ? "Todas las ciudades" : "Elegí país..."} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las ciudades</SelectItem>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Aerolínea */}
    <div className="space-y-2">
      <Label htmlFor="filter-airline" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Building2 className="h-3 w-3" /> Aerolínea
      </Label>
      <Select
        value={airline || "all"}
        onValueChange={(value) => setAirline(value === "all" ? "" : value)}
        disabled={airlines.length === 0}
      >
        <SelectTrigger
          id="filter-airline"
          className={cn(
            "h-12 transition-all hover:border-primary/50 bg-background/50 backdrop-blur-sm",
            airline && "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
          )}
        >
          <SelectValue placeholder="Todas las aerolíneas" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las aerolíneas</SelectItem>
          {airlines.map((a) => (
            <SelectItem key={a.code} value={a.code}>{a.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
)

interface ActiveFiltersSummaryProps {
  origin: string
  country: string
  city: string
  airline: string
  setOrigin: (v: string) => void
  setCountry: (v: string) => void
  setCity: (v: string) => void
  setAirline: (v: string) => void
  hasActiveFilters: boolean
}

const ActiveFiltersSummary = ({
  origin,
  country,
  city,
  airline,
  setOrigin,
  setCountry,
  setCity,
  setAirline,
  hasActiveFilters
}: ActiveFiltersSummaryProps) => {
  if (!hasActiveFilters) return null
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <AnimatePresence mode="popLayout">
        {Boolean(origin) && (
          <motion.span
            key="filter-origin"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary"
          >
            Origen: {origin}
            <button onClick={() => setOrigin("")} className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors">
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        )}
        {Boolean(country) && (
          <motion.span
            key="filter-country"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary"
          >
            País: {country}
            <button onClick={() => setCountry("")} className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors">
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        )}
        {Boolean(city) && (
          <motion.span
            key="filter-city"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary"
          >
            Ciudad: {city}
            <button onClick={() => setCity("")} className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors">
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        )}
        {Boolean(airline) && (
          <motion.span
            key="filter-airline"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary"
          >
            Línea: {airline}
            <button onClick={() => setAirline("")} className="ml-1 p-0.5 hover:bg-primary/20 rounded-full transition-colors">
              <X className="h-3 w-3" />
            </button>
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}
