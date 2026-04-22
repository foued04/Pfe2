"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function DashboardIndexRoute() {
  const { role, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || !role) return
    router.replace(`/dashboard/${role}`)
  }, [isLoading, role, router])

  return <div className="text-sm text-muted-foreground">Redirection vers votre espace...</div>
}

