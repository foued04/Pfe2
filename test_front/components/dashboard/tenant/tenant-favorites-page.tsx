"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Heart } from "lucide-react"
import type { Property } from "@/lib/property-data"
import { useProperties } from "@/hooks/api/use-properties"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { EmptyState } from "@/components/dashboard/shared/empty-state"
import { PropertyCard } from "@/components/property/property-card"
import { PropertyDetailPage } from "@/components/property/property-detail-page"
import { Button } from "@/components/ui/button"

export function TenantFavoritesPage() {
  const { properties } = useProperties({ auth: true })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const favorites = useMemo(() => {
    if (typeof window === "undefined") return []
    const stored = localStorage.getItem("immosmart:favorites")
    const ids: string[] = stored ? JSON.parse(stored) : []
    return properties.filter((property) => ids.includes(property.id))
  }, [properties])

  if (selectedProperty) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedProperty(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to favorites
        </Button>
        <PropertyDetailPage propertyId={selectedProperty.id} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Tenant" title="My Favorites" description="Retrouvez les proprietes enregistrees dans votre liste personnelle." />
      {favorites.length === 0 ? (
        <EmptyState icon={Heart} title="No favorites yet" description="Ajoutez des proprietes a vos favoris depuis le catalogue public pour les retrouver ici." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {favorites.map((property) => (
            <PropertyCard key={property.id} property={property} onSelect={setSelectedProperty} />
          ))}
        </div>
      )}
    </div>
  )
}
