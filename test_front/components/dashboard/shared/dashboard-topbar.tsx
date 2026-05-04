"use client"

import Link from "next/link"
import { Bell, Menu } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { ProfileDropdown } from "@/components/shared/profile-dropdown"

export function DashboardTopbar({
  title,
  onOpenMobileMenu,
  pendingRequests = 0,
  unreadNotifications = 0,
  showOwnerNotifications = false,
  showTenantNotifications = false,
  eyebrow,
}: {
  title: string
  onOpenMobileMenu: () => void
  pendingRequests?: number
  unreadNotifications?: number
  showOwnerNotifications?: boolean
  showTenantNotifications?: boolean
  eyebrow?: string
}) {
  const { lang } = useI18n()

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
        {showOwnerNotifications && (
          <Button
            asChild
            variant="outline"
            className="relative h-10 rounded-full px-3 text-sm font-semibold sm:h-11 sm:px-4"
            title={
              pendingRequests > 0
                ? lang === "fr"
                  ? `${pendingRequests} demande(s) en attente`
                  : `${pendingRequests} pending request(s)`
                : lang === "fr"
                  ? "Aucune nouvelle demande"
                  : "No new requests"
            }
          >
            <Link href="/dashboard/owner/requests">
              <Bell className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{lang === "fr" ? "Demandes" : "Requests"}</span>
              {pendingRequests > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-md ring-2 ring-background">
                  {pendingRequests > 99 ? "99+" : pendingRequests}
                </span>
              )}
            </Link>
          </Button>
        )}
        {showTenantNotifications && (
          <Button
            asChild
            variant="outline"
            className="relative h-11 rounded-full px-4 text-sm font-semibold"
            title={
              unreadNotifications > 0
                ? lang === "fr"
                  ? `${unreadNotifications} notification(s) non lue(s)`
                  : `${unreadNotifications} unread notification(s)`
                : lang === "fr"
                  ? "Aucune nouvelle notification"
                  : "No new notifications"
            }
          >
            <Link href="/dashboard/tenant/notifications">
              <Bell className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{lang === "fr" ? "Notifications" : "Notifications"}</span>
              {unreadNotifications > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-xs font-bold text-white shadow-md ring-2 ring-background">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
            </Link>
          </Button>
        )}
        <ProfileDropdown />
      </div>
    </div>
  )
}
