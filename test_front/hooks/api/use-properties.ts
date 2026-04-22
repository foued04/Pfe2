"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { mapBackendProperty, type Property } from "@/lib/property-data"

export function useProperties({ auth = false }: { auth?: boolean } = {}) {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    apiFetch<any[]>("/properties", { auth })
      .then((data) => {
        if (!active) return
        setProperties((Array.isArray(data) ? data : []).map(mapBackendProperty))
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
  }, [auth])

  return { properties, setProperties, isLoading, error }
}

