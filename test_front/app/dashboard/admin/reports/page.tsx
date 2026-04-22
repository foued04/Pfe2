import { RoleGuard } from "@/components/auth/role-guard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminReportsRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminDashboard initialSection="reports" standaloneLayout={false} />
    </RoleGuard>
  )
}
