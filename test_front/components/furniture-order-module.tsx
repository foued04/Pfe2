"use client"

import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { mockProperties } from "@/lib/property-data"
import { FurnitureCatalog } from "./furniture-catalog"
import { FurnitureCart } from "./furniture-cart"
import { FurnitureReceipt } from "./furniture-receipt"
import { CartItem, FurnitureItem, FurnitureOrder, OrderStatus } from "@/lib/furniture-data"
import { Package, Receipt, ShoppingBag, LayoutGrid, Armchair } from "lucide-react"
import { cn } from "@/lib/utils"

interface FurnitureOrderModuleProps {
  initialPropertyId?: string | null
}

export function FurnitureOrderModule({ initialPropertyId }: FurnitureOrderModuleProps) {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [view, setView] = useState<"catalog" | "receipt">("catalog")
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
    initialPropertyId || mockProperties[0]?.id || ""
  )
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [validatedOrder, setValidatedOrder] = useState<FurnitureOrder | null>(null)

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

  const handleCheckout = () => {
    if (cartItems.length === 0) return
    
    const property = mockProperties.find(p => p.id === selectedPropertyId)
    
    const newOrder: FurnitureOrder = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      propertyId: selectedPropertyId,
      propertyName: property?.title || "Propriété inconnue",
      date: new Date().toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US"),
      items: [...cartItems],
      total: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      paymentMethod: paymentMethod,
      status: "Vérifiée"
    }
    
    setValidatedOrder(newOrder)
    setView("receipt")
    // Note: We don't clear the cart yet so user can go back and edit
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
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white shadow-xl shadow-emerald-900/10 active:scale-[0.99] transition-all">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
                <Armchair className="w-8 h-8 text-secondary" />
                Catalogue de mobilier premium
              </h1>
              <p className="text-emerald-50/80 text-lg font-medium">
                Équipez vos propriétés avec des meubles de qualité et gérez les commandes en toute simplicité.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="bg-secondary/20 backdrop-blur-md px-6 py-4 rounded-xl border border-secondary/30 flex items-center gap-4">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Package className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest font-black text-secondary">Livraison</p>
                  <p className="text-sm font-bold text-white">Standard Gratuite</p>
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
        <div className="xl:col-span-8 space-y-6">
          <FurnitureCatalog onAddToCart={handleAddToCart} />
        </div>

        {/* Cart Side */}
        <div className="xl:col-span-4 h-fit">
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
            paymentMethod={paymentMethod}
            onPaymentMethodChange={setPaymentMethod}
          />
        </div>
      </div>
      </div>
    </div>
  )
}
