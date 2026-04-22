import { RoleGuard } from "@/components/auth/role-guard"
import { TenantRequestsPage } from "@/components/dashboard/tenant/tenant-requests-page"

export default function TenantRequestsRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantRequestsPage />
    </RoleGuard>
  )
}

