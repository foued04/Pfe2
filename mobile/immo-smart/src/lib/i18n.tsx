import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type Language = "en" | "fr" | "ar"

const LANGUAGE_STORAGE_KEY = "immosmart:language"

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Roles
    "role.admin": "Admin",
    "role.owner": "Locateur",
    "role.tenant": "Tenant",
    
    // Navigation
    "nav.home": "Home",
    "nav.search": "Explore",
    "nav.dashboard": "Dashboard",
    "nav.notifications": "Alerts",
    "nav.profile": "Account",
    "nav.favorites": "Favorites",
    "nav.requests": "Requests",
    "nav.furniture": "Furniture",
    "nav.messages": "Messages",
    "nav.maintenance": "Maintenance",
    "nav.housingNeeds": "Housing Needs",
    "nav.myProperties": "My Properties",
    "nav.addProperty": "Add Property",
    "nav.map": "Map",
    
    // General
    "general.loading": "Loading...",
    "general.error": "An error occurred",
    "general.success": "Success!",
    "general.close": "Close",
    "general.save": "Save",
    "general.back": "Back",
    "general.submit": "Submit",
    "general.cancel": "Cancel",
    "general.delete": "Delete",
    "general.edit": "Edit",
    "general.noData": "No data found",
    "general.logout": "Logout",
    "general.settings": "Settings",
    "general.details": "Details",
    "general.viewDetails": "View details",
    "general.modify": "Modify",
    "general.deleteProperty": "Delete property",
    "general.manageFurniture": "Manage furniture",
    "general.readonly": "Read only",
    "general.allProperties": "All Properties",
    
    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.welcome": "Welcome",
    "dashboard.owner": "Locateur Dashboard",
    "dashboard.tenant": "Tenant Dashboard",
    "dashboard.totalProperties": "Total properties",
    "dashboard.pendingRequests": "Pending requests",
    "dashboard.monthlyRevenue": "Monthly revenue",
    "dashboard.available": "Available",
    "dashboard.viewAllProperties": "View all properties",
    "dashboard.reviewRequests": "Review requests",
    "dashboard.openMap": "Open map",
    "dashboard.myProperties": "My Properties",
    "dashboard.noProperties": "No properties yet",
    "dashboard.publicListings": "Public Listings",
    "dashboard.exploreCatalog": "Explore the catalog",
    "dashboard.propertyManagement": "Property Management",
    "dashboard.stats": "Stats",
    "dashboard.eyebrow": "Dashboard",
    "dashboard.ownerEyebrow": "Locateur",
    
    // Status
    "status.available": "Available",
    "status.rented": "Rented",
    "status.maintenance": "Maintenance",
    "status.myProperty": "My property",
    "status.otherOwner": "Other locateur",
    "status.furnished": "Furnished",
    "status.depot": "Deposit",
    
    // Map
    "map.legend": "Status",
    "map.listTitle": "Properties List",
    "map.noGeo": "No geolocated properties available.",
  },
  fr: {
    // Roles
    "role.admin": "Admin",
    "role.owner": "Locateur",
    "role.tenant": "Locataire",
    
    // Navigation
    "nav.home": "Accueil",
    "nav.search": "Biens",
    "nav.dashboard": "Dashboard",
    "nav.notifications": "Alertes",
    "nav.profile": "Compte",
    "nav.favorites": "Favoris",
    "nav.requests": "Demandes",
    "nav.furniture": "Mobilier",
    "nav.messages": "Messages",
    "nav.maintenance": "Réclamations",
    "nav.housingNeeds": "Besoins Logement",
    "nav.myProperties": "Mes Propriétés",
    "nav.addProperty": "Ajouter",
    "nav.map": "Carte",
    
    // General
    "general.loading": "Chargement...",
    "general.error": "Une erreur est survenue",
    "general.success": "Succès !",
    "general.close": "Fermer",
    "general.save": "Enregistrer",
    "general.back": "Retour",
    "general.submit": "Envoyer",
    "general.cancel": "Annuler",
    "general.delete": "Supprimer",
    "general.edit": "Modifier",
    "general.noData": "Aucune donnée trouvée",
    "general.logout": "Déconnexion",
    "general.settings": "Paramètres",
    "general.details": "Détails",
    "general.viewDetails": "Voir détails",
    "general.modify": "Modifier",
    "general.deleteProperty": "Supprimer le bien",
    "general.manageFurniture": "Gérer les meubles",
    "general.readonly": "Lecture seule",
    "general.allProperties": "Toutes les Propriétés",
    
    // Dashboard
    "dashboard.title": "Tableau de Bord",
    "dashboard.welcome": "Bienvenue",
    "dashboard.owner": "Tableau de bord Locateur",
    "dashboard.tenant": "Tableau de bord Locataire",
    "dashboard.totalProperties": "Total propriétés",
    "dashboard.pendingRequests": "Demandes en attente",
    "dashboard.monthlyRevenue": "Revenu mensuel",
    "dashboard.available": "Disponibles",
    "dashboard.viewAllProperties": "Voir tous les biens",
    "dashboard.reviewRequests": "Examiner les demandes",
    "dashboard.openMap": "Ouvrir la carte",
    "dashboard.myProperties": "Mes Propriétés",
    "dashboard.noProperties": "Aucun bien pour le moment",
    "dashboard.publicListings": "Annonces Publiques",
    "dashboard.exploreCatalog": "Explorer le catalogue",
    "dashboard.propertyManagement": "Gestion Immobilière",
    "dashboard.stats": "Stats",
    "dashboard.eyebrow": "Tableau de bord",
    "dashboard.ownerEyebrow": "Locateur",
    
    // Status
    "status.available": "Disponible",
    "status.rented": "Loué",
    "status.maintenance": "Entretien",
    "status.myProperty": "Mon bien",
    "status.otherOwner": "Autre locateur",
    "status.furnished": "Meublé",
    "status.depot": "Dépôt",
    
    // Map
    "map.legend": "Statuts",
    "map.listTitle": "Liste des Biens",
    "map.noGeo": "Aucun bien géolocalisé disponible pour la carte.",
  },
  ar: {
    "general.language": "اللغة",
    "general.save": "حفظ",
    "general.back": "رجوع",
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("fr")

  useEffect(() => {
    const storedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY)
    if (storedLang === "fr" || storedLang === "en" || storedLang === "ar") {
      setLangState(storedLang)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (nextLang: Language) => {
    setLangState(nextLang)
  }

  const t = (key: string): string => {
    return translations[lang][key] || translations.fr[key] || translations.en[key] || key
  }

  const value = useMemo(() => ({ lang, setLang, t }), [lang])

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
