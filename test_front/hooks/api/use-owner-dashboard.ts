"use client"

import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"
import { mapBackendProperty, type Property } from "@/lib/property-data"

// Simple global cache to allow instant transitions
let globalCache: {
  properties: any[];
  requests: any[];
  timestamp: number;
} | null = null;

export function useOwnerDashboard() {
  const { user } = useAuth()
  const [properties, setProperties] = useState<Property[]>(() => {
    return globalCache ? globalCache.properties.map(mapBackendProperty) : []
  })
  const [requestCount, setRequestCount] = useState(() => {
    if (!globalCache) return 0
    return globalCache.requests.filter((r: any) => r.status === "En attente").length
  })
  const [isLoading, setIsLoading] = useState(!globalCache)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    
    // Only show loading if we don't have cached data
    if (!globalCache) {
      setIsLoading(true)
    }

    Promise.all([
      apiFetch<any[]>("/properties", { auth: true }),
      apiFetch<any[]>("/rental-requests", { auth: true }),
    ])
      .then(([propertiesData, requestsData]) => {
        if (!active) return
        
        // Update global cache
        globalCache = {
          properties: propertiesData,
          requests: requestsData,
          timestamp: Date.now()
        }

        const requests = Array.isArray(requestsData) ? requestsData : []
        const rentedPropertyIds = new Set(
          requests
            .filter((request) => request.status === "Contrat actif")
            .map((request) => request.property?._id || request.property?.id || request.property)
            .filter(Boolean)
            .map(String)
        )
        const mappedProperties = (Array.isArray(propertiesData) ? propertiesData : [])
          .map(mapBackendProperty)
          .map((property) => rentedPropertyIds.has(String(property.id)) ? { ...property, status: "rented" as const } : property)

        setProperties(mappedProperties)
        setRequestCount(requests.filter((request) => request.status === "En attente").length)
        setError(null)
      })
      .catch((err) => {
        if (!active) return
        // Don't show error if we have cached data, just log it
        if (globalCache) {
           console.warn("Background refresh failed:", err)
        } else {
           setError(err instanceof Error ? err.message : "Erreur lors du chargement")
        }
      })
      .finally(() => {
        if (!active) return
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])


  const myProperties = useMemo(() => {
    return properties.filter((property) => {
      const ownerId = property.ownerId || property.owner?._id
      return Boolean(ownerId && user?.id && String(ownerId) === String(user.id))
    })
  }, [properties, user?.id])

  const stats = useMemo(() => {
    const total = myProperties.length
    const available = myProperties.filter((property) => property.status === "available").length
    const rented = myProperties.filter((property) => property.status === "rented").length
    const maintenance = myProperties.filter((property) => property.status === "maintenance").length
    const revenue = myProperties
      .filter((property) => property.status === "rented")
      .reduce((sum, property) => sum + (property.rent || 0), 0)

    return { total, available, rented, maintenance, revenue, requestCount }
  }, [myProperties, requestCount])

  return { properties, myProperties, setProperties, stats, requestCount, isLoading, error }
}

