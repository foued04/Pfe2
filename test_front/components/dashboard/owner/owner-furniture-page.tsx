"use client"

import { useI18n } from "@/lib/i18n"
import { PageHeader } from "@/components/dashboard/shared/page-header"
import { FurnitureOrderModule } from "@/components/furniture-order-module"

export function OwnerFurniturePage() {
  const { t } = useI18n()
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={t("role.owner")} title={t("nav.furniture")} description="Gerez le mobilier, les equipements et les besoins d'ameublement par bien." />
      <FurnitureOrderModule />
    </div>
  )
}

