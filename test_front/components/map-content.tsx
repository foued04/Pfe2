"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import L, { Icon } from "leaflet"
import type { Property } from "@/lib/property-data"
import { isValidCoordinate } from "@/lib/coordinate-validation"
import "leaflet/dist/leaflet.css"

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Create custom marker icon with color
const createIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 1C6.48 1 2 5.48 2 11c0 5.25 3.07 9.8 7.5 12 .5.25 1 .5 1.5 .5s1-.25 1.5-.5c4.43-2.2 7.5-6.75 7.5-12 0-5.52-4.48-10-10-10z"/></svg>`
    )}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  })
}

// Status color mapping
const statusColors: Record<Property["status"], string> = {
  available: "#22c55e", // green
  rented: "#3b82f6", // blue
  maintenance: "#eab308", // yellow
}

// Map controller for centering on selected property
function MapController({
  selectedProperty,
}: {
  selectedProperty?: Property | null
}) {
  const map = useMap()

  useEffect(() => {
    if (selectedProperty) {
      map.setView([selectedProperty.lat, selectedProperty.lng], 15, {
        animate: true,
      })
    }
  }, [selectedProperty, map])

  return null
}

export default function MapContent({
  properties,
  selectedProperty,
  onPropertySelect,
}: {
  properties: Property[]
  selectedProperty?: Property | null
  onPropertySelect?: (property: Property) => void
}) {
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before rendering (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-secondary/10">
        <p className="text-muted-foreground">Initialisation de la carte...</p>
      </div>
    )
  }

  // Filter properties with valid coordinates
  const validProperties = properties.filter((p) =>
    isValidCoordinate(p.lat, p.lng)
  )

  // Center on Monastir, Tunisia
  const center: [number, number] = [35.7768, 10.8108]

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      {/* OpenStreetMap tiles */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {/* Map controller for auto-centering on selected property */}
      <MapController selectedProperty={selectedProperty} />

      {/* Property markers */}
      {validProperties.map((property) => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={createIcon(statusColors[property.status])}
          eventHandlers={{
            click: () => {
              if (onPropertySelect) {
                onPropertySelect(property)
              }
            },
          }}
        >
          <Popup maxWidth={300}>
            <div className="p-3 space-y-2">
              {/* Popup title */}
              <h3 className="font-bold text-sm mb-2">
                {property.title}
              </h3>

              {/* Address */}
              <p className="text-xs text-gray-600 mb-2">
                📍 {property.address}
              </p>

              {/* Type and bedrooms */}
              <div className="text-xs mb-2 flex gap-2 flex-wrap">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                  {property.type.toUpperCase()}
                </span>
                {property.bedrooms > 0 && (
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-medium">
                    🛏️ {property.bedrooms} ch.
                  </span>
                )}
              </div>

              {/* Price and status */}
              <div className="mb-2">
                <p className="font-bold text-sm text-green-600">
                  {property.rent} TND / mois
                </p>
                <p className="text-xs mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded text-white text-xs font-medium ${
                      property.status === "available"
                        ? "bg-green-500"
                        : property.status === "rented"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }`}
                  >
                    {property.status === "available"
                      ? "Disponible"
                      : property.status === "rented"
                        ? "Loué"
                        : "Entretien"}
                  </span>
                </p>
              </div>

              {/* Quick info */}
              <div className="text-xs text-gray-600 mb-3 flex gap-2 flex-wrap">
                <span>📏 {property.surface} m²</span>
                {property.parking && <span>🅿️ Parking</span>}
                {property.meuble && <span>🪑 Meublé</span>}
              </div>

              {/* View details button */}
              <button
                onClick={() => onPropertySelect?.(property)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium py-2 rounded transition-colors"
              >
                Voir détails
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
