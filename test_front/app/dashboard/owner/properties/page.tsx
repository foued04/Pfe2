import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerPropertiesPage } from "@/components/dashboard/owner/owner-properties-page"

export default function OwnerPropertiesRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerPropertiesPage />
    </RoleGuard>
  )
}

