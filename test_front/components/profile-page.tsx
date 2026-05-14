"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { AdminDashboard } from "@/components/admin-dashboard"

export function ProfilePage() {
  const { role } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (role === "owner") {
      router.replace("/dashboard/owner/profile")
    }
    if (role === "tenant") {
      router.replace("/dashboard/tenant/profile")
    }
  }, [role, router])

  switch (role) {
    case "admin":
      return <AdminDashboard initialSection="profil" />
    case "owner":
      return <div className="p-6 text-sm text-muted-foreground">Redirection vers votre profil locateur...</div>
    case "tenant":
      return <div className="p-6 text-sm text-muted-foreground">Redirection vers votre profil locataire...</div>
    default:
      return null
  }
}
