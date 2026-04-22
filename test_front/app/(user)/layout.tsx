import type { ReactNode } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { UserAccountShell } from "@/components/shared/user-account-shell"

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <UserAccountShell>{children}</UserAccountShell>
    </AuthGuard>
  )
}
