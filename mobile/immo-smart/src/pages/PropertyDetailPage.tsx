import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  arrowBackOutline,
  locationOutline,
  bedOutline,
  waterOutline,
  expandOutline,
  restaurantOutline,
  carOutline,
  leafOutline,
  sendOutline,
  createOutline,
  trashOutline,
} from "ionicons/icons"
import { useEffect, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { fetchProperty, deleteProperty } from "../lib/property-api"
import { createRentalRequest } from "../lib/rental-api"
import type { BackendProperty } from "../types/api"
import LoadingSpinner from "../components/LoadingSpinner"

const statusLabel: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "En maintenance",
}

const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user, token } = useAuth()
  const history = useHistory()
  const [property, setProperty] = useState<BackendProperty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionBusy, setActionBusy] = useState(false)
  const [actionMsg, setActionMsg] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchProperty(id, token || undefined)
        if (active) setProperty(data)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erreur chargement")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [id, token])

  const isOwner = user?.role === "owner"
  const isTenant = user?.role === "tenant"
  const ownerId = typeof property?.owner === "string" ? property.owner : property?.owner?._id
  const isMyProperty = isOwner && ownerId === user?.id

  const handleRentalRequest = async () => {
    if (!token || !property) return
    setActionBusy(true)
    setActionMsg("")
    try {
      await createRentalRequest({ property: property._id }, token)
      setActionMsg("Demande de location envoyée avec succès !")
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setActionBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !property) return
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette propriété ?")) return
    setActionBusy(true)
    try {
      await deleteProperty(property._id, token)
      history.goBack()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Erreur suppression")
      setActionBusy(false)
    }
  }

  if (loading) {
    return (
      <IonPage>
        <IonContent fullscreen className="mobile-content">
          <div className="mobile-page">
            <LoadingSpinner message="Chargement du bien..." />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (error || !property) {
    return (
      <IonPage>
        <IonContent fullscreen className="mobile-content">
          <div className="mobile-page">
            <div className="empty-state error-state">
              <p>{error || "Propriété introuvable"}</p>
            </div>
            <button type="button" className="link-btn" onClick={() => history.goBack()}>
              Retour
            </button>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  const amenities = [
    property.equippedKitchen && { icon: restaurantOutline, label: "Cuisine équipée" },
    property.parking && { icon: carOutline, label: "Parking" },
    property.balcony && { icon: leafOutline, label: "Balcon" },
    property.meuble && { icon: bedOutline, label: "Meublé" },
  ].filter(Boolean) as Array<{ icon: string; label: string }>

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          {/* Hero */}
          <div className="detail-hero">
            <img
              src={
                property.images?.cover ||
                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop"
              }
              alt={property.title}
            />
            <button type="button" className="detail-back-btn" onClick={() => history.goBack()}>
              <IonIcon icon={arrowBackOutline} />
            </button>
            <span className={`status-pill ${property.status}`} style={{ top: 14, right: 14, left: "auto" }}>
              {statusLabel[property.status] || property.status}
            </span>
          </div>

          {/* Title & Price */}
          <h1 className="detail-title">{property.title}</h1>
          <p className="detail-address">
            <IonIcon icon={locationOutline} />
            {property.city} — {property.address}
          </p>
          <div className="detail-price">
            {property.rent.toLocaleString("fr-FR")} TND<small>/mois</small>
          </div>
          {property.deposit > 0 ? (
            <p style={{ color: "var(--brand-muted)", fontSize: 13, marginTop: 4 }}>
              Dépôt : {property.deposit.toLocaleString("fr-FR")} TND
            </p>
          ) : null}

          {/* Specs */}
          <div className="detail-specs">
            <div className="detail-spec">
              <IonIcon icon={expandOutline} />
              <strong>{property.surface}m²</strong>
              <small>Surface</small>
            </div>
            <div className="detail-spec">
              <IonIcon icon={bedOutline} />
              <strong>{property.bedrooms}</strong>
              <small>Chambres</small>
            </div>
            <div className="detail-spec">
              <IonIcon icon={waterOutline} />
              <strong>{property.bathrooms}</strong>
              <small>Salles de bain</small>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 ? (
            <div className="detail-amenities">
              {amenities.map((a) => (
                <span key={a.label} className="amenity-chip">
                  <IonIcon icon={a.icon} />
                  {a.label}
                </span>
              ))}
            </div>
          ) : null}

          {/* Type */}
          <div style={{ marginBottom: 12 }}>
            <span className="type-chip">{property.type.toUpperCase()}</span>
          </div>

          {/* Description */}
          <div className="detail-description">
            <h3>Description</h3>
            <p>{property.description}</p>
          </div>

          {/* Action Messages */}
          {actionMsg ? (
            <p
              className={`auth-status ${actionMsg.includes("succès") || actionMsg.includes("envoyée") ? "success" : "error"}`}
            >
              {actionMsg}
            </p>
          ) : null}

          {/* CTA Buttons */}
          {isTenant && property.status === "available" ? (
            <button
              type="button"
              className="detail-cta"
              disabled={actionBusy}
              onClick={handleRentalRequest}
            >
              <IonIcon icon={sendOutline} />
              {actionBusy ? "Envoi..." : "Demander cette location"}
            </button>
          ) : null}

          {isMyProperty ? (
            <>
              <button
                type="button"
                className="detail-cta"
                onClick={() => history.push(`/property-form/${property._id}`)}
              >
                <IonIcon icon={createOutline} />
                Modifier cette propriété
              </button>
              <button
                type="button"
                className="detail-cta danger"
                style={{ marginTop: 10 }}
                disabled={actionBusy}
                onClick={handleDelete}
              >
                <IonIcon icon={trashOutline} />
                Supprimer
              </button>
            </>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default PropertyDetailPage
