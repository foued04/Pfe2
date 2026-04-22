import { PageHeader } from "@/components/dashboard/shared/page-header"
import { FurnitureOrderModule } from "@/components/furniture-order-module"

export function OwnerFurniturePage() {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Owner" title="Furniture Management" description="Gerez le mobilier, les equipements et les besoins d'ameublement par bien." />
      <FurnitureOrderModule />
    </div>
  )
}

