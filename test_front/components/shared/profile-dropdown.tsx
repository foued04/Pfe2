"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Settings, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function ProfileDropdown() {
  const router = useRouter()
  const { role, user, logout } = useAuth()

  const initial = useMemo(() => user?.name?.trim()?.charAt(0)?.toUpperCase() || "U", [user?.name])
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto rounded-full px-2 py-2">
          <span className="flex items-center gap-3 rounded-full border border-border bg-card px-2 py-1 shadow-sm">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {initial}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs text-muted-foreground">Compte</span>
              <span className="block max-w-32 truncate text-sm font-semibold text-foreground">{user?.name || "Utilisateur"}</span>
            </span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-semibold">{user?.name || "Utilisateur"}</p>
          <p className="text-xs text-muted-foreground">{user?.email || ""}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(profileHref)}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(settingsHref)}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout()
            router.push("/login")
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
