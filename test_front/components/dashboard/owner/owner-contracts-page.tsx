"use client"

import { useI18n } from "@/lib/i18n"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { RentalRequestsModule } from "@/components/rental-requests-module"

export function OwnerContractsPage() {
  const { t } = useI18n()
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={t("role.owner")} title="Contracts" description="Les contrats generes et signes sont centralises ici, via le meme module metier que les demandes." />
      <RentalRequestsModule />
    </div>
  )
}

