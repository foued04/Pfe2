import { RoleGuard } from "@/components/auth/role-guard"
import { TenantFavoritesPage } from "@/components/dashboard/tenant/tenant-favorites-page"

export default function TenantFavoritesRoute() {
  return (
    <RoleGuard roles={["tenant"]}>
      <TenantFavoritesPage />
    </RoleGuard>
  )
}

