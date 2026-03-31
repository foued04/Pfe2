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
  User,
  MapPin,
  Calendar,
  CreditCard,
  Home,
  Shield,
  Send,
} from "lucide-react"

interface ContractViewProps {
  contract: Contract
  onBack: () => void
  onOwnerSign: (signature: string) => void
  onTenantSign: (signature: string) => void
  onSendToTenant: (message: string) => void
}

export function ContractView({ contract, onBack, onOwnerSign, onTenantSign, onSendToTenant }: ContractViewProps) {
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
      <div className="flex items-center justify-between print:hidden bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/50 sticky top-20 z-10 shadow-sm">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {lang === "fr" ? "Retour" : "Back"}
        </Button>
        <div className="flex items-center gap-3">
          <Badge className={`${statusCfg.bgColor} ${statusCfg.color} font-bold text-xs px-3 py-1 border ${statusCfg.color.replace('text-', 'border-')}/30`}>
            {lang === "fr" ? statusCfg.label_fr : statusCfg.label_en}
          </Badge>
          
          {contract.status === "SignedByOwner" && (
            <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20">
                  <Send className="h-4 w-4" />
                  {lang === "fr" ? "Envoyer au locataire" : "Send to tenant"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{lang === "fr" ? "Envoyer le contrat" : "Send contract"}</DialogTitle>
                  <DialogDescription>
                    {lang === "fr" 
                      ? "Joignez un message au locataire pour l'inviter à signer le contrat."
                      : "Attach a message for the tenant to invite them to sign."}
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[120px] resize-none"
                    placeholder={lang === "fr" ? "Votre message..." : "Your message..."}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                    {lang === "fr" ? "Annuler" : "Cancel"}
                  </Button>
                  <Button onClick={handleSend} className="gap-2">
                    <Send className="h-4 w-4" />
                    {lang === "fr" ? "Envoyer" : "Send"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Button className="gap-2 shadow-lg shadow-primary/20 bg-card text-foreground border-border/50 hover:bg-muted" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            {lang === "fr" ? "Imprimer" : "Print"}
          </Button>
        </div>
      </div>

      {/* Contract Document */}
      <div id="contract-content" className="bg-card border border-border/50 shadow-2xl rounded-2xl overflow-hidden print:rounded-none print:border-none print:shadow-none">
        {/* Top accent */}
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/40 print:hidden" />

        {/* Header */}
        <div className="p-8 md:p-12 space-y-10">
          <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-black text-2xl shadow-lg">
                  IS
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">ImmoSmart<span className="text-primary italic">.</span></h1>
                  <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Gestion Immobilière</p>
                </div>
              </div>
              <div className="text-sm space-y-0.5 text-muted-foreground">
                <p className="font-medium text-foreground">ImmoSmart Monastir</p>
                <p>Zone Touristique Skanes, 5000 Monastir</p>
                <p>+216 73 000 000 | contact@immosmart.tn</p>
              </div>
            </div>
            <div className="text-right space-y-3">
              <div className="bg-primary/5 px-6 py-3 rounded-xl border border-primary/10 inline-block">
                <p className="text-primary font-black text-xl uppercase tracking-tight">
                  {lang === "fr" ? "Contrat de Location" : "Rental Contract"}
                </p>
                <p className="text-xs text-muted-foreground font-medium">N° {contract.id}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>{lang === "fr" ? "Réf. demande" : "Request ref"}: {contract.requestId}</p>
                <p>{lang === "fr" ? "Créé le" : "Created"}: {new Date(contract.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US")}</p>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                  {lang === "fr" ? "Le Bailleur (Propriétaire)" : "The Landlord (Owner)"}
                </p>
              </div>
              <div className="bg-muted/20 rounded-xl p-5 border border-border/30 space-y-2">
                <p className="font-bold text-foreground text-lg">{contract.ownerName}</p>
                <p className="text-sm text-muted-foreground">{contract.ownerEmail}</p>
                <p className="text-sm text-muted-foreground">{contract.ownerPhone}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                  {lang === "fr" ? "Le Preneur (Locataire)" : "The Tenant"}
                </p>
              </div>
              <div className="bg-muted/20 rounded-xl p-5 border border-border/30 space-y-2">
                <p className="font-bold text-foreground text-lg">{contract.tenantName}</p>
                <p className="text-sm text-muted-foreground">{contract.tenantEmail}</p>
                <p className="text-sm text-muted-foreground">{contract.tenantPhone}</p>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Home className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                {lang === "fr" ? "Désignation du Bien" : "Property Description"}
              </p>
            </div>
            <div className="bg-muted/20 rounded-xl p-6 border border-border/30">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Bien" : "Property"}</p>
                    <p className="font-bold text-foreground">{contract.propertyTitle}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Adresse" : "Address"}</p>
                    <p className="text-sm text-foreground flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                      {contract.propertyAddress}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Type" : "Type"}</p>
                    <p className="text-sm text-foreground">{contract.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Surface" : "Area"}</p>
                    <p className="text-sm text-foreground">{contract.propertySurface} m²</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Terms */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
                {lang === "fr" ? "Conditions Financières" : "Financial Terms"}
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Loyer" : "Rent"}</p>
                <p className="text-xl font-black text-primary">{contract.propertyRent.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-bold">TND / mois</p>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Caution" : "Deposit"}</p>
                <p className="text-xl font-black text-foreground">{contract.propertyDeposit.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-bold">TND</p>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Durée" : "Duration"}</p>
                <p className="text-xl font-black text-foreground">{contract.duration}</p>
              </div>
              <div className="bg-muted/20 rounded-xl p-4 border border-border/30 text-center">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{lang === "fr" ? "Période" : "Period"}</p>
                <p className="text-sm font-bold text-foreground">{new Date(contract.startDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</p>
                <p className="text-[10px] text-muted-foreground">→ {new Date(contract.endDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</p>
              </div>
            </div>
          </div>

          {/* Clauses */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">
                {lang === "fr" ? "Clauses Générales" : "General Clauses"}
              </p>
            </div>
            <div className="bg-muted/10 rounded-xl p-6 border border-border/30 text-sm text-muted-foreground space-y-3 leading-relaxed">
              <p><strong className="text-foreground">Article 1 — Objet :</strong> {lang === "fr" ? "Le bailleur met à la disposition du preneur le bien immobilier désigné ci-dessus, pour un usage exclusif d'habitation." : "The landlord makes available to the tenant the property described above, for exclusive residential use."}</p>
              <p><strong className="text-foreground">Article 2 — Loyer :</strong> {lang === "fr" ? `Le loyer mensuel est fixé à ${contract.propertyRent.toLocaleString()} TND, payable d'avance le premier jour de chaque mois.` : `The monthly rent is set at ${contract.propertyRent.toLocaleString()} TND, payable in advance on the first day of each month.`}</p>
              <p><strong className="text-foreground">Article 3 — Caution :</strong> {lang === "fr" ? `Une caution de ${contract.propertyDeposit.toLocaleString()} TND sera versée à la signature du contrat et restituée à la fin du bail.` : `A deposit of ${contract.propertyDeposit.toLocaleString()} TND will be paid upon signing and returned at the end of the lease.`}</p>
              <p><strong className="text-foreground">Article 4 — Entretien :</strong> {lang === "fr" ? "Le preneur s'engage à entretenir le bien en bon état et à effectuer les réparations locatives à sa charge." : "The tenant agrees to maintain the property in good condition and to carry out rental repairs at their own expense."}</p>
              <p><strong className="text-foreground">Article 5 — Résiliation :</strong> {lang === "fr" ? "Chaque partie peut résilier le contrat avec un préavis de 3 mois, par lettre recommandée." : "Either party may terminate the contract with 3 months' notice, by registered letter."}</p>
            </div>
          </div>

          {/* Tenant Message if sent */}
          {contract.tenantMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Send className="h-3.5 w-3.5 text-violet-600" />
                </div>
                <p className="text-[10px] font-black uppercase text-violet-600 tracking-[0.2em]">
                  {lang === "fr" ? "Message joint au locataire" : "Message attached for tenant"}
                </p>
              </div>
              <div className="bg-violet-50 rounded-xl p-6 border border-violet-100 text-sm text-violet-900 leading-relaxed font-medium whitespace-pre-wrap">
                {contract.tenantMessage}
              </div>
            </div>
          )}

          {/* Signatures Section */}
          <div className="space-y-4 print:break-before-page">
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
              {lang === "fr" ? "Signatures" : "Signatures"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SignaturePad
                label={lang === "fr" ? "Signature du Propriétaire" : "Owner's Signature"}
                existingSignature={contract.ownerSignature}
                onSign={onOwnerSign}
                disabled={contract.status !== "Draft"}
              />
              <SignaturePad
                label={lang === "fr" ? "Signature du Locataire" : "Tenant's Signature"}
                existingSignature={contract.tenantSignature}
                onSign={onTenantSign}
                disabled={contract.status !== "SentToTenant"}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-border/50 text-center space-y-1">
            <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Contrat établi en deux exemplaires originaux</p>
            <p className="text-[8px] text-muted-foreground">ImmoSmart SARL — Monastir, Tunisie — Matricule Fiscal: 1234567/A/B/C/000</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          #contract-content, #contract-content * { visibility: visible; }
          #contract-content {
            position: absolute;
            left: 0; top: 0; width: 100%;
            margin: 0; padding: 2rem;
            border: none; box-shadow: none; border-radius: 0;
          }
        }
      `}</style>
    </div>
  )
}
