import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from "@ionic/react"
import { buildOutline } from "ionicons/icons"
import EmptyState from "../components/EmptyState"
import "../theme/mobile-theme.css"

const MaintenancePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" icon="arrow-back-outline" />
          </IonButtons>
          <IonTitle className="font-title">Réclamations</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <EmptyState
            icon={buildOutline}
            title="Aucune réclamation"
            message="Vous n'avez soumis aucune demande de maintenance pour votre logement actuel."
          />
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MaintenancePage
