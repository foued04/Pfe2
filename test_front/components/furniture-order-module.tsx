"use client"

import { useState, useMemo } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { mockProperties } from "@/lib/property-data"
import { FurnitureCatalog } from "./furniture-catalog"
import { FurnitureCart } from "./furniture-cart"
import { FurnitureReceipt } from "./furniture-receipt"
import { CartItem, FurnitureItem, FurnitureOrder, OrderStatus } from "@/lib/furniture-data"
import { Package, Receipt, ShoppingBag, LayoutGrid } from "lucide-react"
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
    <div className="p-6 max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs">
            <Package className="w-4 h-4" />
            Module Mobilier
          </div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            {t("furn.title")}
          </h2>
          <p className="text-muted-foreground max-w-lg">
            {t("furn.subtitle")}
          </p>
        </div>
        
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50 shadow-sm">
           <div className={cn(
             "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
             view === "catalog" ? "bg-background text-primary shadow-md" : "text-muted-foreground"
           )}>
             <LayoutGrid className="w-4 h-4" />
             Catalogue
           </div>
           <div className={cn(
             "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all opacity-50 cursor-not-allowed",
             view === "receipt" ? "bg-background text-primary shadow-md" : "text-muted-foreground"
           )}>
             <Receipt className="w-4 h-4" />
             {t("furn.receipt")}
           </div>
        </div>
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
  )
}
