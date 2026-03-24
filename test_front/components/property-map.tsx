"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { type Property } from "@/lib/property-data"
import { MapPin, Home, X, ExternalLink, Navigation } from "lucide-react"

interface PropertyMapProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect?: (property: Property) => void
  height?: string
}

export function PropertyMap({ 
  properties, 
  selectedProperty,
  onPropertySelect,
  height = "400px" 
}: PropertyMapProps) {
  const { lang } = useI18n()
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null)
  
  // Monastir center coordinates
  const mapCenter = { lat: 35.7768, lng: 10.8108 }
  
  // Calculate relative positions for markers (simplified map visualization)
  const getMarkerPosition = (property: Property) => {
    const latDiff = property.lat - mapCenter.lat
    const lngDiff = property.lng - mapCenter.lng
    
    // Scale to fit in the map container (roughly)
    const x = 50 + (lngDiff * 150)
    const y = 50 - (latDiff * 150)
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  const statusColors = {
    available: "bg-green-500",
    rented: "bg-primary",
    maintenance: "bg-yellow-500",
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {lang === "fr" ? "Carte de Monastir" : "Monastir Map"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="relative bg-secondary/30 overflow-hidden"
          style={{ height }}
        >
          {/* Map background with Monastir stylized representation */}
          <div className="absolute inset-0">
            {/* Mediterranean Sea (top) */}
            <div className="absolute top-0 left-0 right-0 h-1/4 bg-blue-200/40" />
            
            {/* Main land area */}
            <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-secondary/20" />
            
            {/* Port/Marina area */}
            <div className="absolute top-1/4 right-1/4 w-16 h-12 bg-blue-300/30 rounded-full" />
            
            {/* Road grid pattern */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* City center indicator */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full bg-accent/30 animate-pulse" />
            </div>
            
            {/* Label - Monastir */}
            <div className="absolute bottom-4 left-4 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded">
              <div className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                Monastir, Tunisie
              </div>
            </div>
          </div>

          {/* Property markers */}
          {properties.map((property) => {
            const pos = getMarkerPosition(property)
            const isSelected = selectedProperty?.id === property.id
            const isHovered = hoveredProperty?.id === property.id
            
            return (
              <button
                key={property.id}
                onClick={() => onPropertySelect?.(property)}
                onMouseEnter={() => setHoveredProperty(property)}
                onMouseLeave={() => setHoveredProperty(null)}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all z-10 ${
                  isSelected || isHovered ? "z-20 scale-125" : ""
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className={`relative`}>
                  {/* Marker pin */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                    isSelected ? "bg-primary" : statusColors[property.status]
                  }`}>
                    <Home className="w-4 h-4 text-white" />
                  </div>
                  
                  {/* Price tag */}
                  {(isSelected || isHovered) && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                      {property.rent} DT
                    </div>
                  )}
                </div>
              </button>
            )
          })}

          {/* Property info popup */}
          {(hoveredProperty || selectedProperty) && (
            <div className="absolute bottom-4 right-4 w-64 z-30">
              <Card className="shadow-xl border-primary/20">
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    <div 
                      className="w-16 h-16 rounded-lg bg-cover bg-center flex-shrink-0"
                      style={{ backgroundImage: `url(${(hoveredProperty || selectedProperty)?.images.cover})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {(hoveredProperty || selectedProperty)?.title}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {(hoveredProperty || selectedProperty)?.address}
                      </p>
                      <p className="text-sm font-bold text-primary mt-1">
                        {(hoveredProperty || selectedProperty)?.rent} DT/{lang === "fr" ? "mois" : "month"}
                      </p>
                    </div>
                  </div>
                  {selectedProperty && (
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedProperty.lat},${selectedProperty.lng}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Google Maps
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => onPropertySelect?.(selectedProperty)}
                      >
                        {lang === "fr" ? "Details" : "Details"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-background/90 rounded-lg p-2 text-xs">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>{lang === "fr" ? "Disponible" : "Available"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span>{lang === "fr" ? "Loue" : "Rented"}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>{lang === "fr" ? "Entretien" : "Maintenance"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Interactive map selector for property form
interface MapSelectorProps {
  value?: { lat: number; lng: number }
  onChange?: (coords: { lat: number; lng: number }) => void
}

export function MapSelector({ value, onChange }: MapSelectorProps) {
  const { lang } = useI18n()
  const [selectedCoords, setSelectedCoords] = useState(value || { lat: 35.7768, lng: 10.8108 })
  
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    // Convert to approximate coordinates around Monastir
    const lat = 35.7768 + ((50 - y) / 150)
    const lng = 10.8108 + ((x - 50) / 150)
    
    const newCoords = { lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) }
    setSelectedCoords(newCoords)
    onChange?.(newCoords)
  }

  const getMarkerPosition = () => {
    const latDiff = selectedCoords.lat - 35.7768
    const lngDiff = selectedCoords.lng - 10.8108
    
    const x = 50 + (lngDiff * 150)
    const y = 50 - (latDiff * 150)
    
    return { x: Math.max(5, Math.min(95, x)), y: Math.max(5, Math.min(95, y)) }
  }

  const pos = getMarkerPosition()

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {lang === "fr" ? "Localisation sur la carte" : "Location on map"}
      </label>
      <div 
        className="relative h-48 bg-secondary/30 rounded-lg overflow-hidden cursor-crosshair border border-border"
        onClick={handleMapClick}
      >
        {/* Map background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-blue-200/40" />
          <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-secondary/20" />
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="grid-selector" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-selector)" />
          </svg>
        </div>

        {/* Selected marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* Instructions */}
        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          {lang === "fr" ? "Cliquez pour placer le marqueur" : "Click to place marker"}
        </div>
      </div>
      
      {/* Coordinates display */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Lat: {selectedCoords.lat}</span>
        <span>Lng: {selectedCoords.lng}</span>
      </div>
    </div>
  )
}
