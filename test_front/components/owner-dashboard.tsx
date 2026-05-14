"use client"

import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"

const OWNER_SECTION_ROUTES: Record<string, string> = {
  overview: "/dashboard/owner",
  properties: "/dashboard/owner/properties",
  addProperty: "/dashboard/owner/properties/new",
  editProperty: "/dashboard/owner/properties/new",
  map: "/dashboard/owner/map",
  requests: "/dashboard/owner/requests",
  notifications: "/dashboard/owner/notifications",
  furniture: "/dashboard/owner/furniture",
  profile: "/dashboard/owner/profile",
  settings: "/dashboard/owner/settings",
  contracts: "/dashboard/owner/contracts",
}

export function OwnerDashboard({ initialSection = "overview" }: { initialSection?: string }) {
  const router = useRouter()

  const targetPath = useMemo(() => {
    return OWNER_SECTION_ROUTES[initialSection] || OWNER_SECTION_ROUTES.overview
  }, [initialSection])

  useEffect(() => {
    router.replace(targetPath)
  }, [router, targetPath])

  return <div className="p-6 text-sm text-muted-foreground">Redirection vers le tableau de bord locateur...</div>
}
