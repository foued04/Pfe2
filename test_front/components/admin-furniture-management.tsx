"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  Sofa, 
  Package, 
  Search, 
  Check, 
  X, 
  DollarSign,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Clock,
  Info,
  Layers,
  User,
  Tag,
  Hash,
  MessageSquare
} from "lucide-react"
import { cn } from "@/lib/utils"
import { fetchFurniture, FurnitureItem, FurnitureCategory, addFurnitureItem, deleteFurnitureItem, updateFurnitureStatus as apiUpdateStatus } from "@/lib/furniture-data"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "./ui/dialog"

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
  const [items, setItems] = useState<FurnitureItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState({ search: "", category: "all", status: "all" })
  const [selectedItem, setSelectedItem] = useState<FurnitureItem | null>(null)
  
  // New Item State
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Salon" as FurnitureCategory,
    price: 0,
    image: "",
    description: ""
  })

  const loadItems = async () => {
    setIsLoading(true)
    try {
      const data = await fetchFurniture()
      setItems(data)
    } catch (error) {
      console.error("Error loading furniture:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])


  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(filter.search.toLowerCase()) || 
                         (item.requesterName || "").toLowerCase().includes(filter.search.toLowerCase())
    const matchesCategory = filter.category === "all" || item.category === filter.category
    const matchesStatus = filter.status === "all" || item.status === filter.status
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleApprove = async (id: string) => {
    try {
      await apiUpdateStatus(id, "approved")
      await loadItems()
    } catch (error) {
      alert("Error approving item")
    }
  }

  const handleReject = async (id: string) => {
    try {
      await apiUpdateStatus(id, "rejected")
      await loadItems()
    } catch (error) {
      alert("Error updating status")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return
    try {
      await deleteFurnitureItem(id)
      await loadItems()
      setSelectedItem((prev) => (prev?.id === id ? null : prev))
    } catch (error) {
      alert("Error deleting item")
    }
  }

  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      alert("Please enter a name")
      return
    }
    if (!newItem.image) {
      alert("Please add an image")
      return
    }
    setIsAdding(true)
    try {
      await addFurnitureItem(newItem)
      await loadItems()
      setNewItem({ name: "", category: "Salon", price: 0, image: "", description: "" })
    } catch (error) {
      alert("Error adding furniture")
    } finally {
      setIsAdding(false)
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
        <div className="flex gap-4">
           {/* Add Furniture Dialog */}
           <Dialog>
             <DialogTrigger asChild>
               <Button className="bg-primary hover:opacity-90 text-white rounded-xl gap-2 font-bold px-6">
                 <Plus className="w-5 h-5" /> Ajouter un meuble
               </Button>
             </DialogTrigger>
             <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
               <DialogHeader>
                 <DialogTitle className="text-2xl font-black text-primary uppercase">Nouveau Mobilier</DialogTitle>
               </DialogHeader>
               <div className="space-y-6 py-4">
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom du meuble</Label>
                   <Input 
                     value={newItem.name} 
                     onChange={e => setNewItem({...newItem, name: e.target.value})}
                     className="rounded-xl border-muted bg-muted/30 h-12"
                   />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Catégorie</Label>
                     <select 
                       value={newItem.category}
                       onChange={e => setNewItem({...newItem, category: e.target.value as FurnitureCategory})}
                       className="w-full flex h-12 rounded-xl border border-muted bg-muted/30 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                     >
                       {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prix (DT)</Label>
                     <Input 
                       type="number"
                       value={newItem.price} 
                       onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                       className="rounded-xl border-muted bg-muted/30 h-12"
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL de l&apos;image</Label>
                   <div className="relative">
                     <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                     <Input 
                       value={newItem.image} 
                       onChange={e => setNewItem({...newItem, image: e.target.value})}
                       className="rounded-xl border-muted bg-muted/30 h-12 pl-10"
                       placeholder="https://..."
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
                   <Textarea 
                     value={newItem.description} 
                     onChange={e => setNewItem({...newItem, description: e.target.value})}
                     className="rounded-xl border-muted bg-muted/30 min-h-[100px]"
                   />
                 </div>
               </div>
               <DialogFooter>
                 <Button 
                   onClick={handleAddItem} 
                   disabled={isAdding}
                   className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest"
                 >
                   {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enregistrer l'article"}
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>

            <Badge 
              variant="outline" 
              onClick={() => setFilter({ ...filter, status: "pending" })}
              className="px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 border-orange-100 font-bold items-center flex cursor-pointer hover:bg-orange-100 transition-colors shadow-sm"
            >
              <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
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
            className="bg-muted/50 border-none rounded-xl px-4 py-2 text-sm font-black text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">⚠️ À valider (Locateurs)</option>
            <option value="requested">📩 Demandes (Locataires)</option>
            <option value="approved">✅ Approuvés</option>
            <option value="rejected">❌ Rejetés</option>
          </select>
        </div>
      </Card>

      {/* Furniture Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-3xl" />
          ))
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="border-none shadow-xl bg-card overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-48">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute top-4 left-4">
                  {getStatusBadge(item.status as FurnitureStatus)}
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
                  </div>
  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      type="button"
                      onClick={() => setSelectedItem((prev) => (prev?.id === item.id ? null : { ...item }))}
                      variant="outline" 
                      className="flex-1 rounded-2xl font-black uppercase text-[10px] tracking-widest h-10 border-2"
                    >
                      {selectedItem?.id === item.id ? "Masquer les details" : "Details"}
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => item.id && handleDelete(item.id)}
                      variant="outline" 
                      className="w-10 h-10 rounded-2xl border-red-100 text-red-500 hover:bg-red-50 p-0 border-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {selectedItem?.id === item.id ? (
                    <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex flex-col gap-3">
                        {(item.status === 'pending' || item.status === 'requested') && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => item.id && handleApprove(item.id)}
                              className="flex-1 h-11 rounded-2xl bg-emerald-500 font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all hover:scale-[1.02]"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approuver
                            </Button>
                            <Button
                              onClick={() => item.id && handleReject(item.id)}
                              variant="outline"
                              className="flex-1 h-11 rounded-2xl border-red-200 bg-red-50 font-bold uppercase tracking-wider text-red-600 hover:bg-red-100 transition-all hover:scale-[1.02]"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Rejeter
                            </Button>
                          </div>
                        )}
                        <Button
                          type="button"
                          onClick={() => setSelectedItem(null)}
                          variant="outline"
                          className="w-full h-10 rounded-2xl border-slate-200 bg-white font-bold uppercase tracking-wider text-slate-500 hover:bg-slate-50"
                        >
                          Masquer les détails
                        </Button>
                      </div>

                      <div className="rounded-[2rem] border border-slate-200/80 bg-slate-50/50 p-1 shadow-inner">
                        <div className="max-h-[350px] overflow-y-auto scrollbar-hide p-4 space-y-3">
                          <div className="flex items-center gap-2 px-2 mb-2">
                            <div className="h-4 w-1 bg-primary rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Fiche Technique</span>
                          </div>

                          <FurnitureInlineDetail
                            label="Description"
                            value={item.description || "Aucune description fournie pour cet article."}
                            icon={MessageSquare}
                          />
                          
                          <div className="grid gap-3 md:grid-cols-2">
                            <FurnitureInlineDetail label="Catégorie" value={item.category} icon={Layers} />
                            <FurnitureInlineDetail label="Prix Unitaire" value={`${item.price} DT`} icon={DollarSign} />
                            <FurnitureInlineDetail label="Quantité" value={String(item.quantity ?? 1)} icon={Hash} />
                            <FurnitureInlineDetail label="Statut" value={item.status || "pending"} icon={Info} />
                            <FurnitureInlineDetail label="Demandeur" value={item.requesterName || "Locateur"} icon={User} />
                            <FurnitureInlineDetail label="Type" value={item.requesterType === "tenant" ? "Locataire" : "Locateur"} icon={Tag} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                </div>
              </CardContent>
            </Card>
          ))
        )}

        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <Sofa className="w-12 h-12 text-muted-foreground opacity-20 mx-auto mb-4" />
            <h3 className="text-xl font-black text-foreground">Aucun meuble trouvé</h3>
            <p className="text-muted-foreground font-medium">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        )}
      </div>

    </div>
  )
}

function FurnitureInlineDetail({
  label,
  value,
  icon: Icon,
  className,
}: {
  label: string
  value: string
  icon: any
  className?: string
}) {
  const isLongText = label === "Description"

  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-slate-50 text-primary">
          <Icon className="w-3 h-3" />
        </div>
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-sm leading-relaxed text-foreground", isLongText ? "whitespace-pre-wrap font-semibold" : "font-bold")}>{value}</p>
    </div>
  )
}
