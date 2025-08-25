import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateServicePlaceholderImage(serviceName: string, category?: string): string {
  const query = encodeURIComponent(`${serviceName} ${category || ""} icon`)
  return `/placeholder.svg?height=48&width=48&query=${query}`
}
