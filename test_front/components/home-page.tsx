"use client"

import { useState, useMemo, useEffect } from "react"
import { mockProperties, mapBackendProperty, type Property } from "@/lib/property-data"
import { PropertyDetailsModal } from "@/components/property-details-modal"
import {
  Search, MapPin, Bed, Bath, Maximize, Home, Building2,
  ShieldCheck, MessageSquare, Sparkles, Sofa, ChevronRight,
  Phone, Mail, Facebook, Instagram, Linkedin, ArrowRight,
  Star, CheckCircle2, Eye, Armchair, Lamp, CookingPot, Monitor,
} from "lucide-react"

// ─── Palette (Blue Theme) ────────────────────────────────────────────────────────────────────────
const C = {
  primary: "#1D4ED8",
  primaryDark: "#1E3A8A",
  primarySoft: "#60A5FA",
  accent: "#0F766E",
  accentSoft: "#99F6E4",
  borderLight: "#DBEAFE",
  bgMint: "#EFF6FF",
  bgWhite: "#F8FAFC",
  bgSection: "#F1F5F9",
  textDark: "#1F2937",
  textSecondary: "#64748B",
  textMuted: "#94A3B8",
  white: "#FFFFFF",
  shadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
}

// ─── Type labels ────────────────────────────────────────────────────────────
const typeLabels: Record<string, string> = {
  s0: "Studio", s1: "Appartement", s2: "Appartement",
  s3: "Appartement", s4: "Appartement", villa: "Villa",
}
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
  available: "Disponible", rented: "Loué", maintenance: "Maintenance",
}
const statusColors: Record<string, string> = {
  available: C.primarySoft, rented: C.accent, maintenance: "#f59e0b",
}

// ─── Shared button helper ───────────────────────────────────────────────────
function TealButton({ children, onClick, variant = "solid", style: extra }: {
  children: React.ReactNode; onClick?: () => void; variant?: "solid" | "outline"; style?: React.CSSProperties
}) {
  const isSolid = variant === "solid"
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: "8px",
        padding: "15px 30px", borderRadius: "14px", fontSize: "15px", fontWeight: 700,
        cursor: "pointer", transition: "all 0.25s",
        background: isSolid ? `linear-gradient(135deg, ${C.primary}, ${C.primarySoft})` : "rgba(255,255,255,0.82)",
        color: isSolid ? C.white : C.primary,
        border: isSolid ? "none" : `1px solid ${C.borderLight}`,
        boxShadow: isSolid ? "0 18px 34px rgba(37, 99, 235, 0.22)" : "0 10px 30px rgba(148, 163, 184, 0.12)",
        ...extra,
      }}
      onMouseEnter={(e) => {
        if (isSolid) { e.currentTarget.style.boxShadow = "0 22px 40px rgba(37, 99, 235, 0.28)"; e.currentTarget.style.transform = "translateY(-2px)" }
        else { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.color = C.primary; e.currentTarget.style.transform = "translateY(-2px)" }
      }}
      onMouseLeave={(e) => {
        if (isSolid) { e.currentTarget.style.boxShadow = "0 18px 34px rgba(37, 99, 235, 0.22)"; e.currentTarget.style.transform = "translateY(0)" }
        else { e.currentTarget.style.background = "rgba(255,255,255,0.82)"; e.currentTarget.style.color = C.primary; e.currentTarget.style.transform = "translateY(0)" }
      }}
    >
      {children}
    </button>
  )
}

