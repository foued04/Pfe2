import { RoleGuard } from "@/components/auth/role-guard"
import { TenantMapPage } from "@/components/dashboard/tenant/tenant-map-page"

export default function TenantMapRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantMapPage />
    </RoleGuard>
  )
}
