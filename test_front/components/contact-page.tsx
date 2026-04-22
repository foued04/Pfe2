"use client"

import { Clock3, Mail, MapPin, Phone } from "lucide-react"
import { PublicFooter } from "@/components/public-footer"
import { PublicNavbar } from "@/components/public-navbar"

const contactCards = [
  { icon: Phone, title: "Telephone", text: "+216 73 461 000" },
  { icon: Mail, title: "Email", text: "contact@immosmart.tn" },
  { icon: MapPin, title: "Adresse", text: "Monastir, Tunisie" },
  { icon: Clock3, title: "Disponibilite", text: "Lundi - Samedi, 8h00 - 18h00" },
]

export function ContactPage() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #ecfeff 0%, #f8fafc 42%, #ffffff 100%)", color: "#0f172a" }}>
      <PublicNavbar />

      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "48px 24px 0" }}>
        <section style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
          <span style={{ display: "inline-block", background: "rgba(15, 118, 110, 0.12)", color: "#0f766e", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Contact
          </span>
          <h1 style={{ margin: "18px 0 12px", fontSize: "clamp(34px, 6vw, 54px)", lineHeight: 1.04 }}>
            Une page de contact claire et separee
          </h1>
          <p style={{ margin: 0, color: "#475569", fontSize: "18px", lineHeight: 1.7 }}>
            La navigation du haut envoie maintenant vers une vraie page de contact au lieu d'un simple scroll dans la landing page.
          </p>
        </section>

        <section style={{ marginTop: "42px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "22px" }}>
          {contactCards.map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              style={{
                background: "#fff",
                borderRadius: "22px",
                padding: "24px",
                border: "1px solid rgba(148, 163, 184, 0.18)",
                boxShadow: "0 18px 34px rgba(148, 163, 184, 0.1)",
              }}
            >
              <div style={{ width: "48px", height: "48px", borderRadius: "16px", display: "grid", placeItems: "center", background: "rgba(15, 118, 110, 0.1)", color: "#0f766e" }}>
                <Icon size={22} />
              </div>
              <h2 style={{ margin: "18px 0 10px", fontSize: "20px" }}>{title}</h2>
              <p style={{ margin: 0, color: "#475569", lineHeight: 1.7 }}>{text}</p>
            </article>
          ))}
        </section>

        <section
          style={{
            marginTop: "40px",
            borderRadius: "28px",
            padding: "32px",
            background: "linear-gradient(135deg, #0f766e, #14b8a6)",
            color: "#fff",
            boxShadow: "0 28px 58px rgba(15, 118, 110, 0.24)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "30px" }}>Besoin d'aide pour louer ou publier ?</h2>
          <p style={{ margin: "14px 0 0", lineHeight: 1.7, maxWidth: "760px", color: "rgba(255, 255, 255, 0.9)" }}>
            Nous pouvons vous aider pour la recherche de logement, la publication d'annonce, les demandes de location et les questions techniques autour de la plateforme.
          </p>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
