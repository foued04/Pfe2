import { RoleGuard } from "@/components/auth/role-guard"
import { AdminProfile } from "@/components/admin-profile"

export default function AdminProfileRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <AdminProfile />
    </RoleGuard>
  )
}
