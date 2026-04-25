"use client"

import { useCallback, useEffect, useState } from "react"
import { apiFetch } from "@/lib/api/client"
import { mapBackendProperty, type Property } from "@/lib/property-data"
import { useAuth } from "@/lib/auth-context"

export function useFavorites() {
  const { isAuthenticated, role, isLoading: isAuthLoading } = useAuth()
  const [favorites, setFavorites] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadFavorites = useCallback(async () => {
    if (isAuthLoading) return
    if (!isAuthenticated || role !== "tenant") {
      setFavorites([])
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const data = await apiFetch<any[]>("/properties/favorites", { auth: true })
      setFavorites((Array.isArray(data) ? data : []).map(mapBackendProperty))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du chargement des favoris")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthLoading, isAuthenticated, role])

  useEffect(() => {
    void loadFavorites()
  }, [loadFavorites])

  const toggleFavorite = useCallback(async (propertyId: string) => {
    if (!isAuthenticated || role !== "tenant") {
      throw new Error("Connectez-vous avec un compte locataire pour gerer vos favoris.")
    }

    const isFavorite = favorites.some((property) => property.id === propertyId)
    setIsSaving(true)

    try {
      const data = await apiFetch<any[]>(`/properties/${propertyId}/favorite`, {
        auth: true,
        method: isFavorite ? "DELETE" : "POST",
      })
      setFavorites((Array.isArray(data) ? data : []).map(mapBackendProperty))
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise a jour des favoris"
      setError(message)
      throw new Error(message)
    } finally {
      setIsSaving(false)
    }
  }, [favorites, isAuthenticated, role])

  return {
    favorites,
    favoriteIds: favorites.map((property) => property.id),
    isLoading,
    isSaving,
    error,
    reloadFavorites: loadFavorites,
    toggleFavorite,
  }
}
