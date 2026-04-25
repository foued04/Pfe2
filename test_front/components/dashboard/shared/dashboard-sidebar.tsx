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
} from "lucide-react"

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> }

const ownerItems: NavItem[] = [
  { href: "/dashboard/owner", label: "Dashboard", icon: Home },
  { href: "/dashboard/owner/properties", label: "My Properties", icon: Building2 },
  { href: "/dashboard/owner/properties/new", label: "Add Property", icon: Plus },
  { href: "/dashboard/owner/map", label: "Map", icon: Map },
  { href: "/dashboard/owner/requests", label: "Requests", icon: FileText },
  { href: "/dashboard/owner/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/owner/furniture", label: "Furniture", icon: ShoppingBag },
]

const tenantItems: NavItem[] = [
  { href: "/dashboard/tenant", label: "Dashboard", icon: Home },
  { href: "/dashboard/tenant/my-home", label: "My Home", icon: KeyRound },
  { href: "/dashboard/tenant/map", label: "Map", icon: Map },
  { href: "/dashboard/tenant/requests", label: "Requests", icon: FileText },
  { href: "/dashboard/tenant/reclamations", label: "Reclamation", icon: Megaphone },
  { href: "/dashboard/tenant/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard/tenant/furniture", label: "Furniture", icon: ShoppingBag },
  { href: "/dashboard/tenant/notifications", label: "Notifications", icon: Bell },
]

const adminItems: NavItem[] = [
  { href: "/dashboard/admin", label: "Dashboard", icon: Home },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/properties", label: "Properties", icon: Shield },
  { href: "/dashboard/admin/furniture", label: "Furniture", icon: Sofa },
  { href: "/dashboard/admin/map", label: "Map", icon: Map },
  { href: "/dashboard/admin/verifications", label: "Verifications", icon: ShieldCheck },
  { href: "/dashboard/admin/reports", label: "Reports", icon: TrendingUp },
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
}: {
  role: UserRole | null
  pendingRequests?: number
  unreadNotifications?: number
}) {
  const pathname = usePathname()
  const { lang } = useI18n()
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
              <span className="flex-1">
                {item.label === "Dashboard" ? (lang === "fr" ? "Tableau de bord" : "Dashboard") :
                 item.label === "My Properties" ? (lang === "fr" ? "Mes proprietes" : "My Properties") :
                 item.label === "Add Property" ? (lang === "fr" ? "Ajouter un bien" : "Add Property") :
                 item.label === "Map" ? (lang === "fr" ? "Carte" : "Map") :
                 item.label === "Requests" ? (lang === "fr" ? "Demandes" : "Requests") :
                 item.label === "Notifications" ? (lang === "fr" ? "Notifications" : "Notifications") :
                 item.label === "Furniture" ? (lang === "fr" ? "Mobilier" : "Furniture") :
                 item.label === "My Home" ? (lang === "fr" ? "Mon logement" : "My Home") :
                 item.label === "Reclamation" ? (lang === "fr" ? "Reclamation" : "Reclamation") :
                 item.label === "Favorites" ? (lang === "fr" ? "Favoris" : "Favorites") :
                 item.label === "Users" ? (lang === "fr" ? "Utilisateurs" : "Users") :
                 item.label === "Properties" ? (lang === "fr" ? "Proprietes" : "Properties") :
                 item.label === "Verifications" ? (lang === "fr" ? "Verifications" : "Verifications") :
                 item.label === "Reports" ? (lang === "fr" ? "Rapports" : "Reports") :
                 item.label}
              </span>
              {role === "owner" && item.href === "/dashboard/owner/requests" && pendingRequests > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  {pendingRequests > 99 ? "99+" : pendingRequests}
                </span>
              )}
              {role === "tenant" && item.href === "/dashboard/tenant/notifications" && unreadNotifications > 0 && (
                <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white shadow-sm">
                  {unreadNotifications > 99 ? "99+" : unreadNotifications}
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
          {lang === "fr" ? "Parametres" : "Settings"}
        </Link>
      </div>
    </div>
  )
}
