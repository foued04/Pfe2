"use client"

import { useState, useMemo } from "react"
import { mockProperties } from "@/lib/property-data"
import type { Property } from "@/lib/property-data"
import { PropertyDetailsModal } from "@/components/property-details-modal"
import { Search, MapPin, Bed, Bath, Maximize, Home, Building2, Hotel, Castle } from "lucide-react"

// ─── Type labels ────────────────────────────────────────────────────────────
const typeLabels: Record<string, string> = {
  s0: "Studio",
  s1: "Appartement",
  s2: "Appartement",
  s3: "Appartement",
  s4: "Appartement",
  villa: "Villa",
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
  available: "Disponible",
  rented: "Loué",
  maintenance: "Maintenance",
}

const statusColors: Record<string, string> = {
  available: "#22c55e",
  rented: "#3b82f6",
  maintenance: "#f59e0b",
}

// ─── Property Card ───────────────────────────────────────────────────────────
function HomePropertyCard({
  property,
  onClick,
}: {
  property: Property
  onClick: () => void
}) {
  const bedroomLabel = property.bedrooms === 0 ? "1 ch." : `${property.bedrooms} ch.`

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        cursor: "pointer",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.14)"
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", width: "100%", paddingTop: "66%" }}>
        <img
          src={property.images.cover}
          alt={property.title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Status badge */}
        <span
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: statusColors[property.status],
            color: "#fff",
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "20px",
          }}
        >
          {statusLabels[property.status]}
        </span>
        {/* Price badge */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "10px",
            background: "rgba(0,0,0,0.72)",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: "8px",
            backdropFilter: "blur(4px)",
          }}
        >
          {property.rent.toLocaleString("fr-TN")} TND
          <span style={{ fontWeight: 400, fontSize: "12px", marginLeft: "3px" }}>/mois</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "14px 16px 16px" }}>
        <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1a1a2e", lineHeight: 1.3 }}>
          {property.title}
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "5px", color: "#6b7280", fontSize: "12px" }}>
          <MapPin size={12} color="#f59e0b" />
          <span>{property.address}</span>
        </div>
        <p
          style={{
            margin: "8px 0",
            fontSize: "12px",
            color: "#6b7280",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {property.description}
        </p>
        <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "10px 0" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "12px", color: "#6b7280", fontSize: "12px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Maximize size={13} /> {property.surface} m²
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Bed size={13} /> {bedroomLabel}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
              <Bath size={13} /> {property.bathrooms} sdb
            </span>
          </div>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "#f59e0b",
              background: "#fff7ed",
              padding: "2px 9px",
              borderRadius: "20px",
              border: "1px solid #fed7aa",
            }}
          >
            {typeLabels[property.type]}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main HomePage ───────────────────────────────────────────────────────────
interface HomePageProps {
  onLogin: () => void
  onRegister: () => void
}

export function HomePage({ onLogin, onRegister }: HomePageProps) {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  const filtered = useMemo(() => {
    return mockProperties.filter((p) => {
      const matchSearch =
        search === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.city.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === "all" || p.type === typeFilter
      return matchSearch && matchType
    })
  }, [search, typeFilter])

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: "'Inter', sans-serif" }}>
      {/* ── Navbar ── */}
      <nav
        style={{
          background: "#4a5e3a",
          padding: "0 32px",
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#f59e0b",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Home size={18} color="#fff" />
          </div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px" }}>
            ImmoSmart
          </span>
        </div>

        {/* Nav Actions */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <button
            onClick={onLogin}
            style={{
              background: "transparent",
              border: "none",
              color: "#e5e7eb",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "8px 16px",
              borderRadius: "8px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            Connexion
          </button>
          <button
            onClick={onRegister}
            style={{
              background: "#f59e0b",
              border: "none",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              padding: "8px 20px",
              borderRadius: "8px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#d97706")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#f59e0b")}
          >
            S&apos;inscrire
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "48px 24px 32px" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(26px, 4vw, 38px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2 }}>
          Trouvez votre bien idéal à{" "}
          <span style={{ color: "#f59e0b" }}>Monastir</span>
        </h1>
        <p style={{ marginTop: "12px", color: "#6b7280", fontSize: "15px" }}>
          Consultez nos{" "}
          <span style={{ color: "#f59e0b", fontWeight: 500 }}>propriétés disponibles</span>
          {" "}: appartements, villas, studios
          <br />
          et locaux commerciaux
        </p>

        {/* ── Search bar ── */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            maxWidth: "680px",
            margin: "28px auto 0",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: "240px",
              position: "relative",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
              border: "1px solid #e5e7eb",
            }}
          >
            <Search
              size={16}
              color="#9ca3af"
              style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              placeholder="Rechercher par nom ou ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                padding: "12px 14px 12px 40px",
                fontSize: "14px",
                borderRadius: "10px",
                background: "transparent",
                color: "#1a1a2e",
                boxSizing: "border-box",
              }}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: "12px 16px",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              fontSize: "14px",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
              outline: "none",
              boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
            }}
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Properties Grid ── */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 24px 60px",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#6b7280" }}>
            <Building2 size={48} color="#d1d5db" style={{ marginBottom: "12px" }} />
            <p>Aucun bien trouvé pour votre recherche.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "24px",
            }}
          >
            {filtered.map((property) => (
              <HomePropertyCard
                key={property.id}
                property={property}
                onClick={() => setSelectedProperty(property)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
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
