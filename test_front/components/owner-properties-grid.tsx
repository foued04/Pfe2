"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import {
  Armchair,
  Bed,
  Building2,
  Eye,
  MapPin,
  Maximize,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { PropertyDetailsModal } from "./property-details-modal"

interface OwnerPropertyCardProps {
  property: any
  onManageFurniture: (id: string) => void
  onEdit: (property: any) => void
  onDelete: (id: string) => void
}

function OwnerPropertyCard({ property, onManageFurniture, onEdit, onDelete }: OwnerPropertyCardProps) {
  const { user } = useAuth()
  const { lang } = useI18n()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const ownerId = property.ownerId || property.owner?._id
  const isOwnProperty = Boolean(ownerId && user?.id && String(ownerId) === String(user.id))

  const statusStyles: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-700 border-emerald-100",
    rented: "bg-slate-100 text-slate-700 border-slate-200",
    maintenance: "bg-amber-50 text-amber-700 border-amber-100",
  }

  const statusLabels: Record<string, string> = {
    available: "Disponible",
    rented: "Loue",
    maintenance: "Maintenance",
  }

  const handleDelete = () => {
    if (window.confirm(lang === "fr" ? "Etes-vous sur de vouloir supprimer ce bien ?" : "Are you sure you want to delete this property?")) {
      setIsDeleting(true)
      onDelete(property.id || property._id)
    }
  }

  const displayImage = property.images?.cover
  const isFurnished = Boolean(property.furnished || property.meuble || property.furnishing?.type)

  return (
    <>
      <div className={`group overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isDeleting ? "pointer-events-none opacity-50" : ""}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {displayImage ? (
            <img
              src={displayImage}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
              <Building2 className="h-10 w-10" />
            </div>
          )}

          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-3 pointer-events-none">
            <div className="flex flex-wrap gap-2">
              <Badge
                className={cn(
                  "border px-3 py-1 shadow-sm backdrop-blur-md",
                  statusStyles[property.status] || "bg-gray-100 text-gray-700 hover:bg-gray-100",
                )}
              >
                {statusLabels[property.status] || property.status || "Disponible"}
              </Badge>
              <Badge
                className={cn(
                  "border px-3 py-1 shadow-sm backdrop-blur-md",
                  isOwnProperty
                    ? "border-primary/20 bg-primary/90 text-primary-foreground"
                    : "border-border bg-background/90 text-foreground",
                )}
              >
                {isOwnProperty ? "My property" : "Other owner"}
              </Badge>
            </div>

            {isFurnished ? (
              <Badge className="flex items-center gap-1.5 border-none bg-background/90 px-3 py-1 text-foreground shadow-sm backdrop-blur-md">
                <Armchair className="h-3.5 w-3.5" />
                {lang === "fr" ? "Meuble" : "Furnished"}
              </Badge>
            ) : null}
          </div>

          <div className="absolute bottom-3 left-3 rounded-xl border border-white/10 bg-black/80 px-4 py-2 text-sm font-black text-white shadow-lg backdrop-blur-md">
            {property.rent?.toLocaleString() || 0} TND <span className="text-xs font-normal opacity-70">/mois</span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div>
            <h3 className="line-clamp-1 text-lg font-black tracking-tight text-foreground">{property.title || "Sans Titre"}</h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {property.address || property.city || "Adresse non specifiee"}
            </div>
            {(property.ownerName || property.ownerPhone || property.ownerEmail) && (
              <div className="mt-2 text-xs font-medium text-muted-foreground">
                {property.ownerName || "Owner"}
                {property.ownerPhone && property.ownerPhone !== "-" ? ` • ${property.ownerPhone}` : ""}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <div className="rounded-md bg-muted p-1">
                  <Maximize className="h-3.5 w-3.5" />
                </div>
                {property.surface || 0}m2
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <div className="rounded-md bg-muted p-1">
                  <Bed className="h-3.5 w-3.5" />
                </div>
                {property.bedrooms || 0} ch.
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <DropdownMenuItem className="cursor-pointer gap-2 py-2" onClick={() => setIsDetailsOpen(true)}>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  {lang === "fr" ? "Voir details" : "View details"}
                </DropdownMenuItem>

                {isOwnProperty ? (
                  <>
                    <DropdownMenuItem className="cursor-pointer gap-2 py-2" onClick={() => onEdit(property)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                      {lang === "fr" ? "Modifier" : "Edit"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2 font-medium"
                      onClick={() => onManageFurniture(property.id || property._id)}
                    >
                      <Armchair className="h-4 w-4 text-primary" />
                      {lang === "fr" ? "Gerer les meubles" : "Manage furniture"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      className="cursor-pointer gap-2 py-2 text-destructive focus:text-destructive"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      {lang === "fr" ? "Supprimer le bien" : "Delete property"}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem className="gap-2 py-2 text-muted-foreground focus:text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {lang === "fr" ? "Lecture seule" : "Read only"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {!isOwnProperty && (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground">
              {lang === "fr"
                ? "Ce bien appartient a un autre proprietaire. Visible uniquement."
                : "This property belongs to another owner. View only."}
            </div>
          )}
        </div>
      </div>

      <PropertyDetailsModal
        property={property}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        isFavorite={false}
        onToggleFavorite={() => {}}
        onContact={() => {}}
        isOwnerView={true}
      />
    </>
  )
}

interface OwnerPropertiesGridProps {
  properties: any[]
  onManageFurniture: (id: string) => void
  onEdit: (property: any) => void
  onDelete: (id: string) => void
}

export function OwnerPropertiesGrid({ properties, onManageFurniture, onEdit, onDelete }: OwnerPropertiesGridProps) {
  const { lang } = useI18n()

  if (!properties || properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-20 text-center">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Building2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {lang === "fr" ? "Aucune propriete trouvee" : "No properties found"}
        </h3>
        <p className="mx-auto max-w-sm text-muted-foreground">
          {lang === "fr"
            ? "Aucun bien n'est disponible pour le moment."
            : "No properties are available right now."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property, idx) => (
        <OwnerPropertyCard
          key={property.id || property._id || `prop-${idx}`}
          property={property}
          onManageFurniture={onManageFurniture}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
