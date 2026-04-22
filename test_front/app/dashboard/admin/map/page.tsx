import { RoleGuard } from "@/components/auth/role-guard"
import { AdminDashboard } from "@/components/admin-dashboard"

export default function AdminMapRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminDashboard initialSection="map" standaloneLayout={false} />
    </RoleGuard>
  )
}
