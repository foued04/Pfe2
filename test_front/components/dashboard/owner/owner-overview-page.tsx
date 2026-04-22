"use client"

import Link from "next/link"
import { Building2, FileText, Plus, TrendingUp } from "lucide-react"
import { useOwnerDashboard } from "@/hooks/api/use-owner-dashboard"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { StatsGrid } from "@/components/dashboard/shared/stats-grid"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OwnerPropertiesGrid } from "@/components/owner-properties-grid"

export function OwnerOverviewPage() {
  const { properties, stats, isLoading, error } = useOwnerDashboard()

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Owner"
        title="Owner Dashboard"
        description="Suivez vos indicateurs, accedez rapidement a vos biens et gardez le controle sur vos demandes."
        actions={
          <Button asChild>
            <Link href="/dashboard/owner/properties/new"><Plus className="mr-2 h-4 w-4" />Add Property</Link>
          </Button>
        }
      />

      <StatsGrid
        stats={[
          { label: "Total properties", value: stats.total, icon: Building2 },
          { label: "Pending requests", value: stats.requestCount, icon: FileText },
          { label: "Monthly revenue", value: `${stats.revenue.toLocaleString("fr-TN")} TND`, icon: TrendingUp },
          { label: "Available", value: stats.available, icon: Building2 },
        ]}
      />

      {isLoading ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground">Chargement du tableau de bord...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-8 text-sm text-destructive">{error}</CardContent></Card>
      ) : (
        <div className="space-y-6">
          <Card className="rounded-3xl">
            <CardContent className="flex flex-wrap gap-4 p-6">
              <Button asChild variant="outline"><Link href="/dashboard/owner/properties">View all properties</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/owner/requests">Review requests</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/owner/contracts">Open contracts</Link></Button>
              <Button asChild variant="outline"><Link href="/dashboard/owner/furniture">Manage furniture</Link></Button>
            </CardContent>
          </Card>
          <OwnerPropertiesGrid
            properties={properties.slice(0, 3)}
            onManageFurniture={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </div>
      )}
    </div>
  )
}

