"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, LogIn, UserPlus } from "lucide-react"

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/proprietes", label: "Proprietes" },
  { href: "/ameublement", label: "Ameublement" },
  { href: "/contact", label: "Contact" },
]

export function PublicNavbar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(18px)",
        background: "rgba(248, 250, 252, 0.88)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
      }}
    >
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "#0f172a",
            fontWeight: 800,
            fontSize: "20px",
          }}
        >
          <span
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
              color: "#fff",
              boxShadow: "0 14px 28px rgba(37, 99, 235, 0.2)",
            }}
          >
            <Home size={18} />
          </span>
          ImmoSmart
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", flex: "1 1 auto", justifyContent: "center" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href

            return (
              <button
                key={link.href}
                type="button"
                onClick={() => router.push(link.href)}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "14px",
                  color: isActive ? "#1d4ed8" : "#475569",
                  background: isActive ? "rgba(29, 78, 216, 0.1)" : "transparent",
                }}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => router.push("/login")}
            style={{
              border: "1px solid rgba(148, 163, 184, 0.25)",
              borderRadius: "999px",
              padding: "10px 16px",
              background: "#fff",
              color: "#334155",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <LogIn size={16} />
            Connexion
          </button>
          <button
            type="button"
            onClick={() => router.push("/register")}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "10px 16px",
              background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
              color: "#fff",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            <UserPlus size={16} />
            Inscription
          </button>
        </div>
      </div>
    </header>
  )
}
