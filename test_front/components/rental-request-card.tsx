"use client"

import { RentalRequest } from "@/lib/requests-data"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Calendar, MapPin, Clock, MessageSquare, FileText, XCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface RentalRequestCardProps {
  request: RentalRequest
  onCancel: (id: string) => void
  onViewDetails: (id: string) => void
  onViewContract: (id: string) => void
}

export function RentalRequestCard({
  request,
  onCancel,
  onViewDetails,
  onViewContract,
}: RentalRequestCardProps) {
  const { property, status, message, createdAt, startDate, duration, price } = request

  const getStatusConfig = (status: RentalRequest["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: "En attente",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: Clock,
          animation: "animate-pulse",
        }
      case "accepted":
        return {
          label: "Acceptée",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
        }
      case "refused":
        return {
          label: "Refusée",
          color: "bg-red-100 text-red-700 border-red-200",
          icon: XCircle,
        }
      case "active":
        return {
          label: "Contrat actif",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
        }
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: FileText,
        }
    }
  }

  const config = getStatusConfig(status)
  const StatusIcon = config.icon

  return (
    <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300 group bg-card">
      <div className="flex flex-col md:flex-row h-full">
        {/* Property Image */}
        <div className="relative w-full md:w-72 h-48 md:h-auto overflow-hidden">
          <img
            src={property?.images?.cover || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"}
            alt={property?.title || "Property"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3">
            <Badge className={cn("px-2 py-1 flex items-center gap-1.5 backdrop-blur-md bg-white/90 border-white/20", config.color)}>
              <StatusIcon className={cn("w-3.5 h-3.5", config.animation)} />
              {config.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {property.address}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-primary">{(price || property?.rent || 0).toLocaleString()} DT</span>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Par mois</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4 p-4 rounded-xl bg-accent/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shadow-sm border border-border/50">
                <Calendar className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Date de début</p>
                <p className="text-xs font-bold text-foreground">{startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-background flex items-center justify-center shadow-sm border border-border/50">
                <Clock className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Durée souhaitée</p>
                <p className="text-xs font-bold text-foreground">{duration}</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/40 p-4 rounded-xl border border-border/30 mb-6 flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <MessageSquare className="w-12 h-12 rotate-12" />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold flex items-center gap-1.5 mb-2 relative z-10 text-primary">
              <MessageSquare className="w-3 h-3" />
              Message d'accompagnement
            </p>
            <p className="text-sm text-foreground/90 italic leading-relaxed relative z-10">
              "{message}"
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto pt-5 border-t border-border/50">
            <div className="flex flex-col">
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Soumise le
              </p>
              <p className="text-xs font-bold text-foreground">
                {createdAt}
              </p>
            </div>
            <div className="flex gap-2.5">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(request.id)} className="font-semibold hover:bg-accent hover:text-accent-foreground border-border/50">
                Voir détails
              </Button>
              {status === "pending" && (
                <Button variant="destructive" size="sm" onClick={() => onCancel(request.id)} className="font-semibold shadow-sm shadow-red-100">
                  Annuler
                </Button>
              )}
              {(status === "accepted" || status === "contract_in_progress") && (
                <Button variant="default" size="sm" onClick={() => onViewContract(request.id)} className="bg-green-600 hover:bg-green-700 font-semibold shadow-sm shadow-green-100">
                  <FileText className="w-4 h-4 mr-2" />
                  Voir contrat
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {status === "pending" && (
        <div className="bg-yellow-50/80 border-t border-yellow-100/50 py-2.5 px-4 flex items-center justify-center gap-3">
          <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-[10px] text-yellow-800 font-bold uppercase tracking-[0.1em] text-center">
            En attente de confirmation du locateur
          </p>
          <div className="flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          </div>
        </div>
      )}
    </Card>
  )
}
