import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  addOutline,
  bedOutline,
  businessOutline,
  carOutline,
  chatbubblesOutline,
  closeOutline,
  documentTextOutline,
  ellipsisVerticalOutline,
  eyeOutline,
  homeOutline,
  locationOutline,
  mapOutline,
  menuOutline,
  notificationsOutline,
  pencilOutline,
  personCircleOutline,
  searchOutline,
  settingsOutline,
  statsChartOutline,
  trashOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import { useAuth } from "../lib/auth-context"
import { useI18n } from "../lib/i18n"
import { http } from "../lib/api"
import { fetchUnreadMessagesCount } from "../lib/messages-api"
import { deleteProperty, fetchOwnerDashboardProperties } from "../lib/property-api"
import type { BackendProperty, BackendRentalRequest } from "../types/api"
import "./OwnerDashboard.css"

type OwnerSection = "overview" | "properties" | "map"

type DashboardStats = {
  total: number
  available: number
  rented: number
  revenue: number
  requestCount: number
}

type NavItem =
  | { key: string; labelKey: string; icon: string; type: "section"; section: OwnerSection }
  | { key: string; labelKey: string; icon: string; type: "route"; href: string }

type MappableProperty = BackendProperty & { lat: number; lng: number }

const statusTone: Record<string, string> = {
  available: "success",
  rented: "neutral",
  maintenance: "warning",
}

const ownerNavItems: NavItem[] = [
  { key: "overview", labelKey: "nav.dashboard", icon: homeOutline, type: "section", section: "overview" },
  { key: "properties", labelKey: "nav.myProperties", icon: businessOutline, type: "section", section: "properties" },
  { key: "add-property", labelKey: "nav.addProperty", icon: addOutline, type: "route", href: "/property-form" },
  { key: "map", labelKey: "nav.map", icon: mapOutline, type: "section", section: "map" },
  { key: "requests", labelKey: "nav.requests", icon: documentTextOutline, type: "route", href: "/rental-requests" },
  { key: "messages", labelKey: "nav.messages", icon: chatbubblesOutline, type: "route", href: "/messages" },
  { key: "notifications", labelKey: "nav.notifications", icon: notificationsOutline, type: "route", href: "/notifications" },
  { key: "furniture", labelKey: "nav.furniture", icon: bedOutline, type: "route", href: "/furniture" },
]

const getSectionFromSearch = (search: string): OwnerSection => {
  const section = new URLSearchParams(search).get("section")
  if (section === "overview" || section === "properties" || section === "map") return section
  return "properties"
}

// Simple global cache to allow instant transitions between tabs
let mobileGlobalCache: {
  properties: BackendProperty[];
  requests: BackendRentalRequest[];
  notificationsCount: number;
  messagesCount: number;
  timestamp: number;
} | null = null;

