"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { mapBackendProperty, type Property } from "@/lib/property-data"

export function useOwnerDashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [requestCount, setRequestCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)

    Promise.all([
      apiFetch<any[]>("/properties", { auth: true }),
      apiFetch<any[]>("/rental-requests", { auth: true }),
    ])
      .then(([propertiesData, requestsData]) => {
        if (!active) return
        const mappedProperties = (Array.isArray(propertiesData) ? propertiesData : []).map(mapBackendProperty)
        const requests = Array.isArray(requestsData) ? requestsData : []
        setProperties(mappedProperties)
        setRequestCount(requests.filter((request) => request.status === "En attente").length)
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
  }, [])

  const stats = useMemo(() => {
    const total = properties.length
    const available = properties.filter((property) => property.status === "available").length
    const rented = properties.filter((property) => property.status === "rented").length
    const maintenance = properties.filter((property) => property.status === "maintenance").length
    const revenue = properties
      .filter((property) => property.status === "rented")
      .reduce((sum, property) => sum + (property.rent || 0), 0)

    return { total, available, rented, maintenance, revenue, requestCount }
  }, [properties, requestCount])

  return { properties, setProperties, stats, requestCount, isLoading, error }
}

