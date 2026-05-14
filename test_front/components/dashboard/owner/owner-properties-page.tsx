"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { apiFetch } from "@/lib/api/client"
import { useOwnerDashboard } from "@/hooks/api/use-owner-dashboard"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { EmptyState } from "@/components/dashboard/shared/empty-state"
import { OwnerPropertiesGrid } from "@/components/owner-properties-grid"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export function OwnerPropertiesPage() {
  const { t, lang } = useI18n()
  const router = useRouter()
  const { properties, setProperties, isLoading, error } = useOwnerDashboard()

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
        title={t("nav.allProperties")}
        description={
          lang === "fr" 
            ? "Consultez toutes les proprietes de l'application. Vos biens restent entierement gerables, ceux des autres proprietaires sont en lecture seule."
            : "View all properties in the application. Your properties remain fully manageable, while others are read-only."
        }
        actions={
          <Button asChild>
            <Link href="/dashboard/owner/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              {t("nav.addProperty")}
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-sm text-muted-foreground">
          {t("general.loading") || "Chargement des proprietes..."}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-sm text-destructive">{error}</div>
      ) : properties.length === 0 ? (
        <EmptyState 
          icon={Building2} 
          title={t("dashboard.noProperties")} 
          description={t("dashboard.noPropertiesDesc")} 
        />
      ) : (
        <OwnerPropertiesGrid
          properties={properties}
          onManageFurniture={(id) => router.push(`/dashboard/owner/furniture?property=${id}`)}
          onEdit={(property) => router.push(`/dashboard/owner/properties/new?edit=${property.id || property._id}`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
