import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from "@ionic/react"
import { bedOutline } from "ionicons/icons"
import EmptyState from "../components/EmptyState"
import "../theme/mobile-theme.css"

const FurniturePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tab3" text="" icon="arrow-back-outline" />
          </IonButtons>
          <IonTitle className="font-title">Ameublement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page">
          <EmptyState
            icon={bedOutline}
            title="Catalogue Mobilier"
            message="Le catalogue d'ameublement n'est pas encore disponible sur l'application mobile."
          />
        </div>
      </IonContent>
    </IonPage>
  )
}

export default FurniturePage
