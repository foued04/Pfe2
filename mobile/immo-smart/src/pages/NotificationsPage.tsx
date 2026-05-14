import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  mailOutline,
  notificationsOutline,
  sendOutline,
  calendarOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"
import SectionHeader from "../components/SectionHeader"
import { useAuth } from "../lib/auth-context"
import { sendConversationMessage } from "../lib/messages-api"
import { fetchNotifications, markNotificationRead } from "../lib/notification-api"
import type { BackendNotification } from "../types/api"
import { useHistory } from "react-router-dom"
import { documentTextOutline } from "ionicons/icons"

import { useSocket } from "../lib/socket-context"

const NotificationsPage: React.FC = () => {
  const { token, user } = useAuth()
  const { socket } = useSocket()
  const history = useHistory()
  const [notifications, setNotifications] = useState<BackendNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeId, setActiveId] = useState("")
  const [replyText, setReplyText] = useState("")
  const [replyBusy, setReplyBusy] = useState(false)
  const [replyError, setReplyError] = useState("")
  const [replySuccess, setReplySuccess] = useState("")

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await fetchNotifications(token)
        if (!active) return
        setNotifications(Array.isArray(data) ? data : [])
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
  }, [token])

  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (notification: BackendNotification) => {
      setNotifications((prev) => [notification, ...prev])
    }

    socket.on('new_notification', handleNewNotification)

    return () => {
      socket.off('new_notification', handleNewNotification)
    }
  }, [socket])


  const activeNotification = useMemo(
    () => normalizedNotifications.find((notification) => notification._id === activeId) || null,
    [activeId, normalizedNotifications],
  )

  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  const normalizeType = (type?: string) => {
    if (!type) return "Système"
    const isMangledReclamation = type.includes('R\u00c3\u00a9') || type.includes('R\u00e9') || type.toLowerCase() === "reclamation"
    const isMangledSystem = type.includes('Syst\u00c3\u00a8') || type.includes('Syst\u00e8') || type.toLowerCase() === "systeme" || type.toLowerCase() === "système"
    const isMangledVerification = type.includes('V\u00c3\u00a9') || type.includes('V\u00e9') || type.toLowerCase() === "verification"
    const isMangledMobilier = type.toLowerCase() === "mobilier" || type.toLowerCase() === "furniture"
    const isMangledContrat = type.toLowerCase() === "contrat" || type.toLowerCase() === "contract"

    if (isMangledReclamation) return 'Réclamation'
    if (isMangledSystem) return 'Système'
    if (isMangledVerification) return 'Vérification'
    if (isMangledMobilier) return 'Mobilier'
    if (isMangledContrat) return 'Contrat'
    return type
  }

  const normalizedNotifications = useMemo(() => {
    return notifications.map(n => ({ ...n, type: normalizeType(n.type) }))
  }, [notifications])

  const getIcon = (notification: BackendNotification) => {
    const type = normalizeType(notification.type)
    const haystack = `${notification.title} ${notification.preview || ""} ${notification.message || ""}`.toLowerCase()

    if (haystack.includes("accep")) return checkmarkCircleOutline
    if (haystack.includes("refus")) return alertCircleOutline
    if (type === "Contrat" || notification.contractData) return documentTextOutline
    if (notification.messageMeta?.conversationId) return mailOutline
    if (type === "success") return checkmarkCircleOutline
    if (type === "warning") return alertCircleOutline
    return informationCircleOutline
  }

  const getTone = (notification: BackendNotification) => {
    const type = normalizeType(notification.type)
    const haystack = `${notification.title} ${notification.preview || ""} ${notification.message || ""}`.toLowerCase()

    if (haystack.includes("accep")) return "success"
    if (haystack.includes("refus")) return "danger"
    if (type === "Contrat" || notification.contractData) return "success"
    if (notification.messageMeta?.conversationId) return "info"
    return "neutral"
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleOpenNotification = async (notification: BackendNotification) => {
    setActiveId(notification._id)
    setReplyText("")
    setReplyError("")
    setReplySuccess("")

    if (!token || notification.isRead) return

    try {
      await markNotificationRead(notification._id, token)
      setNotifications((prev) =>
        prev.map((item) => (item._id === notification._id ? { ...item, isRead: true } : item)),
      )
    } catch {
      // no-op
    }
  }

  const handleReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!token || !activeNotification?.messageMeta?.conversationId) return

    const content = replyText.trim()
    if (!content) {
      setReplyError("Veuillez ecrire une reponse.")
      setReplySuccess("")
      return
    }

    setReplyBusy(true)
    setReplyError("")
    setReplySuccess("")

    try {
      await sendConversationMessage(
        {
          conversationId: activeNotification.messageMeta.conversationId,
          content,
        },
        token,
      )

      setReplyText("")
      setReplySuccess(
        user?.role === "owner"
          ? "Votre reponse a ete envoyee au locataire."
          : "Votre reponse a ete envoyee au locateur."
      )
    } catch (err) {
      setReplyError(err instanceof Error ? err.message : "Impossible d'envoyer la reponse.")
    } finally {
      setReplyBusy(false)
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page notifications-page">
          <SectionHeader
            badge={unreadCount > 0 ? `${unreadCount} nouvelles` : "A jour"}
            title="Notifications"
            subtitle={
              user?.role === "owner"
                ? "Consultez les messages, reclamations et alertes recus depuis vos locataires."
                : "Consultez les reponses du locateur, les decisions sur vos demandes et repondez depuis Alertes."
            }
          />

          {loading ? (
            <LoadingSpinner message="Chargement des notifications..." />
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={notificationsOutline}
              title="Aucune notification"
              message="Vous n'avez pas encore de notifications."
            />
          ) : (
            <>
              <div className="notifications-stack">
                {normalizedNotifications.map((notification) => {
                  const tone = getTone(notification)
                  const isActive = activeId === notification._id

                  return (
                    <button
                      key={notification._id}
                      type="button"
                      className={`notification-card notification-card-button ${notification.isRead ? "" : "unread"} ${isActive ? "active" : ""}`}
                      onClick={() => handleOpenNotification(notification)}
                    >
                      <div className={`notification-icon ${tone}`}>
                        <IonIcon icon={getIcon(notification)} />
                      </div>
                      <div className="notification-body">
                        <div className="notification-row">
                          <h4>{notification.title || "Notification"}</h4>
                          <span className={`notification-pill ${tone}`}>
                            {notification.messageMeta?.conversationId ? "Reponse possible" : "Info"}
                          </span>
                        </div>
                        <p>{notification.preview || notification.message || "Sans contenu"}</p>
                        <small>{formatDate(notification.createdAt)}</small>
                      </div>
                    </button>
                  )
                })}
              </div>

              {activeNotification ? (
                <section className="notification-detail-card">
                  <div className="notification-detail-head">
                    <div className={`notification-icon ${getTone(activeNotification)}`}>
                      <IonIcon icon={getIcon(activeNotification)} />
                    </div>
                    <div>
                      <h3>{activeNotification.title || "Notification"}</h3>
                      <p>
                        {activeNotification.messageMeta?.senderName
                          ? `Message de ${activeNotification.messageMeta.senderName}`
                          : activeNotification.status || "Mise a jour"}
                      </p>
                    </div>
                  </div>

                  <div className="notification-detail-copy">
                    <strong>Details</strong>
                    <p>{activeNotification.content || activeNotification.message || activeNotification.preview || "Sans contenu"}</p>
                    <span>{formatDate(activeNotification.createdAt)}</span>
                  </div>

                   {activeNotification.contractData ? (
                    <div className="notification-contract-block">
                      <div className="contract-mini-card">
                        <img 
                          src={activeNotification.contractData.propertyImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"} 
                          alt="Propriété" 
                        />
                        <div className="contract-mini-info">
                          <h4>{activeNotification.contractData.propertyTitle}</h4>
                          <p>{activeNotification.contractData.propertyAddress}</p>
                          <strong>{activeNotification.contractData.rent?.toLocaleString("fr-FR")} TND / mois</strong>
                        </div>
                      </div>
                      <button 
                        className="detail-cta contract-cta"
                        onClick={() => {
                          const requestId = activeNotification.contractData?.requestId || activeNotification.relatedId
                          if (requestId) {
                            history.push(`/rental-requests?id=${requestId}`)
                          }
                        }}
                      >
                        <IonIcon icon={documentTextOutline} />
                        Consulter le Contrat
                      </button>
                    </div>
                  ) : activeNotification.requestMeta ? (
                    <div className="notification-request-block">
                       <div className="contract-mini-card">
                        <div className="contract-mini-info" style={{ paddingLeft: '15px' }}>
                          <h4>{activeNotification.requestMeta.propertyTitle}</h4>
                          <p>Demande de {activeNotification.requestMeta.tenantName}</p>
                        </div>
                      </div>
                      <button 
                        className="detail-cta request-cta"
                        onClick={() => {
                          history.push(`/rental-requests?id=${activeNotification.requestMeta?.requestId}`)
                        }}
                      >
                        <IonIcon icon={documentTextOutline} />
                        Consulter la Demande
                      </button>
                    </div>
                  ) : activeNotification.claimResponse ? (
                    <div className="notification-response-block">
                      <div className="response-message-card">
                        <IonIcon icon={checkmarkCircleOutline} className="response-icon" />
                        <div className="response-content">
                          <p className="response-label">Réponse du locateur</p>
                          <p className="response-text">{activeNotification.claimResponse.message}</p>
                        </div>
                      </div>
                      
                      {activeNotification.claimResponse.intervention && (
                        <div className="intervention-details-card">
                          <div className="intervention-header">
                            <IonIcon icon={calendarOutline} />
                            <span>Intervention programmée</span>
                          </div>
                          <div className="intervention-grid">
                            <div className="grid-item">
                              <small>Date</small>
                              <p>{activeNotification.claimResponse.intervention.date}</p>
                            </div>
                            <div className="grid-item">
                              <small>Heure</small>
                              <p>{activeNotification.claimResponse.intervention.time}</p>
                            </div>
                            <div className="grid-item">
                              <small>Technicien</small>
                              <p>{activeNotification.claimResponse.intervention.technician}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : activeNotification.messageMeta?.conversationId ? (
                    <form className="notification-reply-form" onSubmit={handleReply}>
                      <label className="notification-reply-field">
                        <span>Votre reponse</span>
                        <textarea
                          value={replyText}
                          onChange={(event) => setReplyText(event.target.value)}
                          placeholder={`Repondez a ${activeNotification.messageMeta.senderName || "ce message"}...`}
                          rows={5}
                        />
                      </label>

                      {replyError ? <p className="auth-status error">{replyError}</p> : null}
                      {replySuccess ? <p className="auth-status success">{replySuccess}</p> : null}

                      <button type="submit" className="detail-cta notification-send-btn" disabled={replyBusy}>
                        <IonIcon icon={sendOutline} />
                        {replyBusy ? "Envoi..." : "Envoyer la reponse"}
                      </button>
                    </form>
                  ) : (
                    <div className="notification-detail-note">
                      <IonIcon icon={informationCircleOutline} />
                      <p>
                        {user?.role === "tenant"
                          ? "Cette alerte est informative. Les notifications liees a une conversation afficheront un champ de reponse ici."
                          : "Aucune conversation associee a cette notification."}
                      </p>
                    </div>
                  )}
                </section>
              ) : null}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default NotificationsPage
