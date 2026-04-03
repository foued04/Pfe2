"use client"

import { useI18n } from "@/lib/i18n"
import { CartItem, OrderStatus } from "@/lib/furniture-data"
import { mockProperties } from "@/lib/property-data"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Building2, CheckCircle2, Landmark, X, Package, ChevronRight } from "lucide-react"

interface FurnitureCartProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, delta: number) => void
  onRemoveItem: (id: string) => void
  onCheckout: () => void
  propertyId: string
  onPropertyChange: (id: string) => void
  paymentMethod: string
  onPaymentMethodChange: (method: string) => void
}

export function FurnitureCart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  propertyId,
  onPropertyChange,
  paymentMethod,
  onPaymentMethodChange
}: FurnitureCartProps) {
  const { t, lang } = useI18n()

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <Card className="border-none shadow-2xl shadow-emerald-900/10 bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-primary text-white p-6">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-secondary" />
            {t("furn.cart")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="font-bold text-muted-foreground">{t("furn.empty")}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Sélectionnez des articles dans le catalogue</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none shadow-2xl shadow-emerald-900/10 bg-white rounded-3xl overflow-hidden sticky top-24">
      <CardHeader className="bg-primary text-white p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black flex items-center gap-3">
            <ShoppingCart className="w-6 h-6 text-secondary" />
            {t("furn.cart")}
          </CardTitle>
          <div className="bg-secondary text-primary border-none font-black px-3 py-1 rounded-lg text-xs">
            {items.length} {items.length > 1 ? t("furn.item") + "s" : t("furn.item")}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        <div className="overflow-y-auto max-h-[400px] pr-2 -mr-2 space-y-6">
          {items.map((item) => (
            <div key={item.id} className="p-0 flex gap-4 group transition-colors">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm border border-border/20">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-extrabold text-sm text-primary line-clamp-1">{item.name}</h4>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-secondary/30 rounded-xl p-1 px-2">
                    <button
                      className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white text-muted-foreground transition-all shadow-sm"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black w-3 text-center">{item.quantity}</span>
                    <button
                      className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white text-muted-foreground transition-all shadow-sm"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-md font-black text-primary">
                    {(item.price * item.quantity).toLocaleString()} DT
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6 pt-4 border-t border-border/50">
          {/* Property Selection */}
          <div className="bg-background p-5 rounded-2xl border border-border/40 space-y-4">
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <Building2 className="w-4 h-4 text-secondary" /> {t("furn.property")}
              </label>
              <Select value={propertyId} onValueChange={onPropertyChange}>
                <SelectTrigger className="h-11 bg-white border-none rounded-xl shadow-sm text-sm font-medium">
                  <SelectValue placeholder={t("furn.property")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {mockProperties.map(p => (
                    <SelectItem key={p.id} value={p.id} className="rounded-lg">{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest">
                <CreditCard className="w-4 h-4 text-secondary" /> {t("furn.payment")}
              </label>
              <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
                <SelectTrigger className="h-11 bg-white border-none rounded-xl shadow-sm text-sm font-medium">
                  <SelectValue placeholder={t("furn.payment")} />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value="cash" className="rounded-lg">{t("furn.payment.cash")}</SelectItem>
                  <SelectItem value="check" className="rounded-lg">{t("furn.payment.check")}</SelectItem>
                  <SelectItem value="transfer" className="rounded-lg">{t("furn.payment.transfer")}</SelectItem>
                  <SelectItem value="later" className="rounded-lg">{t("furn.payment.later")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm items-center">
              <span className="font-bold text-muted-foreground/80">{t("furn.total")}</span>
              <span className="font-extrabold">{total.toLocaleString()} DT</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="font-bold text-muted-foreground/80">Livraison</span>
              <span className="text-emerald-600 font-black tracking-tighter uppercase">Gratuite</span>
            </div>
            <div className="border-t-2 border-dashed border-primary/10 pt-4 flex justify-between text-2xl font-black items-center text-primary">
              <span>Total final</span>
              <span>{total.toLocaleString()} DT</span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 bg-background border-t border-border/30">
        <Button 
          className="w-full h-14 bg-primary hover:opacity-80 text-white text-lg font-black rounded-2xl shadow-lg shadow-emerald-950/20 gap-3 group transition-all" 
          onClick={onCheckout}
        >
          {t("furn.checkout")}
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  )
}

