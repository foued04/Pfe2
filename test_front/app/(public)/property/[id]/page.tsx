import { PropertyDetailPage } from "@/components/property/property-detail-page"

export default async function PropertyDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <PropertyDetailPage propertyId={id} />
}