const OwnerDashboard: React.FC = () => {
  const { t } = useI18n()
  const history = useHistory()
  const location = useLocation()
  const { token, user } = useAuth()
  const [properties, setProperties] = useState<BackendProperty[]>(() => mobileGlobalCache?.properties || [])
  const [requestCount, setRequestCount] = useState(() => {
    if (!mobileGlobalCache) return 0
    return mobileGlobalCache.requests.filter((r) => r.status === "En attente").length
  })
  const [unreadNotifications, setUnreadNotifications] = useState(() => mobileGlobalCache?.notificationsCount || 0)
  const [unreadMessages, setUnreadMessages] = useState(() => mobileGlobalCache?.messagesCount || 0)
  const [loading, setLoading] = useState(!mobileGlobalCache)
  const [error, setError] = useState("")
  const [openActionsFor, setOpenActionsFor] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const currentOwnerId = user?.id || ""

  const statusLabels: Record<string, string> = {
    available: t("status.available"),
    rented: t("status.rented"),
    maintenance: t("status.maintenance"),
  }

  const activeSection = getSectionFromSearch(location.search)

  useEffect(() => {
    if (!token) return

    let active = true
    const loadDashboard = async () => {
      try {
        if (!mobileGlobalCache) {
          setLoading(true)
        }
        
        const [propertiesData, requestsData, notificationsData, messagesCountData] = await Promise.all([
          fetchOwnerDashboardProperties(token),
          http.get<BackendRentalRequest[]>("/rental-requests", token),
          http.get<{ count: number }>("/notifications/unread-count", token),
          fetchUnreadMessagesCount(token),
        ])

        if (!active) return

        // Update global cache
        mobileGlobalCache = {
          properties: propertiesData,
          requests: requestsData,
          notificationsCount: Number(notificationsData?.count || 0),
          messagesCount: Number(messagesCountData?.count || 0),
          timestamp: Date.now()
        }

        const requests = Array.isArray(requestsData) ? requestsData : []
        const rentedPropertyIds = new Set(
          requests
            .filter((request) => request.status === "Contrat actif")
            .map((request) => {
              if (typeof request.property === "string") return request.property
              return request.property?._id || ""
            })
            .filter(Boolean)
            .map(String),
        )

        const normalizedProperties = (Array.isArray(propertiesData) ? propertiesData : []).map((property) =>
          rentedPropertyIds.has(String(property._id)) ? { ...property, status: "rented" as const } : property,
        )

        setProperties(normalizedProperties)
        setRequestCount(requests.filter((request) => request.status === "En attente").length)
        setUnreadNotifications(Number(notificationsData?.count || 0))
        setUnreadMessages(Number(messagesCountData?.count || 0))
        setError("")
      } catch (err) {
        if (!active) return
        if (mobileGlobalCache) {
          console.warn("Background mobile refresh failed:", err)
        } else {
          setError(err instanceof Error ? err.message : t("general.error"))
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    const interval = window.setInterval(loadDashboard, 30000)

    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [token, t])


  const stats = useMemo<DashboardStats>(() => {
    const ownedProperties = properties.filter((property) => {
      const ownerId = typeof property.owner === "string" ? property.owner : property.owner?._id || ""
      return Boolean(ownerId && currentOwnerId && String(ownerId) === String(currentOwnerId))
    })

    const total = ownedProperties.length
    const available = ownedProperties.filter((property) => property.status === "available").length
    const rented = ownedProperties.filter((property) => property.status === "rented").length
    const revenue = ownedProperties
      .filter((property) => property.status === "rented")
      .reduce((sum, property) => sum + (property.rent || 0), 0)

    return { total, available, rented, revenue, requestCount }
  }, [currentOwnerId, properties, requestCount])

  const statsCards = [
    { label: t("dashboard.totalProperties"), value: stats.total, icon: businessOutline },
    { label: t("dashboard.pendingRequests"), value: stats.requestCount, icon: documentTextOutline },
    { label: t("dashboard.monthlyRevenue"), value: `${stats.revenue.toLocaleString("fr-TN")} TND`, icon: statsChartOutline },
    { label: t("dashboard.available"), value: stats.available, icon: homeOutline },
  ]

  const quickActions = [
    { label: t("dashboard.viewAllProperties"), action: () => changeSection("properties"), icon: businessOutline },
    { label: t("dashboard.reviewRequests"), action: () => history.push("/rental-requests"), icon: documentTextOutline },
    { label: t("dashboard.openMap"), action: () => changeSection("map"), icon: mapOutline },
    { label: t("general.manageFurniture"), action: () => history.push("/furniture"), icon: bedOutline },
    { label: t("nav.messages"), action: () => history.push("/messages"), icon: chatbubblesOutline },
  ]

  const myProperties = useMemo(() => {
    return properties.filter((property) => {
      const ownerId = typeof property.owner === "string" ? property.owner : property.owner?._id || ""
      return Boolean(ownerId && currentOwnerId && String(ownerId) === String(currentOwnerId))
    })
  }, [currentOwnerId, properties])

  const previewProperties = useMemo(() => myProperties.slice(0, 3), [myProperties])


  const mappableProperties = useMemo(
    () =>
      properties.map((property) => {
        const hasLat = typeof property.lat === "number" && !Number.isNaN(property.lat)
        const hasLng = typeof property.lng === "number" && !Number.isNaN(property.lng)

        if (hasLat && hasLng) {
          return property as MappableProperty
        }

        // Fallback to Monastir center with slight random offset to avoid overlapping
        const seed = property._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const offsetLat = ((seed % 100) - 50) / 5000
        const offsetLng = (((seed * 1.5) % 100) - 50) / 5000

        return {
          ...property,
          lat: 35.7768 + offsetLat,
          lng: 10.8108 + offsetLng
        } as MappableProperty
      }),
    [properties],
  )

  const changeSection = (section: OwnerSection) => {
    history.replace({ pathname: "/tab3", search: `?section=${section}` })
    setSidebarOpen(false)
  }

  const handleNavClick = (item: NavItem) => {
    setOpenActionsFor(null)
    if (item.type === "section") {
      changeSection(item.section)
      return
    }
    setSidebarOpen(false)
    history.push(item.href)
  }

  const handleDelete = async (propertyId: string) => {
    if (!token) return
    if (!window.confirm(t("general.deleteProperty") + " ?")) return

    try {
      await deleteProperty(propertyId, token)
      setProperties((current) => current.filter((property) => property._id !== propertyId))
      setOpenActionsFor(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete property failed")
    }
  }

  const displayName = user?.name || user?.firstName || t("role.owner")
  const activeTitle =
    activeSection === "properties" ? t("general.allProperties") : activeSection === "map" ? t("nav.map") : t("dashboard.owner")

  const isOwnedByCurrentUser = (property: BackendProperty) => {
    const ownerId = typeof property.owner === "string" ? property.owner : property.owner?._id || ""
    return Boolean(ownerId && currentOwnerId && String(ownerId) === String(currentOwnerId))
  }

  const renderPropertyCard = (property: BackendProperty) => {
    const isMenuOpen = openActionsFor === property._id
    const displayImage = property.images?.cover
    const statusLabel = statusLabels[property.status] || property.status || t("status.available")
    const locationLabel = [property.city, property.address].filter(Boolean).join(" - ") || "Adresse non specifiee"
    const propertyType = property.type ? property.type.toUpperCase() : "BIEN"
    const isFurnished = Boolean(property.meuble || property.furnishing?.type)
    const ownerName = property.ownerName || (typeof property.owner === "object" && property.owner !== null ? property.owner.fullName : "") || t("role.owner")
    const ownerPhone = property.ownerPhone || (typeof property.owner === "object" && property.owner !== null ? property.owner.phone : "") || ""
    const ownerEmail = property.ownerEmail || (typeof property.owner === "object" && property.owner !== null ? property.owner.email : "") || ""
    const isOwnProperty = isOwnedByCurrentUser(property)

    return (
      <article key={property._id} className="owner-property-card">
        <div className="owner-property-media">
          {displayImage ? <img src={displayImage} alt={property.title} /> : <div className="owner-property-placeholder">ImmoSmart</div>}

          <div className="owner-property-overlay">
            <div className="owner-property-badges">
              <span className={`owner-property-badge ${statusTone[property.status] || "neutral"}`}>{statusLabel}</span>
              <span className={`owner-property-badge ${isOwnProperty ? "ownership-self" : "ownership-other"}`}>
                {isOwnProperty ? t("status.myProperty") : t("status.otherOwner")}
              </span>
              {isFurnished ? <span className="owner-property-badge furnished">{t("status.furnished")}</span> : null}
            </div>
            <div className="owner-property-menu">
              <button type="button" className="owner-icon-btn floating" onClick={() => setOpenActionsFor(isMenuOpen ? null : property._id)}>
                <IonIcon icon={ellipsisVerticalOutline} />
              </button>

              {isMenuOpen ? (
                <div className="owner-dropdown-menu">
                  <button type="button" onClick={() => history.push(`/property/${property._id}`)}>
                    <IonIcon icon={eyeOutline} />
                    {t("general.viewDetails")}
                  </button>
                  {isOwnProperty ? (
                    <>
                      <button type="button" onClick={() => history.push(`/property-form/${property._id}`)}>
                        <IonIcon icon={pencilOutline} />
                        {t("general.modify")}
                      </button>
                      <button type="button" onClick={() => history.push(`/furniture?property=${property._id}`)}>
                        <IonIcon icon={bedOutline} />
                        {t("general.manageFurniture")}
                      </button>
                      <button type="button" className="danger" onClick={() => handleDelete(property._id)}>
                        <IonIcon icon={trashOutline} />
                        {t("general.deleteProperty")}
                      </button>
                    </>
                  ) : (
                    <button type="button" className="readonly">
                      <IonIcon icon={businessOutline} />
                      {t("general.readonly")}
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="owner-property-price">
            <strong>{property.rent?.toLocaleString("fr-TN") || 0} TND</strong>
            <span>/mois</span>
          </div>
        </div>

        <div className="owner-property-body">
          <div>
            <h3>{property.title || "Sans Titre"}</h3>
            <div className="owner-property-location">
              <IonIcon icon={locationOutline} />
              <span>{locationLabel}</span>
            </div>
          </div>
          <div className="owner-property-inline">
            <span className="owner-property-type">{propertyType}</span>
            {property.deposit ? <span className="owner-property-deposit">{t("status.depot")} {property.deposit.toLocaleString("fr-TN")} TND</span> : null}
          </div>
          <div className="owner-property-owner">
            <span>{ownerName}</span>
            {ownerPhone ? <span>{ownerPhone}</span> : null}
            {ownerEmail ? <span className="owner-email">{ownerEmail}</span> : null}
          </div>
          <div className="owner-property-meta">
            <span>{property.surface || 0} m2</span>
            <span>{property.bedrooms || 0} ch.</span>
            <span>{property.bathrooms || 0} sdb</span>
            {property.parking ? (
              <span>
                <IonIcon icon={carOutline} />
                Parking
              </span>
            ) : null}
          </div>
          <div className="owner-property-actions">
            <button type="button" className="owner-outline-btn compact" onClick={() => history.push(`/property/${property._id}`)}>
              <IonIcon icon={eyeOutline} />
              {t("general.viewDetails")}
            </button>
            {isOwnProperty ? (
              <button type="button" className="owner-outline-btn compact" onClick={() => history.push(`/property-form/${property._id}`)}>
                <IonIcon icon={pencilOutline} />
                {t("general.modify")}
              </button>
            ) : null}
          </div>
          {!isOwnProperty ? <div className="owner-readonly-note">Ce bien appartient a un autre locateur. Visible uniquement.</div> : null}
        </div>
      </article>
    )
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content owner-dashboard-page">
        <div className="owner-dashboard-shell">
          <aside className={`owner-sidebar ${sidebarOpen ? "open" : ""}`}>
            <div className="owner-sidebar-header">
              <div>
                <div className="owner-sidebar-brand">ImmoSmart</div>
                <p>Espace Locateur</p>
              </div>
              <button type="button" className="owner-icon-btn mobile-only" onClick={() => setSidebarOpen(false)}>
                <IonIcon icon={closeOutline} />
              </button>
            </div>

            <nav className="owner-sidebar-nav">
              {ownerNavItems.map((item) => {
                const isActive = item.type === "section" ? item.section === activeSection : false
                return (
                  <button
                    key={item.key}
                    type="button"
                    className={`owner-sidebar-link ${isActive ? "active" : ""}`}
                    onClick={() => handleNavClick(item)}
                  >
                    <IonIcon icon={item.icon} />
                    <span>{t(item.labelKey)}</span>
                    {item.key === "requests" && requestCount > 0 ? <strong>{requestCount > 99 ? "99+" : requestCount}</strong> : null}
                    {item.key === "messages" && unreadMessages > 0 ? <strong>{unreadMessages > 99 ? "99+" : unreadMessages}</strong> : null}
                    {item.key === "notifications" && unreadNotifications > 0 ? <strong>{unreadNotifications > 99 ? "99+" : unreadNotifications}</strong> : null}
                  </button>
                )
              })}
            </nav>

            <div className="owner-sidebar-footer">
              <button type="button" className="owner-sidebar-link" onClick={() => history.push("/profile")}>
                <IonIcon icon={settingsOutline} />
                <span>{t("general.settings")}</span>
              </button>
            </div>
          </aside>

          {sidebarOpen ? <button type="button" className="owner-sidebar-backdrop" onClick={() => setSidebarOpen(false)} /> : null}

          <div className="owner-main">
            <header className="owner-topbar">
              <div className="owner-topbar-title">
                <button type="button" className="owner-icon-btn mobile-only" onClick={() => setSidebarOpen(true)}>
                  <IonIcon icon={menuOutline} />
                </button>
                <div>
                  <div className="owner-eyebrow">{t("dashboard.eyebrow")}</div>
                  <h1>{activeTitle}</h1>
                </div>
              </div>

              <div className="owner-topbar-actions">
                <button type="button" className="owner-pill-btn" onClick={() => history.push("/rental-requests")}>
                  <IonIcon icon={documentTextOutline} />
                  <span>{t("nav.requests")}</span>
                  {requestCount > 0 ? <strong>{requestCount > 99 ? "99+" : requestCount}</strong> : null}
                </button>
                <button type="button" className="owner-pill-btn" onClick={() => history.push("/notifications")}>
                  <IonIcon icon={notificationsOutline} />
                  <span>{t("nav.notifications")}</span>
                  {unreadNotifications > 0 ? <strong>{unreadNotifications > 99 ? "99+" : unreadNotifications}</strong> : null}
                </button>
                <button type="button" className="owner-profile-btn" onClick={() => history.push("/profile")}>
                  <IonIcon icon={personCircleOutline} />
                  <span>{displayName}</span>
                </button>
              </div>
            </header>

            <main className="owner-main-content">
              <section className="owner-page-header">
                <div>
                  <div className="owner-eyebrow">{t("dashboard.ownerEyebrow")}</div>
                  <h2>{activeSection === "properties" ? t("general.allProperties") : activeSection === "map" ? t("nav.map") : t("dashboard.owner")}</h2>
                  <p>
                    {activeSection === "properties"
                      ? "Consultez toutes les proprietes de l'application. Vos biens restent modifiables, ceux des autres locateurs sont visibles en lecture seule."
                      : activeSection === "map"
                        ? "Visualisez l'ensemble des proprietes sur la carte et reperez rapidement vos propres biens."
                        : "Suivez vos indicateurs personnels, accedez a toutes les proprietes et gardez le controle sur vos demandes."}
                  </p>
                </div>
                <button type="button" className="owner-primary-btn" onClick={() => history.push("/property-form")}>
                  <IonIcon icon={addOutline} />
                  {t("nav.addProperty")}
                </button>
              </section>

              {activeSection === "overview" ? (
                <>
                  <section className="owner-stats-grid">
                    {statsCards.map((stat) => (
                      <article key={stat.label} className="owner-stat-card">
                        <div>
                          <p>{stat.label}</p>
                          <strong>{stat.value}</strong>
                        </div>
                        <span className="owner-stat-icon">
                          <IonIcon icon={stat.icon} />
                        </span>
                      </article>
                    ))}
                  </section>

                  {loading ? (
                    <div className="owner-panel muted">{t("general.loading")}</div>
                  ) : error ? (
                    <div className="owner-panel error">{error}</div>
                  ) : (
                    <div className="owner-overview-grid">
                      <section className="owner-panel">
                        <div className="owner-panel-actions">
                          {quickActions.map((item) => (
                            <button key={item.label} type="button" className="owner-outline-btn" onClick={item.action}>
                              <IonIcon icon={item.icon} />
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section className="owner-preview-section">
                        <div className="owner-section-copy">
                          <h3>{t("dashboard.myProperties")}</h3>
                          <p>Gérez vos biens immobiliers et suivez leur statut en temps réel.</p>
                        </div>

                        {previewProperties.length === 0 ? (
                          <div className="owner-panel muted">{t("dashboard.noProperties")}</div>
                        ) : (
                          <div className="owner-properties-grid">{previewProperties.map(renderPropertyCard)}</div>
                        )}
                      </section>
                    </div>
                  )}
                </>
              ) : null}

              {activeSection === "properties" ? (
                loading ? (
                  <div className="owner-panel muted">{t("general.loading")}</div>
                ) : error ? (
                  <div className="owner-panel error">{error}</div>
                ) : properties.length === 0 ? (
                  <div className="owner-panel muted">{t("dashboard.noProperties")}</div>
                ) : (
                  <section className="owner-properties-grid">{properties.map(renderPropertyCard)}</section>
                )
              ) : null}

              {activeSection === "map" ? (
                loading ? (
                  <div className="owner-panel muted">{t("general.loading")}</div>
                ) : error ? (
                  <div className="owner-panel error">{error}</div>
                ) : mappableProperties.length === 0 ? (
                  <div className="owner-panel muted">{t("map.noGeo")}</div>
                ) : (
                  <section className="owner-map-stack">
                    <div className="owner-map-card relative">
                      <MapContainer center={[35.7768, 10.8108]} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="&copy; OpenStreetMap contributors"
                        />
                        {mappableProperties.map((property) => (
                          <Marker key={property._id} position={[property.lat, property.lng]}>
                            <Popup>
                              <div className="owner-map-popup">
                                <div className="popup-ownership">
                                  {isOwnedByCurrentUser(property) ? t("status.myProperty") : t("status.otherOwner")}
                                </div>
                                <div className="popup-badge" style={{
                                  background: property.status === 'available' ? '#22c55e' : property.status === 'rented' ? '#3b82f6' : '#eab308',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: 'bold',
                                  display: 'inline-block',
                                  marginBottom: '5px'
                                }}>
                                  {statusLabels[property.status] || 'Propriété'}
                                </div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', fontWeight: 'bold' }}>{property.title}</h4>
                                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#666' }}>{property.address || property.city}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '8px' }}>
                                  <strong style={{ color: '#0066ff' }}>{property.rent?.toLocaleString("fr-TN")} TND</strong>
                                  <button
                                    onClick={() => history.push(`/property/${property._id}`)}
                                    style={{ background: '#f0f4ff', color: '#0066ff', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                                  >
                                    {t("general.details")}
                                  </button>
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>

                      {/* Legend like web version */}
                      <div className="map-legend-overlay">
                        <div className="legend-title">{t("map.legend")}</div>
                        <div className="legend-items">
                          <div className="legend-item">
                            <span className="dot available"></span>
                            <span>{t("status.available")}</span>
                          </div>
                          <div className="legend-item">
                            <span className="dot rented"></span>
                            <span>{t("status.rented")}</span>
                          </div>
                          <div className="legend-item">
                            <span className="dot maintenance"></span>
                            <span>{t("status.maintenance")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="owner-map-list">
                      <div className="list-header">
                        <h3>{t("map.listTitle")} ({mappableProperties.length})</h3>
                      </div>
                      <div className="list-scroll">
                        {mappableProperties.map((property) => (
                          <article
                            key={property._id}
                            className={`owner-map-item ${property.status}`}
                            onClick={() => history.push(`/property/${property._id}`)}
                          >
                            <div className="item-info">
                              <strong>{property.title}</strong>
                              <span className={`item-ownership ${isOwnedByCurrentUser(property) ? "self" : "other"}`}>
                                {isOwnedByCurrentUser(property) ? t("status.myProperty") : t("status.otherOwner")}
                              </span>
                              <p>{property.address || property.city || "Monastir"}</p>
                            </div>
                            <div className="item-price">
                              <span className="price">{property.rent?.toLocaleString("fr-TN")} TND</span>
                              <span className={`status-tag ${property.status}`}>
                                {statusLabels[property.status]}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  </section>
                )
              ) : null}

              <section className="owner-shortcuts-row">
                <button type="button" className="owner-shortcut-card" onClick={() => history.push("/messages")}>
                  <IonIcon icon={chatbubblesOutline} />
                  <div>
                    <strong>{t("nav.messages")}</strong>
                    <p>Conversations locataires</p>
                  </div>
                  {unreadMessages > 0 ? <span>{unreadMessages > 99 ? "99+" : unreadMessages}</span> : null}
                </button>

                <button type="button" className="owner-shortcut-card" onClick={() => history.push("/profile")}>
                  <IonIcon icon={settingsOutline} />
                  <div>
                    <strong>{t("general.settings")}</strong>
                    <p>Profil et securite</p>
                  </div>
                </button>

                <button type="button" className="owner-shortcut-card" onClick={() => history.push("/tab2")}>
                  <IonIcon icon={searchOutline} />
                  <div>
                    <strong>{t("dashboard.publicListings")}</strong>
                    <p>{t("dashboard.exploreCatalog")}</p>
                  </div>
                </button>
              </section>
            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default OwnerDashboard
