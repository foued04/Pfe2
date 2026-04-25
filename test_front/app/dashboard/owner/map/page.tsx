import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerMapPage } from "@/components/dashboard/owner/owner-map-page"

export default function OwnerMapRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerMapPage />
    </RoleGuard>
  )
}
