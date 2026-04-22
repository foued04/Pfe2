/* ═══════════════════════════════════════
   ImmoSmart — Backend Type Definitions
   ═══════════════════════════════════════ */

export type UserRole = "admin" | "owner" | "tenant"

export type AuthUser = {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  address?: string
  birthDate?: string
}

export type BackendAuthUser = {
  _id?: string
  id?: string
  fullName: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  role: UserRole
  avatar?: string
  address?: string
  birthDate?: string
  notificationPrefs?: {
    acceptedRequests: boolean
    ownerMessages: boolean
    rentReminders: boolean
  }
}

export type BackendAuthResponse = {
  user: BackendAuthUser
  accessToken?: string
  message?: string
  devCode?: string
}

/* ── Properties ── */

export type PropertyType = "s0" | "s1" | "s2" | "s3" | "s4" | "villa"
export type PropertyStatus = "available" | "rented" | "maintenance"
export type ModerationStatus = "pending" | "approved" | "rejected"

export type FurnishingType = "Non meublé" | "Semi-meublé" | "Meublé" | "Meublé haut standing"
export type FurnishingLevel = "Économique" | "Standard" | "Premium"

export type PropertyImages = {
  cover?: string
  kitchen?: string
  bathroom?: string
  bedroom?: string
  livingRoom?: string
  exterior?: string
  gallery?: string[]
}

export type FurnishingItem = {
  name: string
  category: string
  condition: string
  quantity: number
  estimatedPrice: number
  description?: string
}

export type BackendProperty = {
  _id: string
  title: string
  description: string
  city: string
  address: string
  rent: number
  deposit: number
  type: PropertyType
  surface: number
  bedrooms: number
  bathrooms: number
  equippedKitchen: boolean
  balcony: boolean
  parking: boolean
  availability: string
  status: PropertyStatus
  moderationStatus: ModerationStatus
  images?: PropertyImages
  owner: string | BackendAuthUser
  furnishing?: {
    type: FurnishingType
    level: FurnishingLevel
    estimatedTotalValue: number
    items: FurnishingItem[]
  }
  meuble: boolean
  lat?: number
  lng?: number
  createdAt?: string
  updatedAt?: string
}

export type CreatePropertyPayload = {
  title: string
  description: string
  city: string
  address: string
  rent: number
  deposit: number
  type: PropertyType
  surface: number
  bedrooms: number
  bathrooms: number
  equippedKitchen?: boolean
  balcony?: boolean
  parking?: boolean
  availability?: string
  meuble?: boolean
  lat?: number
  lng?: number
  images?: PropertyImages
}

/* ── Rental Requests ── */

export type RentalRequestStatus =
  | "En attente"
  | "Acceptée"
  | "Refusée"
  | "Contrat généré"
  | "Contrat actif"

export type BackendRentalRequest = {
  _id: string
  property: BackendProperty | string
  tenant: BackendAuthUser | string
  owner?: BackendAuthUser | string
  status: RentalRequestStatus
  message?: string
  date?: string
  createdAt?: string
  updatedAt?: string
}

/* ── Contracts ── */

export type BackendContract = {
  _id: string
  rentalRequest: string
  tenant: string | BackendAuthUser
  owner: string | BackendAuthUser
  property: string | BackendProperty
  startDate?: string
  endDate?: string
  monthlyRent?: number
  tenantSignature?: string
  ownerSignature?: string
  status?: string
  createdAt?: string
  updatedAt?: string
}

/* ── Notifications ── */

export type BackendNotification = {
  _id: string
  user: string
  title: string
  message: string
  type?: string
  relatedId?: string
  isRead: boolean
  preview?: string
  createdAt?: string
  updatedAt?: string
}

/* ── Furniture ── */

export type BackendFurniture = {
  _id: string
  name: string
  category: string
  price: number
  image?: string
  description?: string
}

export type BackendFurnitureOrder = {
  _id: string
  contract?: string
  property?: string
  owner?: string
  tenant?: string
  items: Array<{
    furniture: string | BackendFurniture
    quantity: number
    price: number
  }>
  total: number
  status: string
  createdAt?: string
}

export type BackendFurnitureChangeRequest = {
  _id: string
  furnitureId: string | BackendFurniture
  contractId?: string
  propertyId?: string
  tenantId: string
  type: string
  reason: string
  description?: string
  photo?: string
  status: string
  createdAt?: string
}

/* ── Admin Stats ── */

export type AdminStats = {
  totalUsers: number
  totalProperties: number
  totalOwners: number
  totalTenants: number
  totalRequests: number
}
