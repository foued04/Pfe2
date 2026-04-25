"use client"

import { useState, useMemo, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { mockNotifications, TenantNotification, NotificationType } from "@/lib/notifications-data"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  Bell, 
  Search, 
  Clock, 
  CheckCircle, 
  FileSignature, 
  Calendar,
  Wrench,
  Info,
  Mail,
  Send
} from "lucide-react"
import { ContractView } from "./contract-view"
import { Contract } from "@/lib/rental-request-data"
import { Textarea } from "./ui/textarea"

export function TenantNotificationsModule() {
  const { lang } = useI18n()
  const [notifications, setNotifications] = useState<TenantNotification[]>(mockNotifications)
  const [activeType, setActiveType] = useState<NotificationType | "Tous">("Tous")
  const [activeNotifId, setActiveNotifId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [contractToView, setContractToView] = useState<Contract | null>(null)
  const [viewContractError, setViewContractError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)
  const [replySuccess, setReplySuccess] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const handleViewContract = async (contractId?: string, requestId?: string) => {
    setViewContractError(null)
    try {
      const token = localStorage.getItem("accessToken")
      let response: Response | null = null

      if (contractId) {
        response = await fetch(`${API_URL}/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      if ((!response || !response.ok) && requestId) {
        response = await fetch(`${API_URL}/contracts/request/${requestId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }

      if (response && response.ok) {
        const data = await response.json()
        setContractToView(mapBackendContract(data))
      } else {
        setViewContractError(
          lang === "fr"
            ? "Impossible d'ouvrir le contrat pour le moment."
            : "Unable to open the contract right now."
        )
      }
    } catch (err) {
      console.error("Fetch contract error:", err)
      setViewContractError(lang === "fr" ? "Erreur de connexion." : "Connection error.")
    }
  }

  const mapBackendContract = (data: any): Contract => ({
    id: data._id,
    requestId: data.request?._id || data.request,
    propertyId: data.property?._id || data.property,
    propertyImage: data.property?.images?.cover || "",
    propertyTitle: data.property?.title || "...",
    propertyAddress: data.property?.address || "...",
    propertyType: data.property?.type || "...",
    propertySurface: data.property?.surface || 0,
    propertyRent: data.rentAmount,
    propertyDeposit: data.depositAmount,
    ownerName: data.owner?._id ? data.owner.fullName : "...",
    ownerEmail: data.owner?.email || "...",
    ownerPhone: data.owner?.phone || "...",
    tenantName: data.tenant?._id ? data.tenant.fullName : "...",
    tenantEmail: data.tenant?.email || "...",
    tenantPhone: data.tenant?.phone || "...",
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    duration: data.duration || '',
    status: data.status,
    ownerSignature: data.ownerSignature,
    tenantSignature: data.tenantSignature,
    tenantMessage: data.tenantMessage,
    createdAt: data.createdAt
  })

  const handleTenantSign = async (signature: string) => {
    if (!contractToView) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${contractToView.id}/sign`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ signature })
      })
      if (response.ok) {
        const updatedContractData = await response.json()
        setContractToView(mapBackendContract(updatedContractData))
        // Refresh notifications
        const notifResponse = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (notifResponse.ok) {
          const data = await notifResponse.json()
          const dataArray = Array.isArray(data) ? data : []
          const mapped = dataArray.map((n: any) => ({
            id: n._id,
            type: n.type as NotificationType,
            title: n.title,
            preview: n.preview || n.content,
            date: n.createdAt,
            content: n.content,
            status: n.status || "En attente" as const,
            isRead: n.isRead || false,
            claimResponse: n.claimResponse,
            attachments: n.attachments,
            claimMeta: n.claimMeta,
            contractData: n.contractData,
            messageMeta: n.messageMeta
          }))
          setNotifications(prev => [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))])
        }
      }
    } catch (err) {
      console.error("Sign contract error:", err)
    }
  }

  const handleSendToOwner = async (message: string) => {
    if (!contractToView) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${contractToView.id}/send-back`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message })
      })
      if (response.ok) {
        const data = await response.json()
        setContractToView(mapBackendContract(data))
      }
    } catch (err) {
      console.error("Send back to owner error:", err)
    }
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("accessToken")
        const response = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          const dataArray = Array.isArray(data) ? data : []
          // Map backend notifications to frontend format
          const mapped = dataArray.map((n: any) => ({
            id: n._id,
            type: n.type as NotificationType,
            title: n.title,
            preview: n.preview || n.content,
            date: n.createdAt,
            content: n.content,
            status: n.status || "En attente" as const,
            isRead: n.isRead || false,
            claimResponse: n.claimResponse,
            attachments: n.attachments,
            claimMeta: n.claimMeta,
            contractData: n.contractData,
            messageMeta: n.messageMeta
          }))
          setNotifications(prev => [...mapped, ...prev.filter(p => !mapped.some(m => m.id === p.id))])
        }
      } catch (err) {
        console.error("Fetch notifications error:", err)
      }
    }
    
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const filteredNotifs = useMemo(() => {
    return notifications
      .filter(n => activeType === "Tous" || n.type === activeType)
      .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                   n.preview.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [notifications, activeType, searchQuery])

  const activeNotif = notifications.find(n => n.id === activeNotifId)

  const openNotification = async (notification: TenantNotification) => {
    setActiveNotifId(notification.id)
    setReplyText("")
    setReplyError(null)
    setReplySuccess(null)
    if (notification.isRead) return

    setNotifications((prev) =>
      prev.map((item) => (item.id === notification.id ? { ...item, isRead: true } : item))
    )

    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`${API_URL}/notifications/${notification.id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (err) {
      console.error("Mark notification as read error:", err)
    }
  }

  const handleReplyToMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeNotif?.messageMeta?.conversationId) {
      setReplyError("Impossible de retrouver la conversation.")
      return
    }

    const cleanReply = replyText.trim()
    if (!cleanReply) {
      setReplyError("Veuillez ecrire une reponse.")
      return
    }

    setIsReplying(true)
    setReplyError(null)
    setReplySuccess(null)

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeNotif.messageMeta.conversationId,
          content: cleanReply,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => null)
        setReplyError(err?.message || "Impossible d'envoyer la reponse.")
        return
      }

      setReplyText("")
      setReplySuccess("Votre reponse a ete envoyee.")
    } catch (err) {
      console.error("Reply to message error:", err)
      setReplyError("Erreur de connexion.")
    } finally {
      setIsReplying(false)
    }
  }

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case "Réclamation":
        return { color: "text-orange-700 bg-orange-50 border-orange-200", icon: Wrench }
      case "Contrat":
        return { color: "text-emerald-700 bg-emerald-100 border-emerald-200", icon: FileSignature }
      case "Système":
        return { color: "text-primary bg-emerald-50 border-emerald-100", icon: Info }
      default:
        return { color: "text-slate-700 bg-slate-50 border-slate-200", icon: Info }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  if (contractToView) {
    return (
      <div className="p-6">
        <ContractView
          contract={contractToView}
          onBack={() => setContractToView(null)}
          onOwnerSign={() => {}}
          onTenantSign={handleTenantSign}
          onSendToTenant={handleSendToOwner}
          userRole="tenant"
        />
      </div>
    )
  }

  return (
      <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background">
      {/* Colonne Gauche - Liste */}
      <div className="w-full md:w-[400px] flex-shrink-0 border-r border-border/50 flex flex-col bg-muted/5">
        <div className="p-6 space-y-4 border-b border-border/50 bg-background/50 backdrop-blur-md">
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            {lang === "fr" ? "Notifications" : "Notifications"}
          </h2>
          
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {["Tous", "Réclamation", "Contrat", "Système"].map((type) => (
              <Button
                key={type}
                variant={activeType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveType(type as any)}
                className="rounded-full px-4 font-bold text-[11px] uppercase tracking-wider"
              >
                {type}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {filteredNotifs.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-3 opacity-40">
                <Bell className="w-12 h-12" />
                <p className="font-bold">{lang === "fr" ? "Aucune notification" : "No notifications"}</p>
              </div>
            ) : (
              filteredNotifs.map((n) => {
                const config = getTypeConfig(n.type)
                const Icon = config.icon
                const isActive = activeNotifId === n.id
                
                return (
                  <button
                    key={n.id}
                    onClick={() => openNotification(n)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all duration-200 border",
                      isActive 
                        ? "bg-white border-primary/20 shadow-md shadow-primary/5 ring-1 ring-primary/5" 
                        : "bg-transparent border-transparent hover:bg-white hover:border-border/50"
                    )}
                  >
                    <div className="absolute inset-x-3 top-3 flex justify-between items-start pointer-events-none">
                      <Badge className={cn(
                        "border shadow-sm backdrop-blur-md px-3 py-1",
                        config.color
                      )}>
                        {n.type}
                      </Badge>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">
                        {formatDate(n.date)}
                      </span>
                    </div>
                    <h3 className={cn("font-bold text-sm mb-1 line-clamp-1", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                      {n.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {n.preview}
                    </p>
                    {!n.isRead && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter">Nouveau</span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Colonne Droite - Détail */}
      <div className="flex-1 overflow-y-auto bg-card/10">
        {!activeNotif ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10 opacity-20" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">Sélectionnez une notification</h3>
            <p className="max-w-xs text-sm font-medium">Consultez vos messages, contrats et demandes de maintenance en un coup d'œil.</p>
          </div>
        ) : (
          <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Notif Header */}
            <div className="border-b border-border/50 pb-8">
              <div className="flex items-center justify-between mb-4">
                <Badge className={cn("px-3 py-1 text-xs uppercase font-black border-transparent", getTypeConfig(activeNotif.type).color)}>
                  {activeNotif.type}
                </Badge>
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDate(activeNotif.date)}
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full border",
                    activeNotif.status === "Vue par le propriétaire" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                  )}>
                    {activeNotif.status}
                  </span>
                </div>
              </div>
              <h1 className="text-4xl font-black text-foreground tracking-tight mb-4 leading-tight">
                {activeNotif.title}
              </h1>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">
                  L
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Vous</p>
                  <p className="text-xs text-muted-foreground">Locataire</p>
                </div>
              </div>
            </div>

            {/* Original Message */}
            <div className="bg-muted/30 p-6 rounded-3xl border border-border/50">
              <div className="flex items-center gap-2 mb-4 text-xs font-black text-muted-foreground uppercase tracking-widest">
                <Info className="w-4 h-4 text-primary" />
                Détails de la demande
              </div>
              <p className="text-lg text-foreground/80 leading-relaxed italic">
                "{activeNotif.content}"
              </p>
            </div>

            {/* Conditional Content */}
            {activeNotif.type === "Réclamation" && activeNotif.claimResponse && (
              <div className="space-y-6">
                <div className="relative pl-12 before:absolute before:left-6 before:top-0 before:bottom-0 before:w-[2px] before:bg-primary/20">
                  <div className="absolute left-0 top-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 ring-4 ring-background">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">Propriétaire</p>
                        <h4 className="text-xl font-black text-foreground">Réponse Reçue</h4>
                      </div>
                    </div>
                    <p className="text-lg text-foreground/90 leading-relaxed font-medium">
                      {activeNotif.claimResponse.message}
                    </p>
                  </div>
                </div>

                {activeNotif.claimResponse.intervention && (
                  <div className="bg-emerald-500 text-white p-6 rounded-3xl shadow-xl shadow-emerald-200 border border-emerald-400 overflow-hidden relative group">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-2xl font-black tracking-tight">Intervention Programmée</h4>
                        <p className="text-emerald-50 font-bold opacity-80 uppercase text-[10px] tracking-widest">Confirmation Technique</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 relative z-10">
                      <div>
                        <p className="text-emerald-100/70 text-[10px] font-black uppercase mb-1">Date</p>
                        <p className="text-lg font-bold">{activeNotif.claimResponse.intervention.date}</p>
                      </div>
                      <div>
                        <p className="text-emerald-100/70 text-[10px] font-black uppercase mb-1">Heure</p>
                        <p className="text-lg font-bold">{activeNotif.claimResponse.intervention.time}</p>
                      </div>
                      <div>
                        <p className="text-emerald-100/70 text-[10px] font-black uppercase mb-1">Technicien</p>
                        <p className="text-lg font-bold">{activeNotif.claimResponse.intervention.technician}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeNotif.type === "Contrat" && activeNotif.contractData && (
              <div className="bg-white border border-emerald-200 rounded-3xl overflow-hidden shadow-xl shadow-emerald-100">
                <div className="relative h-48">
                  <img 
                    src={activeNotif.contractData.propertyImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"} 
                    alt="Propriété" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="text-2xl font-black mb-1">{activeNotif.contractData.propertyTitle}</h4>
                      <p className="text-xs opacity-80 font-medium">{activeNotif.contractData.propertyAddress}</p>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Début Contrat</p>
                      <p className="text-lg font-bold text-foreground">{activeNotif.contractData.startDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Fin Contrat</p>
                      <p className="text-lg font-bold text-foreground">{activeNotif.contractData.endDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase mb-2">Loyer Mensuel</p>
                      <p className="text-2xl font-black text-emerald-600">{activeNotif.contractData.rent} DT</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-lg font-black shadow-lg shadow-emerald-200"
                    onClick={() => handleViewContract(
                      activeNotif.contractData?.contractId,
                      (activeNotif.contractData as any)?.requestId
                    )}
                  >
                    <FileSignature className="w-5 h-5 mr-3" />
                    Consulter le Contrat
                  </Button>
                  {viewContractError && (
                    <p className="mt-3 text-sm font-semibold text-destructive">{viewContractError}</p>
                  )}
                </div>
              </div>
            )}

            {activeNotif.type === "Système" && (
              <div className="space-y-5">
                <div className="flex gap-4 p-8 bg-blue-50 border border-blue-200 rounded-3xl">
                  <Info className="w-10 h-10 text-blue-500 flex-shrink-0" />
                  <div>
                    <h4 className="text-xl font-black text-blue-900 mb-2">Information Système</h4>
                    <p className="text-blue-800/80 leading-relaxed font-medium">
                      {activeNotif.content}
                    </p>
                  </div>
                </div>

                {activeNotif.messageMeta?.conversationId && (
                  <form onSubmit={handleReplyToMessage} className="rounded-3xl border border-border bg-white p-6 shadow-sm">
                    <div className="mb-4">
                      <h4 className="text-xl font-black text-foreground">Repondre au message</h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Votre reponse sera envoyee dans la conversation avec {activeNotif.messageMeta.senderName || "le proprietaire"}.
                      </p>
                    </div>
                    <Textarea
                      value={replyText}
                      onChange={(event) => setReplyText(event.target.value)}
                      placeholder="Ecrivez votre reponse..."
                      className="min-h-28 resize-none"
                    />
                    {replyError && <p className="mt-3 text-sm font-semibold text-destructive">{replyError}</p>}
                    {replySuccess && <p className="mt-3 text-sm font-semibold text-emerald-700">{replySuccess}</p>}
                    <div className="mt-4 flex justify-end">
                      <Button type="submit" className="gap-2" disabled={isReplying}>
                        {isReplying ? "Envoi..." : "Envoyer la reponse"}
                        {!isReplying && <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
