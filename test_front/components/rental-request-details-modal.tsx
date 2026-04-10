"use client"

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RentalRequest } from "@/lib/requests-data"
import { 
  MapPin, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Phone, 
  Mail, 
  Home, 
  CheckCircle, 
  XCircle, 
  FileText,
  CreditCard
} from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { ChatModule } from "./chat-module"
import { useAuth } from "@/lib/auth-context"

interface RentalRequestDetailsModalProps {
  request: RentalRequest | null
  isOpen: boolean
  onClose: () => void
  onCancel?: (id: string) => void
  onViewContract?: (id: string) => void
}

export function RentalRequestDetailsModal({
  request,
  isOpen,
  onClose,
  onCancel,
  onViewContract
}: RentalRequestDetailsModalProps) {
  const { lang } = useI18n()

  if (!request) return null

  const getStatusConfig = (status: RentalRequest["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: lang === "fr" ? "En attente" : "Pending",
          color: "bg-yellow-100 text-yellow-700 border-yellow-200",
          icon: Clock,
          description: lang === "fr" 
            ? "Votre demande est en cours d'examen par le propriétaire." 
            : "Your request is being reviewed by the owner."
        }
      case "accepted":
        return {
          label: lang === "fr" ? "Acceptée" : "Accepted",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: CheckCircle,
          description: lang === "fr" 
            ? "Félicitations ! Votre demande a été acceptée. Le contrat sera bientôt disponible." 
            : "Congratulations! Your request has been accepted. The contract will be available soon."
        }
      case "refused":
        return {
          label: lang === "fr" ? "Refusée" : "Refused",
          color: "bg-red-100 text-red-700 border-red-200",
          icon: XCircle,
          description: lang === "fr" 
            ? "Malheureusement, votre demande n'a pas été retenue pour ce bien." 
            : "Unfortunately, your request was not selected for this property."
        }
      case "contract_in_progress":
        return {
          label: lang === "fr" ? "Contrat en cours" : "Contract in progress",
          color: "bg-blue-100 text-blue-700 border-blue-200",
          icon: FileText,
          description: lang === "fr" 
            ? "Le propriétaire a généré le contrat. Vous pouvez maintenant le consulter et le signer." 
            : "The owner has generated the contract. You can now view and sign it."
        }
      case "active":
        return {
          label: lang === "fr" ? "Contrat actif" : "Active contract",
          color: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          description: lang === "fr" 
            ? "Votre contrat est actif. Bienvenue dans votre nouveau chez-vous !" 
            : "Your contract is active. Welcome to your new home!"
        }
      default:
        return {
          label: request.status,
          color: "bg-gray-100 text-gray-700 border-gray-200",
          icon: Clock,
          description: ""
        }
    }
  }

  const config = getStatusConfig(request.status)
  const StatusIcon = config.icon

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl sm:max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge className={cn("px-2.5 py-1 flex items-center gap-1.5", config.color)}>
              <StatusIcon className="w-3.5 h-3.5" />
              {config.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {lang === "fr" ? "Demandé le" : "Requested on"} {request.createdAt}
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold">{request.property.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-sm mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {request.property.address}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Banner */}
          <div className={cn("p-4 rounded-xl border flex gap-4 items-start", config.color.replace('bg-', 'bg-opacity-20 bg-'))}>
            <div className={cn("p-2 rounded-lg bg-white shadow-sm", config.color.replace('bg-', 'text-'))}>
              <StatusIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm mb-1">{config.label}</p>
              <p className="text-xs opacity-90 leading-relaxed">{config.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Brief */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{lang === "fr" ? "Détails du bien" : "Property Details"}</h4>
              <div className="bg-accent/30 rounded-xl p-4 space-y-3 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{lang === "fr" ? "Prix" : "Price"}</span>
                  <span className="font-bold text-primary">{request.price.toLocaleString()} DT/mois</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{lang === "fr" ? "Date début" : "Start Date"}</span>
                  <span className="font-bold">{request.startDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{lang === "fr" ? "Durée" : "Duration"}</span>
                  <span className="font-bold">{request.duration}</span>
                </div>
              </div>
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-border">
                <img src={(request.property as any).image} alt={request.property.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-bottom p-3">
                   <p className="text-white text-xs font-bold self-end">{request.property.address}</p>
                </div>
              </div>
            </div>

            {/* Your Request */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{lang === "fr" ? "Votre message" : "Your Message"}</h4>
              <div className="bg-muted/40 rounded-xl p-4 border border-border/50 h-full">
                <p className="text-sm italic text-foreground/80 leading-relaxed">
                  "{request.message}"
                </p>
              </div>
            </div>
          </div>

          <hr className="border-border/50" />

          {/* Messaging Section */}
          <ChatModule 
            contextId={request.id}
            contextTitle={`Demande ${request.property.title}`}
            recipientId={(request.property as any).owner?._id || (request.property as any).owner}
            category="Demandes"
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} className="border-border/50">
            {lang === "fr" ? "Fermer" : "Close"}
          </Button>
          {request.status === "pending" && onCancel && (
            <Button variant="destructive" onClick={() => onCancel(request.id)}>
              {lang === "fr" ? "Annuler la demande" : "Cancel Request"}
            </Button>
          )}
          {(request.status === "accepted" || request.status === "contract_in_progress" || request.status === "active") && onViewContract && (
            <Button className="bg-green-600 hover:bg-green-700 gap-2" onClick={() => onViewContract(request.id)}>
              <FileText className="w-4 h-4" />
              {lang === "fr" ? "Voir le contrat" : "View Contract"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
