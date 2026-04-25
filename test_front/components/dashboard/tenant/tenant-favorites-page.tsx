"use client"

import { useState } from "react"
import { ArrowLeft, Heart } from "lucide-react"
import type { Property } from "@/lib/property-data"
import { useFavorites } from "@/hooks/api/use-favorites"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { EmptyState } from "@/components/dashboard/shared/empty-state"
import { TenantPropertyCard } from "@/components/tenant-property-card"
import { PropertyDetailPage } from "@/components/property/property-detail-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function TenantFavoritesPage() {
  const { favorites, favoriteIds, isLoading, error, toggleFavorite } = useFavorites()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

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
      {isLoading ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-sm text-muted-foreground">Chargement des favoris...</CardContent>
        </Card>
      ) : error ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : favorites.length === 0 ? (
        <EmptyState icon={Heart} title="No favorites yet" description="Ajoutez des proprietes a vos favoris depuis le catalogue public pour les retrouver ici." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {favorites.map((property) => (
            <TenantPropertyCard
              key={property.id}
              property={property}
              isFavorite={favoriteIds.includes(property.id)}
              onToggleFavorite={(propertyId) => {
                void toggleFavorite(propertyId)
              }}
              onViewDetails={setSelectedProperty}
              onContact={setSelectedProperty}
            />
          ))}
        </div>
      )}
    </div>
  )
}
