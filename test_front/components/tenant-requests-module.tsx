"use client"

import { useState } from "react"
import { mockRequests, RentalRequest } from "@/lib/requests-data"
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

export function TenantRequestsModule() {
  const { lang } = useI18n()
  const [requests, setRequests] = useState<RentalRequest[]>(mockRequests)
  const [filter, setFilter] = useState<RentalRequest["status"] | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleCancel = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const handleViewDetails = (id: string) => {
    console.log("View details for", id)
  }

  const handleViewContract = (id: string) => {
    console.log("View contract for", id)
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
        {filteredRequests.length > 0 ? (
          filteredRequests.map((request, idx) => (
            <div
              key={request.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${400 + idx * 50}ms` }}
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
          <div className="py-20 text-center bg-accent/10 rounded-3xl border border-dashed border-border flex flex-col items-center gap-4 animate-in fade-in duration-500 delay-500">
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
    </div>
  )
}
