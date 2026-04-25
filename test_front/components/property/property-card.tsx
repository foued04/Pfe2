import Link from "next/link"
import type { Property } from "@/lib/property-data"
import { Bath, Bed, MapPin, Maximize } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const statusLabel: Record<string, string> = {
  available: "Disponible",
  rented: "Loue",
  maintenance: "Maintenance",
}

type PropertyCardProps = {
  property: Property
  onSelect?: (property: Property) => void
}

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
  const card = (
    <Card className="group overflow-hidden border-border/60 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={property.images.cover}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <Badge className="border-0 bg-white/90 text-slate-900 shadow-sm">{statusLabel[property.status] || property.status}</Badge>
          <Badge variant="secondary">{property.type.toUpperCase()}</Badge>
        </div>
        <div className="absolute bottom-4 left-4 rounded-xl bg-slate-950/80 px-4 py-2 text-sm font-bold text-white backdrop-blur">
          {property.rent.toLocaleString("fr-TN")} TND/mois
        </div>
      </div>
      <CardContent className="space-y-4 p-5">
        <div>
          <h3 className="line-clamp-1 text-lg font-bold">{property.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{property.address}</span>
          </div>
        </div>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{property.description}</p>
        <div className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2"><Maximize className="h-4 w-4" /> {property.surface} m2</span>
          <span className="inline-flex items-center gap-2"><Bed className="h-4 w-4" /> {property.bedrooms}</span>
          <span className="inline-flex items-center gap-2"><Bath className="h-4 w-4" /> {property.bathrooms}</span>
        </div>
      </CardContent>
    </Card>
  )

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(property)} className="block w-full cursor-pointer border-0 bg-transparent p-0">
        {card}
      </button>
    )
  }

  return (
    <Link href={`/property/${property.id}`} className="block">
      {card}
    </Link>
  )
}
