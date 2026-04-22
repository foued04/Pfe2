import { PageHeader } from "@/components/dashboard/shared/page-header"
import { FurnitureOrderModule } from "@/components/furniture-order-module"

export function TenantFurniturePage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Tenant" title="Furniture" description="Consultez le catalogue, gerez votre panier et suivez vos commandes de mobilier." />
      <FurnitureOrderModule />
    </div>
  )
}
