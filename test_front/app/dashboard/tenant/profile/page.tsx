import { RoleGuard } from "@/components/auth/role-guard"
import { TenantProfileSettings } from "@/components/tenant-profile-settings"

export default function TenantProfileRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantProfileSettings />
    </RoleGuard>
  )
}
