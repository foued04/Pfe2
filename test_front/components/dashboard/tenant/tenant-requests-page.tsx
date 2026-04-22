import { PageHeader } from "@/components/dashboard/shared/page-header"
import { TenantRequestsModule } from "@/components/tenant-requests-module"

export function TenantRequestsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Tenant" title="My Requests" description="Consultez le suivi de vos demandes de location." />
      <TenantRequestsModule />
    </div>
  )
}

