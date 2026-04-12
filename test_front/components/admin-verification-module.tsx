"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { 
  Check, 
  X, 
  Eye, 
  User, 
  FileText, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Search,
  MessageSquare
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function AdminVerificationModule({ compact = false }: { compact?: boolean }) {
  const [verifications, setVerifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const { toast } = useToast()

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const fetchVerifications = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/verifications/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setVerifications(data)
      }
    } catch (error) {
      console.error("Error fetching verifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVerifications()
  }, [])

  const handleVerify = async (userId: string, docType: string, status: 'verified' | 'rejected') => {
    setIsProcessing(`${userId}-${docType}`)
    const comment = status === 'rejected' ? prompt("Raison du rejet (Optionnel):") || "" : ""
    
    try {
      const response = await fetch(`${API_URL}/verifications/verify/${userId}/${docType}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status, comment })
      })

      if (response.ok) {
        toast({
          title: status === 'verified' ? "Document approuvé" : "Document rejeté",
          description: `La vérification du ${docType.toUpperCase()} a été enregistrée.`,
          variant: status === 'verified' ? "default" : "destructive"
        })
        fetchVerifications()
      }
    } catch (error) {
      console.error("Error verifying document:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(null)
    }
  }

  const filteredVerifications = verifications.filter(v => 
    v.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className={cn("space-y-6 animate-in fade-in duration-500", compact ? "p-0" : "p-8")}>
      {!compact && (
        <>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Vérifications de documents</h1>
            <p className="text-muted-foreground font-medium">Modérez les identités des propriétaires pour garantir la confiance</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="border-none shadow-lg bg-card p-6 flex items-center gap-5">
               <div className="p-4 rounded-2xl bg-orange-100 text-orange-600">
                 <Clock className="w-6 h-6" />
               </div>
               <div>
                 <p className="text-2xl font-black text-foreground">{verifications.length}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">En attente</p>
               </div>
            </Card>
          </div>
        </>
      )}

      <Card className="border-none shadow-lg bg-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher un propriétaire..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border-none text-sm focus:ring-2 focus:ring-primary/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <div className="space-y-6">
        {filteredVerifications.map((owner) => (
          <Card key={owner._id} className="border-none shadow-xl bg-card overflow-hidden">
            <div className="p-6 bg-muted/30 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                  {owner.fullName[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-foreground text-base">{owner.fullName}</h3>
                  <p className="text-xs text-muted-foreground font-bold">{owner.email}</p>
                </div>
              </div>
              <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5 px-3 py-1">
                {owner.phone || "Pas de téléphone"}
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 divide-x divide-border/50">
              {['cin', 'rib'].map((type) => {
                const doc = owner.documents?.[type]
                if (!doc || (doc.status !== 'pending' && doc.status !== 'rejected' && doc.status !== 'verified')) {
                  return (
                    <div key={type} className="p-6 flex flex-col items-center justify-center text-center space-y-2 opacity-40">
                      <AlertCircle className="w-8 h-8 text-muted-foreground" />
                      <p className="text-xs font-black uppercase tracking-widest">{type.toUpperCase()} Non soumis</p>
                    </div>
                  )
                }

                return (
                  <div key={type} className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="text-sm font-black uppercase tracking-tight">{type === 'cin' ? 'Carte d\'Identité (CIN)' : 'Relevé Bancaire (RIB)'}</span>
                      </div>
                      <Badge className={cn(
                        "font-black text-[10px] px-2 py-0.5 rounded-sm",
                        doc.status === 'pending' ? "bg-orange-100 text-orange-600" :
                        doc.status === 'verified' ? "bg-emerald-100 text-emerald-600" :
                        "bg-red-100 text-red-600"
                      )}>
                        {doc.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div className="aspect-video rounded-xl bg-muted overflow-hidden border border-border/50 relative group">
                      {doc.url ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/5">
                           <FileText className="w-12 h-12 text-muted-foreground/30" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <a href={doc.url} target="_blank" rel="noopener noreferrer">
                               <Button size="sm" variant="secondary" className="font-black text-[10px]">
                                 <ExternalLink className="w-3 h-3 mr-1" /> VOIR
                               </Button>
                             </a>
                           </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs italic">
                          Aucun fichier disponible
                        </div>
                      )}
                    </div>

                    {doc.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => handleVerify(owner._id, type, 'verified')}
                          disabled={isProcessing === `${owner._id}-${type}`}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 font-black text-[10px] uppercase h-9 rounded-lg"
                        >
                          {isProcessing === `${owner._id}-${type}` ? "..." : <><Check className="w-3 h-3 mr-1" /> Approuver</>}
                        </Button>
                        <Button 
                          onClick={() => handleVerify(owner._id, type, 'rejected')}
                          disabled={isProcessing === `${owner._id}-${type}`}
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-black text-[10px] uppercase h-9 rounded-lg"
                        >
                          {isProcessing === `${owner._id}-${type}` ? "..." : <><X className="w-3 h-3 mr-1" /> Rejeter</>}
                        </Button>
                      </div>
                    )}

                    {doc.comment && (
                      <div className="p-3 rounded-lg bg-muted text-[11px] font-medium text-muted-foreground border border-border/50 flex gap-2">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        <span>{doc.comment}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        ))}

        {verifications.length === 0 && !isLoading && (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50">
             <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
               <Check className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-black text-foreground">Tout est à jour !</h3>
             <p className="text-muted-foreground font-bold mt-2">Aucune demande de vérification en attente pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
