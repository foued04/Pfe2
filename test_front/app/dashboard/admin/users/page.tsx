import { RoleGuard } from "@/components/auth/role-guard"
import { AdminUsersPage } from "@/components/dashboard/admin/admin-users-page"

export default function AdminUsersRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminUsersPage />
    </RoleGuard>
  )
}

