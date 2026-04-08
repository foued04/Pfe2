import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  notificationsOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
} from "ionicons/icons"
import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { fetchNotifications, markNotificationRead } from "../lib/notification-api"
import type { BackendNotification } from "../types/api"
import LoadingSpinner from "../components/LoadingSpinner"
import EmptyState from "../components/EmptyState"
import SectionHeader from "../components/SectionHeader"

const NotificationsPage: React.FC = () => {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<BackendNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const data = await fetchNotifications(token)
        if (active) setNotifications(data)
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Erreur chargement")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [token])

  const handleMarkRead = async (id: string) => {
    if (!token) return
    try {
      await markNotificationRead(id, token)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      )
    } catch {
      // silently fail
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const getIcon = (type?: string) => {
    switch (type) {
      case "success":
        return checkmarkCircleOutline
      case "warning":
        return alertCircleOutline
      default:
        return informationCircleOutline
    }
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

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <SectionHeader
            badge={unreadCount > 0 ? `${unreadCount} nouvelles` : "À jour"}
            title="Notifications"
            subtitle="Restez informé de l'activité de votre espace immobilier."
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
            <div style={{ display: "grid", gap: 10 }}>
              {notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`notification-card ${notif.isRead ? "" : "unread"}`}
                  onClick={() => !notif.isRead && handleMarkRead(notif._id)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="notification-icon">
                    <IonIcon icon={getIcon(notif.type)} />
                  </div>
                  <div className="notification-body">
                    <h4>{notif.title || "Notification"}</h4>
                    <p>{notif.message || notif.preview || "Sans contenu"}</p>
                    <small>{formatDate(notif.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default NotificationsPage
