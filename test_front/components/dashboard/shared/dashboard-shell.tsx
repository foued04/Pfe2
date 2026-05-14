"use client"

import { useMemo, useState, type ReactNode } from "react"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DashboardSidebar, getNavItems } from "@/components/dashboard/shared/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard/shared/dashboard-topbar"
import { useAuth } from "@/lib/auth-context"
import { apiFetch } from "@/lib/api/client"
import { useI18n } from "@/lib/i18n"

export function DashboardShell({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const { lang, t } = useI18n()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pendingRequests, setPendingRequests] = useState(0)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  const activeTitle = useMemo(() => {
    const item = getNavItems(role).find((item) => pathname === item.href)
    return item ? t(item.tKey) : t("sidebar.dashboard")
  }, [pathname, role, t])

  const isOverview = useMemo(() => {
    return ["/dashboard/owner", "/dashboard/tenant", "/dashboard/admin"].includes(pathname)
  }, [pathname])

  useEffect(() => {
    if (!role) return

    let active = true

    const fetchUnreadNotifications = () => {
      apiFetch<{ count: number }>("/notifications/unread-count", { auth: true })
        .then((data) => {
          if (active) setUnreadNotifications(Number(data?.count || 0))
        })
        .catch(() => {
          if (active) setUnreadNotifications(0)
        })
    }

    const fetchPendingRequests = () => {
      // Pending requests are primarily for owners (rental requests)
      if (role !== "owner") {
        setPendingRequests(0)
        return
      }
      
      apiFetch<any[]>("/rental-requests", { auth: true })
        .then((requests) => {
          if (!active) return
          const pending = (Array.isArray(requests) ? requests : []).filter((request) => request.status === "En attente").length
          setPendingRequests(pending)
        })
        .catch(() => {
          if (active) setPendingRequests(0)
        })
    }

    const fetchUnreadMessages = () => {
      apiFetch<{ count: number }>("/messages/unread-count", { auth: true })
        .then((data) => {
          if (active) setUnreadMessages(Number(data?.count || 0))
        })
        .catch(() => {
          if (active) setUnreadMessages(0)
        })
    }

    const handleRefresh = () => {
      fetchUnreadNotifications()
      fetchPendingRequests()
      fetchUnreadMessages()
    }

    handleRefresh()
    
    const interval = window.setInterval(handleRefresh, 30000)
    window.addEventListener("refresh-dashboard-counts", handleRefresh)

    return () => {
      active = false
      window.clearInterval(interval)
      window.removeEventListener("refresh-dashboard-counts", handleRefresh)
    }
  }, [role])

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-72 md:flex-col md:bg-sidebar">
        <DashboardSidebar 
          role={role} 
          pendingRequests={pendingRequests} 
          unreadNotifications={unreadNotifications} 
          unreadMessages={unreadMessages}
        />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(20rem,calc(100vw-1rem))] border-0 bg-sidebar p-0 text-white">
          <DashboardSidebar 
            role={role} 
            pendingRequests={pendingRequests} 
            unreadNotifications={unreadNotifications} 
            unreadMessages={unreadMessages}
          />
        </SheetContent>
      </Sheet>

      <div className="md:pl-72">
        <DashboardTopbar
          title={activeTitle}
          eyebrow={isOverview ? t("sidebar.dashboard") : undefined}
          onOpenMobileMenu={() => setMobileOpen(true)}
          pendingRequests={pendingRequests}
          unreadNotifications={unreadNotifications}
          role={role}
        />
        <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-6 md:px-6 md:py-8">{children}</main>
      </div>
    </div>
  )
}
