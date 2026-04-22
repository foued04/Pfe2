import type { ReactNode } from "react"
import { PublicNavbar } from "@/components/shared/public-navbar"
import { PublicFooter } from "@/components/shared/public-footer"

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </div>
  )
}

