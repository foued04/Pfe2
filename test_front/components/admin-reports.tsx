"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  FileText, 
  MessageSquare, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Send, 
  History, 
  Search, 
  Filter,
  User,
  Home,
  ArrowUpRight,
  TrendingUp,
  MoreVertical,
  Calendar,
  X,
  CreditCard,
  Mail
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
type RequestPriority = "faible" | "moyenne" | "urgente"
type RequestStatus = "nouveau" | "en cours" | "traité" | "rejeté"
type PaymentStatus = "payé" | "en attente" | "en retard"

interface ClientRequest {
  id: string
  clientName: string
  role: "locataire" | "locateur"
  type: string
  description: string
  date: string
  priority: RequestPriority
  status: RequestStatus
  property?: string
}

interface TenantPayment {
  id: string
  tenantName: string
  property: string
  rent: number
  dueDate: string
  status: PaymentStatus
  lastPayment?: string
  nextPayment: string
  delayDays: number
}

// Mock Data
const mockRequests: ClientRequest[] = [
  { id: "1", clientName: "Sarra Bouaziz", role: "locataire", type: "maintenance", description: "Problème de plomberie dans la salle de bain, fuite sous le lavabo.", date: "2024-03-28", priority: "urgente", status: "nouveau", property: "Appartement S+2, Marina" },
  { id: "2", clientName: "Mohamed Ben Ali", role: "locateur", type: "meuble", description: "Demande d'ajout d'un nouveau canapé pour le salon avant la prochaine location.", date: "2024-03-27", priority: "moyenne", status: "en cours", property: "Villa Jasmin, Kantaoui" },
  { id: "3", clientName: "Amine Sassi", role: "locataire", type: "information", description: "Question concernant le renouvellement du contrat et les conditions de caution.", date: "2024-03-26", priority: "faible", status: "traité", property: "Studio, Centre Ville" },
  { id: "4", clientName: "Yassine Mansour", role: "locataire", type: "maintenance", description: "Climatiseur ne refroidit plus correctement dans la chambre principale.", date: "2024-03-25", priority: "moyenne", status: "nouveau", property: "Appartement, Skanes" },
  { id: "5", clientName: "Olfa Rekik", role: "locateur", type: "reclamation", description: "Retards répétés de paiement signalés par le système pour mon bien à Sousse.", date: "2024-03-24", priority: "urgente", status: "en cours" },
]

const mockPayments: TenantPayment[] = [
  { id: "P1", tenantName: "Sarra Bouaziz", property: "Appartement S+2, Marina", rent: 1200, dueDate: "2024-04-01", status: "payé", lastPayment: "2024-03-31", nextPayment: "2024-05-01", delayDays: 0 },
  { id: "P2", tenantName: "Yassine Mansour", property: "Appartement, Skanes", rent: 850, dueDate: "2024-04-01", status: "en retard", lastPayment: "2024-03-05", nextPayment: "2024-04-01", delayDays: 3 },
  { id: "P3", tenantName: "Amine Sassi", property: "Studio, Centre Ville", rent: 600, dueDate: "2024-04-05", status: "en attente", nextPayment: "2024-05-05", delayDays: 0 },
  { id: "P4", tenantName: "Leila Jrad", property: "Villa, Monastir", rent: 2500, dueDate: "2024-04-01", status: "en retard", lastPayment: "2024-02-28", nextPayment: "2024-04-01", delayDays: 3 },
  { id: "P5", tenantName: "Firas Mejri", property: "Duplex, Hammamet", rent: 1800, dueDate: "2024-04-10", status: "en attente", nextPayment: "2024-04-10", delayDays: 0 },
]

