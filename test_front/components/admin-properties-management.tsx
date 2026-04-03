"use client"

import { useState } from "react"
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
import { mockProperties, Property } from "@/lib/property-data"

type ValidationStatus = "pending" | "approved" | "rejected"

interface ManagedProperty extends Property {
  validationStatus: ValidationStatus
  rejectionReason?: string
}

export function AdminPropertiesManagement() {
  const [properties, setProperties] = useState<ManagedProperty[]>(
    mockProperties.map((p, i) => ({
      ...p,
      validationStatus: i < 3 ? "pending" : (i % 2 === 0 ? "approved" : "rejected")
    }))
  )
  const [filter, setFilter] = useState({ search: "", status: "all", city: "all" })
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<ManagedProperty | null>(null)

  const filteredProperties = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(filter.search.toLowerCase()) || 
                         p.ownerName.toLowerCase().includes(filter.search.toLowerCase())
    const matchesStatus = filter.status === "all" || p.validationStatus === filter.status
    const matchesCity = filter.city === "all" || p.city === filter.city
    return matchesSearch && matchesStatus && matchesCity
  })

  const handleApprove = (id: string) => {
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, validationStatus: "approved", rejectionReason: undefined } : p
    ))
    if (selectedProperty?.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, validationStatus: "approved", rejectionReason: undefined } : null)
    }
  }

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) return
    setProperties(prev => prev.map(p => 
      p.id === id ? { ...p, validationStatus: "rejected", rejectionReason: rejectionReason } : p
    ))
    if (selectedProperty?.id === id) {
      setSelectedProperty(prev => prev ? { ...prev, validationStatus: "rejected", rejectionReason: rejectionReason } : null)
    }
    setRejectingId(null)
    setRejectionReason("")
  }

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold">Approuvé</Badge>
      case "pending":
        return <Badge className="bg-orange-100 text-orange-600 border-none font-bold animate-pulse">En attente</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 border-none font-bold">Rejeté</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* ... (Header and Filters remain the same) */}
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

      {/* Properties List */}
      <div className="grid gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="border-none shadow-xl bg-card overflow-hidden group hover:shadow-2xl transition-all duration-500">
            <div className="flex flex-col lg:flex-row">
              {/* Image Section */}
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

              {/* Content Section */}
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
                    {property.validationStatus === "pending" && (
                      <>
                        <Button 
                          onClick={() => handleApprove(property.id)}
                          className="flex-1 lg:flex-none h-11 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase text-[11px] tracking-widest text-white shadow-lg shadow-emerald-200 border-none"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button 
                          onClick={() => setRejectingId(property.id)}
                          variant="outline"
                          className="flex-1 lg:flex-none h-11 px-8 rounded-2xl bg-red-50 text-red-600 border-red-200 border-2 font-black uppercase text-[11px] tracking-widest hover:bg-red-100"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Rejeter
                        </Button>
                      </>
                    )}
                    {property.validationStatus !== "pending" && (
                      <Button 
                        variant="outline"
                        onClick={() => property.validationStatus === "approved" ? setRejectingId(property.id) : handleApprove(property.id)}
                        className="h-11 px-8 rounded-2xl font-black uppercase text-[11px] tracking-widest border-2"
                      >
                        Changer le statut
                      </Button>
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
      </div>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-background rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-8">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProperty(null)}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col lg:flex-row h-full">
              {/* Left Side: Images */}
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

              {/* Right Side: Details */}
              <div className="flex-1 p-8 lg:p-12 overflow-y-auto max-h-[800px] scrollbar-hide">
                 <div className="space-y-8">
                    {/* Header */}
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

                    {/* Price & Primary Info */}
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

                    {/* Description */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Description complète</h4>
                      <p className="text-base text-foreground/80 leading-relaxed font-medium">
                        {selectedProperty.description}
                      </p>
                    </div>

                    {/* Features Grid */}
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

                    {/* Owner Card */}
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

                    {/* Admin Action Block */}
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
                                 className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black uppercase text-xs tracking-[0.1em] text-white shadow-xl shadow-emerald-200 border-none"
                               >
                                 <Check className="w-5 h-5 mr-3" />
                                 Approuver l&apos;annonce
                               </Button>
                               <Button 
                                 onClick={() => setRejectingId(selectedProperty.id)}
                                 variant="outline"
                                 className="flex-1 h-14 rounded-2xl bg-red-50 text-red-600 border-red-200 border-2 font-black uppercase text-xs tracking-[0.1em] hover:bg-red-100"
                               >
                                 <X className="w-5 h-5 mr-3" />
                                 Rejeter l&apos;annonce
                               </Button>
                            </div>
                         </div>
                       ) : (
                         <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/50 border border-border/50">
                            <div>
                               <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Statut actuel</p>
                               <div className="flex items-center gap-3">
                                  {getStatusBadge(selectedProperty.validationStatus)}
                                  <span className="text-sm font-bold text-foreground">Action effectuée le {selectedProperty.createdAt}</span>
                               </div>
                            </div>
                            <Button 
                              variant="outline"
                              onClick={() => selectedProperty.validationStatus === "approved" ? setRejectingId(selectedProperty.id) : handleApprove(selectedProperty.id)}
                              className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-10 border-2"
                            >
                               Modifier la décision
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

      {/* Rejection Modal */}
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
                disabled={!rejectionReason.trim()}
                className="flex-1 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] tracking-widest h-12 shadow-lg shadow-red-200 border-none"
              >
                Confirmer le rejet
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
