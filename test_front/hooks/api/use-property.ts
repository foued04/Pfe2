"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { mapBackendProperty, type Property } from "@/lib/property-data"

export function useProperty(propertyId: string) {
  const [property, setProperty] = useState<Property | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!propertyId) return
    let active = true
    setIsLoading(true)
    apiFetch<any>(`/properties/${propertyId}`)
      .then((data) => {
        if (!active) return
        setProperty(mapBackendProperty(data))
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : "Erreur lors du chargement")
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [propertyId])

  return { property, isLoading, error }
}

