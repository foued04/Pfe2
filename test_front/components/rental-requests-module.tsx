"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { resolveApiUrl } from "@/lib/api/client"
import { 
  RentalRequest, 
  Contract,
  RequestStatus,
  requestStatusConfig,
} from "@/lib/rental-request-data"

export interface Payment {
  id: string
  reference: string
  tenantName: string
  propertyTitle: string
  amount: number
  date: string
  status: "Payé" | "En attente" | "Refusé" | "En retard"
  method: "Carte Bancaire" | "Virement" | "Espèces"
}

const mockPayments: Payment[] = [
  {
    id: "pay-001",
    reference: "FAC-2026-001",
    tenantName: "Mohamed Jlassi",
    propertyTitle: "Villa Luxe S+4 Khnis",
    amount: 1500,
    date: "2026-04-01",
    status: "Payé",
    method: "Virement"
  },
  {
    id: "pay-002",
    reference: "FAC-2026-002",
    tenantName: "Sarra Bouaziz",
    propertyTitle: "Appartement S+3 Familial Khniss",
    amount: 950,
    date: "2026-04-15",
    status: "Payé",
    method: "Espèces"
  },
  {
    id: "pay-003",
    reference: "FAC-2026-003",
    tenantName: "Ahmed Mansour",
    propertyTitle: "Studio S+1 Monastir Centre",
    amount: 450,
    date: "2026-05-01",
    status: "Payé",
    method: "Carte Bancaire"
  },
  {
    id: "pay-004",
    reference: "FAC-2026-004",
    tenantName: "Faten Rouissi",
    propertyTitle: "Duplex Standing S+3 Skanes",
    amount: 1200,
    date: "2026-05-05",
    status: "Refusé",
    method: "Carte Bancaire"
  },
  {
    id: "pay-005",
    reference: "FAC-2026-005",
    tenantName: "Mohamed Jlassi",
    propertyTitle: "Villa Luxe S+4 Khnis",
    amount: 1500,
    date: "2026-05-01",
    status: "Payé",
    method: "Virement"
  },
  {
    id: "pay-006",
    reference: "FAC-2026-006",
    tenantName: "Yassine Belhadj",
    propertyTitle: "Appartement S+2 Sahline",
    amount: 650,
    date: "2026-05-10",
    status: "En attente",
    method: "Virement"
  }
]

const demoRequests: RentalRequest[] = [
  {
    id: "demo-req-1",
    tenantName: "Sarra Bouaziz",
    tenantEmail: "sarra@email.com",
    tenantPhone: "+216 22 123 456",
    propertyId: "p1",
    propertyTitle: "Appartement S+2 Monastir Centre",
    propertyAddress: "Rue de la Plage, Monastir",
    propertyRent: 850,
    propertyImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop",
    date: "2026-04-10",
    duration: "12 mois",
    status: "Contrat actif",
    message: "Je suis intéressée par ce bien pour une longue durée."
  },
  {
    id: "demo-req-2",
    tenantName: "Mohamed Jlassi",
    tenantEmail: "mohamed@email.com",
    tenantPhone: "+216 55 987 654",
    propertyId: "p2",
    propertyTitle: "Villa Luxe S+4 Khnis",
    propertyAddress: "Cité des Jardins, Khnis",
    propertyRent: 1500,
    propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    date: "2026-05-01",
    duration: "24 mois",
    status: "Contrat généré",
    message: "La villa correspond parfaitement à nos besoins."
  },
  {
    id: "demo-req-3",
    tenantName: "Ahmed Mansour",
    tenantEmail: "ahmed@email.com",
    tenantPhone: "+216 98 444 555",
    propertyId: "p3",
    propertyTitle: "Studio S+1 Monastir Centre",
    propertyAddress: "Avenue Habib Bourguiba, Monastir",
    propertyRent: 450,
    propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop",
    date: "2026-05-05",
    duration: "6 mois",
    status: "Acceptée",
    message: "Je suis étudiant et j'aimerais louer ce studio."
  }
]

