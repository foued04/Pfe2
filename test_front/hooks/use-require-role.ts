"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { useRequireAuth } from "@/hooks/use-require-auth"

export function useRequireRole(allowedRoles: UserRole[]) {
  const { role } = useAuth()
  const { isAuthenticated, isLoading } = useRequireAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || !isAuthenticated || !role) return
    if (!allowedRoles.includes(role)) {
      router.replace(`/dashboard/${role}`)
    }
  }, [allowedRoles, isAuthenticated, isLoading, role, router])

  return { isAuthenticated, isLoading, role, hasRole: !!role && allowedRoles.includes(role) }
}

