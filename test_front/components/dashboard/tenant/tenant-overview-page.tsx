"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Bell, FileText, Heart, Home, Map, Megaphone, ShoppingBag } from "lucide-react"
import type { Property } from "@/lib/property-data"
import { useProperties } from "@/hooks/api/use-properties"
import { useTenantHomes } from "@/hooks/api/use-tenant-homes"
import { useFavorites } from "@/hooks/api/use-favorites"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { StatsGrid } from "@/components/dashboard/shared/stats-grid"
import { TenantPropertyCard } from "@/components/tenant-property-card"
import { PropertyDetailPage } from "@/components/property/property-detail-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

export function TenantOverviewPage() {
  const { t } = useI18n()
  const { properties, isLoading, error } = useProperties({ auth: true })
  const { homes: myHomes, isLoading: isHomesLoading } = useTenantHomes()
  const { favoriteIds, toggleFavorite } = useFavorites()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const availableProperties = useMemo(() => {
    const rentedIds = new Set(myHomes.map((home) => home.id))
    return properties.filter((property) => !rentedIds.has(property.id))
  }, [myHomes, properties])

  if (selectedProperty) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedProperty(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t("general.back")}
        </Button>
        <PropertyDetailPage propertyId={selectedProperty.id} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("role.tenant")}
        title={t("tenant.title")}
        description={t("tenant.subtitle") || "Accédez rapidement à vos demandes, favoris et notifications depuis un tableau de bord clair."}
      />
      <StatsGrid
        stats={[
          { label: t("dashboard.availableProperties"), value: availableProperties.length, icon: Home },
          { label: t("sidebar.myHome"), value: isHomesLoading ? "-" : myHomes.length, icon: Home },
          { label: t("sidebar.map"), value: "-", icon: Map },
          { label: t("sidebar.requests"), value: "-", icon: FileText },
          { label: t("sidebar.reclamation"), value: "-", icon: Megaphone },
          { label: t("sidebar.favorites"), value: "-", icon: Heart },
          { label: t("sidebar.furniture"), value: "-", icon: ShoppingBag },
          { label: t("sidebar.notifications"), value: "-", icon: Bell },
        ]}
      />
      <Card className="rounded-3xl">
        <CardContent className="flex flex-wrap gap-3 p-6 text-sm">
          <Link href="/dashboard/tenant/map" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">{t("sidebar.map")}</Link>
          <Link href="/dashboard/tenant/my-home" className="rounded-full bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary/90">{t("sidebar.myHome")}</Link>
          <Link href="/dashboard/tenant/requests" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">{t("sidebar.requests")}</Link>
          <Link href="/dashboard/tenant/reclamations" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">{t("sidebar.reclamation")}</Link>
          <Link href="/dashboard/tenant/favorites" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">{t("sidebar.favorites")}</Link>
          <Link href="/dashboard/tenant/furniture" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">{t("sidebar.furniture")}</Link>
          <Link href="/dashboard/tenant/notifications" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">{t("sidebar.notifications")}</Link>
        </CardContent>
      </Card>
      {myHomes.length > 0 && (
        <section className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{t("role.tenant")}</p>
            <h2 className="text-2xl font-bold">{t("sidebar.myHome")}</h2>
            <p className="text-sm text-muted-foreground">{t("tenant.myHomeDesc") || "Votre logement loué après signature du contrat."}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {myHomes.map((property) => (
              <TenantPropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds.includes(property.id)}
                onToggleFavorite={(propertyId) => {
                  void toggleFavorite(propertyId)
                }}
                onViewDetails={setSelectedProperty}
                onContact={setSelectedProperty}
              />
            ))}
          </div>
        </section>
      )}
      {isLoading ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground">{t("general.loading")}</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-8 text-sm text-destructive">{error}</CardContent></Card>
      ) : (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{t("tenant.availableHomes") || "Logements disponibles"}</h2>
            <p className="text-sm text-muted-foreground">{t("tenant.availableHomesDesc") || "Les annonces encore disponibles à la location."}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {availableProperties.slice(0, 3).map((property) => (
              <TenantPropertyCard
                key={property.id}
                property={property}
                isFavorite={favoriteIds.includes(property.id)}
                onToggleFavorite={(propertyId) => {
                  void toggleFavorite(propertyId)
                }}
                onViewDetails={setSelectedProperty}
                onContact={setSelectedProperty}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
