"use client"

import { useAuth } from "@/lib/auth-context"
import { AdminDashboard } from "@/components/admin-dashboard"
import { OwnerDashboard } from "@/components/owner-dashboard"
import { TenantDashboard } from "@/components/tenant-dashboard"

export function ProfilePage() {
  const { role } = useAuth()

  switch (role) {
    case "admin":
      return <AdminDashboard initialSection="profil" />
    case "owner":
      return <OwnerDashboard initialSection="profile" />
    case "tenant":
      return <TenantDashboard initialSection="profile" />
    default:
      return null
  }
}
