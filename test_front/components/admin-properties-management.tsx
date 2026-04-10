"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  Building, 
  MapPin, 
  User, 
  Calendar, 
  Check, 
  X, 
  Eye, 
  Search, 
  Filter,
  AlertCircle,
  MoreVertical,
  Layers,
  Sofa,
  Package
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type Property, mapBackendProperty as centralMapBackendProperty } from "@/lib/property-data"

type ValidationStatus = "pending" | "approved" | "rejected"

interface ManagedProperty extends Property {
  validationStatus: ValidationStatus
  rejectionReason?: string
}

const formatDate = (value?: string) => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString().slice(0, 10)
}

const mapBackendProperty = (property: any): ManagedProperty => {
  const mapped = centralMapBackendProperty(property)
  return {
    ...mapped,
    // Add admin-specific fields
    validationStatus: property.moderationStatus || property.validationStatus || "pending",
    rejectionReason: property.rejectionReason || "",
    // Ensure dates are formatted for the table
    createdAt: formatDate(property.createdAt),
  }
}

export function AdminPropertiesManagement() {
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [filter, setFilter] = useState({ search: "", status: "all", city: "all" })
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<ManagedProperty | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                         p.ownerName.toLowerCase().includes(filter.search.toLowerCase())
    const matchesStatus = filter.status === "all" || p.validationStatus === filter.status
    const matchesCity = filter.city === "all" || p.city === filter.city
    return matchesSearch && matchesStatus && matchesCity
  })

  const syncPropertyState = (id: string, validationStatus: ValidationStatus, reason?: string) => {
    setProperties((prev) =>
      prev.map((property) =>
        property.id === id ? { ...property, validationStatus, rejectionReason: reason } : property
      )
    )
    setSelectedProperty((prev) =>
      prev && prev.id === id ? { ...prev, validationStatus, rejectionReason: reason } : prev
    )
  }

  const fetchProperties = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des proprietes.")
      }

      const data = await response.json()
      setProperties(data.map(mapBackendProperty))
    } catch (error) {
      console.error("Error fetching admin properties:", error)
      alert("Impossible de charger les proprietes.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const updateModerationStatus = async (id: string, validationStatus: ValidationStatus, reason?: string) => {
    setUpdatingId(id)
    try {
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ moderationStatus: validationStatus }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        throw new Error(error?.message || "Erreur lors de la mise a jour du statut.")
      }

      syncPropertyState(id, validationStatus, reason)
      return true
    } catch (error) {
      console.error("Error updating moderation status:", error)
      alert(error instanceof Error ? error.message : "Erreur lors de la mise a jour du statut.")
      return false
    } finally {
      setUpdatingId(null)
    }
  }

  const handleApprove = async (id: string) => {
    await updateModerationStatus(id, "approved")
  }

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) return
    const didUpdate = await updateModerationStatus(id, "rejected", rejectionReason)
    if (didUpdate) {
      setRejectingId(null)
      setRejectionReason("")
    }
  }

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold">Publié</Badge>
      case "pending":
        return <Badge className="bg-orange-100 text-orange-600 border-none font-bold animate-pulse">En attente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 border-none font-bold">Rejeté</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des Biens Immobiliers</h1>
          <p className="text-muted-foreground font-medium">Modérez et gérez les annonces publiées sur la plateforme</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-primary/5 text-primary border-primary/10 font-bold">
             {properties.filter(p => p.validationStatus === "pending").length} en attente
           </Badge>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher par titre, locateur..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-muted/50 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select 
              className="bg-muted/50 border-none rounded-2xl px-4 py-2.5 text-sm font-black text-muted-foreground focus:ring-2 focus:ring-primary/20"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid gap-6">
        {isLoading && (
          <Card className="border-none shadow-xl bg-card p-8">
            <p className="text-sm font-bold text-muted-foreground">Chargement des proprietes...</p>
          </Card>
        )}
        {filteredProperties.map((property) => (
          <Card key={property.id} className="border-none shadow-xl bg-card overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="flex flex-col lg:flex-row">
              <div className="relative w-full lg:w-72 h-48 lg:h-auto shrink-0 overflow-hidden">
                <img 
                  src={property.images.cover} 
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(property.validationStatus)}
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-black text-foreground tracking-tight line-clamp-1">{property.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-primary" /> {property.type}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> {property.city}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-primary tracking-tighter">{property.rent} DT</p>
                      <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">Par mois</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 py-4 border-y border-border/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-muted-foreground mb-1">Locateur</span>
                      <span className="text-sm font-bold text-foreground flex items-center gap-2"><User className="w-3.5 h-3.5 text-orange-400" /> {property.ownerName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-muted-foreground mb-1">Date d&apos;ajout</span>
                      <span className="text-sm font-bold text-foreground flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> {property.createdAt}</span>
                    </div>
                    <div className="flex flex-col col-span-2">
                      <span className="text-[9px] font-black uppercase text-muted-foreground mb-1">Adresse</span>
                      <span className="text-sm font-bold text-foreground truncate">{property.address}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 gap-4">
                  <div className="flex gap-2 w-full lg:w-auto">
                    {property.validationStatus === "pending" ? (
                      <>
                        <Button 
                          onClick={() => handleApprove(property.id)}
                          disabled={updatingId === property.id}
                          className="flex-1 lg:flex-none h-11 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase text-[11px] tracking-widest text-white shadow-lg shadow-emerald-200 border-none"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {updatingId === property.id ? "..." : "Approuver"}
                        </Button>
                        <Button 
                          onClick={() => setRejectingId(property.id)}
                          disabled={updatingId === property.id}
                          variant="outline"
                          className="flex-1 lg:flex-none h-11 px-8 rounded-2xl bg-red-50 text-red-600 border-red-200 border-2 font-black uppercase text-[11px] tracking-widest hover:bg-red-100"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {updatingId === property.id ? "..." : "Rejeter"}
                        </Button>
                      </>
                    ) : (
                      <>
                        {property.validationStatus === "approved" ? (
                          <Button 
                            variant="outline"
                            disabled={updatingId === property.id}
                            onClick={() => setRejectingId(property.id)}
                            className="h-11 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                          >
                            <Check className="w-4 h-4 mr-2" /> PUBLIÉ (Cliquer pour retirer)
                          </Button>
                        ) : (
                          <Button 
                            variant="outline"
                            disabled={updatingId === property.id}
                            onClick={() => handleApprove(property.id)}
                            className="h-11 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest border-2 border-red-500 text-red-600 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" /> REJETÉ (Cliquer pour approuver)
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                  <Button 
                    onClick={() => setSelectedProperty(property)}
                    variant="ghost" 
                    className="h-11 px-6 rounded-2xl font-black uppercase text-[11px] tracking-widest text-primary flex items-center gap-2 hover:bg-primary/5"
                  >
                    <Eye className="w-4 h-4" />
                    Voir Détails
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {!isLoading && filteredProperties.length === 0 && (
          <Card className="border-none shadow-xl bg-card p-8">
            <p className="text-sm font-bold text-foreground">Aucune propriete trouvee.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Modifiez le filtre ou ajoutez de nouvelles annonces pour les voir ici.
            </p>
          </Card>
        )}
      </div>

      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-background rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-8">
            <button 
              onClick={() => setSelectedProperty(null)}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col lg:flex-row h-full">
              <div className="w-full lg:w-1/2 bg-muted p-1 flex flex-col gap-1">
                 <div className="h-[400px] lg:h-[500px] w-full rounded-2xl overflow-hidden relative">
                    <img src={selectedProperty.images.cover} className="w-full h-full object-cover" alt="Main" />
                    <div className="absolute top-6 left-6">
                      {getStatusBadge(selectedProperty.validationStatus)}
                    </div>
                 </div>
                 <div className="grid grid-cols-5 gap-1">
                   {[selectedProperty.images.kitchen, selectedProperty.images.bathroom, selectedProperty.images.bedroom, selectedProperty.images.livingRoom, selectedProperty.images.exterior].map((img, i) => (
                     <div key={i} className="h-20 lg:h-24 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary transition-all cursor-pointer">
                        <img src={img} className="w-full h-full object-cover" alt={`Thumb ${i}`} />
                     </div>
                   ))}
                 </div>
              </div>

              <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[800px] scrollbar-hide">
                 <div className="space-y-8">
                    <div>
                      <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em] mb-2">
                        <Building className="w-3 h-3" /> {selectedProperty.type} • {selectedProperty.city}
                      </div>
                      <h2 className="text-4xl font-black text-foreground tracking-tight leading-tight uppercase underline decoration-primary/30 underline-offset-8 decoration-4 mb-4">
                        {selectedProperty.title}
                      </h2>
                      <p className="text-lg text-muted-foreground font-medium flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" /> {selectedProperty.address}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 py-8 border-y border-border/50">
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5">Loyer Mensuel</p>
                          <p className="text-4xl font-black text-primary tracking-tighter">{selectedProperty.rent} <span className="text-lg">DT</span></p>
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5">Caution Demandée</p>
                          <p className="text-4xl font-black text-foreground tracking-tighter">{selectedProperty.deposit} <span className="text-lg">DT</span></p>
                       </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Description complète</h4>
                      <p className="text-base text-foreground/80 leading-relaxed font-medium">
                        {selectedProperty.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 bg-muted/30 p-6 rounded-3xl border border-border/30">
                       {[
                         { label: "Surface", value: `${selectedProperty.surface} m²`, icon: Layers },
                         { label: "Chambres", value: selectedProperty.bedrooms, icon: Building },
                         { label: "Salles de bain", value: selectedProperty.bathrooms, icon: Building },
                         { label: "Salons", value: selectedProperty.livingRooms, icon: Sofa },
                         { label: "Cuisine", value: selectedProperty.equippedKitchen ? "Équipée" : "Standard", icon: Package },
                         { label: "Meublé", value: selectedProperty.meuble ? "Oui" : "Non", icon: Package },
                       ].map((feat, i) => (
                         <div key={i} className="flex flex-col gap-1">
                            <span className="text-[9px] font-black uppercase text-muted-foreground opacity-60 tracking-wider flex items-center gap-1.5">
                              <feat.icon className="w-3 h-3" /> {feat.label}
                            </span>
                            <span className="text-sm font-black text-foreground">{feat.value}</span>
                         </div>
                       ))}
                    </div>

                    <div className="p-6 rounded-3xl border-2 border-primary/10 bg-primary/5 flex items-center gap-5">
                       <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-black text-2xl shadow-lg ring-4 ring-white">
                         {selectedProperty.ownerName[0]}
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">Locateur de confiance</p>
                          <h4 className="text-xl font-black text-foreground tracking-tight">{selectedProperty.ownerName}</h4>
                          <div className="flex flex-wrap gap-4 mt-2">
                             <div className="text-xs font-black text-muted-foreground flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {selectedProperty.ownerEmail}</div>
                             <div className="text-xs font-black text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> +216 {selectedProperty.ownerPhone.split('+216')[1] || selectedProperty.ownerPhone}</div>
                          </div>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-border/50">
                       {selectedProperty.validationStatus === "pending" ? (
                          <div className="space-y-6">
                             <div className="flex flex-col gap-2">
                                <h4 className="text-[10px] font-black uppercase text-red-600 tracking-widest">Zone de décision</h4>
                                <p className="text-sm text-muted-foreground font-medium">Vérifiez toutes les informations avant de valider cette annonce.</p>
                             </div>
                             <div className="flex gap-4">
                                <Button 
                                  onClick={() => handleApprove(selectedProperty.id)}
                                  disabled={updatingId === selectedProperty.id}
                                  className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase text-xs tracking-[0.1em] text-white shadow-xl shadow-emerald-200 border-none"
                                >
                                  <Check className="w-5 h-5 mr-3" />
                                  {updatingId === selectedProperty.id ? "..." : "Approuver l'annonce"}
                                </Button>
                                <Button 
                                  onClick={() => setRejectingId(selectedProperty.id)}
                                  disabled={updatingId === selectedProperty.id}
                                  variant="outline"
                                  className="flex-1 h-14 rounded-2xl bg-red-50 text-red-600 border-red-200 border-2 font-black uppercase text-xs tracking-[0.1em] hover:bg-red-100"
                                >
                                  <X className="w-5 h-5 mr-3" />
                                  Rejeter l&apos;annonce
                                </Button>
                             </div>
                          </div>
                       ) : selectedProperty.validationStatus === "approved" ? (
                          <div className="flex items-center justify-between p-6 rounded-3xl bg-emerald-50 border border-emerald-200">
                             <div>
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Statut actuel</p>
                                <div className="flex items-center gap-3">
                                   <Badge className="bg-emerald-500 text-white border-none font-bold italic">ANNONCE PUBLIÉE</Badge>
                                   <span className="text-sm font-bold text-foreground">Visible sur la page d'accueil</span>
                                </div>
                             </div>
                             <Button 
                               variant="outline"
                               disabled={updatingId === selectedProperty.id}
                               onClick={() => setRejectingId(selectedProperty.id)}
                               className="rounded-2xl bg-red-50 text-red-600 border-red-200 border-2 font-black uppercase text-[10px] tracking-widest h-10 px-6"
                             >
                                <X className="w-4 h-4 mr-2" /> {updatingId === selectedProperty.id ? "..." : "Retirer l'annonce"}
                             </Button>
                          </div>
                       ) : (
                        <div className="flex items-center justify-between p-6 rounded-3xl bg-red-50 border border-red-200">
                             <div>
                                <p className="text-[10px] font-black uppercase text-red-600 tracking-widest mb-1">Statut actuel</p>
                                <div className="flex items-center gap-3">
                                   <Badge className="bg-red-500 text-white border-none font-bold italic">ANNONCE REJETÉE</Badge>
                                   <span className="text-sm font-bold text-foreground">Non visible par les locataires</span>
                                </div>
                             </div>
                             <Button 
                               disabled={updatingId === selectedProperty.id}
                               onClick={() => handleApprove(selectedProperty.id)}
                               className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white border-none font-black uppercase text-[10px] tracking-widest h-10 px-6 shadow-lg shadow-emerald-200"
                             >
                                <Check className="w-4 h-4 mr-2" /> {updatingId === selectedProperty.id ? "..." : "Ré-Approuver"}
                             </Button>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-none shadow-2xl bg-card p-8 animate-in zoom-in-95 duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Motif du rejet</h2>
              <p className="text-muted-foreground font-medium mt-1">Expliquez pourquoi cette annonce est rejetée. Le locateur sera notifié.</p>
            </div>
            <textarea 
              className="w-full h-32 p-4 rounded-2xl bg-muted border-none text-sm font-medium focus:ring-2 focus:ring-red-200 transition-all resize-none mb-6"
              placeholder="Ex: Photos de mauvaise qualité, description incomplète..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-4">
              <Button 
                onClick={() => handleReject(rejectingId)}
                disabled={!rejectionReason.trim() || updatingId === rejectingId}
                className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] tracking-widest h-12 shadow-lg shadow-red-200 border-none"
              >
                {updatingId === rejectingId ? "..." : "Confirmer le rejet"}
              </Button>
              <Button 
                onClick={() => {
                  setRejectingId(null)
                  setRejectionReason("")
                }}
                variant="ghost"
                className="flex-1 rounded-2xl font-black uppercase text-[11px] tracking-widest h-12"
              >
                Annuler
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
