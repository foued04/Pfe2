import { IonChip, IonContent, IonIcon, IonPage, IonLabel } from "@ionic/react"
import { searchOutline, optionsOutline, mapOutline } from "ionicons/icons"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L, { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useMemo, useState } from "react"
import PropertyCard from "../components/PropertyCard"
import SectionHeader from "../components/SectionHeader"
import { useAuth } from "../lib/auth-context"
import { fetchProperties } from "../lib/property-api"
import type { BackendProperty } from "../types/api"
import "./Tab2.css"

// Fix leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

// Create custom marker icon with color
const createIcon = (color: string) => {
  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 1C6.48 1 2 5.48 2 11c0 5.25 3.07 9.8 7.5 12 .5.25 1 .5 1.5 .5s1-.25 1.5-.5c4.43-2.2 7.5-6.75 7.5-12 0-5.52-4.48-10-10-10z"/></svg>`
    )}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  })
}

const statusColors: Record<string, string> = {
  available: "#22c55e",
  rented: "#3b82f6",
  maintenance: "#eab308",
}

const typeOptions = ["all", "s0", "s1", "s2", "s3", "s4", "villa"] as const

const Tab2: React.FC = () => {
  const { token, isAuthenticated } = useAuth()
  
  const [properties, setProperties] = useState<BackendProperty[]>([])
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<(typeof typeOptions)[number]>("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) {
      setProperties([])
      setLoading(false)
      return
    }

    let active = true

    const load = async () => {
      setLoading(true)
      try {
        setError("")
        const data = await fetchProperties(token)
        if (active) {
          setProperties(data)
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Erreur chargement proprietes")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [token])

  const filtered = useMemo(() => {
    return properties.filter((property) => {
      const text = `${property.title} ${property.city} ${property.address}`.toLowerCase()
      const matchSearch = search.trim() === "" || text.includes(search.toLowerCase())
      const matchType = typeFilter === "all" || property.type === typeFilter
      return matchSearch && matchType
    })
  }, [properties, search, typeFilter])

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <SectionHeader
                badge="Catalogue"
                title="Proprietes"
                subtitle="Donnees en direct depuis le meme backend que la version web."
              />

              <div className="search-input">
                <IonIcon icon={searchOutline} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher par titre, ville ou adresse"
                />
              </div>

              <div className="chips-row">
                {typeOptions.map((type) => (
                  <IonChip
                    key={type}
                    color={typeFilter === type ? "primary" : "light"}
                    onClick={() => setTypeFilter(type)}
                    className="filter-chip"
                  >
                    {type === "all" ? <IonIcon icon={optionsOutline} /> : null}
                    <span>{type === "all" ? "Tous" : type.toUpperCase()}</span>
                  </IonChip>
                ))}
              </div>
          <div style={{ padding: "16px 16px 8px", display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brand-text)', fontWeight: 700 }}>
            <IonIcon icon={mapOutline} />
            <IonLabel>Carte</IonLabel>
          </div>

          {!isAuthenticated ? (
            <div className="empty-state">
              <p>Authentifiez-vous dans Compte pour acceder au catalogue backend.</p>
            </div>
          ) : loading ? (
            <div className="empty-state">
              <p>Chargement des proprietes...</p>
            </div>
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div style={{ height: "calc(100vh - 160px)", margin: "0 16px 16px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--brand-border)" }}>
                <MapContainer
                  center={[35.7768, 10.8108]}
                  zoom={12}
                  scrollWheelZoom={true}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  {filtered.filter(p => p.lat && p.lng && !isNaN(p.lat) && !isNaN(p.lng)).map((property) => (
                    <Marker
                      key={property._id}
                      position={[property.lat as number, property.lng as number]}
                      icon={createIcon(statusColors[property.status || "available"] || "#22c55e")}
                    >
                      <Popup maxWidth={300}>
                        <div className="p-3 space-y-2" style={{ fontFamily: 'inherit' }}>
                          <h3 style={{ fontWeight: 'bold', fontSize: '14px', margin: '0 0 8px' }}>{property.title}</h3>
                          <p style={{ fontSize: '12px', color: '#4b5563', margin: '0 0 8px' }}>📍 {property.address}</p>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginRight: '6px' }}>{property.type.toUpperCase()}</span>
                            {property.bedrooms > 0 && <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>🛏️ {property.bedrooms} ch.</span>}
                          </div>
                          <p style={{ fontWeight: 'bold', fontSize: '14px', color: '#16a34a', margin: '0 0 8px' }}>{property.rent} TND / mois</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Tab2
