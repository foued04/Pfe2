"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { furnitureCatalog, FurnitureCategory, FurnitureItem } from "@/lib/furniture-data"
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
  const [selectedCategory, setSelectedCategory] = useState<(FurnitureCategory | "All")>("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = furnitureCatalog.filter(item => {
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t("general.search")} 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="rounded-full h-8"
            >
              {getCategoryLabel(cat)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
            <div className="aspect-[4/3] overflow-hidden relative">
              <img 
                src={item.image} 
                alt={item.name} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <Badge className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90 font-medium border-none">
                {getCategoryLabel(item.category)}
              </Badge>
            </div>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base line-clamp-1">{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                {item.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-lg font-bold text-primary">
                  {item.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">TND</span>
                </span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button 
                className="w-full gap-2" 
                onClick={() => onAddToCart(item)}
              >
                <Plus className="w-4 h-4" />
                {t("furn.add")}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
          <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">{t("tenant.noResults")}</p>
        </div>
      )}
    </div>
  )
}
