import { IonIcon } from "@ionic/react"
import { bedOutline, calendarOutline, expandOutline, heart, heartOutline, locationOutline, waterOutline } from "ionicons/icons"
import { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { FAVORITES_UPDATED_EVENT, isFavoriteProperty, toggleFavoriteProperty } from "../lib/favorites"
import type { BackendProperty } from "../types/api"

type Props = {
  property: BackendProperty
}

const statusLabel: Record<string, string> = {
  available: "Disponible",
  rented: "Loue",
  maintenance: "Maintenance",
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  const history = useHistory()
  const { user } = useAuth()
  const isTenant = user?.role === "tenant"
  const [isFavorite, setIsFavorite] = useState(false)
  const details = [
    { icon: expandOutline, label: `${property.surface} m2` },
    { icon: bedOutline, label: `${property.bedrooms} ch.` },
    { icon: waterOutline, label: `${property.bathrooms} sdb` },
  ]
  const descriptionPreview =
    property.description && property.description.length > 128
      ? `${property.description.slice(0, 125)}...`
      : property.description
  const displayLocation = [property.city, property.address].filter(Boolean).join(" - ")
  const openDetails = () => history.push(`/property/${property._id}`)

  useEffect(() => {
    if (!isTenant || !user?.id) {
      setIsFavorite(false)
      return
    }

    setIsFavorite(isFavoriteProperty(user.id, property._id))
  }, [isTenant, property._id, user?.id])

  useEffect(() => {
    const syncFavoriteState = () => {
      if (!isTenant || !user?.id) return
      setIsFavorite(isFavoriteProperty(user.id, property._id))
    }

    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavoriteState)
    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavoriteState)
    }
  }, [isTenant, property._id, user?.id])

  const handleToggleFavorite = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!isTenant || !user?.id) return
    const nextFavorites = toggleFavoriteProperty(user.id, property._id)
    setIsFavorite(nextFavorites.includes(property._id))
  }

  return (
    <article
      className="property-card"
      onClick={openDetails}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          openDetails()
        }
      }}
    >
      <div className="property-hero">
        <img
          src={
            property.images?.cover ||
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop"
          }
          alt={property.title}
        />
        <span className={`status-pill ${property.status}`}>
          {statusLabel[property.status] || property.status}
        </span>
        {isTenant ? (
          <button
            type="button"
            className={`property-favorite-btn ${isFavorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <IonIcon icon={isFavorite ? heart : heartOutline} />
          </button>
        ) : null}
        <span className="rent-pill">{property.rent.toLocaleString("fr-TN")} TND/mois</span>
      </div>

      <div className="property-body">
        <div className="property-heading-row">
          <h3>{property.title}</h3>
          <div className="type-chip">{property.type.toUpperCase()}</div>
        </div>

        <p className="address">
          <IonIcon icon={locationOutline} />
          {displayLocation || "Adresse non specifiee"}
        </p>

        <div className="property-inline-meta">
          <span className="property-inline-chip">
            <IonIcon icon={calendarOutline} />
            {property.availability || "Disponible"}
          </span>
        </div>

        {descriptionPreview ? <p className="property-summary">{descriptionPreview}</p> : null}

        <div className="spec-row">
          {details.map((detail) => (
            <span key={detail.label}>
              <IonIcon icon={detail.icon} />
              {detail.label}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default PropertyCard
