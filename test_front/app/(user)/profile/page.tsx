"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function ProfileRoute() {
  const router = useRouter()
  const { isLoading, role } = useAuth()

  useEffect(() => {
    if (isLoading || !role) return

    if (role === "owner") {
      router.replace("/dashboard/owner/profile")
      return
    }

    if (role === "tenant") {
      router.replace("/dashboard/tenant/profile")
      return
    }

    router.replace("/dashboard/admin/profile")
  }, [isLoading, role, router])

  return <div className="py-12 text-sm text-slate-500">Loading profile...</div>
}
