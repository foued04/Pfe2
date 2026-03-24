"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import type { Property } from "@/lib/property-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  X,
  Heart,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Sofa,
  ChefHat,
  Home,
  Calendar,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface PropertyDetailsModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onContact: (property: Property) => void
}

const typeLabels: Record<string, string> = {
  s0: "S+0 (Studio)",
  s1: "S+1",
  s2: "S+2",
  s3: "S+3",
  s4: "S+4",
  villa: "Villa",
}

export function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onContact,
}: PropertyDetailsModalProps) {
  const { t } = useI18n()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  if (!property) return null

  const images = [
    { src: property.images.cover, label: "Couverture" },
    { src: property.images.livingRoom, label: "Salon" },
    { src: property.images.bedroom, label: "Chambre" },
    { src: property.images.kitchen, label: "Cuisine" },
    { src: property.images.bathroom, label: "Salle de bain" },
    { src: property.images.exterior, label: "Extérieur" },
  ]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const amenities = [
    { icon: Bed, label: `${property.bedrooms} ${t("property.bedrooms")}`, available: true },
    { icon: Bath, label: `${property.bathrooms} ${t("property.bathrooms")}`, available: true },
    { icon: Maximize, label: `${property.surface} m²`, available: true },
    { icon: Car, label: "Parking", available: property.parking },
    { icon: Sofa, label: "Meublé", available: property.furnished },
    { icon: ChefHat, label: "Cuisine Équipée", available: property.equippedKitchen },
    { icon: Home, label: "Balcon/Terrasse", available: property.balcony },
  ]

  const statusColors = {
    available: "bg-green-500/10 text-green-700 border-green-200",
    rented: "bg-amber-500/10 text-amber-700 border-amber-200",
    maintenance: "bg-red-500/10 text-red-700 border-red-200",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-card">
        <DialogHeader className="sr-only">
          <DialogTitle>{property.title}</DialogTitle>
        </DialogHeader>

        {/* Image Gallery */}
        <div className="relative aspect-video bg-muted">
          <Image
            src={images[currentImageIndex].src}
            alt={images[currentImageIndex].label}
            fill
            className="object-cover"
          />
          
          {/* Navigation Arrows */}
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-foreground hover:bg-card transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-foreground hover:bg-card transition-colors"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Image Label */}
          <div className="absolute bottom-4 left-4 rounded-full bg-card/80 px-4 py-1 text-sm font-medium text-foreground">
            {images[currentImageIndex].label} ({currentImageIndex + 1}/{images.length})
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 text-foreground hover:bg-card transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        <div className="flex gap-2 overflow-x-auto px-6 py-3 bg-muted/50">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-all",
                currentImageIndex === index
                  ? "ring-2 ring-primary"
                  : "opacity-60 hover:opacity-100"
              )}
            >
              <Image
                src={img.src}
                alt={img.label}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge className="bg-primary text-primary-foreground font-semibold">
                  {typeLabels[property.type]}
                </Badge>
                <Badge variant="outline" className={statusColors[property.status]}>
                  {t(`property.status.${property.status}`)}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold text-foreground">{property.title}</h2>
              <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">
                {property.rent} TND
                <span className="text-base font-normal text-muted-foreground">{t("property.perMonth")}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {t("property.deposit")}: {property.deposit} TND
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {amenities.map((amenity, index) => {
              const Icon = amenity.icon
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border border-border p-3",
                    amenity.available ? "bg-card" : "bg-muted/50 opacity-50"
                  )}
                >
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    amenity.available ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{amenity.label}</span>
                  {amenity.available && <Check className="h-4 w-4 text-green-600 ml-auto" />}
                </div>
              )
            })}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold text-foreground mb-2">{t("property.description")}</h3>
            <p className="text-muted-foreground leading-relaxed">{property.description}</p>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-3 rounded-lg border border-border p-4 bg-secondary/30">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Disponibilité</p>
              <p className="text-sm text-muted-foreground">
                {new Date(property.availability).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Owner Contact */}
          <div className="rounded-lg border border-border p-4 bg-card">
            <h3 className="font-semibold text-foreground mb-3">{t("property.contact")}</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{property.ownerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{property.ownerEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{property.ownerPhone}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              onClick={() => onToggleFavorite(property.id)}
              variant="outline"
              className={cn(
                "flex-1 gap-2",
                isFavorite && "bg-primary/10 border-primary text-primary"
              )}
            >
              <Heart className={cn("h-5 w-5", isFavorite && "fill-current")} />
              {isFavorite ? t("tenant.removeFavorite") : t("tenant.addFavorite")}
            </Button>
            <Button
              onClick={() => onContact(property)}
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {t("tenant.sendRequest")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
