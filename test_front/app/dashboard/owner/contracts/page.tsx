import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerContractsPage } from "@/components/dashboard/owner/owner-contracts-page"

export default function OwnerContractsRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerContractsPage />
    </RoleGuard>
  )
}

