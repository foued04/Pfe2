import { PageHeader } from "@/components/dashboard/shared/page-header"
import { RentalRequestsModule } from "@/components/rental-requests-module"

export function OwnerRequestsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Owner" title="Rental Requests" description="Consultez et traitez les demandes de location depuis une route dediee." />
      <RentalRequestsModule />
    </div>
  )
}

