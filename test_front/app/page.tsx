"use client"

import { useState, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthForms } from "@/components/auth-forms"
import { AdminDashboard } from "@/components/admin-dashboard"
import { OwnerDashboard } from "@/components/owner-dashboard"
import { TenantDashboard } from "@/components/tenant-dashboard"
import { HomePage } from "@/components/home-page"

function AppRouter() {
  const { isAuthenticated, role } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authView, setAuthView] = useState<"login" | "register">("login")

  // If authenticated, route to dashboard
  if (isAuthenticated) {
    switch (role) {
      case "admin":
        return <AdminDashboard />
      case "owner":
        return <OwnerDashboard />
      case "tenant":
        return <TenantDashboard />
      default:
        return <AuthForms initialView={authView} />
    }
  }

  // Show auth forms when user clicks login/register
  if (showAuth) {
    return <AuthForms initialView={authView} />
  }

  // Default: show public homepage
  return (
    <HomePage
      onLogin={() => { 
        setAuthView("login"); 
        setShowAuth(true); 
      }}
      onRegister={() => { 
        setAuthView("register"); 
        setShowAuth(true); 
      }}
    />
  )
}

export default function ImmoSmartApp() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AppRouter />
    </Suspense>
  )
}
