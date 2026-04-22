import { RoleGuard } from "@/components/auth/role-guard"
import { AdminOverviewPage } from "@/components/dashboard/admin/admin-overview-page"

export default function AdminDashboardRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminOverviewPage />
    </RoleGuard>
  )
}

