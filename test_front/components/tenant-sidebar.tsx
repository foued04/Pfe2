"use client"

import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import {
  Search,
  Heart,
  FileText,
  ClipboardList,
  User,
  MessageSquare,
  Home,
  Map,
  LogOut,
} from "lucide-react"

const navItems = [
  { key: "search", icon: Search, label: "nav.search" },
  { key: "map", icon: Map, label: "nav.map" },
  { key: "favorites", icon: Heart, label: "nav.favorites" },
  { key: "myRequests", icon: FileText, label: "nav.myRequests" },
  { key: "maintenance", icon: ClipboardList, label: "nav.maintenance" },
  { key: "housingNeeds", icon: ClipboardList, label: "nav.housingNeeds" },
  { key: "messages", icon: MessageSquare, label: "nav.messages" },
  { key: "profile", icon: User, label: "nav.profile" },
]

interface TenantSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function TenantSidebar({ activeSection, onSectionChange }: TenantSidebarProps) {
  const { t, lang } = useI18n()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <Home className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ImmoSmart</h1>
            <p className="text-xs text-sidebar-foreground/70">{t("role.tenant")}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.key
            return (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{t(item.label)}</span>
              </button>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{user?.name || "Locataire"}</p>
              <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>{lang === "fr" ? "Deconnexion" : "Logout"}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
