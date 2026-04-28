import { 
  IonContent, IonIcon, IonPage, IonMenu, IonHeader, 
  IonToolbar, IonTitle, IonList, IonItem, IonButtons, IonMenuButton 
} from "@ionic/react"
import {
  homeOutline, statsChartOutline, listOutline, logOutOutline,
  locationOutline, globeOutline, addOutline, bedOutline,
  waterOutline, expandOutline, mailOutline, personOutline,
  cartOutline, mapOutline
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { useHistory } from "react-router-dom"
import { fetchProperties } from "../lib/property-api"
import type { BackendFurnitureChangeRequest, BackendProperty, BackendRentalRequest } from "../types/api"
import { http } from "../lib/api"

type OwnerSection =
  | "overview"
  | "properties"
  | "add"
  | "map"
  | "requests"
  | "messages"
  | "analytics"
  | "furniture"
  | "profile"

type BackendNotification = { _id: string; title?: string; preview?: string; isRead?: boolean }
type BackendFurnitureOrder = { _id: string; total?: number; status?: string; createdAt?: string }
type OwnerRequestItem =
  | { kind: "rental"; request: BackendRentalRequest }
  | { kind: "furniture-change"; request: BackendFurnitureChangeRequest }

const navQuick: Array<{ key: string; label: string; icon: string }> = [
  { key: "overview", label: "Aperçu", icon: homeOutline },
  { key: "properties", label: "Mes Propriétés", icon: listOutline },
  { key: "add", label: "Ajouter", icon: addOutline },
  { key: "map", label: "Carte", icon: mapOutline },
  { key: "requests", label: "Demandes", icon: listOutline },
  { key: "messages", label: "Messages", icon: mailOutline },
  { key: "analytics", label: "Analytiques", icon: statsChartOutline },
  { key: "furniture", label: "Mobilier", icon: cartOutline },
  { key: "profile", label: "Profil", icon: personOutline },
]

const OwnerDashboard: React.FC = () => {
  const { user, token, logout } = useAuth()
  const history = useHistory()
  const [activeSection, setActiveSection] = useState<OwnerSection>("overview")
  const [properties, setProperties] = useState<BackendProperty[]>([])
  const [requests, setRequests] = useState<BackendRentalRequest[]>([])
  const [changeRequests, setChangeRequests] = useState<BackendFurnitureChangeRequest[]>([])
  const [notifications, setNotifications] = useState<BackendNotification[]>([])
  const [furnitureOrders, setFurnitureOrders] = useState<BackendFurnitureOrder[]>([])
  const [selectedRequest, setSelectedRequest] = useState<OwnerRequestItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const [propertiesData, requestsData, changeRequestsData, notificationsData, furnitureData] = await Promise.all([
          fetchProperties(token),
          http.get<BackendRentalRequest[]>("/rental-requests", token),
          http.get<BackendFurnitureChangeRequest[]>("/furniture/owner-change-requests", token),
          http.get<BackendNotification[]>("/notifications", token),
          http.get<BackendFurnitureOrder[]>("/furniture/owner-orders", token),
        ])

        if (active) {
          setProperties(propertiesData)
          setRequests(requestsData)
          setChangeRequests(changeRequestsData)
          setNotifications(notificationsData)
          setFurnitureOrders(furnitureData)
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erreur chargement tableau de bord")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [token])

  const stats = useMemo(() => {
    const total = properties.length
    const available = properties.filter((p) => p.status === "available").length
    const rented = properties.filter((p) => p.status === "rented").length
    const revenue = properties.reduce((sum, p) => sum + (Number(p.rent) || 0), 0)

    return [
      { label: "Total Propriétés", value: `${total}`, icon: homeOutline },
      { label: "Disponibles", value: `${available}`, icon: statsChartOutline },
      { label: "Loués", value: `${rented}`, icon: locationOutline },
      { label: "Rev. Estimé", value: `${revenue.toLocaleString("fr-FR")} TND`, icon: statsChartOutline },
      { label: "Demandes", value: `${requests.length + changeRequests.length}`, icon: listOutline },
    ]
  }, [properties, requests.length, changeRequests.length])

  const handleQuickAction = (key: string) => {
    document.querySelector("ion-menu")?.close()
    if (key === "add") { history.push("/property-form"); return; }
    if (key === "profile") { history.push("/profile"); return; }
    if (key === "map") { history.push("/tab2?view=map"); return; }
    
    setActiveSection(key as OwnerSection)
  }

  const handleUpdateRequest = async (id: string, status: string) => {
    if (!token) return
    try {
      await http.put(`/rental-requests/${id}/status`, { status }, token)
      setRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: status as BackendRentalRequest["status"] } : r)),
      )
    } catch (err) {
      setError("Impossible de mettre à jour la demande.")
    }
  }

  const handleMarkAsRead = async (id: string) => {
    if (!token) return
    try {
      await http.patch(`/notifications/${id}/read`, {}, token)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      console.error(err)
    }
  }

  const ownerRequests = useMemo<OwnerRequestItem[]>(() => {
    const rentalItems = requests.map((request) => ({ kind: "rental" as const, request }))
    const furnitureItems = changeRequests.map((request) => ({ kind: "furniture-change" as const, request }))

    return [...rentalItems, ...furnitureItems].sort((a, b) => {
      const aDate = new Date(
        a.kind === "rental" ? a.request.createdAt || a.request.date || 0 : a.request.createdAt || a.request.date || 0,
      ).getTime()
      const bDate = new Date(
        b.kind === "rental" ? b.request.createdAt || b.request.date || 0 : b.request.createdAt || b.request.date || 0,
      ).getTime()
      return bDate - aDate
    })
  }, [requests, changeRequests])

  const formatDate = (date?: string) => {
    if (!date) return "Date non disponible"
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const getRentalPropertyTitle = (request: BackendRentalRequest) => {
    if (typeof request.property === "string") return "Demande de location"
    return request.property?.title || "Demande de location"
  }

  const getChangePropertyTitle = (request: BackendFurnitureChangeRequest) => {
    if (!request.propertyId || typeof request.propertyId === "string") return "Demande de changement mobilier"
    return request.propertyId.title || "Demande de changement mobilier"
  }

  const getChangeFurnitureName = (request: BackendFurnitureChangeRequest) => {
    if (request.furnitureName) return request.furnitureName
    if (request.furnitureId && typeof request.furnitureId !== "string") return request.furnitureId.name
    return "Meuble non precise"
  }

  const renderRequestsSection = () => (
    <div style={{ display: 'grid', gap: '12px' }}>
      {selectedRequest ? (
        <article style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--brand-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                {selectedRequest.kind === "rental" ? "Demande de location" : "Demande de changement meuble"}
              </div>
              <h4 style={{ margin: 0, color: 'var(--brand-primary-deep)', fontWeight: 'bold' }}>
                {selectedRequest.kind === "rental"
                  ? getRentalPropertyTitle(selectedRequest.request)
                  : getChangePropertyTitle(selectedRequest.request)}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedRequest(null)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--brand-border)', background: 'white', color: '#475569', fontWeight: '600' }}
            >
              Fermer
            </button>
          </div>

          {selectedRequest.kind === "rental" ? (
            <div style={{ display: 'grid', gap: '8px', color: '#334155' }}>
              <p style={{ margin: 0 }}><strong>Statut:</strong> {selectedRequest.request.status || "En attente"}</p>
              <p style={{ margin: 0 }}><strong>Date:</strong> {formatDate(selectedRequest.request.createdAt || selectedRequest.request.date)}</p>
              <p style={{ margin: 0 }}><strong>Message:</strong> {selectedRequest.request.message || "Demande de location recue."}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '8px', color: '#334155' }}>
              <p style={{ margin: 0 }}><strong>Meuble:</strong> {getChangeFurnitureName(selectedRequest.request)}</p>
              <p style={{ margin: 0 }}><strong>Type:</strong> {selectedRequest.request.type}</p>
              <p style={{ margin: 0 }}><strong>Statut:</strong> {selectedRequest.request.status || "En attente"}</p>
              <p style={{ margin: 0 }}><strong>Date:</strong> {formatDate(selectedRequest.request.createdAt || selectedRequest.request.date)}</p>
              <p style={{ margin: 0 }}><strong>Locataire:</strong> {selectedRequest.request.tenantId}</p>
              <p style={{ margin: 0 }}><strong>Motif:</strong> {selectedRequest.request.reason}</p>
              {selectedRequest.request.description ? <p style={{ margin: 0 }}><strong>Description:</strong> {selectedRequest.request.description}</p> : null}
              {selectedRequest.request.photo ? (
                <img
                  src={selectedRequest.request.photo}
                  alt={getChangeFurnitureName(selectedRequest.request)}
                  style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px', border: '1px solid var(--brand-border)' }}
                />
              ) : null}
            </div>
          )}
        </article>
      ) : null}

      {ownerRequests.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#64748b' }}>
          Aucune demande pour le moment.
        </div>
      ) : (
        ownerRequests.map((item) => (
          <article key={`${item.kind}-${item.request._id}`} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--brand-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  {item.kind === "rental" ? "Location" : "Changement meuble"}
                </div>
                <h4 style={{ margin: '0 0 6px', color: 'var(--brand-primary-deep)', fontWeight: 'bold' }}>
                  {item.kind === "rental" ? getRentalPropertyTitle(item.request) : getChangePropertyTitle(item.request)}
                </h4>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '14px' }}>
                  {item.kind === "rental"
                    ? `Statut: ${item.request.status || "En attente"}`
                    : `${getChangeFurnitureName(item.request)} - ${item.request.type}`}
                </p>
                <small style={{ color: '#94a3b8' }}>
                  {formatDate(item.kind === "rental" ? item.request.createdAt || item.request.date : item.request.createdAt || item.request.date)}
                </small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRequest(item)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--brand-primary)', background: 'white', color: 'var(--brand-primary-deep)', fontWeight: '600', whiteSpace: 'nowrap' }}
              >
                Consulter
              </button>
            </div>

            {item.kind === "rental" && item.request.status === "En attente" ? (
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <button style={{ flex: 1, padding: '8px', background: 'var(--brand-primary-deep)', color: 'white', borderRadius: '6px', fontWeight: '600' }} onClick={() => handleUpdateRequest(item.request._id, "Contrat actif")}>Accepter</button>
                <button style={{ flex: 1, padding: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontWeight: '600' }} onClick={() => handleUpdateRequest(item.request._id, "RefusÃ©")}>Refuser</button>
              </div>
            ) : null}
          </article>
        ))
      )}
    </div>
  )

  const visibleProperties = activeSection === "properties" ? properties : properties.slice(0, 3)

  const renderDynamicSection = () => {
    if (activeSection === "requests") {
      return renderRequestsSection()
    }

    if (false) {
      return (
        <div style={{ display: 'grid', gap: '12px' }}>
          {requests.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#64748b' }}>
              Aucune demande pour le moment.
            </div>
          ) : (
            requests.map((request) => (
              <article key={request._id} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--brand-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 6px', color: 'var(--brand-primary-deep)', fontWeight: 'bold' }}>{getRentalPropertyTitle(request)}</h4>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '14px' }}>Status: {request.status || "En attente"}</p>
                <small style={{ color: '#94a3b8' }}>{request.date || "Date non disponible"}</small>
                {request.status === "En attente" && (
                  <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                    <button style={{ flex: 1, padding: '8px', background: 'var(--brand-primary-deep)', color: 'white', borderRadius: '6px', fontWeight: '600' }} onClick={() => handleUpdateRequest(request._id, "Contrat actif")}>Accepter</button>
                    <button style={{ flex: 1, padding: '8px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', fontWeight: '600' }} onClick={() => handleUpdateRequest(request._id, "Refusé")}>Refuser</button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      )
    }

    if (activeSection === "messages") {
      return (
        <div style={{ display: 'grid', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', background: 'white', borderRadius: '12px', color: '#64748b' }}>Aucun message pour le moment.</div>
          ) : (
            notifications.map((n) => (
              <article key={n._id} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--brand-border)', borderLeft: !n.isRead ? '4px solid var(--brand-primary-deep)' : '1px solid var(--brand-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <h4 style={{ margin: '0 0 4px', color: 'var(--brand-primary-deep)', fontWeight: 'bold' }}>{n.title || "Notification"}</h4>
                <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '14px' }}>{n.preview || "Sans aperçu"}</p>
                <small style={{ color: '#94a3b8' }}>{n.isRead ? "Lue" : "Non lue"}</small>
                {!n.isRead && (
                  <button style={{ marginTop: '12px', display: 'block', padding: '6px 12px', background: 'var(--brand-bg)', color: 'var(--brand-primary-deep)', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }} onClick={() => handleMarkAsRead(n._id)}>Marquer comme lu</button>
                )}
              </article>
            ))
          )}
        </div>
      )
    }

    if (activeSection === "furniture") {
      return (
        <div style={{ display: 'grid', gap: '12px' }}>
          {furnitureOrders.map((o) => (
            <article key={o._id} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid var(--brand-border)' }}>
              <h4 style={{ margin: '0 0 6px', color: 'var(--brand-primary-deep)', fontWeight: 'bold' }}>Commande #{o._id.slice(-6)}</h4>
              <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>Total: {o.total || 0} TND</p>
            </article>
          ))}
        </div>
      )
    }
    
    if (activeSection === "analytics") {
      const occupationRate = properties.length > 0 ? Math.round((properties.filter(p => p.status === "rented").length / properties.length) * 100) : 0
      return (
        <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid var(--brand-border)', textAlign: 'center' }}>
          <h3 style={{ fontSize: '36px', color: 'var(--brand-primary-deep)', margin: '0 0 8px', fontWeight: 'bold' }}>{occupationRate}%</h3>
          <p style={{ margin: 0, color: '#64748b' }}>Taux d'occupation global</p>
        </div>
      )
    }
    return null
  }

  return (
    <>
      <IonMenu contentId="owner-main-content" type="overlay">
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'var(--brand-primary-deep)', '--color': 'white', paddingTop: 'env(safe-area-inset-top)' }}>
            <IonTitle style={{ fontWeight: 'bold' }}>ImmoSmart</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <IonContent style={{ '--background': 'linear-gradient(180deg, var(--brand-primary-deep) 0%, var(--brand-primary) 100%)' }}>
          <div style={{ padding: '8px' }}>
            <IonList style={{ background: 'transparent' }} lines="none">
              {navQuick.map((item) => {
                const isActive = activeSection === item.key
                return (
                  <IonItem
                    button
                    key={item.key}
                    onClick={() => handleQuickAction(item.key)}
                    style={{
                      '--background': isActive ? 'var(--brand-primary)' : 'transparent',
                      '--color': 'white',
                      borderRadius: '8px',
                      margin: '4px 0',
                    }}
                  >
                    <IonIcon slot="start" icon={item.icon} style={{ color: 'white' }} />
                    <span style={{ fontSize: '14px', fontWeight: isActive ? 'bold' : 'normal' }}>{item.label}</span>
                  </IonItem>
                )
              })}
            </IonList>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IonIcon icon={personOutline} style={{ color: 'white' }} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{user?.name || "Propriétaire"}</p>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{user?.email}</p>
              </div>
            </div>
            
            <button
               onClick={() => { logout(); history.replace("/tab3"); }}
               style={{ width: '100%', marginTop: '12px', background: 'rgba(239,68,68,0.2)', color: '#fca5a5', padding: '10px', borderRadius: '8px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}
            >
              <IonIcon icon={logOutOutline} />
              Déconnexion
            </button>
          </div>
        </IonContent>
      </IonMenu>

      <IonPage id="owner-main-content">
        <IonHeader className="ion-no-border">
          <IonToolbar style={{ '--background': 'rgba(255,255,255,0.92)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--brand-border)' }}>
            <IonButtons slot="start">
              <IonMenuButton autoHide={false} style={{ color: 'var(--brand-primary-deep)' }}></IonMenuButton>
            </IonButtons>
            
            <div slot="start" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b', marginLeft: '6px' }}>
              <IonIcon icon={locationOutline} />
              Monastir, TN
            </div>

            <IonButtons slot="end" style={{ marginRight: '16px', gap: '8px' }}>
              <button style={{ border: '1px solid var(--brand-border)', background: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', gap: '6px', alignItems: 'center', fontWeight: 'bold', color: 'var(--brand-primary-deep)' }}>
                 AI
              </button>
              <button style={{ border: '1px solid var(--brand-border)', background: 'white', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', fontWeight: 'bold', color: 'var(--brand-primary-deep)' }}>
                 <IonIcon icon={globeOutline} /> FR
              </button>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent color="light" style={{ '--background': 'var(--brand-bg)' }}>
          <div style={{ padding: '24px 16px', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h1 style={{ margin: '0', fontSize: '24px', fontWeight: 'bold', color: 'var(--brand-text)' }}>Bienvenue, {user?.name || "Propriétaire"}</h1>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Espace Propriétaire</p>
              </div>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', marginTop: '60px', color: '#64748b' }}>Chargement...</div>
            ) : error ? (
              <div style={{ padding: '16px', background: 'rgba(242, 125, 114, 0.12)', color: 'var(--brand-accent-deep)', borderRadius: '8px' }}>{error}</div>
            ) : activeSection !== "overview" && activeSection !== "properties" ? (
              renderDynamicSection()
            ) : (
              <>
                <div style={{ marginBottom: '32px' }}>
                  <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 'bold', color: 'var(--brand-text)' }}>Menu Rapide</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                    {navQuick.filter(item => item.key !== 'overview').map((item) => (
                      <button 
                        key={item.key} 
                        onClick={() => handleQuickAction(item.key)} 
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '12px 4px', borderRadius: '16px', border: '1px solid var(--brand-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <IonIcon icon={item.icon} style={{ color: 'var(--brand-primary)', fontSize: '20px' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--brand-text)', textAlign: 'center', lineHeight: '1.2' }}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '32px' }}>
                  {stats.slice(0, 5).map((s, i) => (
                    <div key={i} style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid var(--brand-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--brand-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                        <IonIcon icon={s.icon} style={{ color: 'var(--brand-primary)', fontSize: '18px' }} />
                      </div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 'bold', color: 'var(--brand-text)' }}>{s.value}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'var(--brand-text)' }}>
                      {activeSection === "properties" ? "Mes Propriétés" : "Aperçu Récent"}
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>Gérez vos biens immobiliers à Monastir</p>
                  </div>
                  <button onClick={() => history.push("/property-form")} style={{ background: 'transparent', border: '1px solid var(--brand-primary)', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', color: 'var(--brand-primary)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <IonIcon icon={addOutline} /> Ajouter
                  </button>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {visibleProperties.map((p) => (
                    <article key={p._id} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--brand-border)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                      <div style={{ position: 'relative', height: '180px' }}>
                        <img src={p.images?.cover || "https://images.unsplash.com/photo-1613490493576-7fde63acd811?"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        <span style={{ position: 'absolute', top: '12px', left: '12px', background: 'var(--brand-primary)', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Disponible</span>
                        <span style={{ position: 'absolute', bottom: '12px', left: '12px', background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)', color: 'white', padding: '6px 10px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' }}>{p.rent} TND</span >
                      </div>
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 'bold', color: 'var(--brand-text)' }}>{p.title}</h3>
                        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <IonIcon icon={locationOutline} /> {p.city}
                        </p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IonIcon icon={expandOutline} /> {p.surface}mÂ²</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IonIcon icon={bedOutline} /> {p.bedrooms} ch.</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><IonIcon icon={waterOutline} /> {p.bathrooms} sdb</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        </IonContent>
      </IonPage>
    </>
  )
}

export default OwnerDashboard



