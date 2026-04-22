import { RoleGuard } from "@/components/auth/role-guard"
import { TenantNotificationsPage } from "@/components/dashboard/tenant/tenant-notifications-page"

export default function TenantNotificationsRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantNotificationsPage />
    </RoleGuard>
  )
}

