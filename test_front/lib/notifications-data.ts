export type NotificationType = "Réclamation" | "Contrat" | "Système" | "Mobilier"
export type NotificationStatus = "Vue par le propriétaire" | "En attente"

export interface NotificationIntervention {
  date: string
  time: string
  technician: string
}

export interface TenantNotification {
  id: string
  type: NotificationType
  title: string
  preview: string
  date: string
  content: string
  status: NotificationStatus
  isRead: boolean
  
  // Specific data
  claimResponse?: {
    message: string
    intervention?: NotificationIntervention
  }
  attachments?: Array<{
    name: string
    type: string
    size: number
    dataUrl: string
  }>
  claimMeta?: {
    claimId?: string
    tenantId?: string
    ownerId?: string
    propertyId?: string
    propertyTitle?: string
    category?: string
    priority?: string
    photos?: string[]
  }
  contractData?: {
    contractId?: string
    requestId?: string
    propertyTitle: string
    propertyAddress: string
    propertyImage: string
    startDate: string
    endDate: string
    rent: number
  }
  messageMeta?: {
    conversationId?: string
    messageId?: string
    senderId?: string
    senderName?: string;
    contextId?: string;
  };
  furnitureMeta?: {
    furnitureId?: string;
    furnitureName?: string;
    category?: string;
    price?: number;
    image?: string;
    ownerName?: string;
    status?: string;
    requestId?: string;
  };
}

export const mockNotifications: TenantNotification[] = [
  {
    id: "notif-1",
    type: "Réclamation",
    title: "Problème Plomberie Cuisine",
    preview: "Votre demande de maintenance a été traitée par le propriétaire.",
    date: "2024-03-31T10:00:00Z",
    content: "Bonjour, j'ai une fuite au niveau de l'évier de la cuisine depuis ce matin. J'ai coupé l'eau en attendant.",
    status: "Vue par le propriétaire",
    isRead: false,
    claimResponse: {
      message: "Bonjour. D'accord, j'ai appelé le plombier. Il passera cet après-midi pour réparer la fuite.",
      intervention: {
        date: "31 Mars 2024",
        time: "14:30",
        technician: "M. Slim (Plombier)"
      }
    }
  },
  {
    id: "notif-2",
    type: "Contrat",
    title: "Contrat de location accepté",
    preview: "Félicitations ! Votre contrat pour l'appartement S+2 Monastir a été accepté.",
    date: "2024-03-30T15:30:00Z",
    content: "Le propriétaire a validé votre dossier de location. Le contrat est prêt à être consulté et signé.",
    status: "Vue par le propriétaire",
    isRead: true,
    contractData: {
      propertyTitle: "Appartement Moderne S+2 Centre Monastir",
      propertyAddress: "15 Avenue Habib Bourguiba, Monastir",
      propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      startDate: "01/04/2024",
      endDate: "31/03/2025",
      rent: 800
    }
  },
  {
    id: "notif-3",
    type: "Système",
    title: "Bienvenue sur ImmoSmart",
    preview: "Votre compte locataire a été activé avec succès.",
    date: "2024-03-25T09:00:00Z",
    content: "L'équipe ImmoSmart vous souhaite la bienvenue ! Vous pouvez désormais explorer les offres et soumettre vos demandes de location.",
    status: "Vue par le propriétaire", // Doesn't really apply to system, but keeping consistency
    isRead: true
  },
  {
    id: "notif-4",
    type: "Réclamation",
    title: "Panne de Climatisation",
    preview: "Votre réclamation est en attente de lecture par le propriétaire.",
    date: "2024-03-31T18:45:00Z",
    content: "Le climatiseur du salon ne refroidit plus. Il fait beaucoup de bruit quand il est allumé.",
    status: "En attente",
    isRead: false
  }
]
