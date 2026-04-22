"use client"

import { useMemo } from "react"
import { Heart } from "lucide-react"
import { useProperties } from "@/hooks/api/use-properties"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { EmptyState } from "@/components/dashboard/shared/empty-state"
import { PropertyCard } from "@/components/property/property-card"

export function TenantFavoritesPage() {
  const { properties } = useProperties({ auth: true })

  const favorites = useMemo(() => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("immosmart:favorites")
    const ids: string[] = stored ? JSON.parse(stored) : []
    return properties.filter((property) => ids.includes(property.id))
  }, [properties])

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Tenant" title="My Favorites" description="Retrouvez les proprietes enregistrees dans votre liste personnelle." />
      {favorites.length === 0 ? (
        <EmptyState icon={Heart} title="No favorites yet" description="Ajoutez des proprietes a vos favoris depuis le catalogue public pour les retrouver ici." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}

