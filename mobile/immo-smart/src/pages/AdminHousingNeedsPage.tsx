import { IonBackButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonSpinner, IonTitle, IonToolbar, IonSearchbar, IonBadge } from "@ionic/react"
import {
  calendarOutline,
  homeOutline,
  locateOutline,
  mailOutline,
  personOutline,
  walletOutline,
  chevronForwardOutline,
} from "ionicons/icons"
import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { fetchAllHousingNeeds } from "../lib/housing-need-api"
import type { BackendHousingNeed } from "../types/api"
import "./HousingNeedsPage.css"

const AdminHousingNeedsPage: React.FC = () => {
  const { token } = useAuth()
  const [needs, setNeeds] = useState<BackendHousingNeed[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (!token) return

    fetchAllHousingNeeds(token)
      .then((data) => setNeeds(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur lors du chargement"))
      .finally(() => setIsLoading(false))
  }, [token])

  const filteredNeeds = needs.filter((need) => {
    const searchStr = `${need.tenant?.fullName || ""} ${need.desiredCity} ${need.department || ""}`.toLowerCase()
    return searchStr.includes(searchQuery.toLowerCase())
  })

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" text="" />
          </IonButtons>
          <IonTitle className="font-title">Besoins Logement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <IonSearchbar
            placeholder="Rechercher..."
            value={searchQuery}
            onIonInput={(e) => setSearchQuery(e.detail.value!)}
            className="immosmart-searchbar"
          />

          {isLoading ? (
            <div className="flex-center p-20">
              <IonSpinner name="crescent" color="primary" />
            </div>
          ) : error ? (
            <div className="p-20 text-center">
              <p className="text-red-500">{error}</p>
            </div>
          ) : filteredNeeds.length === 0 ? (
            <div className="p-20 text-center opacity-50">
              <p>Aucun besoin trouve.</p>
            </div>
          ) : (
            <div className="needs-list p-4 space-y-4">
              {filteredNeeds.map((need) => (
                <div key={need._id} className="housing-summary-card" style={{ padding: '20px' }}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-xl text-primary">
                        <IonIcon icon={personOutline} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold m-0">{need.tenant?.fullName || "Locataire"}</h3>
                        <p className="text-sm opacity-60 flex items-center gap-1 m-0">
                          <IonIcon icon={mailOutline} style={{ fontSize: '12px' }} />
                          {need.tenant?.email}
                        </p>
                      </div>
                    </div>
                    <IonBadge color="primary" mode="ios">
                      {new Date(need.updatedAt || "").toLocaleDateString()}
                    </IonBadge>
                  </div>

                  <div className="grid gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <IonIcon icon={locateOutline} className="text-primary" />
                      <span className="font-medium">{need.desiredCity}</span>
                      {need.department && <span className="opacity-50 text-sm">({need.department})</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <IonIcon icon={walletOutline} className="text-primary" />
                      <span className="font-medium">{need.minBudget || 0} - {need.maxBudget || 'Illimite'} TND</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IonIcon icon={calendarOutline} className="text-primary" />
                      <span className="font-medium">
                        {need.moveInDate ? new Date(need.moveInDate).toLocaleDateString() : 'Immediat'}
                      </span>
                      <span className="opacity-50 text-sm">({need.duration || 'Non precise'})</span>
                    </div>
                  </div>

                  {need.notes && (
                    <div className="bg-black/5 p-3 rounded-xl mb-4 italic text-sm opacity-70">
                      "{need.notes}"
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <IonBadge color="light">{need.propertyType?.toUpperCase() || 'Tous types'}</IonBadge>
                    {need.meuble && <IonBadge color="success" mode="ios">Meuble</IonBadge>}
                    {need.parking && <IonBadge color="primary" mode="ios">Parking</IonBadge>}
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

export default AdminHousingNeedsPage
