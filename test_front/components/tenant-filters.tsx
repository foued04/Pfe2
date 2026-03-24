"use client"

import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X } from "lucide-react"

export interface FilterValues {
  city: string
  department: string
  minBudget: string
  maxBudget: string
  propertyType: string
  bedrooms: string
  furnished: boolean
  parking: boolean
  minSurface: string
}

interface TenantFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  onApply: () => void
  onReset: () => void
}

const propertyTypes = [
  { value: "all", label: "Tous" },
  { value: "s0", label: "S+0 (Studio)" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

const bedroomOptions = [
  { value: "any", label: "Tout" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4+", label: "4+" },
]

export function TenantFilters({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onApply,
  onReset,
}: TenantFiltersProps) {
  const { t } = useI18n()

  if (!isOpen) return null

  const updateFilter = (key: keyof FilterValues, value: string | boolean) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative h-full w-full max-w-md overflow-y-auto bg-card shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-4">
          <h2 className="text-lg font-semibold text-foreground">{t("tenant.filters")}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6 p-6">
          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Location</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="city">{t("filter.city")}</Label>
                <Input
                  id="city"
                  value={filters.city}
                  onChange={(e) => updateFilter("city", e.target.value)}
                  placeholder="Tunis, Sousse, Sfax..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="department">{t("filter.department")}</Label>
                <Input
                  id="department"
                  value={filters.department}
                  onChange={(e) => updateFilter("department", e.target.value)}
                  placeholder="Grand Tunis, Cap Bon..."
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-4">
            <h3 className="font-medium text-foreground">Budget</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="minBudget">{t("filter.minBudget")}</Label>
                <Input
                  id="minBudget"
                  type="number"
                  value={filters.minBudget}
                  onChange={(e) => updateFilter("minBudget", e.target.value)}
                  placeholder="500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="maxBudget">{t("filter.maxBudget")}</Label>
                <Input
                  id="maxBudget"
                  type="number"
                  value={filters.maxBudget}
                  onChange={(e) => updateFilter("maxBudget", e.target.value)}
                  placeholder="2000"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-3">
            <Label>{t("filter.propertyType")}</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) => updateFilter("propertyType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms */}
          <div className="space-y-3">
            <Label>{t("filter.bedrooms")}</Label>
            <Select
              value={filters.bedrooms}
              onValueChange={(value) => updateFilter("bedrooms", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {bedroomOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Min Surface */}
          <div className="space-y-3">
            <Label htmlFor="minSurface">{t("filter.minSurface")} (m²)</Label>
            <Input
              id="minSurface"
              type="number"
              value={filters.minSurface}
              onChange={(e) => updateFilter("minSurface", e.target.value)}
              placeholder="50"
            />
          </div>

          {/* Switches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="furnished">{t("filter.furnished")}</Label>
              <Switch
                id="furnished"
                checked={filters.furnished}
                onCheckedChange={(checked) => updateFilter("furnished", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="parking">{t("filter.parking")}</Label>
              <Switch
                id="parking"
                checked={filters.parking}
                onCheckedChange={(checked) => updateFilter("parking", checked)}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 flex gap-3 border-t border-border bg-card p-4">
          <Button variant="outline" onClick={onReset} className="flex-1">
            {t("filter.reset")}
          </Button>
          <Button onClick={onApply} className="flex-1 bg-primary text-primary-foreground">
            {t("filter.apply")}
          </Button>
        </div>
      </div>
    </div>
  )
}
