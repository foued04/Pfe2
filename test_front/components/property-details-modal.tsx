"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import type { Property } from "@/lib/property-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Car,
  Sofa,
  ChefHat,
  Home,
  User,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Send,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const PropertyMiniMap = dynamic(
  () => import("./property-mini-map").then((mod) => mod.PropertyMiniMap),
  { ssr: false }
)

interface PropertyDetailsModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onContact: (property: Property) => void
  isOwnerView?: boolean
}

const typeLabels: Record<string, string> = {
  s0: "Studio (S+0)",
  s1: "Appartement S+1",
  s2: "Appartement S+2",
  s3: "Appartement S+3",
  s4: "Appartement S+4",
  villa: "Villa",
}

const statusConfig: Record<string, { color: string; label: string }> = {
  available: { color: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Disponible" },
  rented: { color: "bg-blue-50 text-blue-700 border-blue-200", label: "Loué" },
  maintenance: { color: "bg-amber-50 text-amber-700 border-amber-200", label: "En maintenance" },
}

export function PropertyDetailsModal({
  property,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onContact,
  isOwnerView = false,
}: PropertyDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (isOpen) setCurrentImageIndex(0)
  }, [property?.id, isOpen])

  if (!property) return null

  const images = [
    { src: property.images.cover, label: "Couverture" },
    { src: property.images.livingRoom, label: "Salon" },
    { src: property.images.bedroom, label: "Chambre" },
    { src: property.images.kitchen, label: "Cuisine" },
    { src: property.images.bathroom, label: "Salle de bain" },
    { src: property.images.exterior, label: "Extérieur" },
  ].filter(img => img.src)

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }
  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleSendRequest = () => {
    onContact(property)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[800px] w-[95vw] max-h-[calc(100vh-8rem)] sm:max-h-[80vh] p-0 overflow-hidden flex flex-col rounded-xl bg-white border-0 shadow-2xl"
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{property.title}</DialogTitle>
        
        {/* ─── SCROLLABLE CONTENT ─── */}
        <div className="flex-1 overflow-y-auto overscroll-contain bg-white custom-scrollbar">
          
          {/* Main Image */}
          <div className="relative h-[240px] sm:h-[280px] w-full bg-gray-100 flex-shrink-0">
            <Image
              src={images[currentImageIndex].src}
              alt={images[currentImageIndex].label}
              fill
              className="object-cover"
              priority
            />
            
            {/* Top Badges */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              <Badge className="bg-white/90 backdrop-blur-sm text-gray-800 border-0 px-2.5 py-1 text-xs font-semibold shadow-sm">
                {typeLabels[property.type]}
              </Badge>
              {property.type === "villa" && (
                <Badge className="bg-amber-100 text-amber-800 border-0 px-2.5 py-1 text-xs font-semibold shadow-sm flex items-center">
                  <Star className="h-3 w-3 mr-1 fill-current" /> Premium
                </Badge>
              )}
            </div>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white backdrop-blur-sm text-gray-700 transition-colors shadow-sm"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm text-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white backdrop-blur-sm shadow-sm text-gray-700 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
            
            {/* Counter */}
            <div className="absolute bottom-3 right-4">
              <span className="bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-medium tracking-wide">
                {currentImageIndex + 1} / {images.length}
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            
            {/* Header & Price */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-2 flex-1">
                <Badge variant="outline" className={cn("px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider", statusConfig[property.status].color)}>
                  {statusConfig[property.status].label}
                </Badge>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span>{property.address}, {property.city}</span>
                </div>
              </div>
              
              <div className="text-left md:text-right shrink-0">
                <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Loyer mensuel</div>
                <div className="flex items-baseline md:justify-end gap-1">
                  <span className="text-3xl font-extrabold text-primary">
                    {property.rent.toLocaleString()}
                  </span>
                  <span className="text-base font-semibold text-gray-700">TND</span>
                </div>
                {property.deposit > 0 && (
                  <div className="text-xs text-gray-500 mt-2">
                    Dépôt de garantie: <span className="font-semibold text-gray-800">{property.deposit.toLocaleString()} TND</span>
                  </div>
                )}
              </div>
            </div>

            {/* Characteristics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FeatureItem icon={Maximize} label="Surface" value={`${property.surface} m²`} />
              <FeatureItem icon={Bed} label="Chambres" value={property.bedrooms} />
              <FeatureItem icon={Bath} label="S. de bain" value={property.bathrooms} />
              <FeatureItem icon={ChefHat} label="Cuisine" value={property.equippedKitchen ? "Équipée" : "Standard"} />
              <FeatureItem icon={Car} label="Parking" value={property.parking ? "Oui" : "Non"} />
              <FeatureItem icon={Sofa} label="Meublé" value={property.furnished ? "Oui" : "Non"} />
              <FeatureItem icon={Home} label="Balcon" value={property.balcony ? "Oui" : "Non"} />
            </div>

            <hr className="border-gray-100" />

            {/* Layout: Description + Map side by side on desktop */}
            <div className="grid md:grid-cols-[1.5fr_1fr] gap-8">
              
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Description
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {property.description || "Aucune description détaillée n'a été fournie pour ce bien."}
                </p>
              </div>

              {/* Localisation */}
              <div className="space-y-3 flex flex-col">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Localisation
                </h3>
                <div className="h-[180px] w-full rounded-lg overflow-hidden border border-gray-200 shrink-0">
                  <PropertyMiniMap property={property} />
                </div>
              </div>

            </div>

            <hr className="border-gray-100" />

            {/* Owner Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 bg-gray-50 rounded-lg p-5 border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Propriétaire</div>
                  <div className="font-semibold text-gray-900">{property.ownerName}</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5 text-sm">
                <a href={`mailto:${property.ownerEmail}`} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{property.ownerEmail}</span>
                </a>
                <a href={`tel:${property.ownerPhone}`} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{property.ownerPhone}</span>
                </a>
              </div>
            </div>

            {/* CTA */}
            {!isOwnerView && (
              <div className="pt-2">
                <Button 
                  onClick={handleSendRequest}
                  className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Envoyer une demande
                </Button>
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function FeatureItem({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div className="flex items-center justify-center text-primary/70">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-[10px] text-gray-500 uppercase font-medium">{label}</div>
        <div className="text-sm font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  )
}
