"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Menu } from "lucide-react"
import { ProfileDropdown } from "@/components/shared/profile-dropdown"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

export function PublicNavbar() {
  const pathname = usePathname()
  const { isAuthenticated, isLoading, role } = useAuth()
  const dashboardHref =
    role === "tenant"
      ? "/dashboard/tenant"
      : role === "owner"
        ? "/dashboard/owner"
        : role === "admin"
          ? "/dashboard/admin"
          : "/dashboard"
  const homeHref = isAuthenticated ? dashboardHref : "/"
  const navItems = [
    { href: homeHref, label: "Accueil" },
    { href: "/properties", label: "Properties" },
    { href: "/ameublement", label: "Meubles" },
    { href: "/contact", label: "Contact" },
  ]
  const showAccountControls = isAuthenticated && !isLoading
  const showGuestControls = !isAuthenticated && !isLoading

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 md:px-6">
        <Link href={homeHref} className="inline-flex items-center gap-3 text-foreground no-underline">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Home className="h-4 w-4" />
          </span>
          <span className="text-lg font-black tracking-tight">ImmoSmart</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-5 py-3 text-base font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {showAccountControls ? (
            <>
              <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
                <Link href={dashboardHref}>Dashboard</Link>
              </Button>
              <ProfileDropdown />
            </>
          ) : showGuestControls ? (
            <>
              <Button asChild variant="outline" className="h-12 rounded-full px-6 text-base">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild className="h-12 rounded-full px-6 text-base">
                <Link href="/register">Inscription</Link>
              </Button>
            </>
          ) : (
            <div className="h-12 w-48" />
          )}
        </div>

        <div className="ml-auto md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "rounded-xl px-5 py-4 text-base font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted",
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  {showAccountControls ? (
                    <>
                      <Button asChild variant="outline" className="h-12 text-base">
                        <Link href={dashboardHref}>Dashboard</Link>
                      </Button>
                      <div className="flex justify-start">
                        <ProfileDropdown />
                      </div>
                    </>
                  ) : showGuestControls ? (
                    <>
                      <Button asChild variant="outline" className="h-12 text-base">
                        <Link href="/login">Connexion</Link>
                      </Button>
                      <Button asChild className="h-12 text-base">
                        <Link href="/register">Inscription</Link>
                      </Button>
                    </>
                  ) : (
                    <div className="h-12" />
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
