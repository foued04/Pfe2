import { Property, mockProperties } from "./property-data"

export type RequestStatus = "pending" | "accepted" | "refused" | "contract_in_progress" | "active"

export interface RentalRequest {
  id: string
  propertyId: string
  property: Property
  tenantId: string
  status: RequestStatus
  message: string
  createdAt: string
  startDate: string
  duration: string
  price: number
}

export const mockRequests: RentalRequest[] = [
  {
    id: "req1",
    propertyId: "1",
    property: mockProperties[0],
    tenantId: "tenant123",
    status: "pending",
    message: "Bonjour, je suis très intéressé par votre appartement S+2 au centre de Monastir. Est-il possible de programmer une visite ?",
    createdAt: "2024-03-25",
    startDate: "2024-04-01",
    duration: "12 mois",
    price: 800,
  },
  {
    id: "req2",
    propertyId: "2",
    property: mockProperties[1],
    tenantId: "tenant123",
    status: "accepted",
    message: "Le studio à Skanes correspond parfaitement à mes besoins d'étudiant. Je souhaiterais louer dès que possible.",
    createdAt: "2024-03-20",
    startDate: "2024-04-01",
    duration: "6 mois",
    price: 450,
  },
  {
    id: "req3",
    propertyId: "4",
    property: mockProperties[3],
    tenantId: "tenant123",
    status: "refused",
    message: "Nous sommes une famille avec deux enfants et cet appartement S+3 à Khniss nous semble idéal.",
    createdAt: "2024-03-15",
    startDate: "2024-04-01",
    duration: "24 mois",
    price: 950,
  },
  {
    id: "req4",
    propertyId: "6",
    property: mockProperties[5],
    tenantId: "tenant123",
    status: "contract_in_progress",
    message: "L'appartement de standing en zone aéroport est magnifique. Nous sommes prêts à signer.",
    createdAt: "2024-03-10",
    startDate: "2024-03-20",
    duration: "12 mois",
    price: 1400,
  },
]
