"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProfileDropdown } from "@/components/shared/profile-dropdown"

export function DashboardTopbar({ title, onOpenMobileMenu }: { title: string; onOpenMobileMenu: () => void }) {
  return (
    <div className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="rounded-full md:hidden" onClick={onOpenMobileMenu}>
          <Menu className="h-4 w-4" />
        </Button>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dashboard</div>
          <div className="text-lg font-bold text-foreground">{title}</div>
        </div>
      </div>
      <ProfileDropdown />
    </div>
  )
}

