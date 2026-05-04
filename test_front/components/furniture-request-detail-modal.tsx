"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { apiFetch } from "@/lib/api/client"
import { Calendar, Tag, Info, Home, User, AlertCircle, ShoppingCart, Image as ImageIcon, Send, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FurnitureRequestDetailModalProps {
  isOpen: boolean
  onClose: () => void
  request: any
  type: "suggestion" | "change"
  lang: string
  onRequestUpdated?: (request: any) => void
}

export function FurnitureRequestDetailModal({
  isOpen,
  onClose,
  request,
  type,
  lang,
  onRequestUpdated,
}: FurnitureRequestDetailModalProps) {
  const [replyMessage, setReplyMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  if (!request) return null

  const isFr = lang === "fr"
  const canReviewChangeRequest = type === "change" && request.status === "En attente"

  const handleReview = async (status: "Approuve" | "Refuse" | "En attente") => {
    setIsSubmitting(true)
    try {
      const updated = await apiFetch<any>(`/furniture/change-requests/${request._id}/review`, {
        auth: true,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          ownerResponse: replyMessage,
        }),
      })
      onRequestUpdated?.(updated)
      setReplyMessage("")
    } catch (error: any) {
      console.error("Error reviewing change request:", error)
      alert(error.message || "Erreur lors de la validation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
        <DialogHeader className="p-8 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] mb-2">
            {type === "suggestion" ? (
              <><ShoppingCart className="w-3 h-3" /> {isFr ? "Suggestion de Mobilier" : "Furniture Suggestion"}</>
            ) : (
              <><AlertCircle className="w-3 h-3" /> {isFr ? "Demande de Changement" : "Change Request"}</>
            )}
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
            {type === "suggestion" ? request.name : request.furnitureName}
          </DialogTitle>
          <div className="flex items-center gap-4 mt-4">
             <Badge className={cn(
                "font-black text-[10px] uppercase px-3 py-1 rounded-full",
                request.status === "approved" || request.status === "Approuve" ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                request.status === "rejected" || request.status === "Refuse" ? "bg-red-100 text-red-700 border-red-200" :
                "bg-orange-100 text-orange-700 border-orange-200"
             )}>
                {request.status}
             </Badge>
             <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(request.createdAt || request.date).toLocaleDateString()}
             </span>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isFr ? "Détails" : "Details"}</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                       <Tag className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{isFr ? "Catégorie / Type" : "Category / Type"}</p>
                      <p className="font-bold text-slate-900">{request.category || request.type}</p>
                    </div>
                  </div>

                  {type === "suggestion" && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                         <Info className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Prix suggéré</p>
                        <p className="font-bold text-primary text-lg">{request.price} DT</p>
                      </div>
                    </div>
                  )}

                  {type === "change" && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                         <AlertCircle className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-600 uppercase tracking-tighter">{isFr ? "Motif" : "Reason"}</p>
                        <p className="font-bold text-slate-900">{request.reason}</p>
                      </div>
                    </div>
                  )}

                  {request.propertyId && (
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                         <Home className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{isFr ? "Propriété" : "Property"}</p>
                        <p className="font-bold text-slate-900">{request.propertyId.title || "---"}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{isFr ? "Image" : "Image"}</p>
               <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center relative group">
                  {(request.image || request.photo) ? (
                    <img src={request.image || request.photo} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                       <ImageIcon className="w-12 h-12" />
                       <p className="text-xs font-bold">Pas d'image</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Description / Reason Detail */}
          {(request.description || request.reason) && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
               <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase">
                  <Info className="w-4 h-4 text-primary" />
                  {isFr ? "Description détaillée" : "Detailed Description"}
               </div>
               <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {request.description || request.reason}
               </p>
            </div>
          )}

          {type === "change" ? (
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-black text-xs uppercase">
                  <Send className="w-4 h-4 text-primary" />
                  {isFr ? "Reponse au locataire" : "Reply to tenant"}
                </div>
              </div>
              <textarea
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                className="min-h-28 w-full resize-none rounded-2xl border border-blue-100 bg-white p-4 text-sm font-medium outline-none ring-primary/20 transition focus:ring-4"
                placeholder={isFr ? "Ecrivez votre message au locataire..." : "Write your reply to the tenant..."}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={() => handleReview("En attente")}
                  disabled={isSubmitting || !replyMessage.trim()}
                  className="rounded-xl bg-primary text-white font-bold h-10 px-6 gap-2 shadow-lg shadow-primary/20"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? (isFr ? "Envoi..." : "Sending...") : isFr ? "Envoyer le message" : "Send message"}
                </Button>
              </div>
              {request.tenantResponse ? (
                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4 shadow-sm">
                  <p className="text-xs font-black uppercase text-orange-600 mb-2">{isFr ? "Reponse du locataire" : "Tenant reply"}</p>
                  <p className="text-sm text-slate-700 leading-relaxed font-bold italic">"{request.tenantResponse}"</p>
                </div>
              ) : null}
              {request.ownerResponse ? (
                <div className="rounded-2xl bg-white border border-blue-100 p-4 shadow-sm">
                  <p className="text-xs font-black uppercase text-slate-500 mb-2">{isFr ? "Derniere reponse (Vous)" : "Latest reply (You)"}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{request.ownerResponse}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-slate-100">
          {canReviewChangeRequest ? (
            <>
              <Button
                onClick={() => handleReview("Refuse")}
                disabled={isSubmitting}
                variant="outline"
                className="rounded-xl px-6 font-bold border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? (isFr ? "Envoi..." : "Sending...") : isFr ? "Refuser" : "Reject"}
              </Button>
              <Button
                onClick={() => handleReview("Approuve")}
                disabled={isSubmitting}
                className="rounded-xl px-6 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isSubmitting ? (isFr ? "Envoi..." : "Sending...") : isFr ? "Accepter" : "Accept"}
              </Button>
            </>
          ) : null}
          <Button variant="outline" onClick={onClose} className="rounded-xl px-8 font-bold border-slate-200">
            {isFr ? "Fermer" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
