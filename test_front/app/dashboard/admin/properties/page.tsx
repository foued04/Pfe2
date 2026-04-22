import { RoleGuard } from "@/components/auth/role-guard"
import { AdminPropertiesPage } from "@/components/dashboard/admin/admin-properties-page"

export default function AdminPropertiesRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminPropertiesPage />
    </RoleGuard>
  )
}
