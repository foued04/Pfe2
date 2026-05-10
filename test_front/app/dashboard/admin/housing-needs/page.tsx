import { RoleGuard } from "@/components/auth/role-guard"
import { AdminHousingNeedsPage } from "@/components/dashboard/admin/admin-housing-needs-page"

export default function AdminHousingNeedsRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminHousingNeedsPage />
    </RoleGuard>
  )
}
