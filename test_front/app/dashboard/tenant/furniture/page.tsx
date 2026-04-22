import { RoleGuard } from "@/components/auth/role-guard"
import { TenantFurniturePage } from "@/components/dashboard/tenant/tenant-furniture-page"

export default function TenantFurnitureRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantFurniturePage />
    </RoleGuard>
  )
}
