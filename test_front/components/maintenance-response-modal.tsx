"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Wrench, 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react"
import { resolveApiUrl } from "@/lib/api/client"
import { cn } from "@/lib/utils"

interface MaintenanceResponseModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  lang: string
  onUpdated: (updated: any) => void
}

export function MaintenanceResponseModal({
  isOpen,
  onClose,
  request,
  lang,
  onUpdated,
}: MaintenanceResponseModalProps) {
  const [responseMessage, setResponseMessage] = useState("")
  const [status, setStatus] = useState<string>(request?.status || "En attente")
  const [interventionDate, setInterventionDate] = useState("")
  const [interventionTime, setInterventionTime] = useState("")
  const [technician, setTechnician] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const API_URL = resolveApiUrl()

  if (!request) return null

  const handleRespond = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/notifications/reclamations/${request._id}/respond`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          responseMessage,
          intervention: interventionDate ? {
            date: interventionDate,
            time: interventionTime,
            technician
          } : undefined
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        onUpdated(updated)
        onClose()
      } else {
        alert("Erreur lors de la réponse")
      }
    } catch (err) {
      console.error("Respond to reclamation error:", err)
      alert("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const photos = request.claimMeta?.photos || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-100 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black uppercase tracking-tight">
                {request.title}
              </DialogTitle>
              <DialogDescription>
                {lang === "fr" ? "Détails de la demande de maintenance" : "Maintenance request details"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          {/* Left Side: Request Details */}
          <div className="space-y-6">
            <div className="rounded-2xl border bg-slate-50/50 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Informations</span>
                <Badge className={cn(
                  "text-[9px] uppercase font-black px-2 py-0.5",
                  request.status === "Resolue" ? "bg-emerald-100 text-emerald-700" : 
                  request.status === "Refusee" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                )}>
                  {request.status}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Locataire</p>
                    <p className="text-sm font-bold text-slate-700">{request.claimMeta?.tenantName || "Inconnu"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Date de la demande</p>
                    <p className="text-sm font-bold text-slate-700">{new Date(request.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">Priorité & Catégorie</p>
                    <p className="text-sm font-bold text-slate-700">{request.claimMeta?.category || "Maintenance"} • {request.claimMeta?.priority || "Normale"}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Message du locataire</p>
                <div className="bg-white rounded-xl border p-4 text-sm text-slate-600 italic">
                  "{request.content.split('\n\n').pop()}"
                </div>
              </div>

              {photos.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Photos jointes</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo: string, i: number) => (
                      <a key={i} href={photo} target="_blank" rel="noreferrer" className="relative aspect-square rounded-lg overflow-hidden border group">
                        <img src={photo} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`attachment-${i}`} />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="h-4 w-4 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Owner Action */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mettre à jour le statut</Label>
                <div className="grid grid-cols-3 gap-2">
                  {["En attente", "En cours", "Resolue", "Refusee"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={cn(
                        "px-2 py-2 rounded-xl text-[10px] font-black uppercase border transition-all",
                        status === s 
                          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                          : "bg-white text-slate-500 border-slate-200 hover:border-primary/50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Réponse au locataire</Label>
                <Textarea 
                  placeholder={lang === "fr" ? "Expliquez les mesures prises..." : "Explain actions taken..."}
                  className="min-h-[100px] rounded-xl"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-100">
                <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> 
                  {lang === "fr" ? "Planifier une intervention (Optionnel)" : "Schedule intervention (Optional)"}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500 uppercase">Date</Label>
                    <Input type="date" className="h-9 rounded-lg text-xs" value={interventionDate} onChange={(e) => setInterventionDate(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] font-bold text-slate-500 uppercase">Heure</Label>
                    <Input type="time" className="h-9 rounded-lg text-xs" value={interventionTime} onChange={(e) => setInterventionTime(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] font-bold text-slate-500 uppercase">Technicien / Entreprise</Label>
                  <Input 
                    placeholder="Ex: Plombier Rapid Service" 
                    className="h-9 rounded-lg text-xs"
                    value={technician}
                    onChange={(e) => setTechnician(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-6">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {lang === "fr" ? "Annuler" : "Cancel"}
          </Button>
          <Button onClick={handleRespond} disabled={isLoading} className="gap-2 px-8">
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {lang === "fr" ? "Enregistrer la réponse" : "Save Response"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
