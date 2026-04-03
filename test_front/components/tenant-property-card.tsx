"use client"

import { useI18n } from "@/lib/i18n"
import type { Property } from "@/lib/property-data"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Eye,
  MessageSquare,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface TenantPropertyCardProps {
  property: Property
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onViewDetails: (property: Property) => void
  onContact: (property: Property) => void
}

const typeLabels: Record<string, string> = {
  s0: "S+0",
  s1: "S+1",
  s2: "S+2",
  s3: "S+3",
  s4: "S+4",
  villa: "Villa",
}

export function TenantPropertyCard({
  property,
  isFavorite,
  onToggleFavorite,
  onViewDetails,
  onContact,
}: TenantPropertyCardProps) {
  const { t } = useI18n()

  const statusColors = {
    available: "bg-green-500/10 text-green-700 border-green-200",
    rented: "bg-amber-500/10 text-amber-700 border-amber-200",
    maintenance: "bg-red-500/10 text-red-700 border-red-200",
  }

  const handleCardActivate = () => {
    onViewDetails(property)
  }

  return (
    <Card
      className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:shadow-primary/10 cursor-pointer focus-within:ring-2 focus-within:ring-primary/40"
      onClick={handleCardActivate}
      tabIndex={0}
      role="button"
      aria-label={`${property.title} - ${property.address}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          handleCardActivate()
        }
      }}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images?.cover || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge variant="aqua" className="font-semibold px-3 py-1">
            {typeLabels[property.type]}
          </Badge>
          {property.type === "villa" && (
            <Badge variant="coral" className="font-semibold px-2 py-1">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </div>
        
        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(property.id || (property as any)._id)
          }}
          className={cn(
            "absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200",
            isFavorite
              ? "bg-orange-500 text-white shadow-lg shadow-orange-900/40"
              : "bg-card/80 text-foreground hover:bg-card"
          )}
        >
          <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
        </button>

        {/* Bottom Info */}
        <div className="absolute bottom-3 left-3 right-3">
          <p className="text-xl font-black text-white drop-shadow-md">
            {property.rent} TND<span className="text-sm font-normal opacity-90">{t("property.perMonth")}</span>
          </p>
        </div>

        {/* Mini Room Previews */}
        <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {[property.images?.kitchen, property.images?.bedroom, property.images?.bathroom].filter(Boolean).map((img, i) => (
            <div key={i} className="h-10 w-10 overflow-hidden rounded-md border-2 border-white/50">
              <img
                src={img!}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title & Status */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1 text-lg">
            {property.title}
          </h3>
          <Badge variant="outline" className={cn("shrink-0 text-xs", statusColors[property.status])}>
            {t(`property.status.${property.status}`)}
          </Badge>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{property.city}, {property.department}</span>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {property.description}
        </p>

        {/* Features */}
        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Maximize className="h-4 w-4" />
            <span>{property.surface} m²</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(property)
            }}
            variant="outline"
            className="flex-1 gap-2 border-primary/20 text-primary hover:bg-primary/5"
          >
            <Eye className="h-4 w-4" />
            {t("property.viewDetails")}
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation()
              onContact(property)
            }}
            variant="coral"
            className="flex-1 gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            {t("tenant.contactOwner")}
          </Button>
        </div>
      </div>
    </Card>
  )
}
