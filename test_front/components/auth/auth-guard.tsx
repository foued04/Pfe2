"use client"

import type { ReactNode } from "react"
import { useRequireAuth } from "@/hooks/use-require-auth"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useRequireAuth()

  if (isLoading) {
    return <div className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">Chargement...</div>
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}

