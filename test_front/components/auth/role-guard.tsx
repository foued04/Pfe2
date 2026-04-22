"use client"

import type { ReactNode } from "react"
import { type UserRole } from "@/lib/auth-context"
import { useRequireRole } from "@/hooks/use-require-role"

export function RoleGuard({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const { isLoading, hasRole } = useRequireRole(roles)

  if (isLoading) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Chargement...</div>
  }

  if (!hasRole) return null

  return <>{children}</>
}

