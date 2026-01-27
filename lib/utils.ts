import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function asset(path: string) {
  const basePath = process.env.NODE_ENV === 'production'
    ? '/front-end-airlines-arg-data-stack'
    : ''

  // Ensure the path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${basePath}${normalizedPath}`
}
