"use client"

import { useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isLoading || isAuthenticated) return
    const query = searchParams?.toString()
    const redirect = query ? `${pathname}?${query}` : pathname
    router.replace(`/login?redirect=${encodeURIComponent(redirect)}`)
  }, [isAuthenticated, isLoading, pathname, router, searchParams])

  return { isAuthenticated, isLoading }
}

