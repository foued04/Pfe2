"use client"

import { useI18n } from "@/lib/i18n"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { RentalRequestsModule } from "@/components/rental-requests-module"

export function OwnerRequestsPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={t("role.owner")} title={t("nav.requests")} description="Consultez et gérez l&apos;ensemble de vos demandes (locations, mobilier, paiements) depuis une interface unifiée." />
      <RentalRequestsModule />
    </div>
  )
}

