"use client"

import dynamic from "next/dynamic"
import type { Property } from "@/lib/property-data"
import { isValidCoordinate } from "@/lib/coordinate-validation"
import { MapPin } from "lucide-react"
import "leaflet/dist/leaflet.css"

const MapContainerDynamic = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
)

const TileLayerDynamic = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
)

const MarkerDynamic = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false }
)

export function PropertyMiniMap({ property }: { property: Property | null }) {
  if (!property || !isValidCoordinate(property.lat, property.lng)) {
    return (
      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
          <MapPin className="h-5 w-5 text-gray-400" />
        </div>
        <p className="text-gray-400 text-xs font-medium">Localisation indisponible</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <MapContainerDynamic
        center={[property.lat, property.lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayerDynamic
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        <MarkerDynamic position={[property.lat, property.lng]} />
      </MapContainerDynamic>
    </div>
  )
}
