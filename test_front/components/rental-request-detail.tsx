"use client"

import { useI18n } from "@/lib/i18n"
import { RentalRequest, requestStatusConfig, RequestStatus } from "@/lib/rental-request-data"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Calendar, 
  Timer, 
  Mail, 
  Phone, 
  MapPin,
  MessageSquare,
  Check,
  X,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  FileSignature,
  Zap,
} from "lucide-react"
import { ChatModule } from "./chat-module"
import { useAuth } from "@/lib/auth-context"

interface RentalRequestDetailProps {
  request: RentalRequest
  onBack: () => void
  onAccept: (requestId: string) => void
  onReject: (requestId: string) => void
  onGenerateContract: (requestId: string) => void
  onViewContract: (requestId: string) => void
  onActivateContract: (contractId: string) => void
  contractId?: string
  contractStatus?: string
}

export function RentalRequestDetail({ 
  request, 
  onBack, 
  onAccept, 
  onReject,
  onGenerateContract,
  onViewContract,
  onActivateContract,
  contractId,
  contractStatus,
}: RentalRequestDetailProps) {
  const { lang } = useI18n()
  const { user } = useAuth()
  const statusCfg = requestStatusConfig[request.status]

  // Timeline steps
  const timelineSteps: { status: RequestStatus; icon: any; label_fr: string; label_en: string }[] = [
    { status: "En attente", icon: Clock, label_fr: "Demande reçue", label_en: "Request received" },
    { status: "Acceptée", icon: CheckCircle2, label_fr: "Acceptée", label_en: "Accepted" },
    { status: "Contrat généré", icon: FileSignature, label_fr: "Contrat généré", label_en: "Contract generated" },
    { status: "Contrat actif", icon: Zap, label_fr: "Contrat actif", label_en: "Contract active" },
  ]

  const statusOrder: RequestStatus[] = ["En attente", "Acceptée", "Contrat généré", "Contrat actif"]
  const currentIndex = request.status === "Refusée" ? -1 : statusOrder.indexOf(request.status)

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
      {/* Back + Status Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {lang === "fr" ? "Retour aux demandes" : "Back to requests"}
        </Button>
        <Badge className={`${statusCfg.bgColor} ${statusCfg.color} ${statusCfg.borderColor} border font-bold text-sm px-4 py-1.5`}>
          {request.status}
        </Badge>
      </div>

      {/* Timeline */}
      {request.status !== "Refusée" && (
        <div className="overflow-x-auto rounded-2xl border border-border/50 bg-card p-4 sm:p-6">
          <div className="relative flex min-w-[560px] items-center justify-between">
            {/* Progress Bar */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/50 mx-12" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-primary mx-12 transition-all duration-700" 
              style={{ width: `${Math.max(0, (currentIndex / (timelineSteps.length - 1)) * 100)}%` }}
            />
            
            {timelineSteps.map((step, i) => {
              const Icon = step.icon
              const isActive = i <= currentIndex
              const isCurrent = i === currentIndex
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center gap-2">
                  <div className={`
                    h-10 w-10 rounded-full flex items-center justify-center transition-all duration-500
                    ${isCurrent ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/30 ring-4 ring-primary/20" 
                      : isActive ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"}
                  `}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-bold text-center max-w-20 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                    {lang === "fr" ? step.label_fr : step.label_en}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Refusal banner */}
      {request.status === "Refusée" && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="font-bold text-red-800">{lang === "fr" ? "Demande refusée" : "Request rejected"}</p>
            <p className="text-sm text-red-600">{lang === "fr" ? "Cette demande de location a été refusée." : "This rental request has been rejected."}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tenant Info */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-black text-foreground">{lang === "fr" ? "Locataire" : "Tenant"}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-black text-lg">{request.tenantName.charAt(0)}</span>
              </div>
              <div>
                <p className="font-bold text-foreground">{request.tenantName}</p>
                <p className="text-xs text-muted-foreground">{lang === "fr" ? "Locataire candidat" : "Tenant applicant"}</p>
              </div>
            </div>

            <div className="space-y-3 px-1">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{request.tenantEmail}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{request.tenantPhone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {lang === "fr" ? "Demande du " : "Requested on "}
                  {new Date(request.date).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                    day: "numeric", month: "long", year: "numeric"
                  })}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {lang === "fr" ? "Durée souhaitée : " : "Desired duration: "}{request.duration}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Property Info */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <img 
              src={request.propertyImage} 
              alt={request.propertyTitle}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-white font-black text-lg">{request.propertyTitle}</p>
              <div className="flex items-center gap-1.5 text-white/80 text-xs mt-1">
                <MapPin className="h-3 w-3" />
                {request.propertyAddress}
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{lang === "fr" ? "Loyer mensuel" : "Monthly rent"}</p>
                <p className="text-2xl font-black text-primary">{request.propertyRent.toLocaleString()} TND</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{lang === "fr" ? "Caution" : "Deposit"}</p>
                <p className="text-lg font-bold text-foreground">{(request.propertyRent * 2).toLocaleString()} TND</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Section */}
      <div id="chat-section" className="bg-card border border-border/50 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-black text-foreground">{lang === "fr" ? "Discussion avec le locataire" : "Discussion with tenant"}</h3>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-black tracking-widest bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse">Direct</Badge>
        </div>
        
        <div className="bg-muted/10 rounded-xl p-4 border border-border/30 mb-2">
          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">{lang === "fr" ? "Message initial de la demande" : "Initial request message"}</p>
          <p className="text-sm text-foreground italic">"{request.message}"</p>
        </div>

        <ChatModule 
          contextId={request.id}
          contextTitle={`Demande ${request.propertyTitle}`}
          recipientId={(request as any).tenantId || (request as any).tenant?._id}
          recipientName={request.tenantName}
          category="Demandes"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card p-5 sm:flex-row sm:flex-wrap sm:justify-end sticky bottom-6 z-40 shadow-2xl backdrop-blur-md bg-white/80">
        <Button
          variant="outline"
          className="gap-2 font-bold border-primary/20 text-primary hover:bg-primary/5"
          onClick={() => document.getElementById('chat-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <MessageSquare className="h-4 w-4" />
          {lang === "fr" ? "Répondre / Discuter" : "Respond / Chat"}
        </Button>

        {(request.status === "En attente" || request.status === "Acceptée" || request.status === "Contrat généré") && (
          <>
            <Button
              variant="outline"
              className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold"
              onClick={() => onReject(request.id)}
            >
              <X className="h-4 w-4" />
              {lang === "fr" ? "Annuler/Refuser" : "Cancel/Reject"}
            </Button>
            {request.status === "En attente" && (
              <Button
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20"
                onClick={() => onAccept(request.id)}
              >
                <Check className="h-4 w-4" />
                {lang === "fr" ? "Accepter la demande" : "Accept request"}
              </Button>
            )}
          </>
        )}

        {request.status === "Acceptée" && (
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20"
            onClick={() => onGenerateContract(request.id)}
          >
            <FileText className="h-4 w-4" />
            {lang === "fr" ? "Générer le contrat" : "Generate contract"}
          </Button>
        )}

        {(request.status === "Contrat généré" || request.status === "Contrat actif") && (
          <Button
            variant="outline"
            className="gap-2 font-bold border-blue-200 text-blue-700 hover:bg-blue-50"
            onClick={() => onViewContract(request.id)}
          >
            <FileText className="h-4 w-4" />
            {lang === "fr" ? "Voir le contrat" : "View contract"}
          </Button>
        )}

        {contractStatus === "SignedByTenant" && (
            <Button
              className="gap-2 bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-600/20"
              onClick={() => contractId && onActivateContract(contractId)}
            >
              <Zap className="h-4 w-4" />
              {lang === "fr" ? "Valider & Activer le contrat" : "Validate & Activate contract"}
            </Button>
        )}
      </div>
    </div>
  )
}
