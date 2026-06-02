import Link from "next/link"
import Image from "next/image"

export function AppLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
      <Image src="/logo.svg" alt="ImmoSmart Logo" width={38} height={38} className="object-contain" />
      <span className="text-2xl font-black tracking-tight">
        <span style={{ color: "#002147" }}>Immo</span>
        <span style={{ color: "#0076D6" }}>Smart</span>
      </span>
    </Link>
  )
}

