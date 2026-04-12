"use client"

import { useI18n } from "@/lib/i18n"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, Heart } from "lucide-react"

interface TenantSearchHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFiltersClick: () => void
  onFavoritesClick: () => void
  favoritesCount: number
}

export function TenantSearchHeader({
  searchQuery,
  onSearchChange,
  onFiltersClick,
  onFavoritesClick,
  favoritesCount,
}: TenantSearchHeaderProps) {
  const { t } = useI18n()

  return (
    <div className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="px-6 py-4">
        {/* Title */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground">{t("tenant.title")}</h1>
          <p className="text-muted-foreground">{t("tenant.subtitle")}</p>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("tenant.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-12 pl-12 pr-4 text-base bg-card border-border rounded-xl focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <Button
            onClick={onFiltersClick}
            variant="outline"
            className="h-12 gap-2 rounded-xl border-border px-5"
          >
            <SlidersHorizontal className="h-5 w-5" />
            <span className="hidden sm:inline">{t("tenant.filters")}</span>
          </Button>

          <Button
            onClick={onFavoritesClick}
            variant="outline"
            className="relative h-12 gap-2 rounded-xl border-border px-5"
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {favoritesCount}
              </span>
            )}
          </Button>
        </div>

        {/* Quick Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {["type.s0", "type.s1", "type.s2", "type.s3", "type.villa"].map((type) => (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className="rounded-full border-border text-xs hover:bg-secondary"
            >
              {t(type)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
