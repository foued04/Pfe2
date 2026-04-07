"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { 
  Building2, 
  MapPin, 
  Bed, 
  Maximize, 
  MoreVertical, 
  Eye, 
  Pencil, 
  Armchair,
  Trash2
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
  const { lang } = useI18n()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const statusStyles: any = {
    available: "bg-emerald-100 text-emerald-700 border-emerald-200", // Turquoise Soft
    rented: "bg-orange-100 text-orange-700 border-orange-200", // Corail Soft
    maintenance: "bg-orange-600/10 text-orange-800 border-orange-300", // Corail Darker
  }

  const statusLabels: any = {
    available: "Disponible",
    rented: "Loué",
    maintenance: "Maintenance",
  }

  const handleDelete = () => {
    if (window.confirm(lang === "fr" ? "Êtes-vous sûr de vouloir supprimer ce bien ?" : "Are you sure you want to delete this property?")) {
      setIsDeleting(true)
      onDelete(property.id || property._id)
    }
  }

  const displayImage = property.images?.cover
  
  return (
    <>
      <div className={`group overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}>
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
          
          <div className="absolute inset-x-3 top-3 flex justify-between items-start pointer-events-none">
            <Badge className={(statusStyles[property.status] || "bg-gray-100 text-gray-700") + " border shadow-sm backdrop-blur-md px-3 py-1"}>
              {statusLabels[property.status] || property.status || "Disponible"}
            </Badge>
            
            {property.furnished && (
              <Badge className="bg-background/90 text-foreground border-none shadow-sm backdrop-blur-md flex items-center gap-1.5 px-3 py-1">
                <Armchair className="h-3.5 w-3.5" />
                {lang === "fr" ? "Meublé" : "Furnished"}
              </Badge>
            )}
          </div>

          <div className="absolute bottom-3 left-3 rounded-xl bg-black/80 px-4 py-2 text-sm font-black text-white backdrop-blur-md shadow-lg border border-white/10">
            {property.rent?.toLocaleString() || 0} TND <span className="text-xs font-normal opacity-70">/mois</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-black text-lg text-foreground line-clamp-1 tracking-tight">{property.title || "Sans Titre"}</h3>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {property.address || property.city || "Adresse non spécifiée"}
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-border/50 pt-4">
             <div className="flex gap-4">
               <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                 <div className="bg-muted p-1 rounded-md"><Maximize className="h-3.5 w-3.5" /></div>
                 {property.surface || 0}m²
               </div>
               <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                 <div className="bg-muted p-1 rounded-md"><Bed className="h-3.5 w-3.5" /></div>
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
                 <DropdownMenuItem className="gap-2 cursor-pointer py-2" onClick={() => setIsDetailsOpen(true)}>
                   <Eye className="h-4 w-4 text-muted-foreground" />
                   {lang === "fr" ? "Voir détails" : "View details"}
                 </DropdownMenuItem>
                 <DropdownMenuItem className="gap-2 cursor-pointer py-2" onClick={() => onEdit(property)}>
                   <Pencil className="h-4 w-4 text-muted-foreground" />
                   {lang === "fr" ? "Modifier" : "Edit"}
                 </DropdownMenuItem>
                 
                 <DropdownMenuSeparator />
                 
                 <DropdownMenuItem 
                   className="gap-2 cursor-pointer font-medium py-2"
                   onClick={() => onManageFurniture(property.id || property._id)}
                 >
                   <Armchair className="h-4 w-4 text-primary" />
                   {lang === "fr" ? "Gérer les meubles" : "Manage furniture"}
                 </DropdownMenuItem>
                 
                 <DropdownMenuSeparator />
                 
                 <DropdownMenuItem 
                   className="gap-2 cursor-pointer text-destructive focus:text-destructive py-2"
                   onClick={handleDelete}
                 >
                   <Trash2 className="h-4 w-4" />
                   {lang === "fr" ? "Supprimer le bien" : "Delete property"}
                 </DropdownMenuItem>
               </DropdownMenuContent>
             </DropdownMenu>
          </div>
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
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed border-border bg-muted/30">
        <div className="mb-4 rounded-full bg-muted p-6">
          <Building2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          {lang === "fr" ? "Aucune propriété trouvée" : "No properties found"}
        </h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          {lang === "fr" 
            ? "Vous n'avez pas encore ajouté de biens immobiliers. Cliquez sur le bouton 'Ajouter' pour commencer." 
            : "You haven't added any properties yet. Click the 'Add' button to get started."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <OwnerPropertyCard 
          key={property.id || property._id || Math.random().toString()} 
          property={property} 
          onManageFurniture={onManageFurniture}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
