"use client"

import { useI18n } from "@/lib/i18n"
import { CartItem, OrderStatus } from "@/lib/furniture-data"
import { mockProperties } from "@/lib/property-data"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Minus, Plus, Trash2, ShoppingCart, CreditCard, Building2, CheckCircle2 } from "lucide-react"

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
      <Card className="border-border/50 bg-background/50">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">{t("furn.empty")}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 shadow-lg overflow-hidden flex flex-col h-full sticky top-24">
      <CardHeader className="bg-primary/5 py-4 flex flex-row items-center justify-between border-b border-border/50">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          {t("furn.cart")}
        </CardTitle>
        <div className="flex bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-semibold text-primary border border-primary/20">
          {items.length} {items.length > 1 ? t("furn.item") + "s" : t("furn.item")}
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-y-auto min-h-[300px] max-h-[450px]">
        <div className="divide-y divide-border/50">
          {items.map((item) => (
            <div key={item.id} className="p-4 flex gap-4 group hover:bg-muted/30 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 border border-border rounded-md px-1 py-0.5 bg-background shadow-xs">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-muted"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-muted"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-sm font-bold text-primary">
                    {(item.price * item.quantity).toLocaleString()} TND
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-4 p-5 bg-muted/20 border-t border-border/50">
        <div className="w-full space-y-3">
          {/* Property Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {t("furn.property")}
            </label>
            <Select value={propertyId} onValueChange={onPropertyChange}>
              <SelectTrigger className="h-9 text-sm bg-background">
                <SelectValue placeholder={t("furn.property")} />
              </SelectTrigger>
              <SelectContent>
                {mockProperties.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> {t("furn.payment")}
            </label>
            <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
              <SelectTrigger className="h-9 text-sm bg-background">
                <SelectValue placeholder={t("furn.payment")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">{t("furn.payment.cash")}</SelectItem>
                <SelectItem value="check">{t("furn.payment.check")}</SelectItem>
                <SelectItem value="transfer">{t("furn.payment.transfer")}</SelectItem>
                <SelectItem value="later">{t("furn.payment.later")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full border-t border-border/50 pt-4 mt-2">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-muted-foreground">{t("furn.total")}</span>
            <span className="text-xl font-bold text-primary">{total.toLocaleString()} TND</span>
          </div>
          <Button 
            className="w-full h-11 text-base font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2" 
            onClick={onCheckout}
          >
            <CheckCircle2 className="w-5 h-5" />
            {t("furn.checkout")}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
