"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { fetchFurniture, FurnitureCategory, FurnitureItem } from "@/lib/furniture-data"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Search, Plus, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface FurnitureCatalogProps {
  onAddToCart: (item: FurnitureItem) => void
}

const categories: (FurnitureCategory | "All")[] = ["All", "Salon", "Chambre", "Salle à manger", "Cuisine", "Décoration", "Bureau"]

export function FurnitureCatalog({ onAddToCart }: FurnitureCatalogProps) {
  const { t, lang } = useI18n()
  const [items, setItems] = useState<FurnitureItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<(FurnitureCategory | "All")>("All")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await fetchFurniture()
        setItems(data)
      } catch (error) {
        console.error("Error loading furniture:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadItems()
  }, [])

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const getCategoryLabel = (cat: string) => {
    if (cat === "All") return t("furn.all")
    const key = cat.toLowerCase().replace(/ /g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return t(`furn.cat.${key}`)
  }

  return (
    <div className="space-y-8">
      {/* Search and Filters Block */}
      <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder={t("general.search")}
            className="pl-12 h-14 bg-blue-50/50 border-none rounded-xl text-lg focus-visible:ring-primary/20 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-bold transition-all border",
                selectedCategory === cat 
                  ? "bg-primary text-white border-primary shadow-lg shadow-blue-100" 
                  : "bg-white text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
              )}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Catalog Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[400px] bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border-none bg-white rounded-2xl shadow-sm">
              <div className="relative aspect-[16/11] overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-primary border-none font-black px-3 py-1">
                  {getCategoryLabel(item.category)}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-extrabold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                  <span className="text-lg font-black text-primary whitespace-nowrap">{item.price.toLocaleString()} DT</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-6 h-8 leading-relaxed">
                  {item.description}
                </p>
                
                <Button 
                  onClick={() => onAddToCart(item)} 
                  className="w-full h-11 bg-primary hover:opacity-80 text-white rounded-xl gap-2 font-bold transition-all shadow-md shadow-blue-900/10 active:scale-95"
                >
                  <Plus className="w-4 h-4" /> {t("furn.add")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border/60 shadow-inner">
          <div className="w-20 h-20 bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Filter className="w-10 h-10 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground font-bold text-lg">{t("tenant.noResults")}</p>
          <p className="text-sm text-muted-foreground/60 mt-1">Essayez d'autres mots-clés ou catégories</p>
        </div>
      )}
    </div>
  )
}
