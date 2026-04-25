"use client"

import { useState } from "react"
import { ArrowLeft, Home, KeyRound } from "lucide-react"
import type { Property } from "@/lib/property-data"
import { useTenantHomes } from "@/hooks/api/use-tenant-homes"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { PropertyCard } from "@/components/property/property-card"
import { PropertyDetailPage } from "@/components/property/property-detail-page"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function TenantMyHomePage() {
  const { homes, isLoading, error } = useTenantHomes()
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  if (selectedProperty) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedProperty(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to my home
        </Button>
        <PropertyDetailPage propertyId={selectedProperty.id} />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Locataire"
        title="My home"
        description="Retrouvez ici le logement que vous louez apres la signature du contrat."
      />

      {isLoading ? (
        <Card><CardContent className="p-8 text-sm text-muted-foreground">Chargement de votre logement...</CardContent></Card>
      ) : error ? (
        <Card><CardContent className="p-8 text-sm text-destructive">{error}</CardContent></Card>
      ) : homes.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {homes.map((property) => (
            <PropertyCard key={property.id} property={property} onSelect={setSelectedProperty} />
          ))}
        </div>
      ) : (
        <Card className="rounded-3xl">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-12 text-center">
            <div className="rounded-full bg-primary/10 p-5 text-primary">
              <KeyRound className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Aucun logement loué pour le moment</h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                Quand votre contrat sera signé et renvoyé au propriétaire, votre logement apparaîtra ici.
              </p>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a href="/dashboard/tenant">
                <Home className="h-4 w-4" />
                Voir les logements disponibles
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
