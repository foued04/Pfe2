import { PageHeader } from "@/components/dashboard/shared/page-header"
import { TenantHousingNeedCard } from "@/components/dashboard/tenant/tenant-housing-need-card"

export function TenantHousingNeedsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Tenant"
        title="Besoin logement"
        description="Renseignez votre besoin en logement et recevez une notification des qu un bien correspondant devient disponible."
      />
      <TenantHousingNeedCard defaultOpen hideToggleButton />
    </div>
  )
}
