import { IonContent, IonIcon, IonLabel, IonPage } from "@ionic/react"
import { chevronDownOutline, chevronUpOutline, homeOutline, mapOutline, searchOutline } from "ionicons/icons"
import L, { Icon } from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useMemo, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"
import PropertyCard from "../components/PropertyCard"
import SectionHeader from "../components/SectionHeader"
import { TUNISIA_GOVERNORATES } from "../data/tunisia-locations"
import { useAuth } from "../lib/auth-context"
import { fetchProperties } from "../lib/property-api"
import type { BackendProperty } from "../types/api"
import "./Tab2.css"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

const createIcon = (color: string) =>
  new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><circle cx="12" cy="10" r="3"/><path d="M12 1C6.48 1 2 5.48 2 11c0 5.25 3.07 9.8 7.5 12 .5.25 1 .5 1.5 .5s1-.25 1.5-.5c4.43-2.2 7.5-6.75 7.5-12 0-5.52-4.48-10-10-10z"/></svg>`
    )}`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -35],
  })

const statusColors: Record<string, string> = {
  available: "#22c55e",
  rented: "#3b82f6",
  maintenance: "#eab308",
}

const statusLabels: Record<string, string> = {
  available: "Disponible",
  rented: "Loue",
  maintenance: "Maintenance",
}

const typeOptions = ["all", "s0", "s1", "s2", "s3", "s4", "villa"] as const
const viewOptions = [
  { value: "list", label: "Liste", icon: searchOutline },
  { value: "map", label: "Carte", icon: mapOutline },
] as const

type MappableProperty = BackendProperty & { lat: number; lng: number }

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()

const includesNormalized = (value: string, target: string) =>
  normalizeText(value).includes(normalizeText(target))

