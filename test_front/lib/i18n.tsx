"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "en" | "fr"

interface I18nContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Roles
    "role.admin": "Admin",
    "role.owner": "Owner",
    "role.tenant": "Tenant",
    
    // Navigation - Owner
    "nav.overview": "Overview",
    "nav.myProperties": "My Properties",
    "nav.addProperty": "Add Property",
    "nav.requests": "Requests",
    "nav.messages": "Messages",
    "nav.analytics": "Analytics",
    "nav.profile": "Profile",
    
    // Navigation - Tenant
    "nav.search": "Search",
    "nav.favorites": "Favorites",
    "nav.myRequests": "My Requests",
    "nav.housingNeeds": "Housing Needs",
    "nav.maintenance": "Maintenance",
    
    // Navigation - Admin
    "nav.dashboard": "Dashboard",
    "nav.users": "Users",
    "nav.allProperties": "All Properties",
    "nav.reports": "Reports",
    "nav.settings": "Settings",
    "nav.map": "Map",
    
    // Dashboard - Owner
    "dashboard.title": "Owner Dashboard",
    "dashboard.welcome": "Welcome back",
    "dashboard.totalProperties": "Total Properties",
    "dashboard.availableProperties": "Available",
    "dashboard.rentedProperties": "Rented",
    "dashboard.estimatedRevenue": "Est. Revenue",
    "dashboard.requestsReceived": "Requests",
    
    // Dashboard - Tenant
    "tenant.title": "Find Your Home",
    "tenant.subtitle": "Discover your perfect rental property",
    "tenant.searchPlaceholder": "Search by city, department...",
    "tenant.filters": "Filters",
    "tenant.results": "results found",
    "tenant.noResults": "No properties found",
    "tenant.contactOwner": "Contact Owner",
    "tenant.addFavorite": "Add to Favorites",
    "tenant.removeFavorite": "Remove from Favorites",
    "tenant.sendRequest": "Send Request",
    "tenant.viewGallery": "View Gallery",
    
    // Filters
    "filter.city": "City",
    "filter.department": "Department",
    "filter.minBudget": "Min Budget",
    "filter.maxBudget": "Max Budget",
    "filter.propertyType": "Property Type",
    "filter.bedrooms": "Bedrooms",
    "filter.furnished": "Furnished",
    "filter.parking": "Parking",
    "filter.availability": "Availability",
    "filter.minSurface": "Min Surface",
    "filter.apply": "Apply Filters",
    "filter.reset": "Reset",
    
    // Property Types
    "type.s0": "S+0 (Studio)",
    "type.s1": "S+1",
    "type.s2": "S+2",
    "type.s3": "S+3",
    "type.s4": "S+4",
    "type.villa": "Villa",
    
    // Property Card
    "property.perMonth": "/month",
    "property.status.available": "Available",
    "property.status.rented": "Rented",
    "property.status.maintenance": "Maintenance",
    "property.edit": "Edit",
    "property.delete": "Delete",
    "property.viewDetails": "View Details",
    "property.bedrooms": "Bedrooms",
    "property.bathrooms": "Bathrooms",
    "property.surface": "Surface",
    "property.deposit": "Deposit",
    "property.amenities": "Amenities",
    "property.description": "Description",
    "property.contact": "Contact",
    "property.location": "Location",
    "property.gallery": "Gallery",
    
    // Forms
    "form.title": "Property Title",
    "form.description": "Description",
    "form.city": "City",
    "form.department": "Department/Region",
    "form.address": "Address",
    "form.rent": "Monthly Rent",
    "form.deposit": "Deposit",
    "form.type": "Property Type",
    "form.surface": "Surface (m²)",
    "form.bedrooms": "Bedrooms",
    "form.bathrooms": "Bathrooms",
    "form.livingRooms": "Living Rooms",
    "form.equippedKitchen": "Equipped Kitchen",
    "form.balcony": "Balcony/Terrace",
    "form.parking": "Parking",
    "form.furnished": "Furnished",
    "form.availability": "Availability Date",
    "form.images": "Images",
    "form.coverImage": "Cover Image",
    "form.kitchenImage": "Kitchen Image",
    "form.bathroomImage": "Bathroom Image",
    "form.bedroomImage": "Bedroom Image",
    "form.livingRoomImage": "Living Room Image",
    "form.exteriorImage": "Exterior Image",
    "form.gallery": "Gallery",
    "form.submit": "Submit Property",
    "form.cancel": "Cancel",
    "form.yes": "Yes",
    "form.no": "No",
    
    // Housing Needs Form
    "housing.title": "Describe Your Housing Needs",
    "housing.subtitle": "Tell us what you're looking for",
    "housing.fullName": "Full Name",
    "housing.email": "Email",
    "housing.phone": "Phone",
    "housing.desiredCity": "Desired City",
    "housing.desiredDepartment": "Department/Region",
    "housing.minBudget": "Minimum Budget",
    "housing.maxBudget": "Maximum Budget",
    "housing.desiredType": "Desired Property Type",
    "housing.desiredBedrooms": "Desired Bedrooms",
    "housing.moveInDate": "Desired Move-in Date",
    "housing.duration": "Rental Duration",
    "housing.furnished": "Furnished Preference",
    "housing.parking": "Parking Needed",
    "housing.nearCenter": "Near City Center",
    "housing.notes": "Extra Notes / Special Needs",
    "housing.submit": "Submit Request",
    
    // Contact Form
    "contact.title": "Contact Owner",
    "contact.name": "Your Name",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.message": "Message",
    "contact.visitDate": "Preferred Visit Date",
    "contact.send": "Send Message",
    
    // AI Chatbot
    "chatbot.title": "ImmoSmart Assistant",
    "chatbot.placeholder": "Ask me anything...",
    "chatbot.welcome": "Hello! How can I help you today?",
    "chatbot.suggestions": "Suggestions",
    
    // General
    "general.search": "Search...",
    "general.language": "Language",
    "general.loading": "Loading...",
    "general.error": "An error occurred",
    "general.success": "Success!",
    "general.close": "Close",
    "general.save": "Save",
    "general.back": "Back",
    
    // Maintenance
    "maintenance.title": "Maintenance Request",
    "maintenance.subtitle": "Report an issue with your property",
    "maintenance.subject": "Subject",
    "maintenance.category": "Category",
    "maintenance.priority": "Priority",
    "maintenance.description": "Problem Description",
    "maintenance.unit": "Apartment / Unit",
    "maintenance.submit": "Submit Request",
    "maintenance.success": "Your request has been sent to the owner.",
    "maintenance.cat.plumbing": "Plumbing",
    "maintenance.cat.electricity": "Electricity",
    "maintenance.cat.heating": "Heating/AC",
    "maintenance.cat.appliance": "Appliance",
    "maintenance.cat.other": "Other",
    "maintenance.pri.low": "Low",
    "maintenance.pri.medium": "Medium",
    "maintenance.pri.high": "High / Urgent",
  },
  fr: {
    // Roles
    "role.admin": "Admin",
    "role.owner": "Propriétaire",
    "role.tenant": "Locataire",
    
    // Navigation - Owner
    "nav.overview": "Aperçu",
    "nav.myProperties": "Mes Propriétés",
    "nav.addProperty": "Ajouter",
    "nav.requests": "Demandes",
    "nav.messages": "Messages",
    "nav.analytics": "Analytiques",
    "nav.profile": "Profil",
    
    // Navigation - Tenant
    "nav.search": "Rechercher",
    "nav.favorites": "Favoris",
    "nav.myRequests": "Mes Demandes",
    "nav.housingNeeds": "Besoins Logement",
    "nav.maintenance": "Réclamations",
    
    // Navigation - Admin
    "nav.dashboard": "Tableau de Bord",
    "nav.users": "Utilisateurs",
    "nav.allProperties": "Toutes les Propriétés",
    "nav.reports": "Rapports",
    "nav.settings": "Paramètres",
    "nav.map": "Carte",
    
    // Dashboard - Owner
    "dashboard.title": "Tableau de Bord",
    "dashboard.welcome": "Bienvenue",
    "dashboard.totalProperties": "Total Propriétés",
    "dashboard.availableProperties": "Disponibles",
    "dashboard.rentedProperties": "Loués",
    "dashboard.estimatedRevenue": "Rev. Estimé",
    "dashboard.requestsReceived": "Demandes",
    
    // Dashboard - Tenant
    "tenant.title": "Trouvez Votre Logement",
    "tenant.subtitle": "Découvrez la propriété idéale",
    "tenant.searchPlaceholder": "Rechercher par ville, département...",
    "tenant.filters": "Filtres",
    "tenant.results": "résultats trouvés",
    "tenant.noResults": "Aucune propriété trouvée",
    "tenant.contactOwner": "Contacter",
    "tenant.addFavorite": "Ajouter aux Favoris",
    "tenant.removeFavorite": "Retirer des Favoris",
    "tenant.sendRequest": "Envoyer Demande",
    "tenant.viewGallery": "Voir Galerie",
    
    // Filters
    "filter.city": "Ville",
    "filter.department": "Département",
    "filter.minBudget": "Budget Min",
    "filter.maxBudget": "Budget Max",
    "filter.propertyType": "Type de Bien",
    "filter.bedrooms": "Chambres",
    "filter.furnished": "Meublé",
    "filter.parking": "Parking",
    "filter.availability": "Disponibilité",
    "filter.minSurface": "Surface Min",
    "filter.apply": "Appliquer",
    "filter.reset": "Réinitialiser",
    
    // Property Types
    "type.s0": "S+0 (Studio)",
    "type.s1": "S+1",
    "type.s2": "S+2",
    "type.s3": "S+3",
    "type.s4": "S+4",
    "type.villa": "Villa",
    
    // Property Card
    "property.perMonth": "/mois",
    "property.status.available": "Disponible",
    "property.status.rented": "Loué",
    "property.status.maintenance": "Entretien",
    "property.edit": "Modifier",
    "property.delete": "Supprimer",
    "property.viewDetails": "Voir Détails",
    "property.bedrooms": "Chambres",
    "property.bathrooms": "Salles de bain",
    "property.surface": "Surface",
    "property.deposit": "Caution",
    "property.amenities": "Équipements",
    "property.description": "Description",
    "property.contact": "Contact",
    "property.location": "Localisation",
    "property.gallery": "Galerie",
    
    // Forms
    "form.title": "Titre de la Propriété",
    "form.description": "Description",
    "form.city": "Ville",
    "form.department": "Département/Région",
    "form.address": "Adresse",
    "form.rent": "Loyer Mensuel",
    "form.deposit": "Caution",
    "form.type": "Type de Bien",
    "form.surface": "Surface (m²)",
    "form.bedrooms": "Chambres",
    "form.bathrooms": "Salles de bain",
    "form.livingRooms": "Salons",
    "form.equippedKitchen": "Cuisine Équipée",
    "form.balcony": "Balcon/Terrasse",
    "form.parking": "Parking",
    "form.furnished": "Meublé",
    "form.availability": "Date de Disponibilité",
    "form.images": "Images",
    "form.coverImage": "Image de Couverture",
    "form.kitchenImage": "Image Cuisine",
    "form.bathroomImage": "Image Salle de bain",
    "form.bedroomImage": "Image Chambre",
    "form.livingRoomImage": "Image Salon",
    "form.exteriorImage": "Image Extérieur",
    "form.gallery": "Galerie",
    "form.submit": "Soumettre",
    "form.cancel": "Annuler",
    "form.yes": "Oui",
    "form.no": "Non",
    
    // Housing Needs Form
    "housing.title": "Décrivez Vos Besoins",
    "housing.subtitle": "Dites-nous ce que vous recherchez",
    "housing.fullName": "Nom Complet",
    "housing.email": "Email",
    "housing.phone": "Téléphone",
    "housing.desiredCity": "Ville Souhaitée",
    "housing.desiredDepartment": "Département/Région",
    "housing.minBudget": "Budget Minimum",
    "housing.maxBudget": "Budget Maximum",
    "housing.desiredType": "Type de Bien Souhaité",
    "housing.desiredBedrooms": "Chambres Souhaitées",
    "housing.moveInDate": "Date d'Emménagement",
    "housing.duration": "Durée de Location",
    "housing.furnished": "Préférence Meublé",
    "housing.parking": "Parking Nécessaire",
    "housing.nearCenter": "Proche Centre-Ville",
    "housing.notes": "Notes / Besoins Spéciaux",
    "housing.submit": "Envoyer la Demande",
    
    // Contact Form
    "contact.title": "Contacter le Propriétaire",
    "contact.name": "Votre Nom",
    "contact.email": "Email",
    "contact.phone": "Téléphone",
    "contact.message": "Message",
    "contact.visitDate": "Date de Visite Préférée",
    "contact.send": "Envoyer",
    
    // AI Chatbot
    "chatbot.title": "Assistant ImmoSmart",
    "chatbot.placeholder": "Posez-moi une question...",
    "chatbot.welcome": "Bonjour ! Comment puis-je vous aider ?",
    "chatbot.suggestions": "Suggestions",
    
    // General
    "general.search": "Rechercher...",
    "general.language": "Langue",
    "general.loading": "Chargement...",
    "general.error": "Une erreur est survenue",
    "general.success": "Succès !",
    "general.close": "Fermer",
    "general.save": "Enregistrer",
    "general.back": "Retour",
    
    // Maintenance
    "maintenance.title": "Réclamation de Maintenance",
    "maintenance.subtitle": "Signalez un problème dans votre logement",
    "maintenance.subject": "Sujet",
    "maintenance.category": "Catégorie",
    "maintenance.priority": "Priorité",
    "maintenance.description": "Description du Problème",
    "maintenance.unit": "Appartement / Unité",
    "maintenance.submit": "Envoyer la Réclamation",
    "maintenance.success": "Votre réclamation a été envoyée au propriétaire.",
    "maintenance.cat.plumbing": "Plomberie",
    "maintenance.cat.electricity": "Électricité",
    "maintenance.cat.heating": "Chauffage / Clim",
    "maintenance.cat.appliance": "Électroménager",
    "maintenance.cat.other": "Autre",
    "maintenance.pri.low": "Basse",
    "maintenance.pri.medium": "Moyenne",
    "maintenance.pri.high": "Haute / Urgent",
  },
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("fr")

  const t = (key: string): string => {
    return translations[lang][key as keyof typeof translations.en] || key
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
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