// ─── Section Title ──────────────────────────────────────────────────────────
function SectionTitle({ badge, title, subtitle }: { badge?: string; title: string; subtitle?: string }) {
  return (
    <div style={{ textAlign: "center", marginBottom: "48px" }}>
      {badge && (
        <span style={{
          display: "inline-block", background: "rgba(255,255,255,0.86)", color: C.primary,
          fontSize: "12px", fontWeight: 800, padding: "8px 16px", borderRadius: "999px",
          marginBottom: "16px", letterSpacing: "0.14em", textTransform: "uppercase",
          border: `1px solid ${C.borderLight}`, boxShadow: "0 10px 24px rgba(148, 163, 184, 0.10)",
        }}>{badge}</span>
      )}
      <h2 style={{ margin: 0, fontSize: "clamp(28px, 3vw, 40px)", fontWeight: 800, color: C.textDark, lineHeight: 1.15, letterSpacing: "-0.04em" }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ margin: "14px auto 0", maxWidth: "640px", color: C.textSecondary, fontSize: "17px", lineHeight: 1.7 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Property Card ──────────────────────────────────────────────────────────
function HomePropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  const bedroomLabel = property.bedrooms === 0 ? "1 ch." : `${property.bedrooms} ch.`
  return (
    <div
      onClick={onClick}
      style={{
        background: C.white, borderRadius: "16px", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)", cursor: "pointer",
        transition: "transform 0.25s, box-shadow 0.25s", border: `1px solid ${C.borderLight}`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-5px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(15,106,115,0.12)" }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)" }}
    >
      <div style={{ position: "relative", width: "100%", paddingTop: "62%" }}>
        <img src={property.images.cover} alt={property.title} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
        <span style={{ position: "absolute", top: "12px", left: "12px", background: statusColors[property.status], color: "#fff", fontSize: "11px", fontWeight: 600, padding: "4px 12px", borderRadius: "20px" }}>
          {statusLabels[property.status]}
        </span>
        <div style={{ position: "absolute", bottom: "12px", left: "12px", background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", color: "#fff", fontSize: "15px", fontWeight: 700, padding: "6px 14px", borderRadius: "10px" }}>
          {property.rent.toLocaleString("fr-TN")} DT<span style={{ fontWeight: 400, fontSize: "12px", marginLeft: "3px" }}>/mois</span>
        </div>
      </div>
      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: C.textDark, lineHeight: 1.35 }}>{property.title}</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "6px", color: C.textSecondary, fontSize: "12px" }}>
          <MapPin size={12} color={C.primary} /><span>{property.address}</span>
        </div>
        <p style={{ margin: "8px 0", fontSize: "12px", color: C.textSecondary, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {property.description}
        </p>
        <hr style={{ border: "none", borderTop: `1px solid ${C.borderLight}`, margin: "12px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "14px", color: C.textSecondary, fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Maximize size={13} /> {property.surface} m²</span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Bed size={13} /> {bedroomLabel}</span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}><Bath size={13} /> {property.bathrooms} sdb</span>
          </div>
          <span style={{ fontSize: "11px", fontWeight: 600, color: C.primary, background: `${C.primary}10`, padding: "3px 10px", borderRadius: "20px", border: `1px solid ${C.primary}25` }}>
            {typeLabels[property.type]}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Feature Card ───────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div style={{
      background: C.white, borderRadius: "16px", padding: "28px 24px",
      boxShadow: "0 2px 12px rgba(0,0,0,0.04)", border: `1px solid ${C.borderLight}`,
      transition: "transform 0.25s, box-shadow 0.25s", cursor: "default",
      display: "flex", flexDirection: "column", gap: "14px",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(15,106,115,0.08)" }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)" }}
    >
      <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: `${C.primary}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={24} color={C.primary} />
      </div>
      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: C.textDark }}>{title}</h3>
      <p style={{ margin: 0, fontSize: "14px", color: C.textSecondary, lineHeight: 1.55 }}>{text}</p>
    </div>
  )
}

// ─── Property Type Card ─────────────────────────────────────────────────────
function PropertyTypeCard({ icon: Icon, title, count, image, onClick }: { icon: any; title: string; count: number; image: string; onClick?: () => void }) {
  return (
    <div style={{
      position: "relative", borderRadius: "18px", overflow: "hidden", height: "220px",
      cursor: "pointer", transition: "transform 0.3s",
    }}
      onClick={onClick}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)" }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}
    >
      <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 30%, rgba(11,86,96,0.85) 100%)" }} />
      <div style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Icon size={20} color={C.white} />
          <span style={{ color: C.white, fontSize: "18px", fontWeight: 700 }}>{title}</span>
        </div>
        <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>{count} biens disponibles</span>
      </div>
    </div>
  )
}

// ─── Furniture Category Card ────────────────────────────────────────────────
function FurnitureCategoryCard({ icon: Icon, title, image }: { icon: any; title: string; image: string }) {
  return (
    <div style={{
      background: C.white, borderRadius: "16px", overflow: "hidden",
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: `1px solid ${C.borderLight}`,
      transition: "transform 0.25s, box-shadow 0.25s", cursor: "default",
    }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(15,106,115,0.1)" }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)" }}
    >
      <div style={{ width: "100%", height: "180px", overflow: "hidden" }}>
        <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s" }} loading="lazy"
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.08)" }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)" }}
        />
      </div>
      <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <Icon size={20} color={C.primary} />
        <span style={{ fontSize: "15px", fontWeight: 600, color: C.textDark }}>{title}</span>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ─── MAIN HOMEPAGE ──────────────────────────────────────────────────────────
// ═════════════════════════════════════════════════════════════════════════════

interface HomePageProps { onLogin: () => void; onRegister: () => void }

export function HomePage({ onLogin, onRegister }: HomePageProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const fetchProperties = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/properties`)
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      
      // Map backend structure using the centralized mapper
      const mappedData = data.map(mapBackendProperty)
      
      setProperties(mappedData)
    } catch (error) {
      console.error("Error fetching properties:", error)
      // Fallback to mock data if API fails (optional, but keep it for now)
      setProperties(mockProperties.map(mapBackendProperty))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const heroImages = useMemo(() => [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop"
  ], [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIdx((prev) => (prev + 1) % heroImages.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [heroImages.length])

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch = search === "" || p.title.toLowerCase().includes(search.toLowerCase()) || p.city.toLowerCase().includes(search.toLowerCase()) || p.address.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "all" || p.type === typeFilter
      return matchSearch && matchType
    })
  }, [search, typeFilter, properties])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  const scrollToProperties = () => {
    document.getElementById("properties-section")?.scrollIntoView({ behavior: "smooth" })
  }
  const scrollToFurniture = () => {
    document.getElementById("furniture-section")?.scrollIntoView({ behavior: "smooth" })
  }
  const scrollToContact = () => {
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" })
  }
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavClick = (link: string) => {
    if (link === "Accueil") scrollToTop()
    else if (link === "Propriétés") scrollToProperties()
    else if (link === "Ameublement") scrollToFurniture()
    else if (link === "Contact") scrollToContact()
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: C.textDark }}>

      {/* ═══════════════════════ 1. NAVBAR ═══════════════════════ */}
      <nav style={{
        background: C.bgWhite, padding: "0 clamp(20px, 4vw, 48px)", height: "68px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
        borderBottom: `1px solid ${C.borderLight}`,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(15,106,115,0.25)",
          }}>
            <Home size={18} color={C.white} />
          </div>
          <span style={{ fontWeight: 800, fontSize: "20px", color: C.primary, letterSpacing: "-0.5px" }}>ImmoSmart</span>
        </div>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {["Accueil", "Propriétés", "Ameublement", "Contact"].map((link) => (
            <button key={link} style={{
              background: "none", border: "none", color: C.textSecondary, fontSize: "14px",
              fontWeight: 500, cursor: "pointer", padding: "8px 14px", borderRadius: "8px",
              transition: "all 0.2s",
            }}
              onClick={() => handleNavClick(link)}
              onMouseEnter={(e) => { e.currentTarget.style.color = C.primary; e.currentTarget.style.background = `${C.primary}08` }}
              onMouseLeave={(e) => { e.currentTarget.style.color = C.textSecondary; e.currentTarget.style.background = "none" }}
            >
              {link}
            </button>
          ))}
          <div style={{ width: "1px", height: "24px", background: C.borderLight, margin: "0 4px" }} />
          <button onClick={onLogin} style={{
            background: "none", border: "none", color: C.textSecondary,
            fontSize: "14px", fontWeight: 500, cursor: "pointer", padding: "8px 16px",
            borderRadius: "8px", transition: "color 0.2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.color = C.primary }}
            onMouseLeave={(e) => { e.currentTarget.style.color = C.textSecondary }}
          >
            Connexion
          </button>
          <button onClick={onRegister} style={{
            background: `linear-gradient(135deg, ${C.primary}, ${C.primarySoft})`,
            border: "none", color: C.white, fontSize: "14px", fontWeight: 600,
            cursor: "pointer", padding: "10px 22px", borderRadius: "10px",
            transition: "all 0.2s", boxShadow: "0 12px 28px rgba(37, 99, 235, 0.22)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 16px 34px rgba(37, 99, 235, 0.28)" }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 12px 28px rgba(37, 99, 235, 0.22)" }}
          >
            S&apos;inscrire
          </button>
        </div>
      </nav>

      {/* ═══════════════════════ 2. HERO ═══════════════════════ */}
      <section style={{
        position: "relative", minHeight: "560px", display: "flex", alignItems: "center",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${C.bgMint} 0%, ${C.primarySoft}20 50%, ${C.accentSoft}20 100%)`,
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-80px", right: "-60px", width: "360px", height: "360px", borderRadius: "50%", background: `${C.primary}08` }} />
        <div style={{ position: "absolute", bottom: "-120px", left: "-80px", width: "440px", height: "440px", borderRadius: "50%", background: `${C.primary}06` }} />

        <div style={{
          maxWidth: "1240px", margin: "0 auto", padding: "60px clamp(24px, 5vw, 48px)",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center",
          position: "relative", zIndex: 1, width: "100%",
        }}>
          {/* Text */}
          <div>
            <h1 style={{ margin: 0, fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 800, lineHeight: 1.15, color: C.textDark }}>
              Trouvez votre bien{" "}
              <span style={{ color: C.primary }}>idéal</span> à Monastir
            </h1>
            <p style={{ margin: "18px 0 0", fontSize: "17px", color: C.textSecondary, lineHeight: 1.65, maxWidth: "480px" }}>
              Appartements, villas, studios et locaux commerciaux — meublés ou non meublés. Une expérience immobilière moderne et transparente.
            </p>
            <div style={{ display: "flex", gap: "14px", marginTop: "32px", flexWrap: "wrap" }}>
              <TealButton onClick={scrollToProperties}>Voir les annonces <ArrowRight size={18} /></TealButton>
              <TealButton variant="outline" onClick={scrollToFurniture}>Découvrir l&apos;ameublement</TealButton>
            </div>
            {/* Quick stats */}
            <div style={{ display: "flex", gap: "32px", marginTop: "40px" }}>
              {[
                { value: "150+", label: "Biens" },
                { value: "98%", label: "Satisfaction" },
                { value: "24h", label: "Réponse" },
              ].map((s) => (
                <div key={s.label}>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: C.primary }}>{s.value}</div>
                  <div style={{ fontSize: "13px", color: C.textSecondary, marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero image */}
          <div style={{ position: "relative" }}>
            <div style={{
              borderRadius: "24px", overflow: "hidden", boxShadow: "0 20px 60px rgba(15,106,115,0.15)",
              border: `3px solid ${C.white}`, position: "relative", width: "100%", height: "400px"
            }}>
              {heroImages.map((src, idx) => (
                <img
                  key={src}
                  src={src}
                  alt={`Immobilier moderne ${idx + 1}`}
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
                    opacity: currentImageIdx === idx ? 1 : 0, transition: "opacity 1s ease-in-out"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 3. CONCEPT ═══════════════════════ */}
      <section style={{ background: C.bgMint, padding: "80px clamp(24px, 5vw, 48px)" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <SectionTitle
            badge="Notre concept"
            title="Une expérience immobilière moderne"
            subtitle="ImmoSmart réinvente la recherche de logement à Monastir avec une plateforme digitale, transparente et simple d'utilisation."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            <FeatureCard icon={ShieldCheck} title="Annonces vérifiées" text="Chaque bien est vérifié par notre équipe pour garantir la fiabilité des informations et la qualité du logement." />
            <FeatureCard icon={MessageSquare} title="Contact direct" text="Échangez directement avec les propriétaires sans intermédiaire. Communication fluide et transparente." />
            <FeatureCard icon={Search} title="Recherche intelligente" text="Filtrez par type, surface, budget et localisation pour trouver le bien qui correspond exactement à vos besoins." />
            <FeatureCard icon={Sofa} title="Ameublement intégré" text="Bien non meublé ? Consultez notre catalogue de meubles et équipez votre logement en quelques clics." />
            <FeatureCard icon={Sparkles} title="Solution digitale" text="Gestion des contrats, paiements et maintenance — tout est centralisé on une seule plateforme moderne." />
            <FeatureCard icon={Eye} title="Confiance & clarté" text="Photos réelles, descriptions détaillées, avis vérifiés. Prenez vos décisions en toute sérénité." />
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 4. PUBLICITÉ / MISE EN AVANT ═══════════════════════ */}
      <section style={{ background: C.white, padding: "80px clamp(24px, 5vw, 48px)" }}>
        <div style={{
          maxWidth: "1240px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", alignItems: "center",
        }}>
          <div style={{
            borderRadius: "24px", overflow: "hidden", position: "relative",
            boxShadow: "0 16px 48px rgba(15,106,115,0.12)",
          }}>
            <img
              src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&h=600&fit=crop"
              alt="Intérieur moderne"
              style={{ width: "100%", height: "420px", objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 50%, ${C.primaryDark}90 100%)` }} />
            <div style={{ position: "absolute", bottom: "24px", left: "24px", color: C.white }}>
              <div style={{ fontSize: "13px", fontWeight: 600, opacity: 0.85, marginBottom: "4px" }}>Sélection du mois</div>
              <div style={{ fontSize: "22px", fontWeight: 800 }}>Villa contemporaine – Kantaoui</div>
            </div>
          </div>

          <div>
            <span style={{
              display: "inline-block", background: `${C.primary}10`, color: C.primary,
              fontSize: "13px", fontWeight: 600, padding: "6px 14px", borderRadius: "100px",
              marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.5px",
            }}>Mise en avant</span>
            <h2 style={{ margin: 0, fontSize: "clamp(24px, 3vw, 32px)", fontWeight: 800, color: C.textDark, lineHeight: 1.25 }}>
              Des biens d&apos;exception sélectionnés pour vous
            </h2>
            <p style={{ margin: "16px 0 0", fontSize: "16px", color: C.textSecondary, lineHeight: 1.65 }}>
              Découvrez notre sélection premium de propriétés à Monastir. Chaque bien est soigneusement choisi pour son emplacement, sa qualité et son rapport qualité-prix exceptionnel.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "28px" }}>
              {[
                "Emplacements stratégiques dans les meilleurs quartiers",
                "Finitions haut de gamme et espaces lumineux",
                "Proximité des commodités et transports",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", background: `${C.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={14} color={C.primary} />
                  </div>
                  <span style={{ fontSize: "15px", color: C.textDark }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "32px" }}>
              <TealButton onClick={scrollToProperties}>Explorer les biens <ArrowRight size={18} /></TealButton>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 5. AMEUBLEMENT ═══════════════════════ */}
      <section id="furniture-section" style={{ background: C.bgWhite, padding: "80px clamp(24px, 5vw, 48px)" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <SectionTitle
            badge="Ameublement"
            title="Bien non meublé ? Nous avons la solution"
            subtitle="ImmoSmart vous permet de consulter et commander des meubles et équipements pour compléter votre logement. Un service unique intégré à votre location."
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <FurnitureCategoryCard icon={Armchair} title="Salon" image="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop" />
            <FurnitureCategoryCard icon={Bed} title="Chambre" image="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=600&h=400&fit=crop" />
            <FurnitureCategoryCard icon={CookingPot} title="Cuisine" image="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop" />
            <FurnitureCategoryCard icon={Monitor} title="Bureau" image="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=400&fit=crop" />
          </div>

          <div style={{ textAlign: "center", marginTop: "40px" }}>
            <TealButton variant="outline" onClick={onLogin}>Voir le catalogue meubles <ChevronRight size={18} /></TealButton>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 6. TYPES DE BIENS ═══════════════════════ */}
      <section style={{ background: C.white, padding: "80px clamp(24px, 5vw, 48px)" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <SectionTitle
            badge="Catégories"
            title="Explorez par type de bien"
            subtitle="Trouvez le logement qui correspond à votre style de vie à Monastir."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: "24px" }}>
            <PropertyTypeCard icon={Building2} title="Appartements" count={5} image="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop" onClick={() => { setTypeFilter("appartement"); scrollToProperties(); }} />
            <PropertyTypeCard icon={Home} title="Villas" count={1} image="https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop" onClick={() => { setTypeFilter("villa"); scrollToProperties(); }} />
            <PropertyTypeCard icon={Lamp} title="Studios" count={2} image="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&h=400&fit=crop" onClick={() => { setTypeFilter("studio"); scrollToProperties(); }} />
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 7. ANNONCES (Properties Grid) ═══════════════════════ */}
      <section id="properties-section" style={{ background: C.bgMint, padding: "80px clamp(24px, 5vw, 48px)" }}>
        <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
          <SectionTitle
            badge="Annonces"
            title="Nos propriétés disponibles"
            subtitle="Parcourez les biens immobiliers disponibles à la location à Monastir."
          />

          {/* Search bar */}
          <div style={{
            display: "flex", gap: "14px", maxWidth: "700px", margin: "0 auto 40px",
            flexWrap: "wrap", justifyContent: "center",
          }}>
            <div style={{
              flex: 1, minWidth: "260px", position: "relative", background: C.white,
              borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: `1px solid ${C.borderLight}`,
            }}>
              <Search size={16} color={C.textSecondary} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text" placeholder="Rechercher par nom ou quartier..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%", border: "none", outline: "none",
                  padding: "14px 14px 14px 42px", fontSize: "14px",
                  borderRadius: "12px", background: "transparent", color: C.textDark, boxSizing: "border-box",
                }}
              />
            </div>
            <select
              value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                padding: "14px 18px", border: `1px solid ${C.borderLight}`, borderRadius: "12px",
                fontSize: "14px", background: C.white, color: C.textDark, cursor: "pointer",
                outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              }}
            >
              {typeOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: C.textSecondary }}>
              <Building2 size={48} color={C.borderLight} style={{ marginBottom: "12px" }} />
              <p>Aucun bien trouvé pour votre recherche.</p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}>
              {filtered.map((property) => (
                <HomePropertyCard key={property.id} property={property} onClick={() => setSelectedProperty(property)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════ 8. CTA PROPRIÉTAIRE ═══════════════════════ */}
      <section style={{
        background: "linear-gradient(135deg, #17367f 0%, #2452b8 56%, #4d86de 100%)",
        padding: "72px clamp(24px, 5vw, 48px)",
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ margin: 0, fontSize: "clamp(24px, 3.5vw, 34px)", fontWeight: 800, color: C.white, lineHeight: 1.2 }}>
            Vous êtes propriétaire ?
          </h2>
          <p style={{ margin: "16px 0 0", fontSize: "17px", color: "rgba(241,245,249,0.92)", lineHeight: 1.6 }}>
            Publiez vos annonces sur ImmoSmart et atteignez des milliers de locataires potentiels à Monastir. Gestion simplifiée, visibilité maximale.
          </p>
          <div style={{ display: "flex", gap: "14px", justifyContent: "center", marginTop: "32px", flexWrap: "wrap" }}>
            <button onClick={onRegister} style={{
              padding: "16px 32px", borderRadius: "12px", fontSize: "16px", fontWeight: 700,
              background: "#F8FAFC", color: "#1D4ED8", border: "1px solid rgba(255,255,255,0.55)", cursor: "pointer",
              boxShadow: "0 8px 24px rgba(15,23,42,0.18)", transition: "all 0.2s",
              display: "flex", alignItems: "center", gap: "8px",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "0 14px 30px rgba(15,23,42,0.22)"
                e.currentTarget.style.background = "#FFFFFF"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.18)"
                e.currentTarget.style.background = "#F8FAFC"
              }}
            >
              Publier une annonce <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ 9. FOOTER ═══════════════════════ */}
      <footer id="contact-section" style={{ background: "#132d6b", padding: "60px clamp(24px, 5vw, 48px) 0", color: "rgba(226,232,240,0.9)" }}>
        <div style={{
          maxWidth: "1240px", margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Home size={16} color={C.white} />
              </div>
              <span style={{ fontWeight: 800, fontSize: "18px", color: C.white }}>ImmoSmart</span>
            </div>
            <p style={{ fontSize: "14px", lineHeight: 1.6, maxWidth: "280px" }}>
              La plateforme immobilière intelligente de Monastir. Trouvez, louez et gérez vos biens en toute simplicité.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: "0.5px" }}>Navigation</h4>
            {["Accueil", "Propriétés", "Ameublement", "Contact"].map((link) => (
              <div key={link} style={{ marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", cursor: "pointer", transition: "color 0.2s", color: "rgba(226,232,240,0.84)" }}
                  onClick={() => handleNavClick(link)}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF" }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(226,232,240,0.84)" }}
                >{link}</span>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: "0.5px" }}>Contact</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Phone size={14} /> +216 73 461 000</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><Mail size={14} /> contact@immosmart.tn</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}><MapPin size={14} /> Monastir, Tunisie</div>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ margin: "0 0 16px", fontSize: "14px", fontWeight: 700, color: C.white, textTransform: "uppercase", letterSpacing: "0.5px" }}>Réseaux sociaux</h4>
            <div style={{ display: "flex", gap: "12px" }}>
              {[Facebook, Instagram, Linkedin].map((Icon, i) => (
                <div key={i} style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", display: "flex",
                  alignItems: "center", justifyContent: "center", cursor: "pointer",
                  transition: "background 0.2s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.18)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.10)" }}
                >
                  <Icon size={18} color={C.white} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          marginTop: "48px", padding: "20px 0", borderTop: "1px solid rgba(148,163,184,0.25)",
          textAlign: "center", fontSize: "13px", color: "rgba(191,219,254,0.8)",
        }}>
          © 2026 ImmoSmart — Monastir, Tunisie. Tous droits réservés.
        </div>
      </footer>

      {/* ─── Property Detail Modal ───────────────────────────────────────── */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isFavorite={selectedProperty ? favorites.includes(selectedProperty.id) : false}
        onToggleFavorite={toggleFavorite}
        onContact={() => { setSelectedProperty(null); onLogin() }}
      />
    </div>
  )
}
