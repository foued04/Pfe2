"use client"

import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Plus,
  FileText,
  MessageSquare,
  User,
  ChevronLeft,
  ChevronRight,
  Home,
  Sofa,
  Bell,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { key: "nav.overview", icon: LayoutDashboard, href: "#" },
  { key: "nav.myProperties", icon: Building2, href: "#" },
  { key: "nav.addProperty", icon: Plus, href: "#" },
  { key: "nav.requests", icon: FileText, href: "#", badge: 5 },
  { key: "nav.notifications", icon: Bell, href: "#", badge: 3 },
  { key: "nav.furniture", icon: Sofa, href: "#" },
  { key: "nav.profile", icon: User, href: "#" },
]

export function OwnerSidebar() {
  const { t } = useI18n()
  const [collapsed, setCollapsed] = useState(false)
  const [active, setActive] = useState("nav.overview")

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-sm">
          <Home className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold tracking-tight">ImmoSmart</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active === item.key
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-orange-900/20"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0 transition-colors",
                active === item.key ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/60"
              )}
            />
            {!collapsed && (
              <span className="truncate">{t(item.key)}</span>
            )}
            {!collapsed && item.badge && (
              <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="m-3 flex items-center justify-center rounded-lg border border-sidebar-border py-2 text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </aside>
  )
}
