import { RoleGuard } from "@/components/auth/role-guard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminVerificationsRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminDashboard initialSection="verifications" standaloneLayout={false} />
    </RoleGuard>
  )
}
