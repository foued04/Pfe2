import { RoleGuard } from "@/components/auth/role-guard"
import { OwnerFurniturePage } from "@/components/dashboard/owner/owner-furniture-page"

export default function OwnerFurnitureRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <OwnerFurniturePage />
    </RoleGuard>
  )
}

