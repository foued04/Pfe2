"use client"

import { useMemo, useState, type ReactNode } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DashboardSidebar, getNavItems } from "@/components/dashboard/shared/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard/shared/dashboard-topbar"
import { useAuth } from "@/lib/auth-context"

export function DashboardShell({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeTitle = useMemo(() => {
    return getNavItems(role).find((item) => pathname === item.href)?.label || "Dashboard"
  }, [pathname, role])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:bg-sidebar">
        <DashboardSidebar role={role} />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0 text-white">
          <DashboardSidebar role={role} />
        </SheetContent>
      </Sheet>

      <div className="md:pl-72">
        <DashboardTopbar title={activeTitle} onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">{children}</main>
      </div>
    </div>
  )
}

