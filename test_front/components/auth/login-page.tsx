"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AuthForms } from "@/components/auth-forms"
import { useAuth } from "@/lib/auth-context"

export function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    router.replace(searchParams.get("redirect") || "/dashboard")
  }, [isAuthenticated, isLoading, router, searchParams])

  return <AuthForms initialView="login" />
}

