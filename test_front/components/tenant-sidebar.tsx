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
} from "lucide-react"

const navItems = [
  { key: "search", icon: Search, label: "nav.search" },
  { key: "map", icon: Map, label: "nav.map" },
  { key: "favorites", icon: Heart, label: "nav.favorites" },
  { key: "myRequests", icon: FileText, label: "nav.myRequests" },
  { key: "furniture", icon: Sofa, label: "nav.furniture" },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-[#1e3a8a] to-[#1d4ed8] text-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-white/20 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <Home className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">ImmoSmart</h1>
            <p className="text-xs text-white/80">{t("role.tenant")}</p>
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
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#3b82f6] text-white shadow-md"
                    : "text-white/85 hover:bg-white/15 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
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
            <span>{lang === "fr" ? "Deconnexion" : "Logout"}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

