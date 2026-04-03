"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "./ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { 
  Plus, 
  Search, 
  Armchair,
  ShoppingCart, 
  ChevronRight, 
  Package, 
  Truck, 
  HelpCircle, 
  X, 
  Minus, 
  FileText,
  CreditCard,
  Download,
  Landmark,
  User as UserIcon,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { FurnitureChangeRequestModal } from "./furniture-change-request-modal"
import type { Contract } from "@/lib/rental-request-data"
import { cn } from "@/lib/utils"
import { PdfLayout } from "./pdf-layout"

// Interface for Furniture from Backend
interface Furniture {
  _id: string
  name: string
  category: string
  price: number
  image: string
  description: string
}

interface CartItem extends Furniture {
  quantity: number
}

interface FurnitureOrderPageProps {
  contract: Contract
}

const CATEGORIES = ["Tous", "Salon", "Chambre", "Cuisine", "Salle à manger", "Bureau", "Décoration"]

export function FurnitureOrderPage({ contract }: FurnitureOrderPageProps) {
  const { user } = useAuth()
  const [catalog, setCatalog] = useState<Furniture[]>([])
  const [filteredCatalog, setFilteredCatalog] = useState<Furniture[]>([])
  const [selectedCategory, setSelectedCategory] = useState("Tous")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  useEffect(() => {
    fetchFurniture()
  }, [])

  const fetchFurniture = async () => {
    try {
      const response = await fetch(`${API_URL}/api/furniture`)
      if (response.ok) {
        const data = await response.json()
        setCatalog(data)
        setFilteredCatalog(data)
      }
    } catch (error) {
      console.error("Error fetching furniture:", error)
      toast.error("Erreur lors du chargement du catalogue")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let result = catalog
    if (selectedCategory !== "Tous") {
      result = result.filter(item => item.category === selectedCategory)
    }
    if (searchQuery) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setFilteredCatalog(result)
  }, [selectedCategory, searchQuery, catalog])

  const addToCart = (item: Furniture) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === item._id)
      if (existing) {
        return prev.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    toast.success(`${item.name} ajouté au panier`)
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item._id !== id))
  }

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item._id === id) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    }))
  }

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  const handleGenerateVoucher = async () => {
    if (cart.length === 0) {
      toast.error("Votre panier est vide")
      return
    }

    setIsGenerating(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/api/furniture/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          contractId: contract.id,
          items: cart.map(item => ({
            furniture: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          total: total
        })
      })

      if (response.ok) {
        toast.success("Bon d'achat généré avec succès !")
      } else {
        toast.error("Erreur lors de la génération du bon d'achat")
      }
    } catch (error) {
      console.error("Error generating voucher:", error)
      toast.error("Erreur de connexion au serveur")
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreviewPDF = () => {
    if (cart.length === 0) {
      toast.error("Ajoutez des articles au panier pour voir l'aperçu")
      return
    }
    
    const element = document.getElementById('voucher-pdf-content');
    if (element) {
        // @ts-ignore
        import('html2pdf.js').then((html2pdf) => {
            const opt = {
                margin: 0,
                filename: `Bon_Achat_Meubles_${contract.id}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };
            html2pdf.default().from(element).set(opt).save();
        });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-primary p-8 text-white shadow-xl shadow-emerald-900/10 active:scale-[0.99] transition-all">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
                <Armchair className="w-8 h-8 text-secondary" />
                Catalogue Mobilier Premium
              </h1>
              <p className="text-emerald-50/80 text-lg font-medium">
                {contract.propertyTitle && "Ce logement n'est pas entièrement meublé — commandez depuis notre catalogue, un bon d'achat sera joint au contrat. Vous pouvez aussi demander le changement d'un meuble existant."}
              </p>
            </div>
            <div className="bg-secondary/20 backdrop-blur-md px-6 py-4 rounded-xl border border-secondary/30 flex items-center gap-4">
              <div className="p-2 bg-secondary/20 rounded-lg">
                <Truck className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-black text-secondary">Livraison</p>
                <p className="text-sm font-bold">Standard Gratuite</p>
              </div>
            </div>
          </div>
          {/* Abstract circles decoration */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column - Catalog (Col 8/9) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un meuble, un style..."
                  className="pl-12 h-14 bg-secondary/20 border-none rounded-xl text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-bold transition-all border",
                      selectedCategory === cat 
                        ? "bg-primary text-white border-primary shadow-lg shadow-emerald-100" 
                        : "bg-white text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Catalog Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="h-80 animate-pulse bg-muted rounded-2xl border-none" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCatalog.map(item => (
                  <Card key={item._id} className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border-none bg-white rounded-2xl shadow-sm">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-primary border-none font-black px-3 py-1">
                        {item.category}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-extrabold text-xl line-clamp-1">{item.name}</h3>
                        <span className="text-xl font-black text-primary">{item.price} DT</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10 leading-relaxed">{item.description}</p>
                      
                      <Button 
                        onClick={() => addToCart(item)} 
                        className="w-full h-11 bg-primary hover:opacity-80 text-white rounded-xl gap-2 font-bold transition-all shadow-md shadow-emerald-900/5 active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Ajouter au panier
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* How it works */}
            <Card className="bg-background border-secondary/30 rounded-2xl overflow-hidden">
              <CardHeader className="bg-white/50 border-b border-secondary/20">
                <CardTitle className="text-lg font-black flex items-center gap-2 text-primary">
                  <HelpCircle className="w-5 h-5 text-secondary" />
                  Comment ça marche ?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { step: 1, title: "Choisissez", desc: "Sélectionnez vos meubles préférés", icon: <Package className="w-5 h-5" /> },
                    { step: 2, title: "Panier", desc: "Vérifiez vos articles et quantités", icon: <ShoppingCart className="w-5 h-5" /> },
                    { step: 3, title: "Bon d'achat", desc: "Générez le document pour le contrat", icon: <FileText className="w-5 h-5" /> },
                    { step: 4, title: "Règlement", desc: "Payez à la livraison à domicile", icon: <CreditCard className="w-5 h-5" /> }
                  ].map(item => (
                    <div key={item.step} className="flex flex-col items-center text-center space-y-4 group">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-xl shadow-emerald-900/5 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center text-primary">
                          {item.icon}
                        </div>
                        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-secondary text-primary flex items-center justify-center font-black text-xs border-2 border-background">
                          {item.step}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-sm uppercase tracking-tight">{item.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Change Furniture Card */}
            <Card className="bg-background border-primary/10 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center md:text-left">
                  <h3 className="font-black text-xl text-primary">Besoin de changer un meuble ?</h3>
                  <p className="text-sm text-muted-foreground">Si un meuble ne convient pas ou est endommagé, vous pouvez envoyer une demande de changement.</p>
                </div>
                <Button 
                  onClick={() => setIsChangeModalOpen(true)}
                  className="bg-white hover:bg-white text-primary border border-primary/20 font-black h-12 px-8 rounded-xl shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                >
                  Demander un changement
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Cart (Col 4/12) */}
          <div className="lg:col-span-4 space-y-8 sticky top-24">
            <Card className="border-none shadow-2xl shadow-emerald-900/10 bg-white rounded-3xl overflow-hidden">
              <CardHeader className="bg-primary text-white p-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-black flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-secondary" />
                    Panier de commande
                  </CardTitle>
                  <Badge className="bg-secondary text-primary border-none font-black rounded-lg">
                    {cart.reduce((a, b) => a + b.quantity, 0)} articles
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-8">
                <ScrollArea className="h-[400px] pr-4 -mr-4">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40 grayscale">
                      <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mb-4">
                        <Package className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <p className="font-bold text-muted-foreground">Votre panier est vide</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">Commencez vos achats depuis le catalogue</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cart.map(item => (
                        <div key={item._id} className="flex items-center gap-4 group">
                          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 shadow-sm border border-border/20">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-extrabold text-sm text-primary line-clamp-1">{item.name}</p>
                              <button 
                                onClick={() => removeFromCart(item._id)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-md font-black text-primary">{item.price} DT</p>
                              <div className="flex items-center gap-3 bg-secondary/30 rounded-xl p-1 px-2">
                                <button 
                                  onClick={() => updateQuantity(item._id, -1)}
                                  className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white text-muted-foreground transition-all shadow-sm"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-black w-3 text-center">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item._id, 1)}
                                  className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white text-muted-foreground transition-all shadow-sm"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                <div className="space-y-6">
                  <div className="bg-background p-5 rounded-2xl border border-border/40 space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                       <Landmark className="w-4 h-4 text-secondary" />
                       Détails de la propriété
                    </div>
                    <div className="space-y-1">
                      <p className="font-extrabold text-primary">{contract.propertyTitle}</p>
                      <p className="text-xs text-muted-foreground">{contract.propertyAddress}</p>
                    </div>
                    <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                      <span className="text-xs font-bold text-muted-foreground">Règlement :</span>
                      <Badge variant="outline" className="bg-white border-primary/20 text-primary">Espèces à la livraison</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm items-center">
                      <span className="font-bold text-muted-foreground/80">Sous-total</span>
                      <span className="font-extrabold">{total} DT</span>
                    </div>
                    <div className="flex justify-between text-sm items-center">
                      <span className="font-bold text-muted-foreground/80">Livraison</span>
                      <span className="text-emerald-600 font-black tracking-tighter">GRATUITE</span>
                    </div>
                    <div className="border-t-2 border-dashed border-primary/10 pt-4 flex justify-between text-2xl font-black items-center text-primary">
                      <span>Total final</span>
                      <span>{total} DT</span>
                    </div>
                  </div>

                  {/* Voucher Preview Card */}
                  <div className="relative group overflow-hidden bg-primary rounded-2xl p-6 text-white shadow-xl shadow-emerald-950/20 active:scale-[0.98] transition-all cursor-default select-none mt-8">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                       <FileText className="w-16 h-16" />
                    </div>
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center gap-2 bg-secondary/20 w-fit px-3 py-1 rounded-lg border border-secondary/20">
                         <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Bon d'achat</span>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-lg">{user?.name}</h4>
                        <p className="text-xs text-emerald-50/60 leading-tight">Bon d'achat lié au contrat #{contract.id}</p>
                      </div>
                      <div className="flex justify-between items-end pt-2">
                        <div className="space-y-1">
                           <p className="text-[10px] uppercase font-black tracking-tighter text-secondary">Articles</p>
                           <p className="text-lg font-black">{cart.reduce((a, b) => a + b.quantity, 0)} items</p>
                        </div>
                        <div className="text-right space-y-1">
                           <p className="text-[10px] uppercase font-black tracking-tighter text-secondary">Total</p>
                           <p className="text-2xl font-black text-secondary">{total} DT</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-6 bg-background border-t border-border/30 flex flex-col gap-4">
                <Button 
                  className="w-full h-14 bg-primary hover:opacity-80 text-white text-lg font-black rounded-2xl shadow-lg shadow-emerald-950/20 gap-3 group transition-all"
                  onClick={handleGenerateVoucher}
                  disabled={cart.length === 0 || isGenerating}
                >
                  {isGenerating ? (
                    <span className="animate-pulse">Génération en cours...</span>
                  ) : (
                    <>
                      Générer le bon d'achat
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
                <div className="grid grid-cols-1 gap-3 w-full">
                  <Button 
                    variant="outline" 
                    className="h-12 rounded-xl border border-primary/20 text-primary font-black gap-2 hover:bg-primary/5 hover:text-primary" 
                    onClick={handlePreviewPDF}
                    disabled={cart.length === 0}
                  >
                    <Download className="w-4 h-4" /> Télécharger Aperçu PDF
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center px-4 leading-relaxed">
                  Le règlement de cette commande s'effectue intégralement à la livraison. Les tarifs incluent la livraison et l'installation.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      <FurnitureChangeRequestModal 
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        furnitureList={cart.length > 0 ? cart : catalog.slice(0, 10)}
        contractId={contract.id}
      />

      {/* Standardized PDF Content */}
      <div style={{ display: 'none' }}>
        <PdfLayout
          id="voucher-pdf-content"
          title="Bon d'Achat"
          documentId={contract.id}
          date={new Date().toLocaleDateString()}
          infoLeft={
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Informations Locataire</p>
              <div className="flex items-center gap-2">
                <UserIcon className="w-3 h-3 text-primary" />
                <p className="font-black text-primary">{user?.name}</p>
              </div>
              <p className="text-[11px] text-[#6B7280]">{user?.email}</p>
              <p className="text-[11px] text-[#6B7280]">{user?.phone}</p>
            </div>
          }
          infoRight={
            <div className="space-y-2 text-right">
              <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Référence Logement</p>
              <div className="flex items-center gap-2 justify-end">
                <p className="font-black text-primary">{contract.propertyTitle}</p>
                <Landmark className="w-3 h-3 text-primary" />
              </div>
              <p className="text-[11px] text-[#6B7280]">{contract.propertyAddress}</p>
              <p className="text-[10px] text-[#6B7280] italic">Contrat ID: {contract.id}</p>
            </div>
          }
          footerNotes="Conformément à l'accord ImmoSmart, le règlement s'effectue intégralement à la livraison. Le mobilier reste la propriété d'ImmoSmart jusqu'au paiement intégral. L'installation est effectuée par nos techniciens qualifiés."
        >
          <div className="space-y-[10mm]">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b-[3px] border-primary">
                  <th className="py-4 text-[10px] font-black uppercase text-primary">Articles sélectionnés</th>
                  <th className="py-4 text-[10px] font-black uppercase text-primary">Catégorie</th>
                  <th className="py-4 text-center text-[10px] font-black uppercase text-primary">Quantité</th>
                  <th className="py-4 text-right text-[10px] font-black uppercase text-primary">Prix Unitaire</th>
                  <th className="py-4 text-right text-[10px] font-black uppercase text-primary">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item._id} className="border-b border-background">
                    <td className="py-5 font-bold text-primary">{item.name}</td>
                    <td className="py-5 text-[12px] text-[#6B7280]">{item.category}</td>
                    <td className="py-5 text-center font-bold">{item.quantity}</td>
                    <td className="py-5 text-right font-medium">{item.price.toLocaleString()} DT</td>
                    <td className="py-5 text-right font-black text-primary">{(item.price * item.quantity).toLocaleString()} DT</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-6">
              <div className="w-[80mm] space-y-4">
                <div className="flex justify-between items-center text-[12px] text-[#6B7280] font-bold">
                  <span>Sous-total</span>
                  <span>{total.toLocaleString()} DT</span>
                </div>
                <div className="flex justify-between items-center text-[12px] text-emerald-600 font-bold uppercase tracking-tighter">
                  <span>Livraison & Installation</span>
                  <span>OFFERTE</span>
                </div>
                <div className="bg-primary p-6 rounded-2xl text-white flex justify-between items-center shadow-xl shadow-emerald-900/10">
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Total à régler</p>
                    <p className="text-[11px] font-medium opacity-80 italic">à la livraison</p>
                  </div>
                  <p className="text-3xl font-black">{total.toLocaleString()} DT</p>
                </div>
              </div>
            </div>

            <div className="mt-20 flex justify-between gap-[30mm]">
              <div className="flex-1 text-center space-y-4">
                <div className="h-[25mm] border-b border-[#E5E7EB] flex items-end justify-center pb-2">
                   <p className="text-[10px] text-[#9CA3AF] italic">Signer ici</p>
                </div>
                <div>
                  <p className="text-[12px] font-black text-primary">Signature Locataire</p>
                  <p className="text-[10px] text-[#9CA3AF]">Lu et approuvé</p>
                </div>
              </div>
              <div className="flex-1 text-center space-y-4 relative">
                <div className="h-[25mm] border-b border-[#E5E7EB] flex items-end justify-center pb-2 relative">
                   <div className="absolute top-[5mm] left-1/2 -translate-x-1/2 -rotate-12 border-[3px] border-primary/20 px-4 py-2 rounded-xl text-primary/20 font-black text-[12px] uppercase">
                     VALIDÉ IMMOSMART
                   </div>
                   <p className="text-[10px] text-[#9CA3AF] italic">Cachet de la direction</p>
                </div>
                <div>
                  <p className="text-[12px] font-black text-primary">Direction ImmoSmart</p>
                  <p className="text-[10px] text-[#9CA3AF]">Signature autorisée</p>
                </div>
              </div>
            </div>
          </div>
        </PdfLayout>
      </div>
    </div>
  )
}
