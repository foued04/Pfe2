"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"
import type { Property } from "@/lib/property-data"
import { useProperties } from "@/hooks/api/use-properties"
import { useI18n } from "@/lib/i18n"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { PropertyMap } from "@/components/property-map"
import { Card, CardContent } from "@/components/ui/card"

export function OwnerMapPage() {
  const { t } = useI18n()
  const { properties, isLoading, error } = useProperties({ auth: true })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={t("role.owner")}
        title={t("nav.map")}
        description="Visualisez vos biens sur la carte et controlez rapidement leur localisation."
      />

      {isLoading ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-sm text-muted-foreground">Chargement de la carte...</CardContent>
        </Card>
      ) : error ? (
        <Card className="rounded-3xl">
          <CardContent className="p-8 text-sm text-destructive">{error}</CardContent>
        </Card>
      ) : (
        <>
          <PropertyMap
            properties={properties}
            selectedProperty={selectedProperty}
            onPropertySelect={setSelectedProperty}
            height="clamp(22rem, 60vh, 35rem)"
          />

          {selectedProperty && (
            <Card className="rounded-3xl">
              <CardContent className="flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Bien selectionne</div>
                  <h2 className="mt-2 text-2xl font-semibold text-foreground">{selectedProperty.title}</h2>
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{selectedProperty.address}, {selectedProperty.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Loyer</div>
                  <div className="mt-2 text-2xl font-semibold text-primary">
                    {selectedProperty.rent.toLocaleString("fr-TN")} TND
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
