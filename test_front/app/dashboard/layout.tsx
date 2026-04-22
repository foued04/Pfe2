import type { ReactNode } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { DashboardShell } from "@/components/dashboard/shared/dashboard-shell"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  )
}

