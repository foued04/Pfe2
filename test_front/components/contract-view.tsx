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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PdfLayout } from "./pdf-layout"

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
      </div>      {/* Contract Document */}
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
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-3.5 w-3.5 text-[#6B7280]" />
              <p className="text-[10px] font-black uppercase text-[#6B7280] tracking-[0.2em]">
                {lang === "fr" ? "Clauses Générales" : "General Clauses"}
              </p>
            </div>
            <div className="bg-background/50 rounded-2xl p-6 border border-secondary/5 text-[11px] text-[#4B5563] space-y-3 leading-relaxed">
              <p><strong className="text-primary">Article 1 — Objet :</strong> {lang === "fr" ? "Le bailleur met à la disposition du preneur le bien immobilier désigné ci-dessus, pour un usage exclusif d'habitation." : "The landlord makes available to the tenant the property described above, for exclusive residential use."}</p>
              <p><strong className="text-primary">Article 2 — Loyer :</strong> {lang === "fr" ? `Le loyer mensuel est fixé à ${contract.propertyRent.toLocaleString()} TND, payable d'avance le premier jour de chaque mois.` : `The monthly rent is set at ${contract.propertyRent.toLocaleString()} TND, payable in advance on the first day of each month.`}</p>
              <p><strong className="text-primary">Article 3 — Caution :</strong> {lang === "fr" ? `Une caution de ${contract.propertyDeposit.toLocaleString()} TND sera versée à la signature du contrat et restituée à la fin du bail.` : `A deposit of ${contract.propertyDeposit.toLocaleString()} TND will be paid upon signing and returned at the end of the lease.`}</p>
              <p><strong className="text-primary">Article 4 — Entretien :</strong> {lang === "fr" ? "Le preneur s'engage à entretenir le bien en bon état et à effectuer les réparations locatives à sa charge." : "The tenant agrees to maintain the property in good condition and to carry out rental repairs at their own expense."}</p>
              <p><strong className="text-primary">Article 5 — Résiliation :</strong> {lang === "fr" ? "Chaque partie peut résilier le contrat avec un préavis de 3 mois, par lettre recommandée." : "Either party may terminate the contract with 3 months' notice, by registered letter."}</p>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">
              {lang === "fr" ? "Signatures" : "Signatures"}
            </p>
            <div className="grid grid-cols-2 gap-8">
              <SignaturePad
                label={lang === "fr" ? "Le Propriétaire" : "The Owner"}
                existingSignature={contract.ownerSignature}
                onSign={onOwnerSign}
                disabled={contract.status !== "Draft"}
              />
              <SignaturePad
                label={lang === "fr" ? "Le Locataire" : "The Tenant"}
                existingSignature={contract.tenantSignature}
                onSign={onTenantSign}
                disabled={contract.status !== "SentToTenant"}
              />
            </div>
          </div>
        </div>
      </PdfLayout>
    </div>
  )
}
