"use client"

import { useState } from "react"
import type { Property } from "@/lib/property-data"
import { mockProperties } from "@/lib/property-data"
import { TenantSidebar } from "./tenant-sidebar"
import { TenantSearchHeader } from "./tenant-search-header"
import { TenantFilters, type FilterValues } from "./tenant-filters"
import { TenantPropertiesGrid } from "./tenant-properties-grid"
import { PropertyDetailsModal } from "./property-details-modal"
import { ContactOwnerForm } from "./contact-owner-form"
import { HousingNeedsForm } from "./housing-needs-form"
import { MaintenanceForm } from "./maintenance-form"
import { AIChatbot } from "./ai-chatbot"
import { PropertyMap } from "./property-map"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { Globe, MapPin } from "lucide-react"

const defaultFilters: FilterValues = {
  city: "",
  department: "",
  minBudget: "",
  maxBudget: "",
  propertyType: "all",
  bedrooms: "any",
  furnished: false,
  parking: false,
  minSurface: "",
}

export function TenantDashboard() {
  const { lang, setLang } = useI18n()
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState("search")
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterValues>(defaultFilters)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [mapSelectedProperty, setMapSelectedProperty] = useState<Property | null>(null)

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property)
    setIsDetailsOpen(true)
  }

  const handleContact = (property: Property) => {
    setIsDetailsOpen(false)
    setSelectedProperty(property)
    // Small delay so the detail modal closes smoothly before contact opens
    setTimeout(() => setIsContactOpen(true), 150)
  }

  const handleApplyFilters = () => {
    setIsFiltersOpen(false)
  }

  const handleResetFilters = () => {
    setFilters(defaultFilters)
  }

  const handleMapPropertySelect = (property: Property) => {
    setMapSelectedProperty(property)
    setSelectedProperty(property)
    setIsDetailsOpen(true)
  }

  const renderContent = () => {
    switch (activeSection) {
      case "map":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                {lang === "fr" ? "Carte des Proprietes - Monastir" : "Property Map - Monastir"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {lang === "fr" 
                  ? "Explorez les proprietes disponibles sur la carte de Monastir" 
                  : "Explore available properties on the Monastir map"}
              </p>
            </div>
            <PropertyMap 
              properties={mockProperties}
              selectedProperty={mapSelectedProperty}
              onPropertySelect={handleMapPropertySelect}
              height="500px"
            />
          </div>
        )
      case "housingNeeds":
        return <HousingNeedsForm />
      case "maintenance":
        return <MaintenanceForm />
      case "favorites":
        return (
          <TenantPropertiesGrid
            searchQuery=""
            filters={defaultFilters}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onViewDetails={handleViewDetails}
            onContact={handleContact}
            showFavoritesOnly
          />
        )
      default:
        return (
          <>
            <TenantSearchHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFiltersClick={() => setIsFiltersOpen(true)}
              onFavoritesClick={() => setActiveSection("favorites")}
              onChatbotClick={() => setIsChatbotOpen(true)}
              favoritesCount={favorites.length}
            />
            <TenantPropertiesGrid
              searchQuery={searchQuery}
              filters={filters}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onViewDetails={handleViewDetails}
              onContact={handleContact}
            />
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TenantSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* Main Content */}
      <div className="ml-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>Monastir, Tunisie</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {lang === "fr" ? "Bienvenue," : "Welcome,"} <span className="font-medium text-foreground">{user?.name}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {lang === "fr" ? "FR" : "EN"}
            </Button>
          </div>
        </header>

        {renderContent()}
      </div>

      {/* Modals */}
      <TenantFilters
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
        onToggleFavorite={toggleFavorite}
        onContact={handleContact}
      />

      <ContactOwnerForm
        property={selectedProperty}
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <AIChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        userRole="tenant"
      />
    </div>
  )
}
