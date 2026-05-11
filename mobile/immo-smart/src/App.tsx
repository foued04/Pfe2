import { Redirect, Route } from "react-router-dom"
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react"
import { IonReactRouter } from "@ionic/react-router"
import {
  homeOutline,
  searchOutline,
  gridOutline,
  notificationsOutline,
  personOutline,
} from "ionicons/icons"
import { AuthProvider, useAuth } from "./lib/auth-context"

import Tab1 from "./pages/Tab1"
import Tab2 from "./pages/Tab2"
import Tab3 from "./pages/Tab3"
import OwnerDashboard from "./pages/OwnerDashboard"
import TenantDashboard from "./pages/TenantDashboard"
import NotificationsPage from "./pages/NotificationsPage"
import ProfilePage from "./pages/ProfilePage"
import PropertyDetailPage from "./pages/PropertyDetailPage"
import PropertyFormPage from "./pages/PropertyFormPage"
import RentalRequestsPage from "./pages/RentalRequestsPage"
import FavoritesPage from "./pages/FavoritesPage"
import FurniturePage from "./pages/FurniturePage"
import MaintenancePage from "./pages/MaintenancePage"
import HousingNeedsPage from "./pages/HousingNeedsPage"
import AdminHousingNeedsPage from "./pages/AdminHousingNeedsPage"
import AdminUsersPage from "./pages/AdminUsersPage"
import MessagesPage from "./pages/MessagesPage"
import MobileChatbot from "./components/MobileChatbot"
import VerifyEmailPage from "./pages/VerifyEmailPage"

import "@ionic/react/css/core.css"

import "@ionic/react/css/normalize.css"
import "@ionic/react/css/structure.css"
import "@ionic/react/css/typography.css"
import "@ionic/react/css/padding.css"
import "@ionic/react/css/float-elements.css"
import "@ionic/react/css/text-alignment.css"
import "@ionic/react/css/text-transformation.css"
import "@ionic/react/css/flex-utils.css"
import "@ionic/react/css/display.css"

import "./theme/variables.css"
import "./theme/mobile-theme.css"

setupIonicReact()

const DashboardRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Redirect to="/login" />
  }

  switch (user?.role) {
    case "owner":
      return <OwnerDashboard />
    case "tenant":
      return <TenantDashboard />
    case "admin":
      return <Redirect to="/account" />
    default:
      return <Redirect to="/login" />
  }
}

const ProtectedRoute: React.FC<{ component: React.FC }> = ({ component: Component }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Component /> : <Redirect to="/login" />
}

const AppTabs: React.FC = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/tab1" component={Tab1} />
      <Route exact path="/tab2" component={Tab2} />
      <Route exact path="/tab3">
        <DashboardRoute />
      </Route>
      <Route exact path="/login" component={Tab3} />
      <Route exact path="/register" component={Tab3} />
      <Route exact path="/verify-email" component={VerifyEmailPage} />
      <Route exact path="/notifications">
        <ProtectedRoute component={NotificationsPage} />
      </Route>
      <Route exact path="/account" component={Tab3} />
      <Route exact path="/profile">
        <ProtectedRoute component={ProfilePage} />
      </Route>
      <Route exact path="/property/:id" component={PropertyDetailPage} />
      <Route exact path="/property-form">
        <ProtectedRoute component={PropertyFormPage} />
      </Route>
      <Route exact path="/property-form/:id" component={PropertyFormPage} />
      <Route exact path="/rental-requests">
        <ProtectedRoute component={RentalRequestsPage} />
      </Route>
      <Route exact path="/favorites">
        <ProtectedRoute component={FavoritesPage} />
      </Route>
      <Route exact path="/furniture">
        <ProtectedRoute component={FurniturePage} />
      </Route>
      <Route exact path="/messages">
        <ProtectedRoute component={MessagesPage} />
      </Route>
      <Route exact path="/maintenance">
        <ProtectedRoute component={MaintenancePage} />
      </Route>
      <Route exact path="/housing-needs">
        <ProtectedRoute component={HousingNeedsPage} />
      </Route>
      <Route exact path="/admin/housing-needs">
        <ProtectedRoute component={AdminHousingNeedsPage} />
      </Route>
      <Route exact path="/admin/users">
        <ProtectedRoute component={AdminUsersPage} />
      </Route>
      <Route exact path="/">
        <Redirect to="/tab1" />
      </Route>
    </IonRouterOutlet>

    <IonTabBar slot="bottom" className="immosmart-glass-tabbar">
      <IonTabButton tab="tab1" href="/tab1">
        <IonIcon icon={homeOutline} />
        <IonLabel>Accueil</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab2" href="/tab2">
        <IonIcon icon={searchOutline} />
        <IonLabel>Biens</IonLabel>
      </IonTabButton>
      <IonTabButton tab="tab3" href="/tab3">
        <IonIcon icon={gridOutline} />
        <IonLabel>Dashboard</IonLabel>
      </IonTabButton>
      <IonTabButton tab="notifications" href="/notifications">
        <IonIcon icon={notificationsOutline} />
        <IonLabel>Alertes</IonLabel>
      </IonTabButton>
      <IonTabButton tab="account" href="/account">
        <IonIcon icon={personOutline} />
        <IonLabel>Compte</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
)

import { SocketProvider } from "./lib/socket-context"

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <SocketProvider>
        <IonReactRouter>
          <AppTabs />
        </IonReactRouter>
        <MobileChatbot />
      </SocketProvider>
    </AuthProvider>
  </IonApp>
)


export default App
