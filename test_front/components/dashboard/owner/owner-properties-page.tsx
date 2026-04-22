"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { apiFetch } from "@/lib/api/client"
import { useOwnerDashboard } from "@/hooks/api/use-owner-dashboard"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { EmptyState } from "@/components/dashboard/shared/empty-state"
import { OwnerPropertiesGrid } from "@/components/owner-properties-grid"
import { Button } from "@/components/ui/button"
import { Building2 } from "lucide-react"

export function OwnerPropertiesPage() {
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
        eyebrow="Owner"
        title="My Properties"
        description="Retrouvez l'ensemble de vos annonces dans une page dediee, avec des actions SaaS claires."
        actions={
          <Button asChild>
            <Link href="/dashboard/owner/properties/new"><Plus className="mr-2 h-4 w-4" />Add Property</Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-3xl border border-border bg-card p-8 text-sm text-muted-foreground">Chargement des proprietes...</div>
      ) : error ? (
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 text-sm text-destructive">{error}</div>
      ) : properties.length === 0 ? (
        <EmptyState icon={Building2} title="No properties yet" description="Ajoutez votre premiere propriete pour commencer votre activite sur ImmoSmart." />
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