const Tab2: React.FC = () => {
  const history = useHistory()
  const { token, isAuthenticated, user } = useAuth()
  const location = useLocation()
  const [properties, setProperties] = useState<BackendProperty[]>([])
  const [search, setSearch] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [typeFilter, setTypeFilter] = useState<(typeof typeOptions)[number]>("all")
  const [selectedGovernorate, setSelectedGovernorate] = useState("")
  const [selectedDelegation, setSelectedDelegation] = useState("")
  const [isGovernoratesOpen, setIsGovernoratesOpen] = useState(false)
  const [isDelegationsOpen, setIsDelegationsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<(typeof viewOptions)[number]["value"]>("list")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const catalogToken = user?.role === "owner" ? undefined : token || undefined

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const requestedView = searchParams.get("view")
    setViewMode(requestedView === "map" ? "map" : "list")
  }, [location.search])

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        setError("")
        const data = await fetchProperties(catalogToken)
        if (!active) return

        const visibleProperties = (Array.isArray(data) ? data : []).filter(
          (property) => property.moderationStatus === "approved" && property.status === "available"
        )
        setProperties(visibleProperties)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Erreur chargement proprietes")
      } finally {
        if (!active) return
        setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [catalogToken])

  const delegationOptions = useMemo(() => {
    const selected = TUNISIA_GOVERNORATES.find((governorate) => governorate.name === selectedGovernorate)
    return selected ? [...selected.delegations].sort((a, b) => a.localeCompare(b)) : []
  }, [selectedGovernorate])

  useEffect(() => {
    if (!delegationOptions.includes(selectedDelegation)) {
      setSelectedDelegation("")
    }
  }, [delegationOptions, selectedDelegation])

  useEffect(() => {
    if (!selectedGovernorate) {
      setIsDelegationsOpen(false)
    }
  }, [selectedGovernorate])

  const filtered = useMemo(
    () =>
      properties.filter((property) => {
        const titleText = property.title || ""
        const locationText = `${property.city || ""} ${property.address || ""}`
        const propertyPrice = Number(property.rent) || 0
        const minPriceValue = Number(minPrice)
        const maxPriceValue = Number(maxPrice)

        const matchSearch = search.trim() === "" || includesNormalized(titleText, search)
        const matchType = typeFilter === "all" || property.type === typeFilter
        const matchGovernorate =
          selectedGovernorate === "" || includesNormalized(locationText, selectedGovernorate)
        const matchDelegation =
          selectedDelegation === "" || includesNormalized(locationText, selectedDelegation)
        const matchMinPrice = minPrice.trim() === "" || (!Number.isNaN(minPriceValue) && propertyPrice >= minPriceValue)
        const matchMaxPrice = maxPrice.trim() === "" || (!Number.isNaN(maxPriceValue) && propertyPrice <= maxPriceValue)

        return (
          matchSearch &&
          matchType &&
          matchGovernorate &&
          matchDelegation &&
          matchMinPrice &&
          matchMaxPrice
        )
      }),
    [maxPrice, minPrice, properties, search, selectedDelegation, selectedGovernorate, typeFilter]
  )

  const mappableProperties = useMemo(
    () =>
      filtered.filter(
        (property): property is MappableProperty =>
          typeof property.lat === "number" &&
          typeof property.lng === "number" &&
          !Number.isNaN(property.lat) &&
          !Number.isNaN(property.lng)
      ),
    [filtered]
  )

  const canRequestRental = isAuthenticated && user?.role === "tenant"
  const isOwnerBrowsingCatalog = user?.role === "owner"
  const hasActiveFilters =
    search.trim() !== "" ||
    minPrice.trim() !== "" ||
    maxPrice.trim() !== "" ||
    typeFilter !== "all" ||
    selectedGovernorate !== "" ||
    selectedDelegation !== ""

  const resetFilters = () => {
    setSearch("")
    setMinPrice("")
    setMaxPrice("")
    setTypeFilter("all")
    setSelectedGovernorate("")
    setSelectedDelegation("")
    setIsGovernoratesOpen(false)
    setIsDelegationsOpen(false)
  }

  const governoratesSummary =
    selectedGovernorate === ""
      ? "Choisir les gouvernorats"
      : selectedGovernorate
  const delegationsSummary =
    selectedDelegation === ""
      ? "Choisir les delegations"
      : selectedDelegation

  const openPropertyDetails = (propertyId: string) => {
    history.push(`/property/${propertyId}`)
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page tab2-page">
          <SectionHeader
            badge="Catalogue"
            title="Recherche de biens"
            subtitle={
              isOwnerBrowsingCatalog
                ? "Consultez tous les biens approuves et disponibles de l'application, comme sur la version web."
                : "Consultez les biens approuves et disponibles avec la meme API que le catalogue existant."
            }
          />

          <div className="tab2-toolbar">
            {viewOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`tab2-view-toggle ${viewMode === option.value ? "active" : ""}`}
                onClick={() => setViewMode(option.value)}
              >
                <IonIcon icon={option.icon} />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          <div className="tab2-filters-card">
            <div className="search-input tab2-search-input">
              <IonIcon icon={searchOutline} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher par titre ou nom du bien"
              />
            </div>

            <div className="tab2-filters-grid">
              <div className="tab2-filter-field">
                <span>Prix min (TND)</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={minPrice}
                  onChange={(event) => setMinPrice(event.target.value)}
                  placeholder="Ex: 600"
                />
              </div>

              <div className="tab2-filter-field">
                <span>Prix max (TND)</span>
                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={maxPrice}
                  onChange={(event) => setMaxPrice(event.target.value)}
                  placeholder="Ex: 1200"
                />
              </div>

              <label className="tab2-filter-field">
                <span>Type</span>
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as (typeof typeOptions)[number])}>
                  <option value="all">Tous les types</option>
                  {typeOptions
                    .filter((type) => type !== "all")
                    .map((type) => (
                      <option key={type} value={type}>
                        {type.toUpperCase()}
                      </option>
                    ))}
                </select>
              </label>

              <div className="tab2-filter-field tab2-filter-field-full">
                <span>Gouvernorats</span>
                <button
                  type="button"
                  className={`tab2-collapse-trigger ${isGovernoratesOpen ? "active" : ""}`}
                  onClick={() => setIsGovernoratesOpen((current) => !current)}
                >
                  <span>{governoratesSummary}</span>
                  <IonIcon icon={isGovernoratesOpen ? chevronUpOutline : chevronDownOutline} />
                </button>
                {isGovernoratesOpen ? (
                  <div className="tab2-checkbox-list">
                    {TUNISIA_GOVERNORATES.map((governorate) => (
                      <label key={governorate.name} className="tab2-checkbox-item">
                        <input
                          type="radio"
                          name="governorate"
                          checked={selectedGovernorate === governorate.name}
                          onChange={() => {
                            setSelectedGovernorate(governorate.name)
                            setSelectedDelegation("")
                            setIsGovernoratesOpen(false)
                            setIsDelegationsOpen(false)
                          }}
                        />
                        <span>{governorate.name}</span>
                      </label>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="tab2-filter-field tab2-filter-field-full">
                <span>Delegations</span>
                {selectedGovernorate === "" ? (
                  <div className="tab2-checkbox-empty">Selectionnez d'abord un gouvernorat.</div>
                ) : (
                  <>
                    <button
                      type="button"
                      className={`tab2-collapse-trigger ${isDelegationsOpen ? "active" : ""}`}
                      onClick={() => setIsDelegationsOpen((current) => !current)}
                    >
                      <span>{delegationsSummary}</span>
                      <IonIcon icon={isDelegationsOpen ? chevronUpOutline : chevronDownOutline} />
                    </button>
                    {isDelegationsOpen ? (
                      <div className="tab2-checkbox-list">
                        {delegationOptions.map((delegation) => (
                          <label key={delegation} className="tab2-checkbox-item">
                            <input
                              type="radio"
                              name="delegation"
                              checked={selectedDelegation === delegation}
                              onChange={() => {
                                setSelectedDelegation(delegation)
                                setIsDelegationsOpen(false)
                              }}
                            />
                            <span>{delegation}</span>
                          </label>
                        ))}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            </div>

            <div className="tab2-filters-footer">
              <p>{filtered.length} bien(s) disponible(s)</p>
              {hasActiveFilters ? (
                <button type="button" className="tab2-clear-btn" onClick={resetFilters}>
                  Reinitialiser
                </button>
              ) : null}
            </div>
          </div>

          {viewMode === "list" ? (
            loading ? (
              <LoadingSpinner message="Chargement des biens disponibles..." />
            ) : error ? (
              <EmptyState icon={homeOutline} title="Impossible de charger les biens" message={error} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={searchOutline}
                title="Aucun resultat"
                message="Aucun bien disponible ne correspond a vos filtres actuels."
                actionLabel={hasActiveFilters ? "Effacer les filtres" : undefined}
                onAction={hasActiveFilters ? resetFilters : undefined}
              />
            ) : (
              <div className="property-list tab2-property-list">
                {filtered.map((property) => (
                  <PropertyCard key={property._id} property={property} />
                ))}
              </div>
            )
          ) : (
            <>
              <div className="tab2-map-heading">
                <IonIcon icon={mapOutline} />
                <IonLabel>Carte des biens disponibles</IonLabel>
              </div>

              {!canRequestRental && !isOwnerBrowsingCatalog ? (
                <EmptyState
                  icon={homeOutline}
                  title="Connexion locataire requise"
                  message="Connectez-vous avec un compte locataire pour envoyer une demande depuis la fiche d'un bien."
                />
              ) : null}

              {loading ? (
                <LoadingSpinner message="Chargement de la carte..." />
              ) : error ? (
                <EmptyState icon={homeOutline} title="Carte indisponible" message={error} />
              ) : mappableProperties.length === 0 ? (
                <EmptyState
                  icon={mapOutline}
                  title="Aucune position disponible"
                  message="Les biens filtres n'ont pas encore de position cartographique exploitable."
                />
              ) : (
                <div className="tab2-map-shell">
                  <MapContainer
                    center={[35.7768, 10.8108]}
                    zoom={12}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {mappableProperties.map((property) => (
                      <Marker
                        key={property._id}
                        position={[property.lat, property.lng]}
                        icon={createIcon(statusColors[property.status || "available"] || "#22c55e")}
                      >
                        <Popup maxWidth={300}>
                          <div className="tab2-map-popup">
                            <h3>{property.title}</h3>
                            <p>{property.address || property.city || "Adresse non specifiee"}</p>
                            <div className="tab2-map-popup-chips">
                              <span>{property.type.toUpperCase()}</span>
                              {property.bedrooms > 0 ? <span>{property.bedrooms} ch.</span> : null}
                              <span>{statusLabels[property.status] || property.status}</span>
                            </div>
                            <strong>{property.rent.toLocaleString("fr-TN")} TND / mois</strong>
                            <div className="tab2-map-popup-meta">
                              <span>{property.surface} m2</span>
                              {property.parking ? <span>Parking</span> : null}
                              {property.meuble ? <span>Meuble</span> : null}
                            </div>
                            <button
                              type="button"
                              className="tab2-map-popup-btn"
                              onClick={() => openPropertyDetails(property._id)}
                            >
                              Voir details
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Tab2
