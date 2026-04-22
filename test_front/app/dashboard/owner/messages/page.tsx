import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerMessagesPage } from "@/components/dashboard/owner/owner-messages-page"

export default function OwnerMessagesRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerMessagesPage />
    </RoleGuard>
  )
}

