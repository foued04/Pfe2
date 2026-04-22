import { PageHeader } from "@/components/dashboard/shared/page-header"
import { TenantNotificationsModule } from "@/components/tenant-notifications-module"

export function TenantNotificationsPage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Tenant" title="Notifications" description="Toutes vos alertes et mises a jour en un seul endroit." />
      <TenantNotificationsModule />
    </div>
  )
}

