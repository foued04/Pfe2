// ─── Types ──────────────────────────────────────────────────────────────────

export type RequestStatus =
  | "En attente"
  | "Acceptée"
  | "Refusée"
  | "Contrat généré"
  | "Contrat actif"

export type ContractStatus =
  | "Draft"
  | "SignedByOwner"
  | "SentToTenant"
  | "SignedByTenant"
  | "SignedByBoth"

export interface RentalRequest {
  id: string
  tenantName: string
  tenantEmail: string
  tenantPhone: string
  tenantAvatar?: string
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  propertyRent: number
  propertyImage: string
  date: string
  duration: string
  message: string
  status: RequestStatus
}

export interface Contract {
  id: string
  requestId: string
  propertyId: string
  propertyTitle: string
  propertyAddress: string
  propertyType: string
  propertySurface: number
  propertyRent: number
  propertyDeposit: number
  ownerName: string
  ownerEmail: string
  ownerPhone: string
  tenantName: string
  tenantEmail: string
  tenantPhone: string
  startDate: string
  endDate: string
  duration: string
  status: ContractStatus
  ownerSignature?: string   // base64 data URL
  tenantSignature?: string  // base64 data URL
  tenantMessage?: string    // Message sent to tenant
  createdAt: string
}

// ─── Status Config ──────────────────────────────────────────────────────────

export const requestStatusConfig: Record<RequestStatus, { color: string; bgColor: string; borderColor: string }> = {
  "En attente":      { color: "text-amber-700",   bgColor: "bg-amber-50",    borderColor: "border-amber-200" },
  "Acceptée":        { color: "text-emerald-700", bgColor: "bg-emerald-50",  borderColor: "border-emerald-200" },
  "Refusée":         { color: "text-red-700",     bgColor: "bg-red-50",      borderColor: "border-red-200" },
  "Contrat généré":  { color: "text-blue-700",    bgColor: "bg-blue-50",     borderColor: "border-blue-200" },
  "Contrat actif":   { color: "text-violet-700",  bgColor: "bg-violet-50",   borderColor: "border-violet-200" },
}

