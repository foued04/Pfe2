"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Building2, FileText, Map, Plus, TrendingUp } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { useOwnerDashboard } from "@/hooks/api/use-owner-dashboard"
import { useI18n } from "@/lib/i18n"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { StatsGrid } from "@/components/dashboard/shared/stats-grid"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OwnerPropertiesGrid } from "@/components/owner-properties-grid"

export function OwnerOverviewPage() {
  const router = useRouter()
  const { t } = useI18n()
  const { myProperties, setProperties, stats, isLoading, error } = useOwnerDashboard()

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/properties/${id}`, { auth: true, method: "DELETE" })
      setProperties((prev) => prev.filter((property) => property.id !== id))
    } catch (err) {
      console.error("Delete property failed:", err)
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("role.owner")}
        title={t("dashboard.ownerTitle")}
        description={t("dashboard.ownerDesc") || "Consultez et gérez vos propres biens immobiliers."}
        actions={
          <Button asChild>
            <Link href="/dashboard/owner/properties/new"><Plus className="mr-2 h-4 w-4" />{t("dashboard.addProperty")}</Link>
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: t("dashboard.totalProperties"), value: stats.total, icon: Building2 },
          { label: t("dashboard.pendingRequests"), value: stats.requestCount, icon: FileText },
          { label: t("dashboard.monthlyRevenue"), value: `${stats.revenue.toLocaleString("fr-TN")} TND`, icon: TrendingUp },
          { label: t("dashboard.available"), value: stats.available, icon: Building2 },
        ]}
      />

      {isLoading ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground">{t("general.loading")}</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-8 text-sm text-destructive">{error}</CardContent></Card>
      ) : (
        <div className="space-y-6">
          <Card className="rounded-3xl">
            <CardContent className="flex flex-wrap gap-4 p-6">
              <Button asChild variant="outline"><Link href="/dashboard/owner/properties">{t("dashboard.viewAllProperties")}</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/owner/requests">{t("dashboard.reviewRequests")}</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/owner/map"><Map className="mr-2 h-4 w-4" />{t("dashboard.openMap")}</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/owner/furniture">{t("dashboard.manageFurniture")}</Link></Button>
            </CardContent>
          </Card>
          <OwnerPropertiesGrid
            properties={myProperties}
            onManageFurniture={(id) => router.push(`/dashboard/owner/furniture?property=${id}`)}
            onEdit={(property) => router.push(`/dashboard/owner/properties/new?edit=${property.id || property._id}`)}
            onDelete={handleDelete}
          />
        </div>
      )}

    </div>
  )
}
