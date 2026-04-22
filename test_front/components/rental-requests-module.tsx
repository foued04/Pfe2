"use client"

import { useState, useMemo, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { 
  RentalRequest, 
  Contract,
  RequestStatus,
  mockRentalRequests, 
  mockContracts, 
  generateContract,
  requestStatusConfig,
} from "@/lib/rental-request-data"
import { RentalRequestList } from "./rental-request-list"
import { RentalRequestDetail } from "./rental-request-detail"
import { ContractView } from "./contract-view"
import { Badge } from "./ui/badge"
import { 
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileSignature,
  Zap,
  Inbox,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ModuleView = "list" | "detail" | "contract"

export function RentalRequestsModule() {
  const { lang } = useI18n()
  const { user } = useAuth()

  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [currentView, setCurrentView] = useState<ModuleView>("list")
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

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
        const mapped = dataArray.map((r: any) => ({
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
        }))
        setRequests(mapped)
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

  useEffect(() => {
    fetchRequests()
  }, [user])

  // Stats
  const stats = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === "En attente").length,
    accepted: requests.filter(r => r.status === "Acceptée").length,
    rejected: requests.filter(r => r.status === "Refusée").length,
    contractGenerated: requests.filter(r => r.status === "Contrat généré").length,
    active: requests.filter(r => r.status === "Contrat actif").length,
  }), [requests])

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
                    // ... other fields if needed, but the main purpose is to have it in the list
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
            // If not found, fallback to generate? or just alert
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
        
        // Update local state
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
        const updated = await response.json()
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Acceptée" as RequestStatus } : r))
        if (selectedRequest?.id === requestId) setSelectedRequest(prev => prev ? { ...prev, status: "Acceptée" as RequestStatus } : null)
        
        // For now, satisfy the frontend's immediate contract generation logic
        const request = requests.find(r => r.id === requestId)
        if (request) {
           handleGenerateContract(requestId)
        }
      } else {
        alert("Erreur lors de la mise à jour du statut.")
      }
    } catch (err) {
      console.error("Update status error:", err)
      alert("Erreur de connexion.")
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
      } else {
        alert("Erreur lors de la mise à jour du statut.")
      }
    } catch (err) {
      console.error("Update status error:", err)
      alert("Erreur de connexion.")
    }
  }

  const handleGenerateContract = async (requestId: string) => {
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
        const contract = await response.json()
        const mappedContract: Contract = {
          id: contract._id,
          requestId: contract.request,
          propertyId: contract.property,
          propertyTitle: "...", 
          ownerName: user?.name || "Propriétaire",
          ownerEmail: user?.email || "",
          ownerPhone: "",
          tenantName: "",
          tenantEmail: "",
          tenantPhone: "",
          propertyRent: contract.rentAmount,
          propertySurface: 0,
          propertyAddress: "",
          propertyType: "Appartement",
          startDate: contract.startDate || "",
          endDate: contract.endDate || "",
          duration: "12 mois",
          propertyDeposit: contract.depositAmount,
          status: contract.status,
          ownerSignature: contract.ownerSignature,
          tenantSignature: contract.tenantSignature,
          createdAt: contract.createdAt
        }
        
        // Better: Fetch the full contract details from backend to get populated fields
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
        }
        
        setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Contrat généré" as RequestStatus } : r))
        setCurrentView("contract")
      }
    } catch (err) {
      console.error("Generate contract error:", err)
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
        const updated = await response.json()
        setSelectedContract(prev => prev ? { ...prev, ownerSignature: signature, status: "SignedByOwner" } : null)
        setContracts(prev => prev.map(c => c.id === selectedContract.id ? { ...c, ownerSignature: signature, status: "SignedByOwner" } : c))
      }
    } catch (err) {
      console.error("Owner sign error:", err)
    }
  }

  const handleTenantSign = (signature: string) => {
    if (!selectedContract) return
    const updated = { 
      ...selectedContract, 
      tenantSignature: signature, 
      status: "SignedByBoth" as const 
    }
    setSelectedContract(updated)
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c))

    // Mark request as active
    setRequests(prev => prev.map(r => 
      r.id === updated.requestId ? { ...r, status: "Contrat actif" as RequestStatus } : r
    ))
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
    { key: "accepted", label_fr: "Acceptées", label_en: "Accepted", value: stats.accepted, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { key: "contracts", label_fr: "Contrats", label_en: "Contracts", value: stats.contractGenerated + stats.active, icon: FileSignature, color: "text-blue-600", bg: "bg-blue-50" },
  ]

  // Filter tabs
  const filterTabs: { key: string; label_fr: string; label_en: string; count: number }[] = [
    { key: "all", label_fr: "Toutes", label_en: "All", count: stats.total },
    { key: "En attente", label_fr: "En attente", label_en: "Pending", count: stats.pending },
    { key: "Acceptée", label_fr: "Acceptées", label_en: "Accepted", count: stats.accepted },
    { key: "Refusée", label_fr: "Refusées", label_en: "Rejected", count: stats.rejected },
    { key: "Contrat généré", label_fr: "Contrats", label_en: "Contracts", count: stats.contractGenerated },
    { key: "Contrat actif", label_fr: "Actifs", label_en: "Active", count: stats.active },
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
          {lang === "fr" ? "Demandes de Location" : "Rental Requests"}
        </h2>
        <p className="text-muted-foreground max-w-xl">
          {lang === "fr" 
            ? "Gérez les demandes de location reçues, acceptez ou refusez, et générez des contrats." 
            : "Manage incoming rental requests, accept or reject, and generate contracts."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.key} className={`rounded-2xl border border-border/50 p-5 ${card.bg} transition-all hover:shadow-md`}>
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-background shadow-sm`}>
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
      <div className="flex gap-2 overflow-x-auto pb-2">
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

      {/* Requests List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="p-10 text-center text-destructive">{error}</div>
      ) : (
        <RentalRequestList
          requests={requests}
          onViewDetails={handleViewDetails}
          onAccept={handleAccept}
          onReject={handleReject}
          statusFilter={statusFilter}
        />
      )}
    </div>
  )
}
