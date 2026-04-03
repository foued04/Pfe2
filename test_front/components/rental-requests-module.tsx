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
  const [contracts, setContracts] = useState<Contract[]>(mockContracts)
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
        const mapped = data.map((r: any) => ({
          id: r._id,
          propertyId: r.property?._id,
          propertyName: r.property?.title || "Propriété inconnue",
          propertyAddress: r.property?.address || "Adresse inconnue",
          propertyRent: r.property?.rent || 0,
          tenantName: r.tenant?.fullName || "Utilisateur inconnu",
          tenantEmail: r.tenant?.email || "",
          tenantPhone: r.tenant?.phone || "",
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
  const handleViewDetails = (request: RentalRequest) => {
    setSelectedRequest(request)
    setCurrentView("detail")
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
    // 1. Mark request as 'Acceptée' functionally, but we immediately generate the contract
    const request = requests.find(r => r.id === requestId)
    if (!request) return

    // Ensure no duplicate contracts
    const existing = contracts.find(c => c.requestId === requestId)
    if (existing) {
      setSelectedContract(existing)
      setCurrentView("contract")
      // Update request status just in case
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: "Contrat généré" as RequestStatus } : r))
      if (selectedRequest?.id === requestId) setSelectedRequest(prev => prev ? { ...prev, status: "Contrat généré" as RequestStatus } : null)
      return
    }

    // 2. Automatically generate the contract immediately
    const newContract = generateContract(
      request,
      user?.name || "Propriétaire",
      user?.email || "",
      user?.phone || ""
    )

    setContracts(prev => [...prev, newContract])
    setSelectedContract(newContract)

    // 3. Update status (Logically moves from En attente -> Acceptée -> Contrat généré)
    setRequests(prev => prev.map(r => 
      r.id === requestId ? { ...r, status: "Contrat généré" as RequestStatus } : r
    ))
    
    if (selectedRequest?.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, status: "Contrat généré" as RequestStatus } : null)
    }

    // 4. Open the contract view for signature
    setCurrentView("contract")
  }

  const handleOwnerSign = (signature: string) => {
    if (!selectedContract) return
    const updated = { ...selectedContract, ownerSignature: signature, status: "SignedByOwner" as const }
    setSelectedContract(updated)
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c))
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

  const handleSendToTenant = (message: string) => {
    if (!selectedContract) return
    const updated = { 
      ...selectedContract, 
      tenantMessage: message, 
      status: "SentToTenant" as const 
    }
    setSelectedContract(updated)
    setContracts(prev => prev.map(c => c.id === updated.id ? updated : c))
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
