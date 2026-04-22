import { RoleGuard } from "@/components/auth/role-guard"
import { TenantOverviewPage } from "@/components/dashboard/tenant/tenant-overview-page"

export default function TenantDashboardRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantOverviewPage />
    </RoleGuard>
  )
}

