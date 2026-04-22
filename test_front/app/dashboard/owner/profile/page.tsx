import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerProfile } from "@/components/owner-profile"

export default function OwnerProfileRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerProfile />
    </RoleGuard>
  )
}
