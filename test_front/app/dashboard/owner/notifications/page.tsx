import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerNotificationsPage } from "@/components/dashboard/owner/owner-notifications-page"

export default function OwnerNotificationsRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerNotificationsPage />
    </RoleGuard>
  )
}
