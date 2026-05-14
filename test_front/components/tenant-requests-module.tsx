"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
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
import { CreditCard, Receipt } from "lucide-react"
import { Badge } from "./ui/badge"
import { cn } from "@/lib/utils"

export interface Payment {
  id: string
  propertyTitle: string
  amount: number
  date: string
  status: "Payé" | "En attente" | "Refusé" | "En retard"
  method: "Carte Bancaire" | "Virement" | "Espèces"
  invoiceUrl?: string
}

const mockTenantPayments: Payment[] = [
  {
    id: "FAC-2026-001",
    propertyTitle: "Villa Luxe S+4 Khnis",
    amount: 1500,
    date: "2026-04-01",
    status: "Payé",
    method: "Virement",
    invoiceUrl: "#"
  },
  {
    id: "FAC-2026-003",
    propertyTitle: "Villa Luxe S+4 Khnis",
    amount: 1500,
    date: "2026-05-01",
    status: "Payé",
    method: "Carte Bancaire",
    invoiceUrl: "#"
  },
  {
    id: "FAC-2026-004",
    propertyTitle: "Duplex Standing S+3 Skanes",
    amount: 1200,
    date: "2026-05-05",
    status: "Refusé",
    method: "Carte Bancaire"
  },
  {
    id: "FAC-2026-005",
    propertyTitle: "Villa Luxe S+4 Khnis",
    amount: 1500,
    date: "2026-06-01",
    status: "En attente",
    method: "Carte Bancaire"
  }
]

const demoTenantRequests: any[] = [
  {
    id: "demo-req-1",
    status: "active",
    property: {
      id: "p1",
      title: "Appartement S+2 Monastir Centre",
      address: "Rue de la Plage, Monastir",
      rent: 850,
      images: { cover: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop" }
    },
    price: 850,
    createdAt: "2026-04-10",
    startDate: "2026-04-15",
    duration: "12 mois",
    message: "Contrat actif et signé."
  },
  {
    id: "demo-req-2",
    status: "contract_in_progress",
    property: {
      id: "p2",
      title: "Villa Luxe S+4 Khnis",
      address: "Cité des Jardins, Khnis",
      rent: 1500,
      images: { cover: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop" }
    },
    price: 1500,
    createdAt: "2026-05-01",
    startDate: "2026-05-15",
    duration: "24 mois",
    message: "En attente de signature du contrat."
  }
]

const demoTenantContracts: Contract[] = [
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
    tenantName: "Utilisateur", // Will be replaced by actual name if available
    tenantEmail: "tenant@email.com",
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
    tenantName: "Utilisateur",
    tenantEmail: "tenant@email.com",
    tenantPhone: "+216 55 987 654",
    startDate: "2026-05-15",
    endDate: "2028-05-14",
    duration: "24 mois",
    status: "SignedByOwner",
    ownerSignature: "signed",
    createdAt: "2026-05-01"
  }
]

interface TenantRequestsModuleProps {
  autoOpenRequestId?: string | null
  onAutoOpenHandled?: () => void
}

export function TenantRequestsModule({ autoOpenRequestId, onAutoOpenHandled }: TenantRequestsModuleProps) {
  const { lang } = useI18n()
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const initialFilter = searchParams.get("tab") || "all"

  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [filter, setFilter] = useState<string>(initialFilter)
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
        setRequests(prev => {
          const merged = data.map((r: any) => ({
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
          return merged
        })
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
    payments: 0,
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
                alert(lang === "fr" ? "Contrat renvoyé au locateur." : "Contract sent back to owner.")
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { key: "all", label: "Total", value: stats.total, icon: FileText, color: "bg-blue-500", shadow: "shadow-blue-100", delay: "delay-100" },
            { key: "pending", label: lang === "fr" ? "En attente" : "Pending", value: stats.pending, icon: Clock, color: "bg-yellow-500", shadow: "shadow-yellow-100", delay: "delay-150" },
            { key: "accepted", label: lang === "fr" ? "Acceptées" : "Accepted", value: stats.accepted, icon: CheckCircle, color: "bg-green-500", shadow: "shadow-green-100", delay: "delay-200" },
            { key: "refused", label: lang === "fr" ? "Refusées" : "Refused", value: stats.refused, icon: XCircle, color: "bg-red-500", shadow: "shadow-red-100", delay: "delay-250" },
            { key: "payments", label: lang === "fr" ? "Paiements" : "Payments", value: stats.payments, icon: CreditCard, color: "bg-emerald-500", shadow: "shadow-emerald-100", delay: "delay-300" },
          ].map((stat, i) => (
            <div 
              key={i} 
              onClick={() => setFilter(stat.key)}
              className={cn(
                "bg-card border p-5 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300 animate-in fade-in zoom-in-95 cursor-pointer group",
                stat.delay, 
                stat.shadow,
                filter === stat.key ? "border-primary ring-1 ring-primary/20" : "border-border/50"
              )}
            >
              <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform`}>
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
          <Button 
            variant={filter === "payments" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setFilter("payments")}
            className="rounded-full px-5 font-bold"
          >
            {lang === "fr" ? "Paiements" : "Payments"}
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 gap-6 pb-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="py-20 text-center text-destructive bg-destructive/5 rounded-3xl border border-dashed border-destructive/20">{error}</div>
        ) : filter === "payments" ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[].map((payment, idx) => (
                <div key={payment.id} className="bg-card border border-border/50 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                         <CreditCard className="w-4 h-4 text-primary" />
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{payment.id}</span>
                      </div>
                      <h3 className="text-lg font-black text-foreground tracking-tight">{payment.propertyTitle}</h3>
                    </div>
                    <Badge className={cn(
                      "text-[10px] font-black uppercase px-3 py-1 border-none",
                      payment.status === "Payé" ? "bg-emerald-100 text-emerald-700" : 
                      payment.status === "Refusé" ? "bg-red-100 text-red-700" : 
                      payment.status === "En retard" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {payment.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-accent/30 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === "fr" ? "Montant" : "Amount"}</p>
                      <p className="text-xl font-black text-primary">{payment.amount} DT</p>
                    </div>
                    <div className="bg-accent/30 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-sm font-bold text-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/30">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase text-slate-400">{lang === "fr" ? "Méthode" : "Method"}:</span>
                       <span className="text-xs font-bold text-foreground">{payment.method}</span>
                    </div>
                    {payment.status === "Payé" && (
                      <Button variant="ghost" size="sm" className="h-8 rounded-xl text-[10px] font-black uppercase gap-2 hover:bg-primary/10 hover:text-primary">
                        <Receipt className="w-3.5 h-3.5" />
                        {lang === "fr" ? "Consulter Reçu" : "View Receipt"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
