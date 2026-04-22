"use client"

import Link from "next/link"
import { Bell, FileText, Heart, Home, Map, ShoppingBag } from "lucide-react"
import { useProperties } from "@/hooks/api/use-properties"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { StatsGrid } from "@/components/dashboard/shared/stats-grid"
import { PropertyCard } from "@/components/property/property-card"
import { Card, CardContent } from "@/components/ui/card"

export function TenantOverviewPage() {
  const { properties, isLoading, error } = useProperties({ auth: true })

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Tenant" title="Tenant Dashboard" description="Accedez rapidement a vos demandes, favoris et notifications depuis un tableau de bord clair." />
      <StatsGrid
        stats={[
          { label: "Properties available", value: properties.length, icon: Home },
          { label: "Map", value: "-", icon: Map },
          { label: "Requests", value: "-", icon: FileText },
          { label: "Favorites", value: "-", icon: Heart },
          { label: "Furniture", value: "-", icon: ShoppingBag },
          { label: "Notifications", value: "-", icon: Bell },
        ]}
      />
      <Card className="rounded-3xl">
        <CardContent className="flex flex-wrap gap-3 p-6 text-sm">
          <Link href="/dashboard/tenant/map" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">Map</Link>
          <Link href="/dashboard/tenant/requests" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">My requests</Link>
          <Link href="/dashboard/tenant/favorites" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">My favorites</Link>
          <Link href="/dashboard/tenant/furniture" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">Furniture</Link>
          <Link href="/dashboard/tenant/notifications" className="rounded-full bg-muted px-4 py-2 font-medium hover:bg-primary/10 hover:text-primary">Notifications</Link>
        </CardContent>
      </Card>
      {isLoading ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground">Chargement des proprietes...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-8 text-sm text-destructive">{error}</CardContent></Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {properties.slice(0, 3).map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
