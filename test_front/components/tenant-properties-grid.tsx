"use client"

import { useI18n } from "@/lib/i18n"
import { mockProperties, type Property } from "@/lib/property-data"
import { TenantPropertyCard } from "./tenant-property-card"
import { FilterValues } from "./tenant-filters"

interface TenantPropertiesGridProps {
  searchQuery: string
  filters: FilterValues
  favorites: string[]
  onToggleFavorite: (id: string) => void
  onViewDetails: (property: Property) => void
  onContact: (property: Property) => void
  showFavoritesOnly?: boolean
}

export function TenantPropertiesGrid({
  searchQuery,
  filters,
  favorites,
  onToggleFavorite,
  onViewDetails,
  onContact,
  showFavoritesOnly = false,
}: TenantPropertiesGridProps) {
  const { t } = useI18n()

  // Filter properties
  const filteredProperties = mockProperties.filter((property) => {
    // Favorites only
    if (showFavoritesOnly && !favorites.includes(property.id)) {
      return false
    }
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        property.title.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query) ||
        property.department.toLowerCase().includes(query) ||
        property.description.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // City filter
    if (filters.city && !property.city.toLowerCase().includes(filters.city.toLowerCase())) {
      return false
    }

    // Department filter
    if (filters.department && !property.department.toLowerCase().includes(filters.department.toLowerCase())) {
      return false
    }

    // Budget filters
    if (filters.minBudget && property.rent < parseInt(filters.minBudget)) {
      return false
    }
    if (filters.maxBudget && property.rent > parseInt(filters.maxBudget)) {
      return false
    }

    // Property type
    if (filters.propertyType && filters.propertyType !== "all" && property.type !== filters.propertyType) {
      return false
    }

    // Bedrooms
    if (filters.bedrooms && filters.bedrooms !== "any") {
      if (filters.bedrooms === "4+") {
        if (property.bedrooms < 4) return false
      } else if (property.bedrooms !== parseInt(filters.bedrooms)) {
        return false
      }
    }

    // Furnished
    if (filters.furnished && !property.furnished) {
      return false
    }

    // Parking
    if (filters.parking && !property.parking) {
      return false
    }

    // Min surface
    if (filters.minSurface && property.surface < parseInt(filters.minSurface)) {
      return false
    }

    return true
  })

  return (
    <div className="px-6 py-6">
      {/* Results Count */}
      <div className="mb-6">
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredProperties.length}</span>{" "}
          {t("tenant.results")}
        </p>
      </div>

      {/* Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProperties.map((property) => (
            <TenantPropertyCard
              key={property.id}
              property={property}
              isFavorite={favorites.includes(property.id)}
              onToggleFavorite={onToggleFavorite}
              onViewDetails={onViewDetails}
              onContact={onContact}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-6">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            {t("tenant.noResults")}
          </h3>
          <p className="text-muted-foreground">
            Essayez de modifier vos filtres de recherche
          </p>
        </div>
      )}
    </div>
  )
}
