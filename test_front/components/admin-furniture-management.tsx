"use client"

import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  Sofa, 
  Package, 
  Search, 
  Check, 
  X, 
  Eye, 
  DollarSign
} from "lucide-react"
import { cn } from "@/lib/utils"
import { furnitureCatalog, FurnitureItem, FurnitureCategory } from "@/lib/furniture-data"

type FurnitureStatus = "pending" | "approved" | "rejected" | "requested"

interface ManagedFurniture extends FurnitureItem {
  status: FurnitureStatus
  requesterType: "owner" | "tenant"
  requesterName: string
  quantity: number
  price: number
}

const categories: FurnitureCategory[] = ["Salon", "Chambre", "Salle à manger", "Cuisine", "Décoration", "Bureau"]

export function AdminFurnitureManagement() {
  const [items, setItems] = useState<ManagedFurniture[]>(
    furnitureCatalog.map((item, i) => ({
      ...item,
      status: i < 4 ? "pending" : (i % 3 === 0 ? "approved" : "requested"),
      requesterType: i % 2 === 0 ? "owner" : "tenant",
      requesterName: i % 2 === 0 ? "Mohamed Ben Ali" : "Sarra Bouaziz",
      quantity: Math.floor(Math.random() * 5) + 1,
      price: item.price
    }))
  )
  const [filter, setFilter] = useState({ search: "", category: "all", status: "all" })
  const [selectedItem, setSelectedItem] = useState<ManagedFurniture | null>(null)

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                         item.requesterName.toLowerCase().includes(filter.search.toLowerCase())
    const matchesCategory = filter.category === "all" || item.category === filter.category
    const matchesStatus = filter.status === "all" || item.status === filter.status
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: "approved" } : item
    ))
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: "approved" } : null)
    }
  }

  const handleReject = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, status: "rejected" } : item
    ))
    if (selectedItem?.id === id) {
      setSelectedItem(prev => prev ? { ...prev, status: "rejected" } : null)
    }
  }

  const getStatusBadge = (status: FurnitureStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold">Approuvé</Badge>
      case "pending":
        return <Badge className="bg-orange-100 text-orange-600 border-none font-bold animate-pulse">À valider</Badge>
      case "requested":
        return <Badge className="bg-blue-100 text-blue-600 border-none font-bold">Demande locataire</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-600 border-none font-bold">Rejeté</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion du Mobilier</h1>
          <p className="text-muted-foreground font-medium">Administrez les équipements et les demandes d&apos;ameublement</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border-blue-100 font-bold">
             {items.filter(i => i.status === "requested").length} Demandes
           </Badge>
           <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 border-orange-100 font-bold">
             {items.filter(i => i.status === "pending").length} À valider
           </Badge>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid gap-6 sm:grid-cols-4">
        {[
          { label: "Total Articles", value: items.length, icon: Package, color: "text-primary bg-primary/10" },
          { label: "Validés", value: items.filter(i => i.status === "approved").length, icon: Check, color: "text-emerald-500 bg-emerald-50" },
          { label: "Ameublement Salon", value: items.filter(i => i.category === "Salon").length, icon: Sofa, color: "text-orange-500 bg-orange-50" },
          { label: "Valeur Totale", value: (items.reduce((acc, curr) => acc + curr.price, 0)).toLocaleString() + " DT", icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-lg bg-card p-5 flex items-center gap-4">
             <div className={cn("p-3 rounded-2xl", stat.color)}>
               <stat.icon className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xl font-black text-foreground">{stat.value}</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
             </div>
          </Card>
        ))}
      </div>

      {/* Filters & Categories */}
      <Card className="border-none shadow-xl bg-card p-4 overflow-x-auto">
        <div className="flex flex-col md:flex-row gap-6 items-center min-w-max md:min-w-0">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <Button 
               variant={filter.category === "all" ? "default" : "outline"}
               onClick={() => setFilter({ ...filter, category: "all" })}
               className="rounded-xl px-4 py-1 h-9 text-xs font-black uppercase tracking-wider"
            >
              Tous
            </Button>
            {categories.map(cat => (
              <Button 
                key={cat}
                variant={filter.category === cat ? "default" : "outline"}
                onClick={() => setFilter({ ...filter, category: cat })}
                className="rounded-xl px-4 py-1 h-9 text-xs font-black uppercase tracking-wider whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Rechercher un meuble ou un demandeur..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border-none text-sm font-bold focus:ring-2 focus:ring-primary/20"
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            />
          </div>
          <select 
            className="bg-muted/50 border-none rounded-xl px-4 py-2 text-sm font-black text-muted-foreground"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">À valider</option>
            <option value="requested">Demandes</option>
            <option value="approved">Approuvés</option>
            <option value="rejected">Rejetés</option>
          </select>
        </div>
      </Card>

      {/* Furniture Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-none shadow-xl bg-card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="relative h-48">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-4 left-4">
                {getStatusBadge(item.status)}
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-black/40 backdrop-blur-md text-white border-none font-bold text-xs">
                  {item.category}
                </Badge>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                 <h3 className="text-white font-black text-lg tracking-tight">{item.name}</h3>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium line-clamp-2">
                  {item.description || "Aucune description fournie pour cet article."}
                </p>

                <div className="flex items-center justify-between py-3 border-y border-border/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted-foreground mb-1">Prix Unitaire</span>
                    <span className="text-lg font-black text-primary tracking-tighter">{item.price} DT</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase text-muted-foreground mb-1">Quantité</span>
                    <span className="text-lg font-black text-foreground tracking-tighter">{item.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className={cn(
                     "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm",
                     item.requesterType === 'owner' ? "bg-orange-100 text-orange-600" : "bg-primary/10 text-primary"
                   )}>
                     {item.requesterName[0]}
                   </div>
                   <div className="flex-1 truncate">
                     <p className="text-xs font-black text-foreground truncate">{item.requesterName}</p>
                     <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-tighter">
                       {item.requesterType === 'owner' ? "Propriétaire (Proposé)" : "Locataire (Demandé)"}
                     </p>
                   </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => setSelectedItem(item)}
                    variant="outline" 
                    className="w-full rounded-2xl font-black uppercase text-[10px] tracking-widest h-10 border-2"
                  >
                    <Eye className="w-3 h-3 mr-2" /> Détails de l&apos;article
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Sofa className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-xl font-black text-foreground">Aucun meuble trouvé</h3>
            <p className="text-muted-foreground font-medium">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        )}
      </div>

      {/* Furniture Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-500 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-background rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 my-8">
            {/* Close Button */}
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all shadow-lg"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row min-h-[500px]">
              {/* Image Section */}
              <div className="w-full md:w-1/2 relative bg-muted">
                <img src={selectedItem.image} className="w-full h-full object-cover" alt={selectedItem.name} />
                <div className="absolute top-6 left-6">
                  {getStatusBadge(selectedItem.status)}
                </div>
                <div className="absolute top-6 right-16">
                  <Badge className="bg-black/40 backdrop-blur-md text-white border-none font-black text-xs uppercase tracking-widest">
                    {selectedItem.category}
                  </Badge>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 p-8 lg:p-12 space-y-8 flex flex-col justify-between">
                <div>
                   <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em] mb-2">
                     <Package className="w-3 h-3" /> Mobilier • {selectedItem.category}
                   </div>
                   <h2 className="text-4xl font-black text-foreground tracking-tight leading-tight uppercase underline decoration-primary/30 underline-offset-8 decoration-4 mb-6">
                     {selectedItem.name}
                   </h2>

                   <div className="grid grid-cols-2 gap-8 py-6 border-y border-border/50">
                      <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Prix Estimé</p>
                        <p className="text-3xl font-black text-primary tracking-tighter">{selectedItem.price} <span className="text-sm">DT</span></p>
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Quantité</p>
                         <p className="text-3xl font-black text-foreground tracking-tighter">{selectedItem.quantity}</p>
                      </div>
                   </div>

                   <div className="mt-8">
                      <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">Description du produit</h4>
                      <p className="text-base text-foreground/80 leading-relaxed font-medium">
                        {selectedItem.description || "Cet article fait partie de l'équipement standard proposé pour améliorer le confort de la propriété. Il a été sélectionné pour sa qualité et son design s'intégrant parfaitement au style moderne de la plateforme."}
                      </p>
                   </div>

                   <div className="mt-8 p-6 rounded-3xl bg-muted/30 border border-border/30 flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-black text-lg",
                        selectedItem.requesterType === 'owner' ? "bg-orange-100 text-orange-600 shadow-orange-100 shadow-lg" : "bg-primary/10 text-primary shadow-primary/10 shadow-lg"
                      )}>
                        {selectedItem.requesterName[0]}
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase text-muted-foreground opacity-60 tracking-widest leading-none mb-1">Demandé par</p>
                         <h4 className="text-lg font-black text-foreground tracking-tight leading-none">{selectedItem.requesterName}</h4>
                         <p className="text-[10px] font-bold text-primary/60 uppercase mt-1">
                           {selectedItem.requesterType === 'owner' ? "Propriétaire (Validation requise)" : "Locataire (Demande d'achat)"}
                         </p>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                   {(selectedItem.status === 'pending' || selectedItem.status === 'requested') ? (
                     <div className="flex gap-4">
                        <Button 
                          onClick={() => handleApprove(selectedItem.id)}
                          className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-100 border-none px-8"
                        >
                          <Check className="w-5 h-5 mr-3" /> Valider l&apos;article
                        </Button>
                        <Button 
                          onClick={() => handleReject(selectedItem.id)}
                          variant="outline"
                          className="flex-1 h-14 rounded-2xl border-red-200 text-red-500 hover:bg-red-50 font-black uppercase text-xs tracking-widest px-8 border-2"
                        >
                          <X className="w-5 h-5 mr-3" /> Rejeter
                        </Button>
                     </div>
                   ) : (
                     <div className="flex items-center justify-between p-6 rounded-3xl bg-muted/50 border border-border/50">
                        <div>
                           <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Statut de validation</p>
                           {getStatusBadge(selectedItem.status)}
                        </div>
                        <Button 
                          variant="outline"
                          onClick={() => selectedItem.status === 'approved' ? handleReject(selectedItem.id) : handleApprove(selectedItem.id)}
                          className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-10 border-2"
                        >
                           Changer le statut
                        </Button>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
