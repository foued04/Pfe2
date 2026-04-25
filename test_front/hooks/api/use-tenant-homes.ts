"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { mapBackendProperty, type Property } from "@/lib/property-data"

const rentedContractStatuses = new Set(["SignedByTenant", "SignedByBoth"])

export function useTenantHomes() {
  const [homes, setHomes] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadHomes = async () => {
      setIsLoading(true)
      try {
        const requests = await apiFetch<any[]>("/rental-requests", { auth: true })
        const requestList = Array.isArray(requests) ? requests : []

        const homesFromRequests = await Promise.all(
          requestList.map(async (request) => {
            if (!request.property) return null

            const property = mapBackendProperty(request.property)
            if (request.status === "Contrat actif" || property.status === "rented") {
              return { ...property, status: "rented" as const }
            }

            try {
              const contract = await apiFetch<any>(`/contracts/request/${request._id}`, { auth: true })
              if (rentedContractStatuses.has(contract?.status)) {
                return { ...property, status: "rented" as const }
              }
            } catch {
              return null
            }

            return null
          })
        )

        if (!active) return

        const resolvedHomes = homesFromRequests.filter(Boolean) as Property[]
        const uniqueHomes = resolvedHomes
          .filter((home, index, list) => list.findIndex((item) => item.id === home.id) === index)

        setHomes(uniqueHomes)
        setError(null)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Erreur lors du chargement de votre logement")
      } finally {
        if (!active) return
        setIsLoading(false)
      }
    }

    loadHomes()

    return () => {
      active = false
    }
  }, [])

  return { homes, isLoading, error }
}
