"use client"

import type { ReactNode } from "react"
import { useMemo } from "react"
import Link from "next/link"
import { ChevronLeft, LayoutDashboard, Settings, User } from "lucide-react"

import { AppLogo } from "@/components/shared/app-logo"
import { ProfileDropdown } from "@/components/shared/profile-dropdown"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"

export function UserAccountShell({ children }: { children: ReactNode }) {
  const { role } = useAuth()
  const { t } = useI18n()
  const profileHref = useMemo(() => {
    if (role === "owner") return "/dashboard/owner/profile"
    if (role === "tenant") return "/dashboard/tenant/profile"
    if (role === "admin") return "/dashboard/admin/profile"
    return "/profile"
  }, [role])
  const settingsHref = useMemo(() => {
    if (role === "owner") return "/dashboard/owner/settings"
    if (role === "tenant") return "/dashboard/tenant/settings"
    if (role === "admin") return "/dashboard/admin/settings"
    return "/settings"
  }, [role])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <AppLogo />
            <div className="lg:hidden">
              <ProfileDropdown />
            </div>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <AccountNavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label={t("sidebar.dashboard")} />
              <AccountNavLink href={profileHref} icon={<User className="h-4 w-4" />} label={t("profile")} />
              <AccountNavLink href={settingsHref} icon={<Settings className="h-4 w-4" />} label={t("settings")} />
              <AccountNavLink href="/" icon={<ChevronLeft className="h-4 w-4" />} label={t("general.backToSite") || "Retour au site"} />
            </nav>

            <div className="hidden lg:block">
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

function AccountNavLink({
  href,
  icon,
  label,
}: {
  href: string
  icon: ReactNode
  label: string
}) {
  return (
    <Link
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
      href={href}
    >
      {icon}
      <span>{label}</span>
    </Link>
  )
}
