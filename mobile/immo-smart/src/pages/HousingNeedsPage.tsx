import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from "@ionic/react"
import { homeOutline } from "ionicons/icons"
import EmptyState from "../components/EmptyState"
import "../theme/mobile-theme.css"

const HousingNeedsPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" icon="arrow-back-outline" />
          </IonButtons>
          <IonTitle className="font-title">Besoins Logement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <EmptyState
            icon={homeOutline}
            title="Aucune demande"
            message="Exprimez vos besoins spécifiques et nous trouverons le logement idéal pour vous."
            actionLabel="Soumettre un besoin"
          />
        </div>
      </IonContent>
    </IonPage>
  )
}

export default HousingNeedsPage
