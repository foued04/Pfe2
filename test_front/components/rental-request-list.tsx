"use client"

import { useI18n } from "@/lib/i18n"
import { RentalRequest, requestStatusConfig } from "@/lib/rental-request-data"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  FileText, 
  User, 
  Building2, 
  Calendar,
  Timer,
  MessageSquare,
  Inbox
} from "lucide-react"

interface RentalRequestListProps {
  requests: RentalRequest[]
  onViewDetails: (request: RentalRequest) => void
  onAccept: (requestId: string) => void
  onReject: (requestId: string) => void
  statusFilter: string
}

export function RentalRequestList({ 
  requests, 
  onViewDetails, 
  onAccept, 
  onReject,
  statusFilter,
}: RentalRequestListProps) {
  const { lang } = useI18n()

  const filteredRequests = statusFilter === "all" 
    ? requests 
    : requests.filter(r => r.status === statusFilter)

  if (filteredRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
          <Inbox className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="text-lg font-bold text-muted-foreground">
          {lang === "fr" ? "Aucune demande" : "No requests"}
        </p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          {lang === "fr" 
            ? "Aucune demande ne correspond à ce filtre." 
            : "No requests match this filter."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredRequests.map((request, index) => {
        const statusCfg = requestStatusConfig[request.status]
        const isPending = request.status === "En attente"

        return (
          <div 
            key={request.id}
            className="group border border-border/50 rounded-2xl bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border animate-in fade-in slide-in-from-bottom-2"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="flex flex-col lg:flex-row">
              {/* Property Image */}
              <div className="relative w-full lg:w-48 h-40 lg:h-auto overflow-hidden flex-shrink-0">
                <img 
                  src={request.propertyImage} 
                  alt={request.propertyTitle}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:bg-gradient-to-r" />
                <div className="absolute bottom-3 left-3 lg:bottom-3 lg:left-3">
                  <span className="text-white font-black text-sm bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-lg">
                    {request.propertyRent.toLocaleString()} TND
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-5 flex flex-col justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border font-bold text-xs px-3 py-1`}>
                        {request.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(request.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Tenant */}
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{request.tenantName}</p>
                          <p className="text-xs text-muted-foreground">{request.tenantEmail}</p>
                        </div>
                      </div>

                      {/* Property */}
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground line-clamp-1">{request.propertyTitle}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            {request.duration}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Message preview */}
                    <div className="flex items-start gap-2 bg-muted/30 rounded-lg p-3 border border-border/30">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                        "{request.message}"
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs font-bold"
                      onClick={() => onViewDetails(request)}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {lang === "fr" ? "Détails" : "Details"}
                    </Button>

                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                          onClick={() => onAccept(request.id)}
                        >
                          <Check className="h-3.5 w-3.5" />
                          {lang === "fr" ? "Accepter" : "Accept"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => onReject(request.id)}
                        >
                          <X className="h-3.5 w-3.5" />
                          {lang === "fr" ? "Refuser" : "Reject"}
                        </Button>
                      </>
                    )}

                    {request.status === "Contrat généré" && (
                      <Button
                        size="sm"
                        className="gap-1.5 text-xs font-bold"
                        onClick={() => onViewDetails(request)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {lang === "fr" ? "Voir contrat" : "View contract"}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
