"use client"

import { useI18n } from "@/lib/i18n"
import { mockProperties } from "@/lib/property-data"
import { Building2, MapPin, Bed, Bath, Maximize } from "lucide-react"

// ─── Owner Property Card ───────────────────────────────────────────────────
function OwnerPropertyCard({ property }: { property: any }) {
  const { t } = useI18n()
  
  const statusStyles: any = {
    available: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rented: "bg-blue-100 text-blue-700 border-blue-200",
    maintenance: "bg-amber-100 text-amber-700 border-amber-200",
  }

  const statusLabels: any = {
    available: "Disponible",
    rented: "Loué",
    maintenance: "Maintenance",
  }

  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={property.images.cover}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md ${statusStyles[property.status]}`}>
          {statusLabels[property.status]}
        </div>
        <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
          {property.rent} TND <span className="text-xs font-normal opacity-80">/mois</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-foreground line-clamp-1">{property.title}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {property.address}
        </div>
        
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
           <div className="flex gap-3">
             <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{property.surface}m²</span>
             <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.bedrooms} ch.</span>
           </div>
           <button className="text-primary font-semibold hover:underline">Gérer</button>
        </div>
      </div>
    </div>
  )
}

// ─── Owner Properties Grid ──────────────────────────────────────────────────
export function OwnerPropertiesGrid() {
  const { t } = useI18n()
  
  // For demo, show some properties
  const ownerProperties = mockProperties.slice(0, 3)

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {ownerProperties.map((property) => (
        <OwnerPropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
