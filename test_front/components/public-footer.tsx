"use client"

import { useRouter } from "next/navigation"
import { Mail, MapPin, Phone } from "lucide-react"

const footerLinks = [
  { href: "/", label: "Accueil" },
  { href: "/proprietes", label: "Proprietes" },
  { href: "/ameublement", label: "Ameublement" },
  { href: "/contact", label: "Contact" },
]

export function PublicFooter() {
  const router = useRouter()

  return (
    <footer style={{ background: "#132d6b", color: "rgba(226, 232, 240, 0.92)", marginTop: "80px" }}>
      <div
        style={{
          maxWidth: "1240px",
          margin: "0 auto",
          padding: "56px 24px 18px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "32px",
        }}
      >
        <div>
          <h3 style={{ margin: 0, color: "#fff", fontSize: "22px" }}>ImmoSmart</h3>
          <p style={{ margin: "14px 0 0", lineHeight: 1.7 }}>
            Plateforme immobiliere moderne avec une navigation claire entre accueil, proprietes, ameublement et contact.
          </p>
        </div>

        <div>
          <h4 style={{ margin: 0, color: "#fff", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Navigation</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            {footerLinks.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => router.push(link.href)}
                style={{
                  border: "none",
                  background: "transparent",
                  color: "rgba(226, 232, 240, 0.92)",
                  textAlign: "left",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ margin: 0, color: "#fff", fontSize: "14px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Contact</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><Phone size={15} /> +216 73 461 000</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><Mail size={15} /> contact@immosmart.tn</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}><MapPin size={15} /> Monastir, Tunisie</div>
          </div>
        </div>
      </div>

      <div style={{ borderTop: "1px solid rgba(148, 163, 184, 0.22)", padding: "18px 24px", textAlign: "center", fontSize: "13px", color: "rgba(191, 219, 254, 0.84)" }}>
        © 2026 ImmoSmart. Tous droits reserves.
      </div>
    </footer>
  )
}
