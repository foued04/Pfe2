import { RoleGuard } from "@/components/auth/role-guard"
import { TenantHousingNeedsPage } from "@/components/dashboard/tenant/tenant-housing-needs-page"

export default function TenantHousingNeedsRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantHousingNeedsPage />
    </RoleGuard>
  )
}
