"use client"

import { useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"

export function useRentalRequests() {
  const [requests, setRequests] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    apiFetch<any[]>("/rental-requests", { auth: true })
      .then((data) => {
        if (!active) return
        setRequests(Array.isArray(data) ? data : [])
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

  return { requests, isLoading, error }
}

