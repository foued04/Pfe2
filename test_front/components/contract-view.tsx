"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Contract, contractStatusConfig } from "@/lib/rental-request-data"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { SignaturePad } from "./signature-pad"
import { 
  ArrowLeft, 
  Printer, 
  FileText,
  Building2,
  MapPin,
  Calendar,
  CreditCard,
  Home,
  Shield, 
  Send,
  User as UserIcon,
  CheckCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PdfLayout } from "./pdf-layout"

interface ContractViewProps {
  contract: Contract
  onBack: () => void
  onOwnerSign: (signature: string) => void
  onTenantSign: (signature: string) => void
  onSendToTenant: (message: string) => void
  userRole: "owner" | "tenant"
}

export function ContractView({ contract, onBack, onOwnerSign, onTenantSign, onSendToTenant, userRole }: ContractViewProps) {
  const { lang, t } = useI18n()
  const statusCfg = contractStatusConfig[contract.status]
  
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)
  const defaultMessage = lang === "fr" 
    ? "Bonjour,\n\nJ'ai signé le contrat de location. Merci de bien vouloir le consulter, le signer dans la zone prévue à cet effet, et me le renvoyer.\n\nCordialement."
    : "Hello,\n\nI have signed the rental contract. Please review it, sign in the designated area, and send it back.\n\nBest regards."
  
  const [message, setMessage] = useState(defaultMessage)

  const handlePrint = () => { window.print() }

  const handleSend = () => {
    onSendToTenant(message)
    setIsSendDialogOpen(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-right-4 duration-400 pb-12">
      {/* Controls */}
      <div className="flex flex-col gap-4 print:hidden">
        <div className="flex items-center justify-between bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/20 sticky top-20 z-50">
          <Button variant="ghost" className="group gap-2 text-slate-500 hover:text-primary transition-all rounded-xl" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-bold">{lang === "fr" ? "Retour" : "Back"}</span>
          </Button>
          
          <div className="flex-1 max-w-md mx-8">
             <div className="relative flex justify-between items-center px-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
                <div 
                  className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-700 z-0" 
                  style={{ 
                    width: contract.status === "Draft" ? "0%" : 
                           contract.status === "SentToTenant" ? "50%" :
                           contract.status === "SignedByTenant" ? "75%" : "100%" 
                  }}
                />
                
                {[
                  { key: "Draft", icon: FileText, label: lang === "fr" ? "Draft" : "Draft" },
                  { key: "SentToTenant", icon: Send, label: lang === "fr" ? "Envoi" : "Sent" },
                  { key: "Active", icon: Shield, label: lang === "fr" ? "Actif" : "Active" }
                ].map((step, idx) => {
                  const isCompleted = (contract.status === "SignedByBoth" || contract.status === "SignedByTenant") || (idx === 0) || (idx === 1 && contract.status !== "Draft")
                  const isActive = contract.status === step.key
                  
                  return (
                    <div key={idx} className="relative z-10 flex flex-col items-center gap-1.5">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm",
                        isCompleted ? "bg-primary text-white scale-110" : "bg-white border-2 border-slate-100 text-slate-300"
                      )}>
                        <step.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-tighter transition-colors",
                        isCompleted || isActive ? "text-primary" : "text-slate-300"
                      )}>
                        {step.label}
                      </span>
                    </div>
                  )
                })}
             </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={cn("font-black text-[10px] px-3 py-1 border shadow-sm transition-all uppercase tracking-widest", statusCfg.bgColor, statusCfg.color, "border-current/10")}>
              {lang === "fr" ? statusCfg.label_fr : statusCfg.label_en}
            </Badge>
            
            {((userRole === "owner" && (contract.status === "Draft" || contract.status === "SignedByOwner")) || 
              (userRole === "tenant" && (contract.status === "SentToTenant" || contract.status === "SignedByTenant") && contract.tenantSignature)) && (
              <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="h-10 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 rounded-xl px-5 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Send className="h-4 w-4" />
                    <span className="font-bold">
                      {userRole === "owner" 
                        ? (lang === "fr" ? "Envoyer au locataire" : "Send to tenant")
                        : (lang === "fr" ? "Envoyer au locateur" : "Send to landlord")}
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600" />
                  <DialogHeader className="pt-6">
                    <DialogTitle className="text-2xl font-black text-indigo-950">
                      {lang === "fr" 
                        ? (userRole === "owner" ? "Envoyer au locataire" : "Renvoyer au locateur")
                        : (userRole === "owner" ? "Send to tenant" : "Send back to landlord")}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                      {lang === "fr" 
                        ? (userRole === "owner" 
                            ? "Authentifiez et envoyez ce contrat au locataire pour signature."
                            : "Veuillez confirmer l'envoi de votre signature au propriétaire.")
                        : (userRole === "owner"
                            ? "Authenticate and send this contract to the tenant for signature."
                            : "Please confirm the delivery of your signature to the landlord.")}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-6">
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[140px] resize-none bg-slate-50 border-slate-100 rounded-2xl p-4 text-slate-700 focus:ring-indigo-500/20 transition-all font-medium"
                      placeholder={lang === "fr" ? "Ajoutez une note personnelle..." : "Add a personal note..."}
                    />
                  </div>
                  <DialogFooter className="pb-6">
                    <Button variant="ghost" onClick={() => setIsSendDialogOpen(false)} className="rounded-xl font-bold text-slate-500">
                      {lang === "fr" ? "Annuler" : "Cancel"}
                    </Button>
                    <Button onClick={handleSend} className="gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl px-8 shadow-xl shadow-indigo-600/20 py-6">
                      <Send className="h-4 w-4" />
                      <span className="font-black text-white">{lang === "fr" ? "Confirmer & Envoyer" : "Confirm & Send"}</span>
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            <Button variant="outline" className="h-10 gap-2 rounded-xl text-slate-600 border-slate-200 bg-white hover:bg-slate-50 transition-all px-4" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              <span className="font-bold">{lang === "fr" ? "Imprimer" : "Print"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contract Document */}
      <PdfLayout
        id="contract-content"
        title={lang === "fr" ? "Contrat de Location" : "Rental Contract"}
        documentId={contract.id}
        date={new Date(contract.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}
        infoLeft={
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                {lang === "fr" ? "Le Bailleur (Propriétaire)" : "The Landlord (Owner)"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-bold text-primary text-lg">{contract.ownerName}</p>
              <p className="text-xs text-muted-foreground">{contract.ownerEmail}</p>
              <p className="text-xs text-muted-foreground">{contract.ownerPhone}</p>
            </div>
          </div>
        }
        infoRight={
          <div className="space-y-4 text-right">
            <div className="flex items-center gap-2 justify-end">
              <p className="text-[10px] font-black uppercase text-[#6B7280] tracking-[0.2em]">
                {lang === "fr" ? "Le Preneur (Locataire)" : "The Tenant"}
              </p>
              <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="font-bold text-primary text-lg">{contract.tenantName}</p>
              <p className="text-xs text-muted-foreground">{contract.tenantEmail}</p>
              <p className="text-xs text-muted-foreground">{contract.tenantPhone}</p>
            </div>
          </div>
        }
        footerNotes={lang === "fr" ? "Contrat établi en deux exemplaires originaux. Document authentifié électroniquement." : "Contract established in two original copies. Electronically authenticated document."}
      >
        <div className="space-y-[10mm]">
          {/* Property Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Home className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                {lang === "fr" ? "Désignation du Bien" : "Property Description"}
              </p>
            </div>
            {contract.propertyImage ? (
              <div className="overflow-hidden rounded-2xl border border-secondary/10">
                <img
                  src={contract.propertyImage}
                  alt={contract.propertyTitle}
                  className="h-44 w-full object-cover"
                />
              </div>
            ) : null}
            <div className="bg-background rounded-2xl p-6 border border-secondary/10">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">{lang === "fr" ? "Bien" : "Property"}</p>
                    <p className="font-bold text-primary">{contract.propertyTitle}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">{lang === "fr" ? "Adresse" : "Address"}</p>
                    <p className="text-[11px] text-primary flex items-start gap-1.5 font-medium">
                      <MapPin className="h-3 w-3 mt-0.5" />
                      {contract.propertyAddress}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">{lang === "fr" ? "Type" : "Type"}</p>
                    <p className="text-[11px] font-bold text-primary">{contract.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-wider mb-1">{lang === "fr" ? "Surface" : "Area"}</p>
                    <p className="text-[11px] font-bold text-primary">{contract.propertySurface} m²</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Terms */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                {lang === "fr" ? "Conditions Financières" : "Financial Terms"}
              </p>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { label: lang === "fr" ? "Loyer" : "Rent", value: `${contract.propertyRent.toLocaleString()}`, sub: "TND / mois", highlight: true },
                { label: lang === "fr" ? "Caution" : "Deposit", value: `${contract.propertyDeposit.toLocaleString()}`, sub: "TND" },
                { label: lang === "fr" ? "Durée" : "Duration", value: contract.duration, sub: "" },
                { label: lang === "fr" ? "Période" : "Period", value: new Date(contract.startDate).toLocaleDateString("fr-FR"), sub: `→ ${new Date(contract.endDate).toLocaleDateString("fr-FR")}` },
              ].map((item, idx) => (
                <div key={idx} className="bg-background rounded-xl p-4 border border-secondary/10">
                  <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-1">{item.label}</p>
                  <p className={cn("text-lg font-black", item.highlight ? "text-primary" : "text-foreground")}>{item.value}</p>
                  {item.sub && <p className="text-[9px] text-muted-foreground font-bold">{item.sub}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                {lang === "fr" ? "Clauses Générales" : "General Clauses"}
              </p>
            </div>
            <div className="space-y-4">
              {[
                { art: "1", tit: lang === "fr" ? "Objet" : "Purpose", content: lang === "fr" ? "Le bailleur met à la disposition du preneur le bien immobilier désigné ci-dessus, pour un usage exclusif d'habitation." : "The landlord makes available to the tenant the property described above, for exclusive residential use." },
                { art: "2", tit: lang === "fr" ? "Loyer" : "Rent", content: lang === "fr" ? `Le loyer mensuel est fixé à ${contract.propertyRent.toLocaleString()} TND, payable d'avance le premier jour de chaque mois.` : `The monthly rent is set at ${contract.propertyRent.toLocaleString()} TND, payable in advance on the first day of each month.` },
                { art: "3", tit: lang === "fr" ? "Caution" : "Deposit", content: lang === "fr" ? `Une caution de ${contract.propertyDeposit.toLocaleString()} TND sera versée à la signature du contrat et restituée à la fin du bail.` : `A deposit of ${contract.propertyDeposit.toLocaleString()} TND will be paid upon signing and returned at the end of the lease.` },
                { art: "4", tit: lang === "fr" ? "Entretien" : "Maintenance", content: lang === "fr" ? "Le preneur s'engage à entretenir le bien en bon état et à effectuer les réparations locatives à sa charge." : "The tenant agrees to maintain the property in good condition and to carry out rental repairs at their own expense." },
                { art: "5", tit: lang === "fr" ? "Résiliation" : "Termination", content: lang === "fr" ? "Chaque partie peut résilier le contrat avec un préavis de 3 mois, par lettre recommandée." : "Either party may terminate the contract with 3 months' notice, by registered letter." },
              ].map((clause, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <span className="text-primary font-black text-sm">#{clause.art}</span>
                  </div>
                  <div className="space-y-1 py-1">
                    <p className="text-[12px] font-black text-primary uppercase tracking-tight">{clause.tit}</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{clause.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-8 flex justify-end">
            <div className="border-[3px] border-emerald-500/20 rounded-full w-24 h-24 flex items-center justify-center p-2 rotate-12 opacity-40">
               <div className="border border-emerald-500/20 rounded-full w-full h-full flex items-center justify-center flex-col text-[#10B981]">
                  <CheckCircle className="h-6 w-6" />
                  <p className="text-[7px] font-black uppercase mt-1">Garantie</p>
                  <p className="text-[8px] font-black uppercase">Sécurisée</p>
               </div>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
              {lang === "fr" ? "Signatures" : "Signatures"}
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <SignaturePad
                  label={lang === "fr" ? "Le Propriétaire" : "The Owner"}
                  existingSignature={contract.ownerSignature}
                  onSign={onOwnerSign}
                  disabled={contract.status !== "Draft" || userRole !== "owner"}
                />
                {contract.ownerSignature && userRole === "owner" && (
                  <p className="text-[10px] font-bold text-emerald-600 uppercase text-center bg-emerald-50 py-2 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-bottom-1">
                    {lang === "fr" ? "✓ Votre signature a été enregistrée" : "✓ Your signature has been recorded"}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <SignaturePad
                  label={lang === "fr" ? "Le Locataire" : "The Tenant"}
                  existingSignature={contract.tenantSignature}
                  onSign={onTenantSign}
                  disabled={contract.status !== "SentToTenant" || userRole !== "tenant"}
                />
                {contract.tenantSignature && userRole === "tenant" && (
                  <p className="text-[10px] font-bold text-emerald-600 uppercase text-center bg-emerald-50 py-2 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-bottom-1">
                    {lang === "fr" ? "✓ Votre signature a été enregistrée" : "✓ Your signature has been recorded"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Legal Validation Seal */}
          <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span>Authentification multi-facteurs (2FA)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                <span>Contrat certifié conforme</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-300 uppercase tracking-tighter text-[12px]">ImmoSmart Legal Guard v3.0</p>
              <p className="font-mono text-[8px] opacity-50">DOCUMENT ID: {contract.id.slice(-12).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </PdfLayout>
    </div>
  )
}
