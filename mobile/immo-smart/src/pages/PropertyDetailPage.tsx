import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  arrowBackOutline,
  bedOutline,
  carOutline,
  callOutline,
  closeOutline,
  createOutline,
  expandOutline,
  heart,
  heartOutline,
  leafOutline,
  locationOutline,
  mailOutline,
  personOutline,
  restaurantOutline,
  sendOutline,
  trashOutline,
  waterOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useHistory, useParams } from "react-router-dom"
import LoadingSpinner from "../components/LoadingSpinner"
import { useAuth } from "../lib/auth-context"
import { FAVORITES_UPDATED_EVENT, isFavoriteProperty, toggleFavoriteProperty } from "../lib/favorites"
import { deleteProperty, fetchProperty } from "../lib/property-api"
import { createRentalRequest } from "../lib/rental-api"
import type { BackendProperty } from "../types/api"

const statusLabel: Record<string, string> = {
  available: "Disponible",
  rented: "Loue",
  maintenance: "En maintenance",
}

const todayIso = () => new Date().toISOString().split("T")[0]

const formatDateLabel = (value: string) => {
  if (!value) return ""

  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("fr-TN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

const calculateDurationLabel = (startDate: string, endDate: string) => {
  const start = new Date(`${startDate}T12:00:00`)
  const end = new Date(`${endDate}T12:00:00`)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return null
  }

  const diffInDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
  const months = Math.max(1, Math.ceil(diffInDays / 30))
  return `${months} mois`
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
  const [isFavorite, setIsFavorite] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [requestMessage, setRequestMessage] = useState("")
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [requestError, setRequestError] = useState("")

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      setError("")
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
    return () => {
      active = false
    }
  }, [id, token])

  useEffect(() => {
    if (user?.role !== "tenant" || !user.id) {
      setIsFavorite(false)
      return
    }

    setIsFavorite(isFavoriteProperty(user.id, id))
  }, [id, user])

  useEffect(() => {
    const syncFavoriteState = () => {
      if (user?.role !== "tenant" || !user.id) return
      setIsFavorite(isFavoriteProperty(user.id, id))
    }

    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavoriteState)
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavoriteState)
    }
  }, [id, user])

  const isOwner = user?.role === "owner"
  const isTenant = user?.role === "tenant"
  const ownerId = typeof property?.owner === "string" ? property.owner : property?.owner?._id
  const isMyProperty = isOwner && ownerId === user?.id

  const ownerInfo = property?.owner && typeof property.owner === "object" ? property.owner : null
  const ownerName = property?.ownerName || ownerInfo?.fullName || "Proprietaire"
  const ownerPhone = property?.ownerPhone || ownerInfo?.phone || "-"
  const ownerEmail = property?.ownerEmail || ownerInfo?.email || "-"

  const requestDuration = useMemo(() => calculateDurationLabel(startDate, endDate), [startDate, endDate])

  const resetRequestForm = () => {
    setStartDate("")
    setEndDate("")
    setRequestMessage("")
  }

  const openRequestDialog = () => {
    setRequestSuccess(false)
    setRequestError("")
    setActionMsg("")
    setIsRequestDialogOpen(true)
  }

  const closeRequestDialog = () => {
    setIsRequestDialogOpen(false)
    setRequestError("")
  }

  const handleRentalRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !property) return

    setRequestSuccess(false)
    setRequestError("")
    setActionMsg("")

    if (!startDate || !endDate) {
      setRequestError("Veuillez choisir une date de debut et une date de fin.")
      return
    }

    if (!requestDuration) {
      setRequestError("La date de fin doit etre posterieure ou egale a la date de debut.")
      return
    }

    const baseMessage = requestMessage.trim() || `Je souhaite louer ${property.title || "ce logement"}.`
    const composedMessage = [
      baseMessage,
      `Periode souhaitee : du ${formatDateLabel(startDate)} au ${formatDateLabel(endDate)}.`,
      `Duree souhaitee : ${requestDuration}.`,
    ].join("\n\n")

    setActionBusy(true)
    try {
      await createRentalRequest(
        {
          property: property._id,
          duration: requestDuration,
          message: composedMessage,
        },
        token,
      )

      setRequestSuccess(true)
      setActionMsg("Votre demande a ete envoyee. Vous pouvez la suivre dans la page Requests.")
      resetRequestForm()
      setIsRequestDialogOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Impossible d'envoyer la demande."
      setRequestError(message)
      setActionMsg(message)
    } finally {
      setActionBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !property) return
    if (!window.confirm("Etes-vous sur de vouloir supprimer cette propriete ?")) return

    setActionBusy(true)
    try {
      await deleteProperty(property._id, token)
      history.goBack()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : "Erreur suppression")
      setActionBusy(false)
    }
  }

  const handleToggleFavorite = () => {
    if (user?.role !== "tenant" || !user.id || !property) return
    const nextFavorites = toggleFavoriteProperty(user.id, property._id)
    const added = nextFavorites.includes(property._id)
    setIsFavorite(added)
    setActionMsg(added ? "Bien ajoute aux favoris." : "Bien retire des favoris.")
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
              <p>{error || "Propriete introuvable"}</p>
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
    property.equippedKitchen && { icon: restaurantOutline, label: "Cuisine equipee" },
    property.parking && { icon: carOutline, label: "Parking" },
    property.balcony && { icon: leafOutline, label: "Balcon" },
    property.meuble && { icon: bedOutline, label: "Meuble" },
  ].filter(Boolean) as Array<{ icon: string; label: string }>

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
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

          <h1 className="detail-title">{property.title}</h1>
          <p className="detail-address">
            <IonIcon icon={locationOutline} />
            {property.city} - {property.address}
          </p>
          <div className="detail-price">
            {property.rent.toLocaleString("fr-FR")} TND<small>/mois</small>
          </div>
          {property.deposit > 0 ? (
            <p style={{ color: "var(--brand-muted)", fontSize: 13, marginTop: 4 }}>
              Depot : {property.deposit.toLocaleString("fr-FR")} TND
            </p>
          ) : null}

          <div className="detail-specs">
            <div className="detail-spec">
              <IonIcon icon={expandOutline} />
              <strong>{property.surface}m2</strong>
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

          {amenities.length > 0 ? (
            <div className="detail-amenities">
              {amenities.map((amenity) => (
                <span key={amenity.label} className="amenity-chip">
                  <IonIcon icon={amenity.icon} />
                  {amenity.label}
                </span>
              ))}
            </div>
          ) : null}

          <div style={{ marginBottom: 12 }}>
            <span className="type-chip">{property.type.toUpperCase()}</span>
          </div>

          <div className="detail-description">
            <h3>Description</h3>
            <p>{property.description}</p>
          </div>

          {isOwner ? (
            <div className="detail-owner-info">
              <h3>Informations Proprietaire</h3>
              <div className="owner-info-grid">
                <div className="owner-info-item">
                  <IonIcon icon={personOutline} />
                  <span>{ownerName}</span>
                </div>
                <div className="owner-info-item">
                  <IonIcon icon={callOutline} />
                  <span>{ownerPhone}</span>
                </div>
                <div className="owner-info-item">
                  <IonIcon icon={mailOutline} />
                  <span>{ownerEmail}</span>
                </div>
              </div>
              {!isMyProperty && (
                <div className="owner-readonly-tag">
                  Visible uniquement (Lecture seule)
                </div>
              )}
            </div>
          ) : null}

          {actionMsg ? (
            <p className={`auth-status ${requestSuccess || actionMsg.includes("envoyee") ? "success" : "error"}`}>
              {actionMsg}
            </p>
          ) : null}

          {isTenant ? (
            <button
              type="button"
              className={`detail-cta ${isFavorite ? "outline" : ""}`}
              onClick={handleToggleFavorite}
            >
              <IonIcon icon={isFavorite ? heart : heartOutline} />
              {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            </button>
          ) : null}

          {isTenant && property.status === "available" ? (
            <button type="button" className="detail-cta" disabled={actionBusy} onClick={openRequestDialog}>
              <IonIcon icon={sendOutline} />
              Demander cette location
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
                Modifier cette propriete
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

          {isTenant && property.status === "available" && isRequestDialogOpen ? (
            <div className="furniture-overlay" role="presentation" onClick={closeRequestDialog}>
              <div className="rental-request-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
                <button type="button" className="rental-request-close" onClick={closeRequestDialog} aria-label="Fermer">
                  <IonIcon icon={closeOutline} />
                </button>

                <div className="rental-request-body">
                  <div className="rental-request-header">
                    <span className="type-chip">Demande de location</span>
                    <h3>Choisissez votre periode</h3>
                    <p>Selectionnez vos dates, ajoutez un message et envoyez la demande au proprietaire.</p>
                  </div>

                  <div className="rental-request-property">
                    <img
                      src={
                        property.images?.cover ||
                        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop"
                      }
                      alt={property.title}
                    />
                    <div>
                      <strong>{property.title}</strong>
                      <span>{property.city} - {property.address}</span>
                      <small>{property.rent.toLocaleString("fr-FR")} TND / mois</small>
                    </div>
                  </div>

                  {requestError ? <p className="auth-status error">{requestError}</p> : null}

                  <form className="rental-request-form" onSubmit={handleRentalRequest}>
                    <div className="rental-request-grid">
                      <label className="rental-request-field">
                        <span>Date de debut</span>
                        <input
                          type="date"
                          value={startDate}
                          min={todayIso()}
                          onChange={(event) => setStartDate(event.target.value)}
                          required
                        />
                      </label>

                      <label className="rental-request-field">
                        <span>Date de fin</span>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate || todayIso()}
                          onChange={(event) => setEndDate(event.target.value)}
                          required
                        />
                      </label>
                    </div>

                    <div className="rental-request-summary">
                      <strong>Duree envoyee au backend</strong>
                      <span>{requestDuration || "Selectionnez votre periode"}</span>
                    </div>

                    <label className="rental-request-field">
                      <span>Message complementaire</span>
                      <textarea
                        value={requestMessage}
                        onChange={(event) => setRequestMessage(event.target.value)}
                        placeholder="Ajoutez un message pour le proprietaire..."
                        rows={5}
                      />
                    </label>

                    <div className="rental-request-actions">
                      <button type="button" className="furniture-secondary-btn" onClick={closeRequestDialog} disabled={actionBusy}>
                        Annuler
                      </button>
                      <button type="submit" className="detail-cta rental-request-submit" disabled={actionBusy}>
                        <IonIcon icon={sendOutline} />
                        {actionBusy ? "Envoi..." : "Confirmer la demande"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default PropertyDetailPage
