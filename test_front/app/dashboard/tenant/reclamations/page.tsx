import { RoleGuard } from "@/components/auth/role-guard"
import { TenantReclamationsPage } from "@/components/dashboard/tenant/tenant-reclamations-page"

export default function TenantReclamationsRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantReclamationsPage />
    </RoleGuard>
  )
}
