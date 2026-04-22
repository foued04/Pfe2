import { RoleGuard } from "@/components/auth/role-guard"
import { UserSettingsPage } from "@/components/shared/user-settings-page"

export default function AdminSettingsRoute() {
  return (
    <RoleGuard roles={["admin"]}>
      <UserSettingsPage />
    </RoleGuard>
  )
}
