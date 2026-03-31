"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import type { Property } from "@/lib/property-data"

// Dynamically import Leaflet components to avoid SSR issues
const MapContent = dynamic(() => import("./map-content"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-secondary/10">
      <p className="text-muted-foreground">Chargement de la carte...</p>
    </div>
  ),
})

interface InteractiveMapProps {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect?: (property: Property) => void
  height?: string
}

export function InteractiveMap({
  properties,
  selectedProperty,
  onPropertySelect,
  height = "400px",
}: InteractiveMapProps) {
  return (
    <div style={{ height }} className="rounded-lg overflow-hidden border">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-secondary/10">
            <p className="text-muted-foreground">Chargement de la carte...</p>
          </div>
        }
      >
        <MapContent
          properties={properties}
          selectedProperty={selectedProperty}
          onPropertySelect={onPropertySelect}
        />
      </Suspense>
    </div>
  )
}