const demoContracts: Contract[] = [
  {
    id: "DEMO-CTR-001",
    requestId: "demo-req-1",
    propertyId: "p1",
    propertyTitle: "Appartement S+2 Monastir Centre",
    propertyAddress: "Rue de la Plage, Monastir",
    propertyType: "Appartement S+2",
    propertySurface: 85,
    propertyRent: 850,
    propertyDeposit: 1700,
    ownerName: "Mohamed Ben Ali",
    ownerEmail: "owner@email.com",
    ownerPhone: "+216 73 461 234",
    tenantName: "Sarra Bouaziz",
    tenantEmail: "sarra@email.com",
    tenantPhone: "+216 22 123 456",
    startDate: "2026-04-15",
    endDate: "2027-04-14",
    duration: "12 mois",
    status: "SignedByBoth",
    ownerSignature: "signed",
    tenantSignature: "signed",
    createdAt: "2026-04-10"
  },
  {
    id: "DEMO-CTR-002",
    requestId: "demo-req-2",
    propertyId: "p2",
    propertyTitle: "Villa Luxe S+4 Khnis",
    propertyAddress: "Cité des Jardins, Khnis",
    propertyType: "Villa Luxe S+4",
    propertySurface: 220,
    propertyRent: 1500,
    propertyDeposit: 3000,
    ownerName: "Mohamed Ben Ali",
    ownerEmail: "owner@email.com",
    ownerPhone: "+216 73 461 234",
    tenantName: "Mohamed Jlassi",
    tenantEmail: "mohamed@email.com",
    tenantPhone: "+216 55 987 654",
    startDate: "2026-05-15",
    endDate: "2028-05-14",
    duration: "24 mois",
    status: "SignedByOwner",
    ownerSignature: "signed",
    createdAt: "2026-05-01"
  }
]
import { RentalRequestList } from "./rental-request-list"
import { RentalRequestDetail } from "./rental-request-detail"
import { ContractView } from "./contract-view"
import { FurnitureRequestDetailModal } from "./furniture-request-detail-modal"
import { MaintenanceResponseModal } from "./maintenance-response-modal"
import { Badge } from "./ui/badge"
import { 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileSignature,
  Zap,
  Inbox,
  ShoppingCart,
  Timer,
  AlertCircle,
  AlertTriangle,
  Home,
  ChevronRight,
  CreditCard,
  Wrench
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

type ModuleView = "list" | "detail" | "contract"

export function RentalRequestsModule() {
  const { lang } = useI18n()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get("tab") || "all"

  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([])
  const [furnitureSuggestions, setFurnitureSuggestions] = useState<any[]>([])
  const [furnitureChangeRequests, setFurnitureChangeRequests] = useState<any[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [currentView, setCurrentView] = useState<ModuleView>("list")
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [selectedFurniture, setSelectedFurniture] = useState<any>(null)
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(null)
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false)
  const [furnitureModalType, setFurnitureModalType] = useState<"suggestion" | "change">("suggestion")
  const [isFurnitureModalOpen, setIsFurnitureModalOpen] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = resolveApiUrl()

  const fetchRequests = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/rental-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const dataArray = Array.isArray(data) ? data : []
        setRequests(prev => {
          const merged = [...dataArray.map((r: any) => ({
            id: r._id,
            propertyId: r.property?._id,
            propertyTitle: r.property?.title || "Propriété inconnue",
            propertyAddress: r.property?.address || "Adresse inconnue",
            propertyRent: r.property?.rent || 0,
            tenantName: r.tenant?.fullName || "Utilisateur inconnu",
            tenantEmail: r.tenant?.email || "",
            tenantPhone: r.tenant?.phone || "",
            tenantId: r.tenant?._id,
            propertyImage: r.property?.images?.cover || "/placeholder-property.jpg",
            date: r.date,
            status: r.status as RequestStatus,
            message: r.message || "",
            duration: r.duration || "12 mois"
          }))]
          // Filter out demos if we have real data with same IDs (unlikely)
          return merged
        })
      } else {
        setError("Erreur lors du chargement des demandes")
      }
    } catch (err) {
      console.error("Fetch requests error:", err)
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFurnitureSuggestions = async () => {
    if (!user) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/furniture/my-suggestions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFurnitureSuggestions(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Fetch furniture suggestions error:", err)
    }
  }

  const fetchMaintenanceRequests = async () => {
    if (!user) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const reclamations = Array.isArray(data) 
          ? data.filter((n: any) => n.type === 'Reclamation' || n.type === 'Réclamation')
          : []
        setMaintenanceRequests(reclamations)
      }
    } catch (err) {
      console.error("Fetch maintenance requests error:", err)
    }
  }

  const fetchFurnitureChangeRequests = async () => {
    if (!user) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/furniture/owner-change-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setFurnitureChangeRequests(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Fetch furniture change requests error:", err)
    }
  }

  useEffect(() => {
    fetchRequests()
    fetchMaintenanceRequests()
    fetchFurnitureSuggestions()
    fetchFurnitureChangeRequests()
  }, [user])

  // Stats
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === "En attente").length,
    accepted: requests.filter(r => r.status === "Acceptée").length,
    rejected: requests.filter(r => r.status === "Refusée").length,
    contractGenerated: requests.filter(r => r.status === "Contrat généré").length,
    active: requests.filter(r => r.status === "Contrat actif").length,
    maintenance: maintenanceRequests.length,
    furniture: furnitureSuggestions.length + furnitureChangeRequests.length,
    payments: payments.length,
  }), [requests, maintenanceRequests, furnitureSuggestions, furnitureChangeRequests])

  // Handlers
  const handleViewDetails = async (request: RentalRequest) => {
    setSelectedRequest(request)
    
    // Check if contract exists to enable "Voir le contrat"
    if (request.status === "Contrat généré" || request.status === "Contrat actif") {
        try {
            const token = localStorage.getItem("accessToken")
            const response = await fetch(`${API_URL}/contracts/request/${request.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setContracts(prev => [...prev.filter(c => c.id !== data._id), {
                    id: data._id,
                    requestId: data.request?._id || data.request,
                    status: data.status,
                    ownerSignature: data.ownerSignature,
                    tenantSignature: data.tenantSignature
                } as any])
            }
        } catch (err) { console.error("Fetch contract for detail error:", err) }
    }
    
    setCurrentView("detail")
  }

  const handleViewContractById = async (requestId: string) => {
    setIsLoading(true)
    try {
        const token = localStorage.getItem("accessToken")
        const response = await fetch(`${API_URL}/contracts/request/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
            const fullData = await response.json()
            const finalContract: Contract = {
                id: fullData._id,
                requestId: fullData.request?._id || fullData.request,
                propertyId: fullData.property?._id || fullData.property,
                propertyImage: fullData.property?.images?.cover || "",
                propertyTitle: fullData.property?.title || "...",
                ownerName: fullData.owner?.fullName || "...",
                ownerEmail: fullData.owner?.email || "...",
                ownerPhone: fullData.owner?.phone || "...",
                tenantName: fullData.tenant?.fullName || "...",
                tenantEmail: fullData.tenant?.email || "...",
                tenantPhone: fullData.tenant?.phone || "...",
                propertyRent: fullData.rentAmount,
                propertyDeposit: fullData.depositAmount,
                propertySurface: fullData.property?.surface || 0,
                propertyAddress: fullData.property?.address || "...",
                propertyType: fullData.property?.type || "Appartement",
                startDate: fullData.startDate || "",
                endDate: fullData.endDate || "",
                duration: fullData.request?.duration || "12 mois",
                status: fullData.status,
                ownerSignature: fullData.ownerSignature,
                tenantSignature: fullData.tenantSignature,
                createdAt: fullData.createdAt
            }
            setSelectedContract(finalContract)
            setCurrentView("contract")
        } else {
            alert("Contrat non trouvé.")
        }
    } catch (err) {
        console.error("View contract error:", err)
    } finally {
        setIsLoading(false)
    }
  }

  const handleActivateContract = async (contractId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${contractId}/activate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (response.ok) {
        const updated = await response.json()
        alert(lang === "fr" ? "Contrat activé avec succès ! Le bien est désormais loué." : "Contract activated successfully! The property is now rented.")
        setRequests(prev => prev.map(r => r.id === updated.request ? { ...r, status: "Contrat actif" } : r))
        if (selectedRequest) setSelectedRequest(prev => prev ? { ...prev, status: "Contrat actif" } : null)
        handleBackToList()
      } else {
        const err = await response.json()
        alert(err.message || "Erreur lors de l'activation")
      }
    } catch (err) {
      console.error("Activate contract error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (requestId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/rental-requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Acceptée" }),
      })

      if (response.ok) {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Acceptée" as RequestStatus } : r))
        if (selectedRequest?.id === requestId) setSelectedRequest(prev => prev ? { ...prev, status: "Acceptée" as RequestStatus } : null)
        const contractGenerated = await handleGenerateContract(requestId)
        if (!contractGenerated) {
          alert(lang === "fr"
            ? "La demande a ete acceptee, mais le contrat n'a pas pu etre genere automatiquement."
            : "The request was accepted, but the contract could not be generated automatically.")
        }
      } else {
        const errorData = await response.json().catch(() => null)
        alert(errorData?.message || (lang === "fr" ? "Erreur lors de l'acceptation de la demande." : "Error while accepting the request."))
      }
    } catch (err) {
      console.error("Update status error:", err)
      alert(lang === "fr" ? "Erreur de connexion pendant l'acceptation." : "Connection error while accepting the request.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/rental-requests/${requestId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Refusée" }),
      })

      if (response.ok) {
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Refusée" as RequestStatus } : r))
        if (selectedRequest?.id === requestId) setSelectedRequest(prev => prev ? { ...prev, status: "Refusée" as RequestStatus } : null)
      }
    } catch (err) {
      console.error("Update status error:", err)
    }
  }

  const handleGenerateContract = async (requestId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ requestId })
      })

      if (response.ok) {
        const fullContractResponse = await fetch(`${API_URL}/contracts/request/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (fullContractResponse.ok) {
          const fullData = await fullContractResponse.json()
          const finalContract: Contract = {
            id: fullData._id,
            requestId: fullData.request?._id || fullData.request,
            propertyId: fullData.property?._id || fullData.property,
            propertyImage: fullData.property?.images?.cover || "",
            propertyTitle: fullData.property?.title || "...",
            ownerName: fullData.owner?.fullName || "...",
            ownerEmail: fullData.owner?.email || "...",
            ownerPhone: fullData.owner?.phone || "...",
            tenantName: fullData.tenant?.fullName || "...",
            tenantEmail: fullData.tenant?.email || "...",
            tenantPhone: fullData.tenant?.phone || "...",
            propertyRent: fullData.rentAmount,
            propertyDeposit: fullData.depositAmount,
            propertySurface: fullData.property?.surface || 0,
            propertyAddress: fullData.property?.address || "...",
            propertyType: fullData.property?.type || "Appartement",
            startDate: fullData.startDate || "",
            endDate: fullData.endDate || "",
            duration: fullData.request?.duration || "12 mois",
            status: fullData.status,
            ownerSignature: fullData.ownerSignature,
            tenantSignature: fullData.tenantSignature,
            createdAt: fullData.createdAt
          }
          setContracts(prev => [...prev.filter(c => c.id !== finalContract.id), finalContract])
          setSelectedContract(finalContract)
          if (selectedRequest?.id === requestId) setSelectedRequest(prev => prev ? { ...prev, status: fullData.status as RequestStatus } : null)
          setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Contrat généré" as RequestStatus } : r))
          setCurrentView("contract")
          return true
        }
        alert(lang === "fr" ? "Le contrat a ete genere, mais il n'a pas pu etre charge." : "The contract was generated, but it could not be loaded.")
        return false
      }
      const errorData = await response.json().catch(() => null)
      alert(errorData?.message || (lang === "fr" ? "Erreur lors de la generation du contrat." : "Error while generating the contract."))
      return false
    } catch (err) {
      console.error("Generate contract error:", err)
      alert(lang === "fr" ? "Erreur de connexion pendant la generation du contrat." : "Connection error while generating the contract.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleOwnerSign = async (signature: string) => {
    if (!selectedContract) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${selectedContract.id}/sign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ signature })
      })

      if (response.ok) {
        setSelectedContract(prev => prev ? { ...prev, ownerSignature: signature, status: "SignedByOwner" } : null)
        setContracts(prev => prev.map(c => c.id === selectedContract.id ? { ...c, ownerSignature: signature, status: "SignedByOwner" } : c))
      }
    } catch (err) {
      console.error("Owner sign error:", err)
    }
  }

  const handleTenantSign = (signature: string) => {
    if (!selectedContract) return
    const updated = { ...selectedContract, tenantSignature: signature, status: "SignedByBoth" as const }
    setSelectedContract(updated)
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c))
    setRequests(prev => prev.map(r => r.id === updated.requestId ? { ...r, status: "Contrat actif" as RequestStatus } : r))
  }

  const handleSendToTenant = async (message: string) => {
    if (!selectedContract) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${selectedContract.id}/send`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      })

      if (response.ok) {
        setSelectedContract(prev => prev ? { ...prev, status: "SentToTenant" } : null)
        setContracts(prev => prev.map(c => c.id === selectedContract.id ? { ...c, status: "SentToTenant" } : c))
        alert(lang === "fr" ? "Contrat envoyé au locataire !" : "Contract sent to tenant!")
      }
    } catch (err) {
      console.error("Send to tenant error:", err)
    }
  }

  const handleBackToList = () => {
    setCurrentView("list")
    setSelectedRequest(null)
    setSelectedContract(null)
  }

  const handleBackToDetail = () => {
    setCurrentView("detail")
    setSelectedContract(null)
  }

  // Stat cards config
  const statCards = [
    { key: "total", label_fr: "Total", label_en: "Total", value: stats.total, icon: Inbox, color: "text-foreground", bg: "bg-muted/50" },
    { key: "pending", label_fr: "En attente", label_en: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { key: "maintenance", label_fr: "Maintenance", label_en: "Maintenance", value: stats.maintenance, icon: Wrench, color: "text-cyan-600", bg: "bg-cyan-50" },
    { key: "furniture", label_fr: "Mobilier", label_en: "Furniture", value: stats.furniture, icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50" },
    { key: "contracts", label_fr: "Contrats", label_en: "Contracts", value: stats.contractGenerated + stats.active, icon: FileSignature, color: "text-blue-600", bg: "bg-blue-50" },
    { key: "payments", label_fr: "Paiements", label_en: "Payments", value: stats.payments, icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-50" },
  ]

  // Filter tabs
  const filterTabs = [
    { key: "all", label_fr: "Toutes", label_en: "All", count: stats.total },
    { key: "En attente", label_fr: "En attente", label_en: "Pending", count: stats.pending },
    { key: "maintenance", label_fr: "Maintenance", label_en: "Maintenance", count: stats.maintenance },
    { key: "furniture", label_fr: "Mobilier", label_en: "Furniture", count: stats.furniture },
    { key: "Acceptée", label_fr: "Acceptées", label_en: "Accepted", count: stats.accepted },
    { key: "Refusée", label_fr: "Refusées", label_en: "Rejected", count: stats.rejected },
    { key: "Contrat actif", label_fr: "Actifs", label_en: "Active", count: stats.active },
    { key: "payments", label_fr: "Paiements", label_en: "Payments", count: stats.payments },
  ]

  // ─── Render Views ───────────────────────────────────────────────────────────
  if (currentView === "contract" && selectedContract) {
    return (
      <div className="p-6">
        <ContractView 
          contract={selectedContract} 
          onBack={handleBackToDetail} 
          onOwnerSign={handleOwnerSign}
          onTenantSign={handleTenantSign}
          onSendToTenant={handleSendToTenant}
          userRole="owner"
        />
      </div>
    )
  }

  if (currentView === "detail" && selectedRequest) {
    return (
      <div className="p-6">
        <RentalRequestDetail
          request={selectedRequest}
          onBack={handleBackToList}
          onAccept={handleAccept}
          onReject={handleReject}
          onGenerateContract={handleGenerateContract}
          onViewContract={handleViewContractById}
          onActivateContract={handleActivateContract}
          contractId={contracts.find(c => c.requestId === selectedRequest.id)?.id}
          contractStatus={contracts.find(c => c.requestId === selectedRequest.id)?.status}
        />
      </div>
    )
  }

  const handleOpenFurnitureDetail = (item: any, type: "suggestion" | "change") => {
    setSelectedFurniture(item)
    setFurnitureModalType(type)
    setIsFurnitureModalOpen(true)
  }

  const handleFurnitureRequestUpdated = (updatedRequest: any) => {
    setFurnitureChangeRequests((prev) => prev.map((item) => (item._id === updatedRequest._id ? updatedRequest : item)))
    setSelectedFurniture(updatedRequest)
  }

  const handleOpenMaintenanceDetail = (item: any) => {
    setSelectedMaintenance(item)
    setIsMaintenanceModalOpen(true)
  }

  const handleMaintenanceUpdated = (updatedMaintenance: any) => {
    setMaintenanceRequests((prev) => prev.map((item) => (item._id === updatedMaintenance._id ? updatedMaintenance : item)))
    setSelectedMaintenance(updatedMaintenance)
  }

  const renderFurnitureChangeRequestsSection = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
         <AlertCircle className="w-4 h-4 text-orange-500" />
         {lang === "fr" ? "Demandes de changement de mobilier" : "Furniture change requests"}
      </h3>
      {furnitureChangeRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-40 border border-dashed rounded-2xl">
           <p className="text-xs font-bold">{lang === "fr" ? "Aucune demande de changement" : "No change requests"}</p>
        </div>
      ) : (
        furnitureChangeRequests.map((item, idx) => (
          <div key={item._id} className="group border border-border/50 rounded-2xl bg-white overflow-hidden transition-all hover:shadow-lg flex animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="w-32 h-32 flex-shrink-0 bg-slate-50 flex items-center justify-center">
              {item.photo ? (
                <img src={item.photo} className="w-full h-full object-cover" alt={item.furnitureName} />
              ) : (
                <AlertCircle className="w-8 h-8 text-slate-200" />
              )}
            </div>
            <div className="flex-1 p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">{item.furnitureName}</h3>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold bg-orange-50 text-orange-600 border-orange-100">{item.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                   <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {new Date(item.date || item.createdAt).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1 text-slate-600 truncate max-w-[200px]"><Home className="w-3 h-3" /> {item.propertyId?.title || "..."}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Statut</p>
                  <div className="flex items-center justify-end gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      item.status === "ApprouvÃ©" || item.status === "TerminÃ©" ? "bg-emerald-500" : item.status === "RefusÃ©" ? "bg-red-500" : "bg-orange-500 animate-pulse"
                    )} />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                       {item.status}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleOpenFurnitureDetail(item, "change")}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderMaintenanceSection = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
         <Wrench className="w-4 h-4 text-cyan-500" />
         {lang === "fr" ? "Demandes de maintenance (Réclamations)" : "Maintenance requests (Claims)"}
      </h3>
      {maintenanceRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-40 border border-dashed rounded-2xl">
           <p className="text-xs font-bold">{lang === "fr" ? "Aucune demande de maintenance" : "No maintenance requests"}</p>
        </div>
      ) : (
        maintenanceRequests.map((item, idx) => (
          <div key={item._id} className="group border border-border/50 rounded-2xl bg-white overflow-hidden transition-all hover:shadow-lg flex animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="w-32 h-32 flex-shrink-0 bg-slate-50 flex items-center justify-center relative overflow-hidden">
              {item.attachments && item.attachments.length > 0 ? (
                <img src={typeof item.attachments[0] === 'string' ? item.attachments[0] : item.attachments[0].dataUrl} className="w-full h-full object-cover" alt="attachment" />
              ) : item.claimMeta?.photos && item.claimMeta.photos.length > 0 ? (
                <img src={item.claimMeta.photos[0]} className="w-full h-full object-cover" alt="photo" />
              ) : (
                <Wrench className="w-8 h-8 text-slate-200" />
              )}
              {item.claimMeta?.priority === "High" || item.claimMeta?.priority === "Urgent" || item.claimMeta?.priority === "Haute" ? (
                <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg uppercase">Urgent</div>
              ) : null}
            </div>
            <div className="flex-1 p-5 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-slate-900 uppercase tracking-tight">{item.title}</h3>
                  <Badge variant="outline" className={cn(
                    "text-[9px] uppercase font-bold",
                    item.claimMeta?.priority === "High" || item.claimMeta?.priority === "Urgent" || item.claimMeta?.priority === "Haute" ? "bg-red-50 text-red-600 border-red-100" : "bg-cyan-50 text-cyan-600 border-cyan-100"
                  )}>{item.claimMeta?.category || "Maintenance"}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                   <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                   <span className="flex items-center gap-1 text-slate-600 truncate max-w-[200px]"><Home className="w-3 h-3" /> {item.claimMeta?.propertyTitle || "..."}</span>
                   <span className="flex items-center gap-1 text-primary"><Inbox className="w-3 h-3" /> {item.claimMeta?.tenantName || "Locataire"}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Statut</p>
                  <div className="flex items-center justify-end gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      item.status === "Resolue" || item.status === "Résolue" ? "bg-emerald-500" : item.status === "Refusee" || item.status === "Refusée" ? "bg-red-500" : "bg-orange-500 animate-pulse"
                    )} />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                       {item.status}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleOpenMaintenanceDetail(item)}>
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderPaymentsSection = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
         <CreditCard className="w-4 h-4 text-emerald-500" />
         {lang === "fr" ? "Historique des paiements" : "Payment history"}
      </h3>
      {payments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-40 border border-dashed rounded-2xl">
           <p className="text-xs font-bold">{lang === "fr" ? "Aucun paiement enregistré" : "No payments recorded"}</p>
        </div>
      ) : (
        <div className="overflow-hidden border border-border/50 rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Ref</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === "fr" ? "Locataire" : "Tenant"}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === "fr" ? "Bien" : "Property"}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === "fr" ? "Montant" : "Amount"}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === "fr" ? "Date" : "Date"}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === "fr" ? "Statut" : "Status"}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">{lang === "fr" ? "Méthode" : "Method"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {payments.map((payment, idx) => (
                <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors animate-in fade-in slide-in-from-bottom-1" style={{ animationDelay: `${idx * 40}ms` }}>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black text-slate-400 font-mono">{payment.reference}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                        {payment.tenantName[0]}
                      </div>
                      <span className="text-xs font-black text-slate-700">{payment.tenantName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-600 truncate max-w-[150px] block">{payment.propertyTitle}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-primary">{payment.amount} DT</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{new Date(payment.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 border-none",
                      payment.status === "Payé" ? "bg-emerald-100 text-emerald-700" : 
                      payment.status === "Refusé" ? "bg-red-100 text-red-700" : 
                      payment.status === "En retard" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {payment.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{payment.method}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  // Default: List view
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-xs">
          <FileText className="w-4 h-4" />
          {lang === "fr" ? "Module Demandes" : "Requests Module"}
        </div>
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          {lang === "fr" ? "Demandes" : "Requests"}
        </h2>
        <p className="text-muted-foreground max-w-xl">
          {lang === "fr" 
            ? "Gérez l'ensemble de vos demandes : locations, mobilier et suivi des paiements." 
            : "Manage all your requests: rentals, furniture, and payment tracking."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          const isActive = (card.key === "total" && statusFilter === "all") || 
                          (card.key === "pending" && statusFilter === "En attente") ||
                          (card.key === "contracts" && statusFilter === "Contrat actif") ||
                          statusFilter === card.key;
          return (
            <div 
              key={card.key} 
              onClick={() => {
                const targetFilter = card.key === "total" ? "all" : 
                                     card.key === "pending" ? "En attente" : 
                                     card.key === "contracts" ? "Contrat actif" : 
                                     card.key;
                setStatusFilter(targetFilter);
              }}
              className={cn(
                "rounded-2xl border p-5 transition-all hover:shadow-lg cursor-pointer group",
                card.bg,
                isActive ? "border-primary ring-1 ring-primary/20 shadow-md shadow-primary/5" : "border-border/50"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-background shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
              <p className="text-3xl font-black text-foreground">{card.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">
                {lang === "fr" ? card.label_fr : card.label_en}
              </p>
            </div>
          )
        })}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filterTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap border",
              statusFilter === tab.key
                ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                : "bg-card text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {lang === "fr" ? tab.label_fr : tab.label_en}
            <Badge variant="secondary" className={cn(
              "text-[10px] px-1.5 py-0 h-5 font-bold",
              statusFilter === tab.key ? "bg-primary-foreground/20 text-primary-foreground" : ""
            )}>
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-destructive">{error}</div>
      ) : statusFilter === "all" ? (
        <div className="space-y-8 pb-10">
          {renderMaintenanceSection()}
          {renderFurnitureChangeRequestsSection()}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {lang === "fr" ? "Demandes de location" : "Rental requests"}
            </h3>
            <RentalRequestList
              requests={requests}
              onViewDetails={handleViewDetails}
              onAccept={handleAccept}
              onReject={handleReject}
              statusFilter={statusFilter}
            />
          </div>
        </div>
      ) : statusFilter === "payments" ? (
        <div className="pb-10">
          {renderPaymentsSection()}
        </div>
      ) : statusFilter === "maintenance" ? (
        <div className="pb-10">
          {renderMaintenanceSection()}
        </div>
      ) : statusFilter === "furniture" ? (
        <div className="space-y-8 pb-10">
          {/* Section 1: Suggestions de l'owner */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <ShoppingCart className="w-4 h-4 text-primary" />
               {lang === "fr" ? "Mes suggestions au catalogue" : "My catalog suggestions"}
            </h3>
            {furnitureSuggestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40 border border-dashed rounded-2xl">
                 <p className="text-xs font-bold">{lang === "fr" ? "Aucune suggestion" : "No suggestions"}</p>
              </div>
            ) : (
              furnitureSuggestions.map((item, idx) => (
                <div key={item._id} className="group border border-border/50 rounded-2xl bg-white overflow-hidden transition-all hover:shadow-lg flex animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="w-32 h-32 flex-shrink-0">
                    <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">{item.name}</h3>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold">{item.category}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                         <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                         <span className="text-primary">{item.price} DT</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Statut Admin</p>
                        <div className="flex items-center justify-end gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            item.status === "approved" ? "bg-emerald-500" : item.status === "rejected" ? "bg-red-500" : "bg-orange-500 animate-pulse"
                          )} />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            {item.status === "approved" ? (lang === "fr" ? "Approuvé" : "Approved") : 
                             item.status === "rejected" ? (lang === "fr" ? "Rejeté" : "Rejected") : 
                             (lang === "fr" ? "En attente" : "Pending")}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleOpenFurnitureDetail(item, "suggestion")}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Section 2: Demandes de changement reçues */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <AlertCircle className="w-4 h-4 text-orange-500" />
               {lang === "fr" ? "Demandes de changement de mobilier" : "Furniture change requests"}
            </h3>
            {furnitureChangeRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-40 border border-dashed rounded-2xl">
                 <p className="text-xs font-bold">{lang === "fr" ? "Aucune demande de changement" : "No change requests"}</p>
              </div>
            ) : (
              furnitureChangeRequests.map((item, idx) => (
                <div key={item._id} className="group border border-border/50 rounded-2xl bg-white overflow-hidden transition-all hover:shadow-lg flex animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="w-32 h-32 flex-shrink-0 bg-slate-50 flex items-center justify-center">
                    {item.photo ? (
                      <img src={item.photo} className="w-full h-full object-cover" alt={item.furnitureName} />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-slate-200" />
                    )}
                  </div>
                  <div className="flex-1 p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 uppercase tracking-tight">{item.furnitureName}</h3>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold bg-orange-50 text-orange-600 border-orange-100">{item.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500 font-bold">
                         <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}</span>
                         <span className="flex items-center gap-1 text-slate-600 truncate max-w-[200px]"><Home className="w-3 h-3" /> {item.propertyId?.title || "..."}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right mr-4">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Statut</p>
                        <div className="flex items-center justify-end gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            item.status === "Approuvé" || item.status === "Terminé" ? "bg-emerald-500" : item.status === "Refusé" ? "bg-red-500" : "bg-orange-500 animate-pulse"
                          )} />
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                             {item.status}
                          </span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary transition-colors" onClick={() => handleOpenFurnitureDetail(item, "change")}>
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <RentalRequestList
          requests={requests}
          onViewDetails={handleViewDetails}
          onAccept={handleAccept}
          onReject={handleReject}
          statusFilter={statusFilter}
        />
      )}

      {/* Furniture Detail Modal */}
      <FurnitureRequestDetailModal
        isOpen={isFurnitureModalOpen}
        onClose={() => setIsFurnitureModalOpen(false)}
        request={selectedFurniture}
        type={furnitureModalType}
        lang={lang}
        onRequestUpdated={handleFurnitureRequestUpdated}
      />

      <MaintenanceResponseModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        request={selectedMaintenance}
        lang={lang}
        onUpdated={handleMaintenanceUpdated}
      />
    </div>
  )
}
