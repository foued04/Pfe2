import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerRequestsPage } from "@/components/dashboard/owner/owner-requests-page"

export default function OwnerRequestsRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerRequestsPage />
    </RoleGuard>
  )
}

