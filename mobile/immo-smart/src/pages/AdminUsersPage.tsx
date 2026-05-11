import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonAvatar,
  IonBadge,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonToast,
  IonAlert
} from "@ionic/react"
import { trashOutline, mailOutline, callOutline, personOutline, shieldCheckmarkOutline } from "ionicons/icons"
import { useEffect, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { fetchAdminUsers, deleteUserByAdmin } from "../lib/user-api"
import "./AdminUsersPage.css"

const AdminUsersPage: React.FC = () => {
  const { token } = useAuth()
  const [role, setRole] = useState<"owner" | "tenant">("owner")
  const [search, setSearch] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [userToDelete, setUserToDelete] = useState<any>(null)

  const loadUsers = async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await fetchAdminUsers(role, search, token)
      setUsers(data)
    } catch (err) {
      console.error(err)
      setToastMessage("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [role, search, token])

  const handleDelete = async () => {
    if (!token || !userToDelete) return
    try {
      await deleteUserByAdmin(userToDelete._id, token)
      setUsers(users.filter(u => u._id !== userToDelete._id))
      setToastMessage("Utilisateur supprimé définitivement")
    } catch (err) {
      setToastMessage("Erreur lors de la suppression")
    } finally {
      setUserToDelete(null)
    }
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="immosmart-toolbar">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/profile" />
          </IonButtons>
          <IonTitle>Gestion Utilisateurs</IonTitle>
        </IonToolbar>
        <IonToolbar className="immosmart-toolbar">
          <IonSearchbar
            value={search}
            onIonInput={(e) => setSearch(e.detail.value!)}
            placeholder="Rechercher par nom..."
            className="immosmart-searchbar"
          />
        </IonToolbar>
        <IonToolbar className="immosmart-toolbar">
          <IonSegment value={role} onIonChange={(e) => setRole(e.detail.value as any)}>
            <IonSegmentButton value="owner">
              <IonLabel>Locateurs</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="tenant">
              <IonLabel>Locataires</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={(e) => { loadUsers().then(() => e.detail.complete()) }}>
          <IonRefresherContent />
        </IonRefresher>

        <IonList className="immosmart-list">
          {users.map((user) => (
            <IonItem key={user._id} className="immosmart-user-item">
              <IonAvatar slot="start">
                <div className="avatar-placeholder">{user.fullName[0]}</div>
              </IonAvatar>
              <IonLabel>
                <h2>{user.fullName}</h2>
                <p>
                  <IonIcon icon={mailOutline} /> {user.email}
                </p>
                <p>
                  <IonIcon icon={callOutline} /> {user.phone || "---"}
                </p>
              </IonLabel>
              <IonButtons slot="end">
                <IonButton color="danger" onClick={() => setUserToDelete(user)}>
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonButtons>
            </IonItem>
          ))}
          {!loading && users.length === 0 && (
            <div className="ion-text-center ion-padding mt-8">
              <IonIcon icon={personOutline} size="large" color="medium" />
              <p className="text-muted">Aucun utilisateur trouvé</p>
            </div>
          )}
        </IonList>

        <IonToast
          isOpen={!!toastMessage}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage("")}
        />

        <IonAlert
          isOpen={!!userToDelete}
          header="Confirmation"
          subHeader="Suppression Définitive"
          message={`ATTENTION: Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT ${userToDelete?.fullName} ? Cette action supprimera également toutes ses propriétés, contrats et messages. Elle est IRREVERSIBLE.`}
          buttons={[
            { text: "Annuler", role: "cancel", handler: () => setUserToDelete(null) },
            { text: "Supprimer", cssClass: "alert-danger", handler: handleDelete }
          ]}
        />
      </IonContent>
    </IonPage>
  )
}

export default AdminUsersPage
