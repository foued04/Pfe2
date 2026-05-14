"use client"

import Link from "next/link"
import { Bell, Menu, FileText } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { ProfileDropdown } from "@/components/shared/profile-dropdown"
import type { UserRole } from "@/lib/auth-context"

export function DashboardTopbar({
  title,
  onOpenMobileMenu,
  pendingRequests = 0,
  unreadNotifications = 0,
  role,
  eyebrow,
}: {
  title: string
  onOpenMobileMenu: () => void
  pendingRequests?: number
  unreadNotifications?: number
  role: UserRole | null
  eyebrow?: string
}) {
  const { lang, t } = useI18n()

  return (
    <div className="sticky top-0 z-30 flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-border bg-background/95 px-3 py-3 backdrop-blur sm:px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="outline" size="icon" className="rounded-full md:hidden" onClick={onOpenMobileMenu}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          {eyebrow && (
            <div className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">
              {eyebrow}
            </div>
          )}
          <div className="truncate text-base font-bold text-foreground sm:text-lg">{title}</div>
        </div>
      </div>
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:gap-3">
        {pendingRequests > 0 && (
          <Button
            asChild
            variant="outline"
            className="relative h-10 rounded-full px-3 text-sm font-semibold sm:h-11 sm:px-4"
            title={`${pendingRequests} ${t("dashboard.pendingRequests")}`}
          >
            <Link href={role === "owner" ? "/dashboard/owner/requests" : "/dashboard/tenant/requests"}>
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("sidebar.requests")}</span>
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white shadow-md ring-2 ring-background">
                {pendingRequests > 99 ? "99+" : pendingRequests}
              </span>
            </Link>
          </Button>
        )}
        {unreadNotifications > 0 && (
          <Button
            asChild
            variant="outline"
            className="relative h-10 rounded-full px-3 text-sm font-semibold sm:h-11 sm:px-4"
            title={`${unreadNotifications} ${t("notifications")}`}
          >
            <Link href={
              role === "admin" 
                ? "/dashboard/admin/notifications" 
                : role === "owner" 
                  ? "/dashboard/owner/notifications" 
                  : "/dashboard/tenant/notifications"
            }>
              <Bell className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{t("notifications")}</span>
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-md ring-2 ring-background">
                {unreadNotifications > 99 ? "99+" : unreadNotifications}
              </span>
            </Link>
          </Button>
        )}
        <ProfileDropdown />
      </div>
    </div>
  )
}
