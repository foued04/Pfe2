import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerOverviewPage } from "@/components/dashboard/owner/owner-overview-page"

export default function OwnerDashboardRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerOverviewPage />
    </RoleGuard>
  )
}

