import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price with comma separators - locale-independent to avoid hydration mismatches
export function formatPrice(price: number): string {
  return String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
