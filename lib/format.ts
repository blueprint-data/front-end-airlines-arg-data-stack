
const numberFormatters = new Map<string, Intl.NumberFormat>()

export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "0"
  }

  const key = `es-AR-${decimals}`
  let formatter = numberFormatters.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
    numberFormatters.set(key, formatter)
  }

  return formatter.format(value)
}

export function formatPercentage(value: number): string {
  return `${formatNumber(value, 1)}%`
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "short",
})

export function formatDateShort(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return dateFormatter.format(date)
}
