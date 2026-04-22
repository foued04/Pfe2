import { RoleGuard } from "@/components/auth/role-guard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminFurnitureRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminDashboard initialSection="furniture" standaloneLayout={false} />
    </RoleGuard>
  )
}
