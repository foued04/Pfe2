"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"
import { type Property } from "@/lib/property-data"
import { MapPin } from "lucide-react"
import { InteractiveMap } from "./interactive-map"

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
  height = "500px" 
}: PropertyMapProps) {
  const { lang } = useI18n()

  return (
    <Card className="overflow-hidden shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <CardTitle className="text-xl flex items-center gap-2 text-primary">
          <MapPin className="w-6 h-6" />
          <span>{lang === "fr" ? "Carte Interactive - Monastir" : "Interactive Map - Monastir"}</span>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {lang === "fr" 
            ? "Explorez les biens disponibles à Monastir" 
            : "Explore available properties in Monastir"}
        </p>
      </CardHeader>
      <CardContent className="p-0 relative" style={{ height }}>
        <InteractiveMap
          properties={properties}
          selectedProperty={selectedProperty}
          onPropertySelect={onPropertySelect}
          height={height}
        />
        
        {/* Legend overlay - Professional Design */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-xl z-40 min-w-max">
          <div className="font-semibold mb-3 text-gray-900 text-sm">
            {lang === "fr" ? "Légende des Statuts" : "Status Legend"}
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm ring-2 ring-green-200" />
              <span className="text-gray-700 text-sm font-medium">
                {lang === "fr" ? "Disponible" : "Available"}
              </span>
              <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">✓</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500 shadow-sm ring-2 ring-blue-200" />
              <span className="text-gray-700 text-sm font-medium">
                {lang === "fr" ? "Loué" : "Rented"}
              </span>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">◉</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm ring-2 ring-yellow-200" />
              <span className="text-gray-700 text-sm font-medium">
                {lang === "fr" ? "Entretien" : "Maintenance"}
              </span>
              <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded">⚙</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              {lang === "fr" 
                ? "Cliquez sur un marqueur pour voir les détails" 
                : "Click on a marker for details"}
            </p>
          </div>
        </div>

        {/* Monastir badge - bottom right */}
        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold shadow-lg z-40 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Monastir
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
