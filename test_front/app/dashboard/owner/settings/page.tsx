import { RoleGuard } from "@/components/auth/role-guard"
import { UserSettingsPage } from "@/components/shared/user-settings-page"

export default function OwnerSettingsRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <UserSettingsPage />
    </RoleGuard>
  )
}
