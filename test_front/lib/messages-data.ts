// ─── Types ──────────────────────────────────────────────────────────────────

export type MessageCategory =
  | "Tous"
  | "Demandes"
  | "Contrats"
  | "Maintenance"
  | "Admin"

export type ParticipantRole = "Owner" | "Tenant" | "Admin"

export interface MessageParticipant {
  id: string
  name: string
  role: ParticipantRole
  avatar?: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string // Matches Participant id
  content: string
  timestamp: string // ISO Date string
  isRead: boolean
  source?: "platform" | "email"
}

export interface Conversation {
  id: string
  category: MessageCategory
  contextId?: string // e.g., "req-004", "prop-123", "ctr-001"
  contextTitle?: string // e.g., "Demande location - Khalil Mansour", "Appartement Centre-Ville"
  participants: MessageParticipant[]
  lastUpdatedAt: string
}

// ─── Constants ──────────────────────────────────────────────────────────────

export const messageCategoryConfig: Record<MessageCategory, { label_fr: string; label_en: string; color: string; bgColor: string; icon: string }> = {
  "Tous":       { label_fr: "Tous",         label_en: "All",         color: "text-foreground",  bgColor: "bg-muted/50",    icon: "Inbox" },
  "Demandes":   { label_fr: "Demandes",     label_en: "Requests",    color: "text-blue-700",    bgColor: "bg-blue-50",     icon: "FileText" },
  "Contrats":   { label_fr: "Contrats",     label_en: "Contracts",   color: "text-emerald-700", bgColor: "bg-emerald-50",  icon: "FileSignature" },
  "Maintenance":{ label_fr: "Maintenance",  label_en: "Maintenance", color: "text-amber-700",   bgColor: "bg-amber-50",    icon: "Wrench" },
  "Admin":      { label_fr: "Admin",        label_en: "Admin",       color: "text-violet-700",  bgColor: "bg-violet-50",   icon: "ShieldAlert" },
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

export const mockCurrentUser = {
  id: "owner-1",
  name: "Mohamed Ben Ali",
  role: "Owner" as ParticipantRole,
}

export const mockConversations: Conversation[] = [
  {
    id: "conv-001",
    category: "Contrats",
    contextId: "ctr-002",
    contextTitle: "Contrat #ctr-002 - Villa Luxe S+4 Khnis",
    participants: [
      mockCurrentUser,
      { id: "tenant-6", name: "Mohamed Jlassi", role: "Tenant" }
    ],
    lastUpdatedAt: "2026-03-29T10:30:00Z",
  },
  {
    id: "conv-002",
    category: "Demandes",
    contextId: "req-002",
    contextTitle: "Demande location - Studio Cozy Skanes",
    participants: [
      mockCurrentUser,
      { id: "tenant-2", name: "Amine Trabelsi", role: "Tenant" }
    ],
    lastUpdatedAt: "2026-03-28T14:15:00Z",
  },
  {
    id: "conv-003",
    category: "Maintenance",
    contextId: "prop-1",
    contextTitle: "Problème Plomberie - Appartement Centre Monastir",
    participants: [
      mockCurrentUser,
      { id: "tenant-3", name: "Fatma Gharbi", role: "Tenant" }
    ],
    lastUpdatedAt: "2026-03-26T09:45:00Z",
  },
  {
    id: "conv-004",
    category: "Admin",
    contextTitle: "Validation de votre compte propriétaire",
    participants: [
      mockCurrentUser,
      { id: "admin-1", name: "Équipe ImmoSmart", role: "Admin" }
    ],
    lastUpdatedAt: "2026-03-15T11:00:00Z",
  }
]

export const mockMessages: Message[] = [
  // Conversation 001 (Contrat Jlassi)
  {
    id: "msg-101",
    conversationId: "conv-001",
    senderId: "owner-1",
    content: "Bonjour Mohamed, j'ai bien signé le contrat de location. Merci de le consulter et d'apposer votre signature dans votre espace.",
    timestamp: "2026-03-01T09:00:00Z",
    isRead: true,
    source: "email",
  },
  {
    id: "msg-102",
    conversationId: "conv-001",
    senderId: "tenant-6",
    content: "Le locataire a signé le contrat et a répondu par email : \"C'est fait ! Le contrat est signé de mon côté également.\"",
    timestamp: "2026-03-01T10:15:00Z",
    isRead: true,
    source: "email",
  },
  {
    id: "msg-103",
    conversationId: "conv-001",
    senderId: "owner-1",
    content: "Parfait, le contrat est désormais actif. On se coordonne pour la remise des clés la semaine prochaine.",
    timestamp: "2026-03-29T10:30:00Z",
    isRead: false,
    source: "platform",
  },

  // Conversation 002 (Demande Amine)
  {
    id: "msg-201",
    conversationId: "conv-002",
    senderId: "tenant-2",
    content: "Une demande de visite a été effectuée. Message : \"Bonjour, le studio est-il toujours disponible pour une visite ce jeudi ?\"",
    timestamp: "2026-03-22T14:00:00Z",
    isRead: true,
    source: "platform",
  },
  {
    id: "msg-202",
    conversationId: "conv-002",
    senderId: "owner-1",
    content: "Bonjour Amine, oui il est disponible. Pouvons-nous prévoir cela vers 17h ?",
    timestamp: "2026-03-22T15:30:00Z",
    isRead: true,
    source: "platform",
  },
  {
    id: "msg-203",
    conversationId: "conv-002",
    senderId: "tenant-2",
    content: "Le locataire a répondu par email : \"C'est parfait pour 17h. À jeudi !\"",
    timestamp: "2026-03-28T14:15:00Z",
    isRead: false,
    source: "email",
  },

  // Conversation 003 (Maintenance Fatma)
  {
    id: "msg-301",
    conversationId: "conv-003",
    senderId: "tenant-3",
    content: "Déclaration de problème de maintenance : \"Bonjour, j'ai une fuite au niveau de l'évier de la cuisine depuis ce matin. J'ai coupé l'eau en attendant.\"",
    timestamp: "2026-03-26T08:10:00Z",
    isRead: true,
    source: "platform",
  },
  {
    id: "msg-302",
    conversationId: "conv-003",
    senderId: "owner-1",
    content: "Bonjour Fatma. D'accord, j'appelle le plombier tout de suite et je reviens vers vous avec son heure de passage.",
    timestamp: "2026-03-26T08:25:00Z",
    isRead: true,
    source: "platform",
  },
  {
    id: "msg-303",
    conversationId: "conv-003",
    senderId: "owner-1",
    content: "Une réponse a été envoyée par email : \"Le plombier passera à 14h aujourd'hui. Tenez-moi au courant.\"",
    timestamp: "2026-03-26T09:45:00Z",
    isRead: true,
    source: "email",
  },

  // Conversation 004 (Admin)
  {
    id: "msg-401",
    conversationId: "conv-004",
    senderId: "admin-1",
    content: "L'administration a envoyé un message : \"Bienvenue sur ImmoSmart ! Vos documents d'identité ont bien été vérifiés. Votre compte propriétaire est maintenant 100% actif. Vous pouvez publier vos annonces.\"",
    timestamp: "2026-03-15T11:00:00Z",
    isRead: true,
    source: "platform",
  }
]
