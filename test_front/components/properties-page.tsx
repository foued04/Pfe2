"use client"

import { useMemo, useState } from "react"
import { Bath, Bed, Building2, Heart, MapPin, Maximize, Search } from "lucide-react"
import { type Property } from "@/lib/property-data"
import { PropertyDetailsModal } from "@/components/property-details-modal"
import { PublicFooter } from "@/components/public-footer"
import { PublicNavbar } from "@/components/public-navbar"
import { useProperties } from "@/hooks/api/use-properties"
import { useFavorites } from "@/hooks/api/use-favorites"
import { useAuth } from "@/lib/auth-context"

const typeOptions = [
  { value: "all", label: "Tous les types" },
  { value: "s0", label: "Studio" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

const statusColors: Record<string, string> = {
  available: "#2563eb",
  rented: "#0f766e",
  maintenance: "#f59e0b",
}

const statusLabels: Record<string, string> = {
  available: "Disponible",
  rented: "Loue",
  maintenance: "Maintenance",
}

export function PropertiesPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const { properties, isLoading, error } = useProperties()
  const { isAuthenticated, role } = useAuth()
  const { favoriteIds, toggleFavorite } = useFavorites()

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const haystack = `${property.title} ${property.city} ${property.address}`.toLowerCase()
      const matchesSearch = !search || haystack.includes(search.toLowerCase())
      const matchesType = typeFilter === "all" || property.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [properties, search, typeFilter])

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 55%, #ffffff 100%)", color: "#0f172a" }}>
      <PublicNavbar />

      <main style={{ maxWidth: "1240px", margin: "0 auto", padding: "48px 24px 0" }}>
        <section style={{ marginBottom: "40px" }}>
          <span style={{ display: "inline-block", background: "rgba(29, 78, 216, 0.1)", color: "#1d4ed8", padding: "8px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Catalogue prive
          </span>
          <h1 style={{ margin: "18px 0 10px", fontSize: "clamp(34px, 6vw, 56px)", lineHeight: 1.02 }}>
            Toutes les proprietes dans une vraie page dediee
          </h1>
          <p style={{ margin: 0, maxWidth: "760px", color: "#475569", fontSize: "18px", lineHeight: 1.7 }}>
            Cette page remplace le simple scroll de la page d'accueil. Chaque clic sur la navbar ouvre maintenant une route complete.
          </p>
        </section>

        <section
          style={{
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
            padding: "20px",
            borderRadius: "24px",
            background: "rgba(255, 255, 255, 0.88)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            boxShadow: "0 24px 50px rgba(148, 163, 184, 0.12)",
          }}
        >
          <div style={{ flex: "1 1 280px", position: "relative" }}>
            <Search size={18} color="#64748b" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par titre, ville ou adresse"
              style={{
                width: "100%",
                borderRadius: "16px",
                border: "1px solid rgba(148, 163, 184, 0.24)",
                padding: "14px 16px 14px 44px",
                fontSize: "15px",
                background: "#fff",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            style={{
              flex: "0 0 190px",
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
        </section>

        <section style={{ marginTop: "36px" }}>
          {isLoading ? (
            <div style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>Chargement des proprietes...</div>
          ) : filteredProperties.length === 0 ? (
            <div style={{ padding: "80px 0", textAlign: "center", color: "#64748b" }}>
              <Building2 size={44} style={{ marginBottom: "14px" }} />
              <div>{error ? "Impossible de charger les proprietes approuvees." : "Aucune propriete ne correspond a cette recherche."}</div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {filteredProperties.map((property) => (
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
                    {isAuthenticated && role === "tenant" ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          void toggleFavorite(property.id)
                        }}
                        aria-label={favoriteIds.includes(property.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                        style={{
                          position: "absolute",
                          top: "14px",
                          right: "14px",
                          height: "40px",
                          width: "40px",
                          borderRadius: "999px",
                          border: "none",
                          display: "grid",
                          placeItems: "center",
                          background: favoriteIds.includes(property.id) ? "#2563eb" : "rgba(255,255,255,0.88)",
                          color: favoriteIds.includes(property.id) ? "#ffffff" : "#0f172a",
                          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.18)",
                          cursor: "pointer",
                        }}
                      >
                        <Heart size={18} fill={favoriteIds.includes(property.id) ? "currentColor" : "none"} />
                      </button>
                    ) : null}
                    <span style={{ position: "absolute", bottom: "14px", left: "14px", background: "rgba(15, 23, 42, 0.72)", color: "#fff", borderRadius: "12px", padding: "8px 12px", fontWeight: 800 }}>
                      {property.rent.toLocaleString("fr-TN")} DT / mois
                    </span>
                  </div>

                  <div style={{ padding: "18px" }}>
                    <h2 style={{ margin: 0, fontSize: "18px", lineHeight: 1.35 }}>{property.title}</h2>
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
              ))}
            </div>
          )}
        </section>
      </main>

      <PublicFooter />

      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        isFavorite={selectedProperty ? favoriteIds.includes(selectedProperty.id) : false}
        onToggleFavorite={toggleFavorite}
        onContact={() => setSelectedProperty(null)}
      />
    </div>
  )
}
