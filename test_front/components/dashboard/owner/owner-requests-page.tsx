import { PageHeader } from "@/components/dashboard/shared/page-header"
import { RentalRequestsModule } from "@/components/rental-requests-module"

export function OwnerRequestsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Propriétaire" title="Gestion des Demandes" description="Consultez et gérez l&apos;ensemble de vos demandes (locations, mobilier, paiements) depuis une interface unifiée." />
      <RentalRequestsModule />
    </div>
  )
}

