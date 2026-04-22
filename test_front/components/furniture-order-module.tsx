"use client"

import { useState, useMemo, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { mockProperties } from "@/lib/property-data"
import { FurnitureCatalog } from "./furniture-catalog"
import { FurnitureCart } from "./furniture-cart"
import { FurnitureReceipt } from "./furniture-receipt"
import { CartItem, FurnitureItem, FurnitureOrder, OrderStatus, submitFurnitureOrder, addFurnitureItem, FurnitureCategory } from "@/lib/furniture-data"
import { Package, Receipt, ShoppingBag, LayoutGrid, Armchair, Plus, Image as ImageIcon, Loader2, CreditCard, ChevronRight } from "lucide-react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "./ui/dialog"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { FurnitureChangeRequestModal } from "./furniture-change-request-modal"

interface FurnitureOrderModuleProps {
  initialPropertyId?: string | null
}

export function FurnitureOrderModule({ initialPropertyId }: FurnitureOrderModuleProps) {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [view, setView] = useState<"catalog" | "receipt">("catalog")
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    initialPropertyId || ""
  )
  const [properties, setProperties] = useState<any[]>([])

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/properties`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setProperties(data)
          if (!selectedPropertyId && data.length > 0) {
            setSelectedPropertyId(data[0].id || data[0]._id)
          }
        }
      } catch (err) {
        console.error("Fetch properties error:", err)
      }
    }
    fetchProperties()
  }, [])
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [validatedOrder, setValidatedOrder] = useState<FurnitureOrder | null>(null)
  const [existingFurniture, setExistingFurniture] = useState<any[]>([])
  const [isExistingLoading, setIsExistingLoading] = useState(false)

  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [brokenExistingImages, setBrokenExistingImages] = useState<Record<string, boolean>>({})

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (user?.role === 'tenant') {
       fetchTenantOrders()
    }
  }, [user])

  const fetchTenantOrders = async () => {
    setOrdersLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return
      const response = await fetch(`${API_URL}/furniture/tenant-orders`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching tenant orders:", error)
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (selectedPropertyId) {
      fetchExistingFurniture(selectedPropertyId)
    }
  }, [selectedPropertyId])

  const fetchExistingFurniture = async (propertyId: string) => {
    setIsExistingLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/furniture/property/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setExistingFurniture(data)
        } else {
          // Fallback to mock data
          const mockProp = mockProperties.find(p => p.id === propertyId || (p as any)._id === propertyId)
          if (mockProp?.furnishing?.items) {
            setExistingFurniture(mockProp.furnishing.items as any)
          }
        }
      } else {
        // Fallback to mock data
        const mockProp = mockProperties.find(p => p.id === propertyId || (p as any)._id === propertyId)
        if (mockProp?.furnishing?.items) {
          setExistingFurniture(mockProp.furnishing.items as any)
        }
      }
    } catch (error) {
      console.error("Error fetching existing furniture:", error)
    } finally {
      setIsExistingLoading(false)
    }
  }
  
  // Suggestion State
  const [isAdding, setIsAdding] = useState(false)
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Salon" as FurnitureCategory,
    price: 0,
    image: "",
    description: ""
  })

  const handleSuggestItem = async () => {
    setIsAdding(true)
    try {
      await addFurnitureItem(newItem)
      alert(lang === "fr" ? "Votre suggestion a été envoyée pour validation." : "Your suggestion has been sent for validation.")
      setNewItem({ name: "", category: "Salon", price: 0, image: "", description: "" })
      // Refreshing catalog happens automatically because FurnitureCatalog has its own useEffect
    } catch (error) {
      alert("Error adding furniture")
    } finally {
      setIsAdding(false)
    }
  }

  const handleAddToCart = (item: FurnitureItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return
    
    try {
      const property = properties.find(p => (p.id || p._id) === selectedPropertyId)
      
      const orderPayload = {
        propertyId: selectedPropertyId,
        items: cartItems.map(item => ({
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        paymentMethod: paymentMethod
      }

      const result = await submitFurnitureOrder(orderPayload)
      
      const newOrder: FurnitureOrder = {
        id: result._id || result.id,
        propertyId: selectedPropertyId,
        propertyName: property?.title || "Propriété",
        date: new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US"),
        items: [...cartItems],
        total: orderPayload.total,
        paymentMethod: paymentMethod,
        status: result.status || "Confirmé"
      }
      
      setValidatedOrder(newOrder)
      setView("receipt")
      setCartItems([]) // Clear cart after successful checkout
    } catch (error) {
      console.error("Error submitting order:", error)
      alert(lang === "fr" ? "Erreur lors de la validation de la commande" : "Error validating order")
    }
  }

  const renderExistingFurnitureThumb = (item: any, idx: number) => {
    const itemKey = String(item._id || item.id || idx)
    const hasImage = item.image && !brokenExistingImages[itemKey]

    if (!hasImage) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-blue-50 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
          {item.category || "Mobilier"}
        </div>
      )
    }

    return (
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        onError={() => setBrokenExistingImages((prev) => ({ ...prev, [itemKey]: true }))}
        className="h-full w-full object-cover"
      />
    )
  }

  if (view === "receipt" && validatedOrder) {
    return (
      <div className="p-6">
        <FurnitureReceipt 
          order={validatedOrder} 
          onBack={() => setView("catalog")} 
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
        {/* Premium Banner */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] p-10 text-white shadow-2xl shadow-blue-900/20 active:scale-[0.99] transition-all border border-white/10">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest">
                <Armchair className="w-3.5 h-3.5" />
                Premium Collection 2024
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Catalogue de <span className="text-blue-200">mobilier</span> premium
              </h1>
              <p className="text-white/80 text-lg font-medium max-w-2xl">
                Équipez vos propriétés avec des meubles de haute qualité. Un design raffiné pour des intérieurs d'exception.
              </p>
              
              {user?.role === 'owner' ? (
                <div className="pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-primary hover:bg-white/90 rounded-xl gap-2 font-bold px-6 shadow-xl shadow-black/10">
                        <Plus className="w-5 h-5" /> Proposer un meuble
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8 border-none shadow-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-primary uppercase tracking-tight">Proposer du Mobilier</DialogTitle>
                        <p className="text-xs text-muted-foreground font-medium">Votre suggestion sera validée par un administrateur.</p>
                      </DialogHeader>
                      <div className="space-y-6 py-6">
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Nom de l&apos;article</Label>
                          <Input 
                            value={newItem.name} 
                            onChange={e => setNewItem({...newItem, name: e.target.value})}
                            className="rounded-xl border-muted bg-muted/30 h-12 font-bold focus:ring-primary/20"
                            placeholder="ex: Canapé Scandinave"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Catégorie</Label>
                            <select 
                              value={newItem.category}
                              onChange={e => setNewItem({...newItem, category: e.target.value as FurnitureCategory})}
                              className="w-full flex h-12 rounded-xl border border-muted bg-muted/30 px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                            >
                              <option value="Salon">Salon</option>
                              <option value="Chambre">Chambre</option>
                              <option value="Salle à manger">Salle à manger</option>
                              <option value="Cuisine">Cuisine</option>
                              <option value="Décoration">Décoration</option>
                              <option value="Bureau">Bureau</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Prix Estimé (DT)</Label>
                            <Input 
                              type="number"
                              value={newItem.price} 
                              onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                              className="rounded-xl border-muted bg-muted/30 h-12 font-bold"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">URL de l&apos;image</Label>
                          <div className="relative">
                            <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input 
                              value={newItem.image} 
                              onChange={e => setNewItem({...newItem, image: e.target.value})}
                              className="rounded-xl border-muted bg-muted/30 h-12 pl-10 font-bold"
                              placeholder="https://images.unsplash.com/..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</Label>
                          <Textarea 
                            value={newItem.description} 
                            onChange={e => setNewItem({...newItem, description: e.target.value})}
                            className="rounded-xl border-muted bg-muted/30 min-h-[100px] font-medium"
                            placeholder="Décrivez brièvement le meuble..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={handleSuggestItem} 
                          disabled={isAdding}
                          className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                          {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer la proposition"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="pt-2">
                  <Button 
                    onClick={() => setIsChangeModalOpen(true)}
                    className="bg-white text-blue-700 hover:bg-white/90 rounded-xl gap-2 font-bold px-6 shadow-xl shadow-black/10 transition-all active:scale-95"
                  >
                    <Plus className="w-5 h-5" /> Proposer / Changer un meuble
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center shrink-0">
              <div className="bg-white/10 backdrop-blur-xl px-6 py-5 rounded-2xl border border-white/20 flex items-center gap-4 shadow-inner">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/60">Expédition</p>
                  <p className="text-sm font-bold text-white">Livraison Offerte</p>
                </div>
              </div>

              {/* View Switcher (Tabs) */}
              <div className="flex bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => setView("catalog")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
                    view === "catalog" ? "bg-secondary text-primary" : "text-white/70 hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Catalogue
                </button>
                <button 
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all opacity-50 cursor-not-allowed",
                    view === "receipt" ? "bg-secondary text-primary" : "text-white/70"
                  )}
                >
                  <Receipt className="w-4 h-4" />
                  {t("furn.receipt")}
                </button>
              </div>
            </div>
          </div>
          {/* Abstract decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Catalog Side */}
        <div className="xl:col-span-8 space-y-8">
          {/* Existing Furniture Section */}
          {existingFurniture.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-blue-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Armchair className="w-5 h-5 text-[#1e3a8a]" />
                  <h3 className="font-bold text-lg text-[#1e3a8a]">Mobilier Actuellement Installé</h3>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-[#1e3a8a] border-none">
                  {existingFurniture.length} articles
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {existingFurniture.map((item, idx) => (
                  <div key={item._id || idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-blue-200 transition-all">
                    <div className="h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-white border border-slate-200 shadow-sm">
                      {renderExistingFurnitureThumb(item, idx)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate uppercase">{item.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold">{item.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <FurnitureCatalog onAddToCart={handleAddToCart} />

          {/* How it works Section (Unified) */}
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LayoutGrid className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#1e3a8a] uppercase tracking-tight">Comment ça marche ?</h3>
                <p className="text-xs text-muted-foreground font-medium">Suivez ces étapes pour équiper votre logement</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { step: 1, title: "Choisissez", desc: lang === 'fr' ? "Sélectionnez vos meubles dans le catalogue" : "Select your furniture from the catalog", icon: <Package className="w-5 h-5" /> },
                { step: 2, title: "Panier", desc: lang === 'fr' ? "Vérifiez vos articles et quantités" : "Check your items and quantities", icon: <ShoppingBag className="w-5 h-5" /> },
                { step: 3, title: "Bon d'achat", desc: lang === 'fr' ? "Générez votre bon de commande" : "Generate your order voucher", icon: <Receipt className="w-5 h-5" /> },
                { step: 4, title: "Règlement", desc: lang === 'fr' ? "Payez à la livraison à domicile" : "Pay upon delivery at home", icon: <CreditCard className="w-5 h-5" /> }
              ].map(item => (
                <div key={item.step} className="flex flex-col items-center text-center space-y-4 group">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center text-primary border border-slate-100">
                      {item.icon}
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary text-primary flex items-center justify-center font-black text-xs border-2 border-white shadow-sm">
                      {item.step}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">{item.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cart Side */}
        <div className="xl:col-span-4 space-y-8 sticky top-24">
          <div className="flex items-center gap-2 mb-4">
             <ShoppingBag className="w-5 h-5 text-primary" />
             <h3 className="font-bold text-lg">{t("furn.cart")}</h3>
          </div>
          <FurnitureCart 
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            propertyId={selectedPropertyId}
            onPropertyChange={setSelectedPropertyId}
            properties={properties} // Pass real properties here
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />

          {/* Orders History Section */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-primary" />
                <h4 className="font-black text-sm uppercase tracking-tight text-slate-900">Historique</h4>
              </div>
              <Badge variant="outline" className="rounded-lg font-black text-[10px] bg-slate-50 border-slate-200">
                {orders.length}
              </Badge>
            </div>
            
            {ordersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 space-y-2 opacity-50">
                <p className="text-xs font-bold text-slate-400 italic">Aucune commande</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {orders.map((order) => (
                  <div key={order._id || order.id} className="group p-3 rounded-2xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                       <span className="text-[10px] font-black text-primary uppercase">#{ (order._id || order.id).slice(-6) }</span>
                       <Badge className={cn(
                         "text-[8px] font-black px-1.5 py-0.5 rounded-md border-none",
                         order.status === "Confirmée" ? "bg-emerald-500 text-white" : "bg-blue-100 text-blue-600"
                       )}>
                         {order.status || "Brouillon"}
                       </Badge>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-900">{order.total?.toLocaleString()} DT</p>
                        <p className="text-[9px] text-slate-400 font-bold">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : order.date}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-lg hover:bg-primary hover:text-white transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      <FurnitureChangeRequestModal 
        isOpen={isChangeModalOpen} 
        onClose={() => setIsChangeModalOpen(false)}
        furnitureList={existingFurniture}
        propertyId={selectedPropertyId}
      />
    </div>
  )
}
