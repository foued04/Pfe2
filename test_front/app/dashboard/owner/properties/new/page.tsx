import { RoleGuard } from "@/components/auth/role-guard"
import { PropertyFormPage } from "@/components/property/property-form-page"

export default function OwnerPropertyFormRoute() {
  return (
    <RoleGuard roles={["owner"]}>
      <PropertyFormPage />
    </RoleGuard>
  )
}

