"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthForms } from "@/components/auth-forms"
import { useAuth } from "@/lib/auth-context"

export function RegisterPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    router.replace("/dashboard")
  }, [isAuthenticated, isLoading, router])

  return <AuthForms initialView="register" />
}

