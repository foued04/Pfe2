"use client"

import { useEffect, useState } from "react"
import { useI18n } from "@/lib/i18n"
import { fetchFurniture, FurnitureCategory, FurnitureItem, getFurnitureFallbackImage } from "@/lib/furniture-data"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Search, Plus, Filter, ImageOff, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface FurnitureCatalogProps {
  onAddToCart: (item: FurnitureItem) => void
}

const categories: (FurnitureCategory | "All")[] = ["All", "Salon", "Chambre", "Salle à manger", "Cuisine", "Décoration", "Bureau"]

const categoryVisuals: Record<string, string> = {
  Salon: "from-amber-100 via-orange-50 to-white",
  Chambre: "from-rose-100 via-pink-50 to-white",
  "Salle à manger": "from-emerald-100 via-teal-50 to-white",
  Cuisine: "from-sky-100 via-cyan-50 to-white",
  Décoration: "from-violet-100 via-fuchsia-50 to-white",
  Bureau: "from-slate-200 via-slate-100 to-white",
}

export function FurnitureCatalog({ onAddToCart }: FurnitureCatalogProps) {
  const { t } = useI18n()
  const [items, setItems] = useState<FurnitureItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<(FurnitureCategory | "All")>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

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

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    const normalizedQuery = searchQuery.toLowerCase()
    const matchesSearch =
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.description?.toLowerCase().includes(normalizedQuery)

    return matchesCategory && matchesSearch
  })

  const getCategoryLabel = (cat: string) => {
    if (cat === "All") return t("furn.all")
    const key = cat.toLowerCase().replace(/ /g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return t(`furn.cat.${key}`)
  }

  const renderImage = (item: FurnitureItem) => {
    const imageFailed = failedImages[item.id] || !item.image
    const imageSrc = imageFailed ? getFurnitureFallbackImage(item) : item.image
    const visualClass = categoryVisuals[item.category] || "from-slate-100 via-slate-50 to-white"

    if (!imageSrc) {
      return (
        <div className={cn("absolute inset-0 bg-gradient-to-br", visualClass)}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_35%)]" />
          <div className="relative flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-sm backdrop-blur">
              <ImageOff className="h-7 w-7 text-slate-500" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-slate-700">{getCategoryLabel(item.category)}</p>
              <p className="line-clamp-2 text-base font-bold text-slate-900">{item.name}</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <img
        src={imageSrc}
        alt={item.name}
        loading="lazy"
        onError={() => setFailedImages((prev) => ({ ...prev, [item.id]: true }))}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
      />
    )
  }

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl border border-border/50 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b bg-slate-950 p-6 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-100">
              <Sparkles className="h-3.5 w-3.5" />
              Sélection meublée
            </div>
            <h2 className="text-2xl font-black">Catalogue mobilier prêt à louer</h2>
            <p className="mt-1 max-w-2xl text-sm font-medium text-slate-300">
              Des exemples réalistes avec photos pour équiper salon, chambre, cuisine, bureau et décoration.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-black">
            {filteredItems.length} articles
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t("general.search")}
              className="h-14 rounded-xl border-none bg-blue-50/50 pl-12 text-lg transition-all focus-visible:ring-primary/20"
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
                  "rounded-full border px-5 py-2 text-sm font-bold transition-all",
                  selectedCategory === cat
                    ? "border-primary bg-primary text-white shadow-lg shadow-blue-100"
                    : "border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-primary"
                )}
              >
                {getCategoryLabel(cat)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-[400px] animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
              <div className="relative aspect-[16/11] overflow-hidden">
                {renderImage(item)}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                <Badge className="absolute right-4 top-4 border-none bg-white/90 px-3 py-1 font-black text-primary backdrop-blur-md">
                  {getCategoryLabel(item.category)}
                </Badge>
                <div className="absolute bottom-4 left-4 rounded-2xl bg-slate-950/85 px-4 py-2 text-lg font-black text-white shadow-lg backdrop-blur">
                  {item.price.toLocaleString()} DT
                </div>
              </div>
              <CardContent className="flex flex-1 flex-col p-6">
                <h3 className="line-clamp-1 text-xl font-black transition-colors group-hover:text-primary">{item.name}</h3>
                <p className="mb-6 mt-3 min-h-[4.8rem] line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>

                <Button
                  onClick={() => onAddToCart(item)}
                  className="mt-auto h-11 w-full gap-2 rounded-xl bg-primary font-bold text-white shadow-md shadow-blue-900/10 transition-all active:scale-95 hover:opacity-80"
                >
                  <Plus className="h-4 w-4" /> {t("furn.add")}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && filteredItems.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border/60 bg-white py-24 text-center shadow-inner">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/30">
            <Filter className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <p className="text-lg font-bold text-muted-foreground">{t("tenant.noResults")}</p>
          <p className="mt-1 text-sm text-muted-foreground/60">Essayez d'autres mots-clés ou catégories</p>
        </div>
      )}
    </div>
  )
}
