import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  personOutline,
  searchOutline,
  mapOutline,
  heartOutline,
  documentTextOutline,
  bedOutline,
  buildOutline,
  homeOutline,
  notificationsOutline,
  logOutOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { fetchRentalRequests } from "../lib/rental-api"
import { fetchUnreadNotificationsCount } from "../lib/notification-api"
import { fetchUnreadMessagesCount } from "../lib/messages-api"
import type { BackendRentalRequest } from "../types/api"
import { useHistory } from "react-router-dom"
import "./TenantDashboard.css"

const TenantDashboard: React.FC = () => {
  const { user, token, logout } = useAuth()
  const history = useHistory()
  const [requests, setRequests] = useState<BackendRentalRequest[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      try {
        const [reqData, notifData, messagesData] = await Promise.all([
          fetchRentalRequests(token).catch(() => [] as BackendRentalRequest[]),
          fetchUnreadNotificationsCount(token).catch(() => ({ count: 0 })),
          fetchUnreadMessagesCount(token).catch(() => ({ count: 0 })),
        ])
        if (active) {
          setRequests(reqData)
          setUnreadNotifications(Number(notifData?.count || 0))
          setUnreadMessages(Number(messagesData?.count || 0))
        }
      } catch (err) {
        // Handle error silently
      }
    }

    load()
    const interval = setInterval(load, 30000)
    return () => { 
      active = false
      clearInterval(interval)
    }
  }, [token])

  const stats = useMemo(() => {
    const pendingReqs = requests.filter((r) => !r.status || r.status === "En attente").length
    return { pendingReqs }
  }, [requests])

  const menuItems = [
    { title: "Recherche", icon: searchOutline, route: "/tab2?view=list", color: "blue", stat: 0 },
    { title: "Carte", icon: mapOutline, route: "/tab2?view=map", color: "blue", stat: 0 },
    { title: "Favoris", icon: heartOutline, route: "/favorites", color: "red", stat: 0 },
    { title: "Mes Demandes", icon: documentTextOutline, route: "/rental-requests", color: "teal", stat: stats.pendingReqs },
    { title: "Mobilier", icon: bedOutline, route: "/furniture", color: "indigo", stat: 0 },
    { title: "Réclamations", icon: buildOutline, route: "/maintenance", color: "orange", stat: 0 },
    { title: "Besoins Logement", icon: homeOutline, route: "/housing-needs", color: "green", stat: 0 },
    { title: "Messages", icon: notificationsOutline, route: "/messages", color: "purple", stat: unreadMessages },
    { title: "Notifications", icon: notificationsOutline, route: "/notifications", color: "orange", stat: unreadNotifications },
    { title: "Profil", icon: personOutline, route: "/profile", color: "slate", stat: 0 },
  ]

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="dashboard-header-bg">
          <div className="top-brand dashboard-brand">
            <div className="brand-info">
              <p className="brand-sub">Tableau de bord locataire</p>
              <h1 className="brand-title">Bienvenue, {user?.name || "Locataire"}</h1>
            </div>
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="dashboard-avatar" />
            ) : (
              <IonIcon icon={personOutline} className="brand-icon" />
            )}
          </div>
        </div>

        <div className="dashboard-grid-container">
          <h2 className="dashboard-section-title">Mes Services</h2>
          <div className="dashboard-tiles-grid">
            {menuItems.map((item, idx) => (
              <div key={idx} className="dashboard-tile" onClick={() => history.push(item.route)}>
                <div className={`tile-icon-box bg-${item.color}`}>
                  <IonIcon icon={item.icon} />
                  {item.stat > 0 && <span className="tile-badge">{item.stat}</span>}
                </div>
                <span className="tile-title">{item.title}</span>
              </div>
            ))}
          </div>

          <div className="dashboard-footer-actions">
            <button
              type="button"
              className="dashboard-logout-btn"
              onClick={() => {
                logout()
                history.replace("/account")
              }}
            >
              <IonIcon icon={logOutOutline} />
              Se déconnecter
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default TenantDashboard
