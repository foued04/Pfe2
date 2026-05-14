"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ComponentType } from "react"
import type { UserRole } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { AppLogo } from "@/components/shared/app-logo"
import { cn } from "@/lib/utils"
import {
  Bell,
  Building2,
  FileText,
  Home,
  KeyRound,
  Megaphone,
  Map,
  Plus,
  Sofa,
  Settings,
  ShoppingBag,
  Shield,
  ShieldCheck,
  TrendingUp,
  Users,
  Heart,
  HousePlus,
  CreditCard,
  MessageSquare,
} from "lucide-react"

type NavItem = { href: string; tKey: string; icon: ComponentType<{ className?: string }> }

const ownerItems: NavItem[] = [
  { href: "/dashboard/owner", tKey: "sidebar.dashboard", icon: Home },
  { href: "/dashboard/owner/properties", tKey: "sidebar.allProperties", icon: Building2 },
  { href: "/dashboard/owner/properties/new", tKey: "sidebar.addProperty", icon: Plus },
  { href: "/dashboard/owner/map", tKey: "sidebar.map", icon: Map },
  { href: "/dashboard/owner/requests", tKey: "sidebar.requests", icon: FileText },
  { href: "/dashboard/owner/messages", tKey: "sidebar.messages", icon: MessageSquare },
  { href: "/dashboard/owner/notifications", tKey: "sidebar.notifications", icon: Bell },
  { href: "/dashboard/owner/furniture", tKey: "sidebar.furniture", icon: ShoppingBag },
]

const tenantItems: NavItem[] = [
  { href: "/dashboard/tenant", tKey: "sidebar.dashboard", icon: Home },
  { href: "/dashboard/tenant/my-home", tKey: "sidebar.myHome", icon: KeyRound },
  { href: "/dashboard/tenant/map", tKey: "sidebar.map", icon: Map },
  { href: "/dashboard/tenant/requests", tKey: "sidebar.requests", icon: FileText },
  { href: "/dashboard/tenant/reclamations", tKey: "sidebar.reclamation", icon: Megaphone },
  { href: "/dashboard/tenant/favorites", tKey: "sidebar.favorites", icon: Heart },
  { href: "/dashboard/tenant/messages", tKey: "sidebar.messages", icon: MessageSquare },
  { href: "/dashboard/tenant/housing-needs", tKey: "sidebar.housingNeeds", icon: HousePlus },
  { href: "/dashboard/tenant/furniture", tKey: "sidebar.furniture", icon: ShoppingBag },
  { href: "/dashboard/tenant/notifications", tKey: "sidebar.notifications", icon: Bell },
]

const adminItems: NavItem[] = [
  { href: "/dashboard/admin", tKey: "sidebar.dashboard", icon: Home },
  { href: "/dashboard/admin/users", tKey: "sidebar.users", icon: Users },
  { href: "/dashboard/admin/properties", tKey: "sidebar.properties", icon: Shield },
  { href: "/dashboard/admin/furniture", tKey: "sidebar.furniture", icon: Sofa },
  { href: "/dashboard/admin/map", tKey: "sidebar.map", icon: Map },
  { href: "/dashboard/admin/verifications", tKey: "sidebar.verifications", icon: ShieldCheck },
  { href: "/dashboard/admin/housing-needs", tKey: "sidebar.housingNeeds", icon: HousePlus },
  { href: "/dashboard/admin/reports", tKey: "sidebar.reports", icon: TrendingUp },
]

export function getNavItems(role: UserRole | null): NavItem[] {
  switch (role) {
    case "owner":
      return ownerItems
    case "tenant":
      return tenantItems
    case "admin":
      return adminItems
    default:
      return []
  }
}

export function DashboardSidebar({
  role,
  pendingRequests = 0,
  unreadNotifications = 0,
  unreadMessages = 0,
}: {
  role: UserRole | null
  pendingRequests?: number
  unreadNotifications?: number
  unreadMessages?: number
}) {
  const pathname = usePathname()
  const { t } = useI18n()
  const items = getNavItems(role)
  const settingsHref =
    role === "owner"
      ? "/dashboard/owner/settings"
      : role === "tenant"
        ? "/dashboard/tenant/settings"
        : role === "admin"
          ? "/dashboard/admin/settings"
          : "/settings"

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <AppLogo />
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{t(item.tKey)}</span>
              {/* Dynamic Badges */}
              {item.href.includes("requests") && pendingRequests > 0 && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {pendingRequests > 99 ? "99+" : pendingRequests}
                </span>
              )}
              {item.href.includes("notifications") && unreadNotifications > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
                </span>
              )}
              {item.href.includes("messages") && unreadMessages > 0 && (
                <span className="rounded-full bg-blue-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {unreadMessages > 99 ? "99+" : unreadMessages}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link
          href={settingsHref}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
            pathname === settingsHref
              ? "bg-white/15 text-white"
              : "text-white/75 hover:bg-white/10 hover:text-white",
          )}
        >
          <Settings className="h-4 w-4" />
          {t("sidebar.settings")}
        </Link>
      </div>
    </div>
  )
}
