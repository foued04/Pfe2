import { PageHeader } from "@/components/dashboard/shared/page-header"
import { RentalRequestsModule } from "@/components/rental-requests-module"

export function OwnerContractsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Owner" title="Contracts" description="Les contrats generes et signes sont centralises ici, via le meme module metier que les demandes." />
      <RentalRequestsModule />
    </div>
  )
}

