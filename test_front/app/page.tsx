"use client"

import { useState } from "react"
import { I18nProvider } from "@/lib/i18n"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AuthForms } from "@/components/auth-forms"
import { AdminDashboard } from "@/components/admin-dashboard"
import { OwnerDashboard } from "@/components/owner-dashboard"
import { TenantDashboard } from "@/components/tenant-dashboard"
import { HomePage } from "@/components/home-page"

function AppRouter() {
  const { isAuthenticated, role } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

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
        return <AuthForms />
    }
  }

  // Show auth forms when user clicks login/register
  if (showAuth) {
    return <AuthForms />
  }

  // Default: show public homepage
  return (
    <HomePage
      onLogin={() => setShowAuth(true)}
      onRegister={() => setShowAuth(true)}
    />
  )
}

export default function ImmoSmartApp() {
  return (
    <AuthProvider>
      <I18nProvider>
        <AppRouter />
      </I18nProvider>
    </AuthProvider>
  )
}
