import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  documentTextOutline,
} from "ionicons/icons"
import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { fetchRentalRequests, updateRentalRequestStatus } from "../lib/rental-api"
import type { BackendRentalRequest, BackendProperty } from "../types/api"
import LoadingSpinner from "../components/LoadingSpinner"
import EmptyState from "../components/EmptyState"
import SectionHeader from "../components/SectionHeader"

const RentalRequestsPage: React.FC = () => {
  const { user, token } = useAuth()
  const [requests, setRequests] = useState<BackendRentalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionBusy, setActionBusy] = useState<string | null>(null)

  const isOwner = user?.role === "owner"

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchRentalRequests(token)
        if (active) setRequests(data)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erreur chargement")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [token])

  const handleStatusUpdate = async (requestId: string, status: "Acceptée" | "Refusée") => {
    if (!token) return
    setActionBusy(requestId)
    try {
      const updated = await updateRentalRequestStatus(requestId, status, token)
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status: updated.status } : r)),
      )
    } catch {
      // silently handle
    } finally {
      setActionBusy(null)
    }
  }

  const getPropertyTitle = (req: BackendRentalRequest): string => {
    if (typeof req.property === "object" && req.property !== null) {
      return (req.property as BackendProperty).title || "Propriété"
    }
    return "Propriété"
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "Acceptée":
      case "Contrat généré":
      case "Contrat actif":
        return checkmarkCircleOutline
      case "Refusée":
        return closeCircleOutline
      default:
        return timeOutline
    }
  }

  const statusLabel = (status: string) => {
    switch (status) {
      case "Acceptée":
        return "Acceptée"
      case "Refusée":
        return "Refusée"
      case "Contrat généré":
        return "Contrat généré"
      case "Contrat actif":
        return "Contrat actif"
      default:
        return "En attente"
    }
  }

  const requestStatusClass = (status: string) => {
    switch (status) {
      case "Acceptée":
      case "Contrat généré":
      case "Contrat actif":
        return "approved"
      case "Refusée":
        return "rejected"
      default:
        return "pending"
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <SectionHeader
            badge={isOwner ? "Propriétaire" : "Locataire"}
            title="Demandes de location"
            subtitle={
              isOwner
                ? "Gérez les demandes reçues pour vos propriétés."
                : "Suivez l'état de vos demandes de location."
            }
          />

          {loading ? (
            <LoadingSpinner message="Chargement des demandes..." />
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : requests.length === 0 ? (
            <EmptyState
              icon={documentTextOutline}
              title="Aucune demande"
              message={
                isOwner
                  ? "Vous n'avez pas encore reçu de demandes."
                  : "Vous n'avez pas encore soumis de demandes."
              }
            />
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {requests.map((req) => (
                <div key={req._id} className="request-card">
                  <h4>{getPropertyTitle(req)}</h4>
                  <p>
                    {req.message || (isOwner ? "Demande de location reçue" : "Votre demande de location")}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--brand-muted)" }}>
                    {formatDate(req.createdAt || req.date)}
                  </p>

                  <span className={`request-status ${requestStatusClass(req.status || "En attente")}`}>
                    <IonIcon icon={statusIcon(req.status || "En attente")} />
                    {statusLabel(req.status || "En attente")}
                  </span>

                  {isOwner && (req.status === "En attente" || !req.status) ? (
                    <div className="request-actions">
                      <button
                        type="button"
                        className="approve-btn"
                        disabled={actionBusy === req._id}
                        onClick={() => handleStatusUpdate(req._id, "Acceptée")}
                      >
                        <IonIcon icon={checkmarkCircleOutline} />
                        {actionBusy === req._id ? "..." : "Approuver"}
                      </button>
                      <button
                        type="button"
                        className="reject-btn"
                        disabled={actionBusy === req._id}
                        onClick={() => handleStatusUpdate(req._id, "Refusée")}
                      >
                        <IonIcon icon={closeCircleOutline} />
                        Refuser
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default RentalRequestsPage
