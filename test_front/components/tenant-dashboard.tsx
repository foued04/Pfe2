"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

const TENANT_SECTION_ROUTES: Record<string, string> = {
  search: "/dashboard/tenant",
  overview: "/dashboard/tenant",
  map: "/dashboard/tenant/map",
  favorites: "/dashboard/tenant/favorites",
  myRequests: "/dashboard/tenant/requests",
  requests: "/dashboard/tenant/requests",
  furniture: "/dashboard/tenant/furniture",
  maintenance: "/dashboard/tenant/reclamations",
  reclamations: "/dashboard/tenant/reclamations",
  housingNeeds: "/dashboard/tenant/housing-needs",
  notifications: "/dashboard/tenant/notifications",
  profile: "/dashboard/tenant/profile",
  settings: "/dashboard/tenant/settings",
  myHome: "/dashboard/tenant/my-home",
}

export function TenantDashboard({ initialSection = "search" }: { initialSection?: string }) {
  const router = useRouter()

  const targetPath = useMemo(() => {
    return TENANT_SECTION_ROUTES[initialSection] || TENANT_SECTION_ROUTES.search
  }, [initialSection])

  useEffect(() => {
    router.replace(targetPath)
  }, [router, targetPath])

  return <div className="p-6 text-sm text-muted-foreground">Redirection vers le tableau de bord locataire...</div>
}
