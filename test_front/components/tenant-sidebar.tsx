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
  Sofa,
  BarChart3,
  Bell,
} from "lucide-react"

const navItems = [
  { key: "search", icon: Search, label: "search" },
  { key: "map", icon: Map, label: "map" },
  { key: "favorites", icon: Heart, label: "favorites" },
  { key: "myRequests", icon: FileText, label: "myRequests" },
  { key: "furniture", icon: Sofa, label: "furniture" },
  { key: "maintenance", icon: ClipboardList, label: "maintenance" },
  { key: "housingNeeds", icon: ClipboardList, label: "housingNeeds" },
  { key: "notifications", icon: Bell, label: "notifications" },
  { key: "profile", icon: User, label: "profile" },
]

interface TenantSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  unreadMessageCount?: number
}

export function TenantSidebar({ activeSection, onSectionChange, unreadMessageCount = 0 }: TenantSidebarProps) {
  const { t, lang } = useI18n()
  const { user, logout } = useAuth()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-[#1e3a8a] to-[#1d4ed8] text-white shadow-xl">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/20 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">ImmoSmart</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">{t("role.tenant")}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.key
            const label = t(item.label)
            return (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
                  isActive
                    ? "bg-white text-blue-700 shadow-lg shadow-black/10 scale-105"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
                {item.key === "notifications" && unreadMessageCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-sm">
                    {unreadMessageCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-white/20 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/10 p-3">
            <div className="flex h-10 w-10 overflow-hidden shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium">{user?.name || "Locataire"}</p>
              <p className="text-xs text-white/75">{user?.email}</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/85 transition-all duration-200 hover:bg-red-500/20 hover:text-red-100"
          >
            <LogOut className="h-5 w-5" />
            <span>{t("auth.deconnection")}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

