"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function SettingsRoute() {
  const router = useRouter()
  const { isLoading, role } = useAuth()

  useEffect(() => {
    if (isLoading || !role) return

    if (role === "owner") {
      router.replace("/dashboard/owner/settings")
      return
    }

    if (role === "tenant") {
      router.replace("/dashboard/tenant/settings")
      return
    }

    router.replace("/dashboard/admin/settings")
  }, [isLoading, role, router])

  return <div className="py-12 text-sm text-slate-500">Loading settings...</div>
}
