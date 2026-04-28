import Link from "next/link"
import { Home } from "lucide-react"

export function AppLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-3 text-foreground no-underline">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Home className="h-5 w-5" />
      </span>
      <span className="text-lg font-black tracking-tight">ImmoSmart</span>
    </Link>
  )
}

