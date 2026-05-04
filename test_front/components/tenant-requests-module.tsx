"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { resolveApiUrl } from "@/lib/api/client"
import { RentalRequest } from "@/lib/requests-data"
import { RentalRequestCard } from "./rental-request-card"
import { useI18n } from "@/lib/i18n"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Search as SearchIcon
} from "lucide-react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { RentalRequestDetailsModal } from "./rental-request-details-modal"
import { ContractView } from "./contract-view"
import { Contract } from "@/lib/rental-request-data"

interface TenantRequestsModuleProps {
  autoOpenRequestId?: string | null
  onAutoOpenHandled?: () => void
}

export function TenantRequestsModule({ autoOpenRequestId, onAutoOpenHandled }: TenantRequestsModuleProps) {
  const { lang } = useI18n()
  const { user } = useAuth()
  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // New state for details and contract
  const [selectedRequest, setSelectedRequest] = useState<RentalRequest | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [viewingContract, setViewingContract] = useState<Contract | null>(null)

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
        const mapped = data.map((r: any) => ({
          id: r._id,
          status: mapStatus(r.status),
          property: {
            id: r.property?._id,
            title: r.property?.title || "Propriété inconnue",
            address: r.property?.address || "Adresse inconnue",
            rent: r.property?.rent || 0,
            owner: r.property?.owner, // Crucial for ChatModule
            images: {
              cover: r.property?.images?.cover || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
            }
          },
          price: r.property?.rent || 0,
          createdAt: r.date || new Date().toLocaleDateString(),
          startDate: r.date || new Date().toLocaleDateString(), // Use date as fallback
          duration: r.duration || "12 mois",
          message: r.message || ""
        }))
        setRequests(mapped)
      } else {
        setError("Erreur lors du chargement de vos demandes")
      }
    } catch (err) {
      console.error("Fetch tenant requests error:", err)
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const mapStatus = (status: string): RentalRequest["status"] => {
    switch (status) {
      case "En attente": return "pending"
      case "Acceptée": return "accepted"
      case "Refusée": return "refused"
      case "Contrat généré": return "contract_in_progress"
      case "Contrat actif": return "active"
      default: return "pending"
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [user])

  useEffect(() => {
    if (!autoOpenRequestId || requests.length === 0) return
    const requestToOpen = requests.find((r) => r.id === autoOpenRequestId)
    if (!requestToOpen) return

    setSelectedRequest(requestToOpen)
    setIsDetailsOpen(true)
    if (onAutoOpenHandled) onAutoOpenHandled()
  }, [autoOpenRequestId, requests, onAutoOpenHandled])

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted" || r.status === "contract_in_progress").length,
    refused: requests.filter((r) => r.status === "refused").length,
  }

  const filteredRequests = requests.filter((r) => {
    const matchesFilter = filter === "all" || r.status === filter || (filter === "accepted" && r.status === "contract_in_progress")
    const matchesSearch = r.property.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         r.property.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleCancel = async (id: string) => {
    if (!confirm(lang === "fr" ? "Êtes-vous sûr de vouloir annuler cette demande ?" : "Are you sure you want to cancel this request?")) return
    
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/rental-requests/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== id))
        setIsDetailsOpen(false)
        setSelectedRequest(null)
      } else {
        alert(lang === "fr" ? "Erreur lors de l'annulation" : "Error while cancelling")
      }
    } catch (err) {
      console.error("Cancel request error:", err)
    }
  }

  const handleViewDetails = (id: string) => {
    const request = requests.find(r => r.id === id)
    if (request) {
      setSelectedRequest(request)
      setIsDetailsOpen(true)
    }
  }

  const handleViewContract = async (requestId: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/request/${requestId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
        setViewingContract(finalContract)
      } else {
        alert(lang === "fr" ? "Contrat non encore disponible" : "Contract not yet available")
      }
    } catch (err) {
      console.error("Fetch contract error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  if (viewingContract) {
    return (
      <div className="p-6">
        <ContractView 
          contract={viewingContract}
          onBack={() => setViewingContract(null)}
          onOwnerSign={() => {}} // Tenant cannot sign for owner
          onTenantSign={async (signature) => {
            try {
              const token = localStorage.getItem("accessToken")
              const response = await fetch(`${API_URL}/contracts/${viewingContract.id}/sign`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ signature })
              })

              if (response.ok) {
                const signedData = await response.json()
                setViewingContract(prev => prev ? { ...prev, tenantSignature: signature, status: signedData.status || "SignedByTenant" } : null)
                alert(lang === "fr" ? "Contrat signé avec succès !" : "Contract signed successfully!")
                // Refresh requests to update status to 'Contrat actif'
                fetchRequests()
              }
            } catch (err) {
              console.error("Tenant sign error:", err)
            }
          }}
          onSendToTenant={async (message) => {
            if (!viewingContract) return
            try {
              const token = localStorage.getItem("accessToken")
              const response = await fetch(`${API_URL}/contracts/${viewingContract.id}/send-back`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ message })
              })

              if (response.ok) {
                const updated = await response.json()
                setViewingContract(prev => prev ? { ...prev, status: updated.status || "SignedByTenant" } : null)
                alert(lang === "fr" ? "Contrat renvoyé au propriétaire." : "Contract sent back to owner.")
                fetchRequests()
              }
            } catch (err) {
              console.error("Send back contract error:", err)
            }
          }}
          userRole="tenant"
        />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6">
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-3xl font-extrabold text-foreground tracking-tight">
            {lang === "fr" ? "Mes Demandes de Location" : "My Rental Requests"}
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            {lang === "fr" 
              ? "Suivez l'état de vos demandes et gérez vos futurs contrats en un clin d'œil." 
              : "Track your request status and manage your future contracts at a glance."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: FileText, color: "bg-blue-500", shadow: "shadow-blue-100", delay: "delay-100" },
            { label: lang === "fr" ? "En attente" : "Pending", value: stats.pending, icon: Clock, color: "bg-yellow-500", shadow: "shadow-yellow-100", delay: "delay-150" },
            { label: lang === "fr" ? "Acceptées" : "Accepted", value: stats.accepted, icon: CheckCircle, color: "bg-green-500", shadow: "shadow-green-100", delay: "delay-200" },
            { label: lang === "fr" ? "Refusées" : "Refused", value: stats.refused, icon: XCircle, color: "bg-red-500", shadow: "shadow-red-100", delay: "delay-250" },
          ].map((stat, i) => (
            <div 
              key={i} 
              className={`bg-card border border-border/50 p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 ${stat.delay} ${stat.shadow}`}
            >
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-accent/20 p-4 rounded-2xl border border-border/30 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <div className="relative w-full md:w-96">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={lang === "fr" ? "Rechercher par propriété..." : "Search by property..."}
            className="pl-10 h-11 bg-background border-border/50 rounded-xl focus-visible:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("all")}
            className="rounded-full px-5 font-bold"
          >
            Tous
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("pending")}
            className="rounded-full px-5 font-bold"
          >
            En attente
          </Button>
          <Button 
            variant={filter === "accepted" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("accepted")}
            className="rounded-full px-5 font-bold"
          >
            Acceptées
          </Button>
          <Button 
            variant={filter === "refused" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("refused")}
            className="rounded-full px-5 font-bold"
          >
            Refusées
          </Button>
        </div>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 gap-6 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-destructive bg-destructive/5 rounded-3xl border border-dashed border-destructive/20">{error}</div>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((request, idx) => (
            <div
              key={request.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <RentalRequestCard 
                request={request}
                onCancel={handleCancel}
                onViewDetails={handleViewDetails}
                onViewContract={handleViewContract}
              />
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-accent/10 rounded-3xl border border-dashed border-border flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">Aucune demande trouvée</p>
              <p className="text-muted-foreground">Essayez d'ajuster vos filtres ou recherchez un autre nom.</p>
            </div>
          </div>
        )}
      </div>

      <RentalRequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        onCancel={handleCancel}
        onViewContract={handleViewContract}
      />
    </div>
  )
}
