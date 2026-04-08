import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar, IonButtons, IonBackButton } from "@ionic/react"
import { heartOutline } from "ionicons/icons"
import EmptyState from "../components/EmptyState"
import "../theme/mobile-theme.css"

const FavoritesPage: React.FC = () => {
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
          <EmptyState
            icon={heartOutline}
            title="Aucun favori"
            message="Vous n'avez pas encore ajouté de biens à vos favoris."
            actionLabel="Explorer les biens"
            onAction={() => window.location.href = "/tab2"}
          />
        </div>
      </IonContent>
    </IonPage>
  )
}

export default FavoritesPage
