
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

export function formatDateForChart(value: string, isMobile = false): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  
  if (isMobile) {
    // Format compact for mobile: "26/11" instead of "26-nov"
    // Optimized: Ensure consistent format with leading zeros
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }
  
  // Original format for desktop
  return date.toLocaleDateString("es-AR", { day: "2-digit", month: "short" })
}