export const contractStatusConfig: Record<ContractStatus, { label_fr: string; label_en: string; color: string; bgColor: string }> = {
  "Draft":           { label_fr: "Brouillon",             label_en: "Draft",               color: "text-amber-700",   bgColor: "bg-amber-50" },
  "SignedByOwner":   { label_fr: "Signé par propriétaire", label_en: "Signed by owner",     color: "text-blue-700",    bgColor: "bg-blue-50" },
  "SentToTenant":    { label_fr: "Envoyé au locataire",    label_en: "Sent to tenant",      color: "text-violet-700",  bgColor: "bg-violet-50" },
  "SignedByTenant":  { label_fr: "Signé par locataire",    label_en: "Signed by tenant",    color: "text-blue-700",    bgColor: "bg-blue-50" },
  "SignedByBoth":    { label_fr: "Signé et actif",         label_en: "Signed & Active",     color: "text-emerald-700", bgColor: "bg-emerald-50" },
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

export const mockRentalRequests: RentalRequest[] = [
  {
    id: "req-001",
    tenantName: "Sarra Bouaziz",
    tenantEmail: "sarra.bouaziz@email.com",
    tenantPhone: "+216 73 462 345",
    propertyId: "1",
    propertyTitle: "Appartement Moderne S+2 Centre Monastir",
    propertyAddress: "15 Avenue Habib Bourguiba, Monastir 5000",
    propertyRent: 800,
    propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    date: "2026-03-25",
    duration: "12 mois",
    message: "Bonjour, je suis très intéressée par cet appartement. Je suis une jeune professionnelle travaillant à Monastir et je recherche un logement à long terme. Je suis disponible pour une visite dès que possible. Cordialement.",
    status: "En attente",
  },
  {
    id: "req-002",
    tenantName: "Amine Trabelsi",
    tenantEmail: "amine.trabelsi@email.com",
    tenantPhone: "+216 98 765 432",
    propertyId: "2",
    propertyTitle: "Studio Cozy S+1 Skanes",
    propertyAddress: "Rue de la Plage, Skanes 5060",
    propertyRent: 550,
    propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    date: "2026-03-22",
    duration: "6 mois",
    message: "Bonjour, je suis étudiant en médecine et je cherche un studio meublé pour la période universitaire. Le loyer correspond à mon budget. Merci de me contacter.",
    status: "En attente",
  },
  {
    id: "req-003",
    tenantName: "Fatma Gharbi",
    tenantEmail: "fatma.gharbi@email.com",
    tenantPhone: "+216 55 123 456",
    propertyId: "1",
    propertyTitle: "Appartement Moderne S+2 Centre Monastir",
    propertyAddress: "15 Avenue Habib Bourguiba, Monastir 5000",
    propertyRent: 800,
    propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    date: "2026-03-20",
    duration: "24 mois",
    message: "Madame, Monsieur, suite à la visite effectuée le 18 mars, je souhaite confirmer mon intérêt pour cet appartement. Ma famille de 3 personnes serait ravie d'y emménager.",
    status: "Acceptée",
  },
  {
    id: "req-004",
    tenantName: "Khalil Mansour",
    tenantEmail: "khalil.mansour@email.com",
    tenantPhone: "+216 22 987 654",
    propertyId: "3",
    propertyTitle: "Villa Luxe S+4 Khnis",
    propertyAddress: "Zone Résidentielle, Khnis 5036",
    propertyRent: 1500,
    propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    date: "2026-03-15",
    duration: "12 mois",
    message: "Bonjour, je suis dirigeant d'entreprise et je recherche une villa haut standing pour ma famille. Excellent emplacement et prestations correspondant à mes attentes.",
    status: "Contrat généré",
  },
  {
    id: "req-005",
    tenantName: "Nadia Ben Salah",
    tenantEmail: "nadia.bensalah@email.com",
    tenantPhone: "+216 44 555 888",
    propertyId: "2",
    propertyTitle: "Studio Cozy S+1 Skanes",
    propertyAddress: "Rue de la Plage, Skanes 5060",
    propertyRent: 550,
    propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    date: "2026-03-10",
    duration: "12 mois",
    message: "Impossible de trouver un logement convenable, je me permets de candidater pour ce studio.",
    status: "Refusée",
  },
  {
    id: "req-006",
    tenantName: "Mohamed Jlassi",
    tenantEmail: "mohamed.jlassi@email.com",
    tenantPhone: "+216 99 111 222",
    propertyId: "3",
    propertyTitle: "Villa Luxe S+4 Khnis",
    propertyAddress: "Zone Résidentielle, Khnis 5036",
    propertyRent: 1500,
    propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    date: "2026-02-28",
    duration: "24 mois",
    message: "Cette villa correspond parfaitement à nos besoins familiaux. Nous sommes prêts à signer.",
    status: "Contrat actif",
  },
]

// ─── Mock Contracts (for requests with status >= "Contrat généré") ───────────

export const mockContracts: Contract[] = [
  {
    id: "ctr-001",
    requestId: "req-004",
    propertyId: "3",
    propertyTitle: "Villa Luxe S+4 Khnis",
    propertyAddress: "Zone Résidentielle, Khnis 5036",
    propertyType: "Villa S+4",
    propertySurface: 220,
    propertyRent: 1500,
    propertyDeposit: 3000,
    ownerName: "Mohamed Ben Ali",
    ownerEmail: "proprietaire@email.com",
    ownerPhone: "+216 73 461 234",
    tenantName: "Khalil Mansour",
    tenantEmail: "khalil.mansour@email.com",
    tenantPhone: "+216 22 987 654",
    startDate: "2026-04-01",
    endDate: "2027-03-31",
    duration: "12 mois",
    status: "Draft",
    createdAt: "2026-03-16",
  },
  {
    id: "ctr-002",
    requestId: "req-006",
    propertyId: "3",
    propertyTitle: "Villa Luxe S+4 Khnis",
    propertyAddress: "Zone Résidentielle, Khnis 5036",
    propertyType: "Villa S+4",
    propertySurface: 220,
    propertyRent: 1500,
    propertyDeposit: 3000,
    ownerName: "Mohamed Ben Ali",
    ownerEmail: "proprietaire@email.com",
    ownerPhone: "+216 73 461 234",
    tenantName: "Mohamed Jlassi",
    tenantEmail: "mohamed.jlassi@email.com",
    tenantPhone: "+216 99 111 222",
    startDate: "2026-03-01",
    endDate: "2028-02-28",
    duration: "24 mois",
    status: "SignedByBoth",
    ownerSignature: "signed",
    tenantSignature: "signed",
    createdAt: "2026-03-01",
  },
  {
    id: "ctr-003",
    requestId: "req-003",
    propertyId: "4",
    propertyTitle: "Appartement S+3 Familial Khniss",
    propertyAddress: "Immeuble El Yasmine, Khniss, Monastir 5036",
    propertyType: "Appartement S+3",
    propertySurface: 120,
    propertyRent: 950,
    propertyDeposit: 1900,
    ownerName: "Leila Sassi",
    ownerEmail: "leila.sassi@email.com",
    ownerPhone: "+216 73 505 678",
    tenantName: "Sarra Bouaziz",
    tenantEmail: "sarra.bouaziz@email.com",
    tenantPhone: "+216 73 462 345",
    startDate: "2026-04-15",
    endDate: "2027-04-14",
    duration: "12 mois",
    status: "Draft",
    createdAt: "2026-03-25",
  },
]

// ─── Utility Functions ──────────────────────────────────────────────────────

export function generateContract(request: RentalRequest, ownerName: string, ownerEmail: string, ownerPhone: string): Contract {
  const startDate = new Date()
  const durationMonths = parseInt(request.duration) || 12
  const endDate = new Date(startDate)
  endDate.setMonth(endDate.getMonth() + durationMonths)

  return {
    id: "ctr-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    requestId: request.id,
    propertyId: request.propertyId,
    propertyTitle: request.propertyTitle,
    propertyAddress: request.propertyAddress,
    propertyType: "Appartement",
    propertySurface: 85,
    propertyRent: request.propertyRent,
    propertyDeposit: request.propertyRent * 2,
    ownerName,
    ownerEmail,
    ownerPhone,
    tenantName: request.tenantName,
    tenantEmail: request.tenantEmail,
    tenantPhone: request.tenantPhone,
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
    duration: request.duration,
    status: "Draft",
    createdAt: new Date().toISOString().split("T")[0],
  }
}
