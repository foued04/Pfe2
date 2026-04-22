"use client"

import { type ReactNode, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function AuthGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || isAuthenticated) return
    const query = searchParams?.toString()
    const redirect = query ? `${pathname}?${query}` : pathname
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
  }, [isAuthenticated, isLoading, pathname, router, searchParams])

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f8fafc", color: "#334155" }}>
        Chargement...
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <>{children}</>
}