export function AdminReports() {
  const [activeTab, setActiveTab] = useState<"requests" | "payments">("requests")
  const [searchQuery, setSearchQuery] = useState("")
  const [requestFilter, setRequestFilter] = useState({ priority: "all", status: "all", type: "all" })
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null)

  // Filters
  const filteredRequests = mockRequests.filter(req => {
    const matchesSearch = req.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         req.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = requestFilter.priority === "all" || req.priority === requestFilter.priority
    const matchesStatus = requestFilter.status === "all" || req.status === requestFilter.status
    return matchesSearch && matchesPriority && matchesStatus
  })

  const filteredPayments = mockPayments.filter(pay => {
    const matchesSearch = pay.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         pay.property.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = paymentFilter === "all" || pay.status === paymentFilter
    return matchesSearch && matchesStatus
  })

  // Badges and Helpers
  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case "urgente":
        return <Badge className="bg-red-50 text-red-600 border-red-100 font-bold uppercase text-[9px] tracking-widest px-2">Urgente</Badge>
      case "moyenne":
        return <Badge className="bg-orange-50 text-orange-600 border-orange-100 font-bold uppercase text-[9px] tracking-widest px-2">Moyenne</Badge>
      case "faible":
        return <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase text-[9px] tracking-widest px-2">Faible</Badge>
    }
  }

  const getStatusBadge = (status: RequestStatus | PaymentStatus) => {
    switch (status) {
      case "nouveau":
      case "en attente":
        return <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[10px]">EN ATTENTE</Badge>
      case "en cours":
        return <Badge className="bg-blue-100 text-blue-600 border-none font-black text-[10px]">EN COURS</Badge>
      case "traité":
      case "payé":
        return <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[10px]">FINALISÉ</Badge>
      case "rejeté":
      case "en retard":
        return <Badge className="bg-red-100 text-red-600 border-none font-black text-[10px]">ALERTE</Badge>
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Rapports & Suivi</h1>
          <p className="text-muted-foreground font-medium">Gestion administrative, besoins clients et rappels de paiements</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={activeTab === "requests" ? "default" : "outline"}
            onClick={() => setActiveTab("requests")}
            className="rounded-2xl h-11 px-6 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10"
          >
            <MessageSquare className="w-4 h-4 mr-2" /> Demandes Clients
          </Button>
          <Button 
            variant={activeTab === "payments" ? "default" : "outline"}
            onClick={() => setActiveTab("payments")}
            className="rounded-2xl h-11 px-6 font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/10"
          >
            <CreditCard className="w-4 h-4 mr-2" /> Paiements
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Demandes", value: mockRequests.length, icon: MessageSquare, color: "text-primary bg-primary/10" },
          { label: "Urgent / Action Requise", value: mockRequests.filter(r => r.priority === "urgente").length, icon: AlertCircle, color: "text-red-600 bg-red-50" },
          { label: "Loyers en Retard", value: mockPayments.filter(p => p.status === "en retard").length, icon: Clock, color: "text-orange-600 bg-orange-50" },
          { label: "Paiements ce Mois", value: "8,450 DT", icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-xl bg-card p-6 flex items-center gap-5 group hover:scale-[1.02] transition-all">
            <div className={cn("p-4 rounded-2xl", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-foreground">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60 leading-tight">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <Card className="border-none shadow-2xl bg-card overflow-hidden">
        <CardHeader className="p-8 border-b border-border/50">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                 <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    {activeTab === "requests" ? <MessageSquare className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black text-foreground tracking-tight">
                       {activeTab === "requests" ? "Demandes & Besoins Utilisateurs" : "Suivi des Paiements Locataires"}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground font-bold mt-0.5">
                       {activeTab === "requests" ? "Gestion des tickets et réclamations" : `${mockPayments.filter(p => p.status === "en retard").length} retards détectés ce mois`}
                    </p>
                 </div>
              </div>

              <div className="flex flex-1 max-w-md relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <input 
                   type="text" 
                   placeholder={activeTab === "requests" ? "Rechercher un client, une demande..." : "Rechercher un locataire, un bien..."}
                   className="w-full pl-11 pr-4 py-3 rounded-2xl bg-muted/50 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
              </div>

              <div className="flex gap-2">
                 {activeTab === "requests" ? (
                   <>
                     <select 
                       className="bg-muted/50 border-none rounded-2xl px-4 py-2 text-xs font-black text-muted-foreground focus:ring-2 focus:ring-primary/20"
                       value={requestFilter.priority}
                       onChange={(e) => setRequestFilter({ ...requestFilter, priority: e.target.value })}
                     >
                       <option value="all">Toutes Priorités</option>
                       <option value="urgente">Urgent</option>
                       <option value="moyenne">Moyen</option>
                       <option value="faible">Faible</option>
                     </select>
                     <select 
                       className="bg-muted/50 border-none rounded-2xl px-4 py-2 text-xs font-black text-muted-foreground focus:ring-2 focus:ring-primary/20"
                       value={requestFilter.status}
                       onChange={(e) => setRequestFilter({ ...requestFilter, status: e.target.value })}
                     >
                       <option value="all">Tous Statuts</option>
                       <option value="nouveau">Nouveau</option>
                       <option value="en cours">En cours</option>
                       <option value="traité">Traité</option>
                     </select>
                   </>
                 ) : (
                   <select 
                     className="bg-muted/50 border-none rounded-2xl px-4 py-2 text-xs font-black text-muted-foreground focus:ring-2 focus:ring-primary/20"
                     value={paymentFilter}
                     onChange={(e) => setPaymentFilter(e.target.value)}
                   >
                     <option value="all">Tous les Statuts</option>
                     <option value="payé">Payé</option>
                     <option value="en attente">À venir</option>
                     <option value="en retard">En retard</option>
                   </select>
                 )}
                 <Button variant="outline" className="rounded-2xl w-10 p-0 flex items-center justify-center">
                    <Filter className="w-4 h-4" />
                 </Button>
              </div>
           </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border/50">
                  {activeTab === "requests" ? (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Client</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type / Besoin</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Logement</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Priorité</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right tracking-[0.2em]">Actions</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Locataire</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bien Loué</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Échéance</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loyer</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right tracking-[0.2em]">Paiement</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {activeTab === "requests" ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-sm",
                            req.role === 'locataire' ? "bg-primary/10 text-primary" : "bg-orange-100 text-orange-600"
                          )}>
                            {req.clientName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-foreground tracking-tight">{req.clientName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-tighter">{req.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                         <p className="text-sm font-black text-foreground/80 tracking-tight leading-tight">{req.type === 'maintenance' ? '🔧 Maintenance' : req.type === 'meuble' ? '🛋️ Meuble' : '📄 Info'}</p>
                         <p className="text-[11px] text-muted-foreground font-medium line-clamp-1 mt-1 max-w-[200px]">{req.description}</p>
                      </td>
                      <td className="px-6 py-6">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-foreground/70 truncate max-w-[150px]">{req.property || "Global"}</span>
                            <span className="text-[10px] text-muted-foreground opacity-50 font-medium">{req.date}</span>
                         </div>
                      </td>
                      <td className="px-6 py-6 font-medium">
                         {getPriorityBadge(req.priority)}
                      </td>
                      <td className="px-6 py-6 font-medium">
                         {getStatusBadge(req.status)}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2">
                            <Button onClick={() => setSelectedRequest(req)} variant="outline" size="sm" className="rounded-xl h-9 px-4 font-black text-[10px] uppercase border-2">
                               Détails
                            </Button>
                            <Button variant="outline" size="sm" className="rounded-xl h-9 w-9 p-0 border-2">
                               <MoreVertical className="w-4 h-4" />
                            </Button>
                         </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  filteredPayments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-muted/10 transition-colors group">
                      <td className="px-8 py-6 font-medium">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-primary" />
                           <div>
                              <p className="text-sm font-black text-foreground tracking-tight">{pay.tenantName}</p>
                              <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">Locataire actif</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium">
                        <div className="flex items-center gap-2">
                           <Home className="w-3.5 h-3.5 text-muted-foreground" />
                           <span className="text-xs font-bold text-foreground/80">{pay.property}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 font-medium">
                         <div className="flex flex-col">
                            <span className={cn(
                              "text-sm font-black tracking-tight",
                              pay.status === 'en retard' ? "text-red-500" : "text-foreground"
                            )}>
                              {pay.dueDate}
                            </span>
                            {pay.status === 'en retard' && (
                              <span className="text-[10px] font-black text-red-500/60 uppercase">Retard: {pay.delayDays}j</span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-6 font-medium tracking-tighter">
                         <p className="text-lg font-black text-primary leading-none">{pay.rent} <span className="text-[10px] uppercase tracking-normal">DT</span></p>
                      </td>
                      <td className="px-6 py-6 font-medium lowercase">
                         {getStatusBadge(pay.status)}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-3">
                           {pay.status !== 'payé' && (
                             <Button size="sm" className="rounded-2xl h-10 px-5 bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                Relancer
                             </Button>
                           )}
                           <Button variant="outline" size="sm" className={cn(
                             "rounded-2xl h-10 flex items-center justify-center font-black text-[10px] uppercase tracking-widest border-2",
                             pay.status === 'payé' ? "w-full" : "px-4"
                           )}>
                              <History className="w-4 h-4 mr-2" /> Historique
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {(activeTab === "requests" ? filteredRequests : filteredPayments).length === 0 && (
             <div className="py-24 text-center">
                <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Search className="w-10 h-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-black text-foreground">Aucun résultat trouvé</h3>
                <p className="text-muted-foreground font-medium max-w-xs mx-auto mt-2">
                   Ajustez vos filtres ou votre recherche pour trouver les informations souhaitées.
                </p>
             </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modals */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <Card className="w-full max-w-2xl border-none shadow-2xl bg-card overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="relative h-2 w-full bg-primary" />
              <div className="p-10">
                 <div className="flex justify-between items-start mb-8">
                    <div>
                       <div className="flex items-center gap-2 mb-2">
                          {getPriorityBadge(selectedRequest.priority)}
                          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">• Réf: {selectedRequest.id}</span>
                       </div>
                       <h2 className="text-3xl font-black text-foreground tracking-tight leading-none uppercase">{selectedRequest.type}</h2>
                    </div>
                    <button onClick={() => setSelectedRequest(null)} className="p-2 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-8 mb-10">
                    <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">Client</p>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">{selectedRequest.clientName[0]}</div>
                          <div>
                             <p className="text-sm font-black text-foreground">{selectedRequest.clientName}</p>
                             <p className="text-[10px] font-bold text-primary/60 uppercase">{selectedRequest.role}</p>
                          </div>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                       <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-3">Date d&apos;envoi</p>
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center shadow-inner"><Calendar className="w-5 h-5 text-muted-foreground" /></div>
                          <div>
                             <p className="text-sm font-black text-foreground">{selectedRequest.date}</p>
                             <p className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase">Date d&apos;échéance: +48h</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mb-10">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-4">Description détaillée</h4>
                    <p className="text-base text-foreground leading-relaxed font-medium bg-muted/20 p-6 rounded-3xl">
                       {selectedRequest.description}
                    </p>
                 </div>

                 <div className="flex gap-4">
                    <Button className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20">
                       Marquer comme traité
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-2 font-black uppercase text-xs tracking-widest">
                       Affecter à un agent
                    </Button>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  )
}
