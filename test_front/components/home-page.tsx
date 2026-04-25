"use client"

import { useMemo, useState } from "react"
import { ArrowRight, Bath, Bed, Building2, CheckCircle2, MapPin, Maximize, Search, ShieldCheck, Sofa, Sparkles } from "lucide-react"
import { type Property } from "@/lib/property-data"
import { PropertyDetailsModal } from "@/components/property-details-modal"
import { PublicFooter } from "@/components/public-footer"
import { PublicNavbar } from "@/components/public-navbar"
import { useProperties } from "@/hooks/api/use-properties"

const typeOptions = [
  { value: "all", label: "Tous les types" },
  { value: "s0", label: "Studio" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

const statusLabels: Record<string, string> = {
  available: "Disponible",
  rented: "Loue",
  maintenance: "Maintenance",
}

const statusColors: Record<string, string> = {
  available: "#2563eb",
  rented: "#0f766e",
  maintenance: "#f59e0b",
}

interface HomePageProps {
  onLogin: () => void
  onRegister: () => void
  onPublish: () => void
}

export function HomePage({ onLogin, onRegister, onPublish }: HomePageProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const { properties, isLoading, error } = useProperties()

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const haystack = `${property.title} ${property.city} ${property.address}`.toLowerCase()
      const matchesSearch = !search || haystack.includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || property.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [properties, search, typeFilter])

  const featuredProperties = filteredProperties.slice(0, 6)

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 52%, #ffffff 100%)", color: "#0f172a" }}>
      <PublicNavbar />

      <main>
        <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "48px 24px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "36px", alignItems: "center" }}>
            <div>
              <span style={{ display: "inline-block", background: "rgba(29, 78, 216, 0.1)", color: "#1d4ed8", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Plateforme immobiliere
              </span>
              <h1 style={{ margin: "18px 0 14px", fontSize: "clamp(38px, 6vw, 68px)", lineHeight: 0.98 }}>
                Chaque lien du menu ouvre maintenant sa propre page.
              </h1>
              <p style={{ margin: 0, color: "#475569", fontSize: "18px", lineHeight: 1.7, maxWidth: "700px" }}>
                La navigation du haut reste visible partout, les pages `Proprietes` et `Ameublement` sont protegees pour les utilisateurs non connectes, et la zone connexion devient un acces direct au profil une fois l'utilisateur authentifie.
              </p>
              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "28px" }}>
                <button
                  type="button"
                  onClick={onPublish}
                  style={{
                    border: "none",
                    borderRadius: "16px",
                    padding: "14px 20px",
                    background: "linear-gradient(135deg, #f97316, #fb923c)",
                    color: "#fff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontWeight: 700,
                    boxShadow: "0 20px 40px rgba(249, 115, 22, 0.22)",
                  }}
                >
                  Publier une annonce
                  <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={onRegister}
                  style={{
                    border: "1px solid rgba(29, 78, 216, 0.14)",
                    borderRadius: "16px",
                    padding: "14px 20px",
                    background: "#fff",
                    color: "#1d4ed8",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Creer un compte
                </button>
              </div>
              <div style={{ display: "flex", gap: "26px", flexWrap: "wrap", marginTop: "36px" }}>
                {[
                  { value: "150+", label: "Biens verifies" },
                  { value: "24h", label: "Reponse moyenne" },
                  { value: "100%", label: "Navigation par pages" },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ fontSize: "30px", fontWeight: 800, color: "#1d4ed8" }}>{item.value}</div>
                    <div style={{ color: "#64748b", marginTop: "4px" }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div style={{ borderRadius: "30px", overflow: "hidden", minHeight: "460px", boxShadow: "0 30px 70px rgba(37, 99, 235, 0.16)" }}>
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=900&fit=crop"
                  alt="Appartement moderne"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              <div style={{ position: "absolute", left: "-18px", bottom: "24px", background: "#fff", borderRadius: "20px", padding: "16px 18px", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.12)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <ShieldCheck size={20} color="#0f766e" />
                  <strong>Annonces verifiees</strong>
                </div>
                <p style={{ margin: "8px 0 0", color: "#64748b", lineHeight: 1.6 }}>Les visiteurs cliquent sur de vraies pages, pas seulement sur des ancres de sections.</p>
              </div>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "52px 24px 0" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "18px",
              padding: "22px",
              background: "rgba(255, 255, 255, 0.82)",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              borderRadius: "24px",
              boxShadow: "0 20px 44px rgba(148, 163, 184, 0.12)",
            }}
          >
            {[
              { icon: Sparkles, title: "Navbar partagee", text: "La barre du haut reste la meme d'une page a l'autre." },
              { icon: Building2, title: "Page proprietes", text: "Le clic sur Proprietes ouvre maintenant `/properties`." },
              { icon: Sofa, title: "Page ameublement", text: "Le clic sur Ameublement ouvre maintenant `/furniture`." },
              { icon: CheckCircle2, title: "Auth integree", text: "Les utilisateurs non inscrits passent par la page login avant les pages protegees." },
            ].map(({ icon: Icon, title, text }) => (
              <article key={title} style={{ borderRadius: "20px", padding: "20px", background: "#fff" }}>
                <div style={{ width: "44px", height: "44px", borderRadius: "14px", display: "grid", placeItems: "center", background: "rgba(29, 78, 216, 0.1)", color: "#1d4ed8" }}>
                  <Icon size={20} />
                </div>
                <h2 style={{ margin: "14px 0 8px", fontSize: "18px" }}>{title}</h2>
                <p style={{ margin: 0, color: "#64748b", lineHeight: 1.65 }}>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "56px 24px 0" }}>
          <div style={{ textAlign: "center", maxWidth: "760px", margin: "0 auto" }}>
            <span style={{ display: "inline-block", background: "rgba(15, 118, 110, 0.1)", color: "#0f766e", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Apercu des biens
            </span>
            <h2 style={{ margin: "18px 0 10px", fontSize: "clamp(30px, 4vw, 46px)", lineHeight: 1.08 }}>
              La page d'accueil garde un extrait, la liste complete vit ailleurs
            </h2>
            <p style={{ margin: 0, color: "#475569", fontSize: "18px", lineHeight: 1.7 }}>
              On conserve un apercu utile ici, mais la vraie navigation vers les annonces se fait maintenant dans la page dediee.
            </p>
          </div>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center", marginTop: "30px" }}>
            <div style={{ position: "relative", flex: "1 1 320px", maxWidth: "460px" }}>
              <Search size={18} color="#64748b" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher un bien..."
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  borderRadius: "16px",
                  border: "1px solid rgba(148, 163, 184, 0.24)",
                  padding: "14px 16px 14px 44px",
                  fontSize: "15px",
                  background: "#fff",
                  outline: "none",
                }}
              />
            </div>
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              style={{
                minWidth: "190px",
                borderRadius: "16px",
                border: "1px solid rgba(148, 163, 184, 0.24)",
                padding: "14px 16px",
                fontSize: "15px",
                background: "#fff",
                color: "#0f172a",
                outline: "none",
              }}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: "30px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {isLoading ? (
              <div style={{ gridColumn: "1 / -1", padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                Chargement des biens approuves...
              </div>
            ) : featuredProperties.length > 0 ? (
              featuredProperties.map((property) => (
                <button
                  key={property.id}
                  type="button"
                  onClick={() => setSelectedProperty(property)}
                  style={{
                    border: "1px solid rgba(148, 163, 184, 0.18)",
                    borderRadius: "22px",
                    overflow: "hidden",
                    background: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                    boxShadow: "0 16px 34px rgba(148, 163, 184, 0.12)",
                    padding: 0,
                  }}
                >
                  <div style={{ position: "relative", height: "220px" }}>
                    <img src={property.images.cover} alt={property.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <span style={{ position: "absolute", top: "14px", left: "14px", background: statusColors[property.status], color: "#fff", borderRadius: "999px", padding: "6px 12px", fontSize: "12px", fontWeight: 700 }}>
                      {statusLabels[property.status]}
                    </span>
                    <span style={{ position: "absolute", bottom: "14px", left: "14px", background: "rgba(15, 23, 42, 0.72)", color: "#fff", borderRadius: "12px", padding: "8px 12px", fontWeight: 800 }}>
                      {property.rent.toLocaleString("fr-TN")} DT / mois
                    </span>
                  </div>
                  <div style={{ padding: "18px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", lineHeight: 1.35 }}>{property.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", color: "#475569", fontSize: "14px" }}>
                      <MapPin size={14} color="#1d4ed8" />
                      {property.address}
                    </div>
                    <p style={{ margin: "14px 0", color: "#64748b", lineHeight: 1.6 }}>
                      {property.description.slice(0, 120)}
                      {property.description.length > 120 ? "..." : ""}
                    </p>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", color: "#334155", fontSize: "14px", fontWeight: 600 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Maximize size={14} /> {property.surface} m2</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Bed size={14} /> {property.bedrooms}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><Bath size={14} /> {property.bathrooms}</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div style={{ gridColumn: "1 / -1", padding: "40px 0", textAlign: "center", color: "#64748b" }}>
                {error ? "Impossible de charger les biens approuves pour le moment." : "Aucun bien approuve n'est encore visible."}
              </div>
            )}
          </div>

          <div style={{ textAlign: "center", marginTop: "26px" }}>
            <button
              type="button"
              onClick={() => { window.location.href = "/properties" }}
              style={{
                border: "none",
                borderRadius: "14px",
                padding: "14px 18px",
                background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Ouvrir la page proprietes
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        <section style={{ maxWidth: "1240px", margin: "0 auto", padding: "56px 24px 0" }}>
          <div style={{ borderRadius: "30px", padding: "34px", background: "linear-gradient(135deg, #17367f 0%, #2452b8 56%, #4d86de 100%)", color: "#fff", boxShadow: "0 28px 60px rgba(37, 99, 235, 0.22)" }}>
            <h2 style={{ margin: 0, fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1 }}>Connexion et inscription remplacent leur zone par le profil utilisateur</h2>
            <p style={{ margin: "14px 0 0", maxWidth: "760px", lineHeight: 1.7, color: "rgba(255,255,255,0.9)" }}>
              En haut a droite, un utilisateur connecte voit maintenant son acces profil a la place des boutons `Connexion` et `Inscription`, comme vous l'avez demande.
            </p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", marginTop: "24px" }}>
              <button
                type="button"
                onClick={onLogin}
                style={{
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Se connecter
              </button>
              <button
                type="button"
                onClick={onRegister}
                style={{
                  border: "none",
                  borderRadius: "14px",
                  padding: "14px 18px",
                  background: "#fff",
                  color: "#1d4ed8",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                S'inscrire
              </button>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
        onToggleFavorite={toggleFavorite}
        onContact={() => {
          setSelectedProperty(null)
          onLogin()
        }}
      />
    </div>
  )
}
