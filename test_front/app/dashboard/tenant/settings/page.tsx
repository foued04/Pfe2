import { RoleGuard } from "@/components/auth/role-guard"
import { UserSettingsPage } from "@/components/shared/user-settings-page"

export default function TenantSettingsRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <UserSettingsPage />
    </RoleGuard>
  )
}
