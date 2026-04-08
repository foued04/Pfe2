import { IonIcon } from "@ionic/react"
import { locationOutline, bedOutline, waterOutline, expandOutline } from "ionicons/icons"
import type { BackendProperty } from "../types/api"
import { useHistory } from "react-router-dom"

type Props = {
  property: BackendProperty
}

const statusLabel: Record<string, string> = {
  available: "Disponible",
  rented: "Loué",
  maintenance: "Maintenance",
}

const PropertyCard: React.FC<Props> = ({ property }) => {
  const history = useHistory()

  return (
    <article
      className="property-card"
      onClick={() => history.push(`/property/${property._id}`)}
      role="button"
      tabIndex={0}
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
        <span className="rent-pill">{property.rent} TND/mois</span>
      </div>
      <div className="property-body">
        <h3>{property.title}</h3>
        <p className="address">
          <IonIcon icon={locationOutline} />
          {property.city} — {property.address}
        </p>
        <div className="spec-row">
          <span>
            <IonIcon icon={expandOutline} />
            {property.surface}m²
          </span>
          <span>
            <IonIcon icon={bedOutline} />
            {property.bedrooms} ch.
          </span>
          <span>
            <IonIcon icon={waterOutline} />
            {property.bathrooms} sdb
          </span>
        </div>
        <div className="type-chip">{property.type.toUpperCase()}</div>
      </div>
    </article>
  )
}

export default PropertyCard
