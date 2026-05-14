import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react"
import { heartOutline } from "ionicons/icons"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"
import PropertyCard from "../components/PropertyCard"
import { useAuth } from "../lib/auth-context"
import { FAVORITES_UPDATED_EVENT, getFavoritePropertyIds } from "../lib/favorites"
import { fetchProperties } from "../lib/property-api"
import type { BackendProperty } from "../types/api"
import "../theme/mobile-theme.css"

const FavoritesPage: React.FC = () => {
  const { user, token } = useAuth()
  const history = useHistory()
  const [properties, setProperties] = useState<BackendProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [favoriteIds, setFavoriteIds] = useState<string[]>([])

  useEffect(() => {
    setFavoriteIds(user?.id ? getFavoritePropertyIds(user.id) : [])
  }, [user?.id])

  useEffect(() => {
    const handleFavoritesUpdated = () => {
      setFavoriteIds(user?.id ? getFavoritePropertyIds(user.id) : [])
    }

    window.addEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated)
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, handleFavoritesUpdated)
    }
  }, [user?.id])

  useEffect(() => {
    let active = true

    const loadFavorites = async () => {
      if (!user?.id) {
        if (active) {
          setProperties([])
          setLoading(false)
        }
        return
      }

      setLoading(true)
      try {
        setError("")
        const data = await fetchProperties(token || undefined)
        if (!active) return

        const visibleProperties = (Array.isArray(data) ? data : []).filter(
          (property) =>
            property.moderationStatus === "approved" &&
            property.status === "available" &&
            favoriteIds.includes(property._id)
        )
        setProperties(visibleProperties)
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Impossible de charger les favoris.")
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadFavorites()
    return () => {
      active = false
    }
  }, [favoriteIds, token, user?.id])

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" icon="arrow-back-outline" />
          </IonButtons>
          <IonTitle className="font-title">Mes Favoris</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          {loading ? (
            <LoadingSpinner message="Chargement de vos favoris..." />
          ) : error ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : properties.length === 0 ? (
            <EmptyState
              icon={heartOutline}
              title="Aucun favori"
              message="Vous n'avez pas encore ajouté de biens à vos favoris."
              actionLabel="Explorer les biens"
              onAction={() => history.push("/tab2?view=list")}
            />
          ) : (
            <div className="property-list">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default FavoritesPage
