"use client"

import { useState, useMemo, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { ContractView } from "./contract-view"
import { Contract } from "@/lib/rental-request-data"
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
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Home,
  MapPin,
  User,
  AlertTriangle
} from "lucide-react"

export interface Notification {
  _id: string;
  type: 'Réclamation' | 'Contrat' | 'Système' | 'Vérification';
  title: string;
  preview: string;
  content: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  attachments?: Array<
    | string
    | {
        name?: string;
        type?: string;
        size?: number;
        dataUrl?: string;
      }
  >;
  claimMeta?: {
    tenantId?: string;
    tenantName?: string;
    propertyTitle?: string;
    propertyAddress?: string;
    subject?: string;
    category?: string;
    priority?: string;
    description?: string;
    photos?: string[];
  };
  contractData?: {
    contractId?: string;
    requestId?: string;
    propertyTitle?: string;
    propertyAddress?: string;
    propertyImage?: string;
    startDate?: string;
    endDate?: string;
    rent?: number;
  };
  furnitureMeta?: {
    furnitureId?: string;
    furnitureName?: string;
    category?: string;
    price?: number;
    image?: string;
    ownerName?: string;
    status?: string;
  };
}

export function NotificationsModule() {
  const { lang } = useI18n()
  const isFr = lang === "fr"
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeType, setActiveType] = useState<string | "Tous">("Tous")
  const [activeNotifId, setActiveNotifId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [contractToView, setContractToView] = useState<Contract | null>(null)
  const [viewContractError, setViewContractError] = useState<string | null>(null)
  const [reclamationReply, setReclamationReply] = useState("")
  const [isSendingReply, setIsSendingReply] = useState(false)
  const [replyStatus, setReplyStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [isModerating, setIsModerating] = useState(false)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
  const normalizeType = (type: string) =>
    type === "RÃ©clamation"
      ? "Réclamation"
      : type === "SystÃ¨me"
        ? "Système"
        : type === "VÃ©rification"
          ? "Vérification"
          : type
  const isReclamation = (type: string) => normalizeType(type) === "Réclamation"

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error("Fetch notifications error:", err)
    } finally {
      setIsLoading(false)
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
    propertyRent: data.rentAmount || 0,
    propertyDeposit: data.depositAmount || 0,
    ownerName: data.owner?.fullName || "...",
    ownerEmail: data.owner?.email || "...",
    ownerPhone: data.owner?.phone || "...",
    tenantName: data.tenant?.fullName || "...",
    tenantEmail: data.tenant?.email || "...",
    tenantPhone: data.tenant?.phone || "...",
    startDate: data.startDate || "",
    endDate: data.endDate || "",
    duration: data.request?.duration || "",
    status: data.status,
    ownerSignature: data.ownerSignature,
    tenantSignature: data.tenantSignature,
    tenantMessage: data.tenantMessage,
    createdAt: data.createdAt
  })

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
          isFr
            ? "Impossible d'ouvrir le contrat pour le moment."
            : "Unable to open the contract right now."
        )
      }
    } catch (err) {
      console.error("Fetch contract error:", err)
      setViewContractError(isFr ? "Erreur de connexion." : "Connection error.")
    }
  }

  const handleOwnerSign = async (signature: string) => {
    if (!contractToView) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${contractToView.id}/sign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ signature }),
      })

      if (response.ok) {
        const data = await response.json()
        setContractToView(mapBackendContract(data))
      }
    } catch (err) {
      console.error("Owner sign from notifications error:", err)
    }
  }

  const handleSendToTenant = async (message: string) => {
    if (!contractToView) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${contractToView.id}/send`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      })

      if (response.ok) {
        const data = await response.json()
        setContractToView(mapBackendContract(data))
      }
    } catch (err) {
      console.error("Send contract from notifications error:", err)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error("Mark as read error:", err)
    }
  }

  const handleReplyToReclamation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!activeNotif || !isReclamation(activeNotif.type)) return

    const tenantId = activeNotif.claimMeta?.tenantId
    const cleanReply = reclamationReply.trim()

    if (!tenantId) {
      setReplyStatus({ type: "error", message: "Impossible de retrouver le locataire pour cette réclamation." })
      return
    }

    if (!cleanReply) {
      setReplyStatus({ type: "error", message: "Veuillez écrire une réponse." })
      return
    }

    setIsSendingReply(true)
    setReplyStatus(null)

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipient: tenantId,
          type: "Réclamation",
          title: `Réponse à votre réclamation - ${activeNotif.claimMeta?.propertyTitle || activeNotif.title}`,
          preview: cleanReply.length > 120 ? `${cleanReply.slice(0, 117)}...` : cleanReply,
          content: cleanReply,
          status: "En attente",
          claimResponse: {
            message: cleanReply,
          },
          claimMeta: {
            ...activeNotif.claimMeta,
            source: "owner",
            subject: activeNotif.claimMeta?.subject || activeNotif.title,
            description: cleanReply,
          },
        }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || "Erreur lors de l'envoi de la réponse.")
      }

      setReclamationReply("")
      setReplyStatus({ type: "success", message: "Réponse envoyée au locataire." })
    } catch (err) {
      setReplyStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Erreur lors de l'envoi de la réponse.",
      })
    } finally {
      setIsSendingReply(false)
    }
  }

  const handleModerateFurniture = async (id: string, status: "approved" | "rejected") => {
    setIsModerating(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/furniture/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        // Update local state to reflect change
        setNotifications(prev => prev.map(n => 
          n.furnitureMeta?.furnitureId === id 
            ? { ...n, furnitureMeta: { ...n.furnitureMeta, status } } 
            : n
        ))
        setReplyStatus({ 
          type: "success", 
          message: status === "approved" ? "Mobilier approuvé avec succès !" : "Suggestion rejetée." 
        })
      } else {
        throw new Error("Erreur lors de la modération")
      }
    } catch (err) {
      console.error("Furniture moderation error:", err)
      setReplyStatus({ type: "error", message: "Impossible de traiter la demande." })
    } finally {
      setIsModerating(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeNotifId) {
      const notif = notifications.find(n => n._id === activeNotifId)
      if (notif && !notif.isRead) {
        markAsRead(activeNotifId)
      }
    }
    setReclamationReply("")
    setReplyStatus(null)
  }, [activeNotifId])

  const filteredNotifs = useMemo(() => {
    return notifications
      .filter(n => activeType === "Tous" || normalizeType(n.type) === activeType)
      .filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [notifications, activeType, searchQuery])

  const activeNotif = notifications.find(n => n._id === activeNotifId)
  const activeNotifPhotos = useMemo(() => {
    if (!activeNotif) return []
    const fromAttachments =
      activeNotif.attachments
        ?.map((item) => (typeof item === "string" ? item : item?.dataUrl))
        .filter((url): url is string => Boolean(url)) || []
    if (fromAttachments.length > 0) return fromAttachments
    return activeNotif.claimMeta?.photos?.filter(Boolean) || []
  }, [activeNotif])

  const getTypeConfig = (type: string) => {
    switch (normalizeType(type)) {
      case "Vérification":
        return { color: "text-emerald-700 bg-emerald-100 border-emerald-200", icon: ShieldCheck }
      case "Contrat":
        return { color: "text-blue-700 bg-blue-100 border-blue-200", icon: FileSignature }
      case "Réclamation":
        return { color: "text-red-700 bg-red-100 border-red-200", icon: AlertTriangle }
      case "Mobilier":
        return { color: "text-orange-700 bg-orange-100 border-orange-200", icon: Home }
      case "Système":
      default:
        return { color: "text-slate-700 bg-slate-100 border-slate-200", icon: Info }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(isFr ? "fr-FR" : "en-US", {
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
          onOwnerSign={handleOwnerSign}
          onTenantSign={() => {}}
          onSendToTenant={handleSendToTenant}
          userRole="owner"
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white rounded-3xl border border-border/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      {/* List Column */}
      <div className="w-full md:w-[400px] flex-shrink-0 border-r border-border/10 flex flex-col bg-slate-50/30">
        <div className="p-6 space-y-4 border-b border-border/10 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              {isFr ? "Notifications" : "Notifications"}
            </h2>
            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />}
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder={isFr ? "Rechercher..." : "Search..."}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["Tous", "Réclamation", "Mobilier", "Vérification", "Contrat", "Système"].map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap",
                  activeType === type 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-2">
            {filteredNotifs.length === 0 ? (
              <div className="py-20 text-center flex flex-col items-center gap-3 opacity-30">
                <Bell className="w-12 h-12" />
                <p className="font-bold text-sm">{isFr ? "Aucune notification" : "No notifications"}</p>
              </div>
            ) : (
              filteredNotifs.map((n) => {
                const config = getTypeConfig(n.type)
                const Icon = config.icon
                const isActive = activeNotifId === n._id
                const normalizedType = normalizeType(n.type)
                
                return (
                  <button
                    key={n._id}
                    onClick={() => setActiveNotifId(n._id)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl transition-all duration-200 border group relative",
                      isActive 
                        ? "bg-white border-primary/20 shadow-lg shadow-primary/5 ring-1 ring-primary/5" 
                        : "bg-transparent border-transparent hover:bg-white/50 hover:border-slate-200"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn("p-2 rounded-xl border flex-shrink-0", config.color)}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className={cn("font-bold text-sm line-clamp-1", !n.isRead ? "text-foreground" : "text-muted-foreground")}>
                            {n.title}
                          </h3>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {n.preview}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">
                              {formatDate(n.createdAt)}
                            </span>
                            {isReclamation(normalizedType) && (
                              <span className="rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-black uppercase text-red-600">
                                {n.claimMeta?.priority || "Reclamation"}
                              </span>
                            )}
                          </div>
                          {!n.isRead && (
                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail Column */}
      <div className="flex-1 overflow-y-auto bg-slate-50/10">
        {!activeNotif ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-40">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">
              {isFr ? "Sélectionnez une notification" : "Select a notification"}
            </h3>
            <p className="max-w-xs text-sm font-medium">
              {isFr ? "Consultez vos messages système et alertes administratives." : "View your system messages and administrative alerts."}
            </p>
          </div>
        ) : (
          <div className="p-8 md:p-12 max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
              <Badge className={cn("px-4 py-1 text-[10px] uppercase font-black border-transparent shadow-sm", getTypeConfig(activeNotif.type).color)}>
                {normalizeType(activeNotif.type)}
              </Badge>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(activeNotif.createdAt)}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
                {activeNotif.title}
              </h1>
              <div className="h-1 w-20 bg-primary rounded-full" />
            </div>

            {isReclamation(activeNotif.type) ? (
              <div className="overflow-hidden rounded-3xl border border-red-100 bg-white shadow-xl shadow-red-50">
                <div className="border-b border-red-100 bg-red-50/70 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-red-600 p-3 text-white shadow-lg shadow-red-200">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-red-600">Réclamation locataire</p>
                        <h3 className="text-xl font-black text-slate-950">{activeNotif.claimMeta?.subject || activeNotif.title}</h3>
                      </div>
                    </div>
                    <Badge className="border-red-200 bg-white px-4 py-1.5 text-xs font-black uppercase text-red-700">
                      {activeNotif.claimMeta?.priority || activeNotif.preview}
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-4 p-6 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                      <User className="h-4 w-4 text-primary" />
                      Locataire
                    </p>
                    <p className="text-lg font-black text-slate-900">{activeNotif.claimMeta?.tenantName || "Locataire"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                      <Home className="h-4 w-4 text-primary" />
                      Logement
                    </p>
                    <p className="text-lg font-black text-slate-900">{activeNotif.claimMeta?.propertyTitle || "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 md:col-span-2">
                    <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                      <MapPin className="h-4 w-4 text-primary" />
                      Adresse
                    </p>
                    <p className="font-bold text-slate-800">{activeNotif.claimMeta?.propertyAddress || "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Catégorie</p>
                    <p className="font-black text-slate-900">{activeNotif.claimMeta?.category || "-"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Statut</p>
                    <p className="font-black text-amber-600">{activeNotif.status || "En attente"}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 md:col-span-2">
                    <p className="mb-3 text-xs font-black uppercase tracking-wider text-slate-500">Description</p>
                    <p className="whitespace-pre-wrap text-base font-semibold leading-7 text-slate-700">
                      {activeNotif.claimMeta?.description || activeNotif.content}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none">
                <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-inner">
                  <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {activeNotif.content}
                  </p>
                </div>
              </div>
            )}

            {activeNotif.furnitureMeta && (
              <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/50">
                <div className="relative h-64 w-full">
                  <img 
                    src={activeNotif.furnitureMeta.image || "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800"} 
                    className="h-full w-full object-cover"
                    alt={activeNotif.furnitureMeta.furnitureName}
                  />
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-primary/90 text-white border-none font-black px-4 py-1.5 rounded-full text-xs uppercase tracking-widest backdrop-blur-md">
                      {activeNotif.furnitureMeta.category}
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8">
                     <h3 className="text-3xl font-black text-white tracking-tight uppercase leading-none">
                       {activeNotif.furnitureMeta.furnitureName}
                     </h3>
                  </div>
                </div>
                
                <div className="p-10 space-y-8">
                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-100">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">
                        {activeNotif.title.includes("changement") ? "Type de Changement" : "Prix Suggéré"}
                      </p>
                      {activeNotif.title.includes("changement") ? (
                        <p className="text-2xl font-black text-primary tracking-tight">
                          {activeNotif.furnitureMeta.category}
                        </p>
                      ) : (
                        <p className="text-3xl font-black text-primary tracking-tighter">
                          {activeNotif.furnitureMeta.price} <span className="text-sm font-bold uppercase ml-1">DT</span>
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-2">
                        {activeNotif.title.includes("changement") ? "Locataire" : "Demandeur"}
                      </p>
                      <p className="text-2xl font-black text-slate-800 tracking-tight">
                        {activeNotif.furnitureMeta.ownerName || "Utilisateur"}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                     <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-3">Statut Actuel</p>
                     <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-3 w-3 rounded-full animate-pulse",
                          activeNotif.furnitureMeta.status === "approved" ? "bg-emerald-500" :
                          activeNotif.furnitureMeta.status === "rejected" ? "bg-red-500" : "bg-orange-500"
                        )} />
                        <span className="font-black text-slate-700 uppercase text-sm tracking-widest">
                          {activeNotif.furnitureMeta.status === "pending" ? "En attente de validation" :
                           activeNotif.furnitureMeta.status === "approved" ? "Validé et publié" : "Refusé"}
                        </span>
                     </div>
                  </div>

                  {activeNotif.furnitureMeta.status === "pending" && (
                    <div className="flex gap-4 pt-4">
                      <Button 
                        disabled={isModerating}
                        onClick={() => activeNotif.furnitureMeta?.furnitureId && handleModerateFurniture(activeNotif.furnitureMeta.furnitureId, "approved")}
                        className="flex-1 h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-100 border-none px-8 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <ShieldCheck className="w-5 h-5 mr-3" /> Approuver l'article
                      </Button>
                      <Button 
                        disabled={isModerating}
                        variant="outline"
                        onClick={() => activeNotif.furnitureMeta?.furnitureId && handleModerateFurniture(activeNotif.furnitureMeta.furnitureId, "rejected")}
                        className="flex-1 h-16 rounded-2xl border-red-200 text-red-500 hover:bg-red-50 font-black uppercase text-xs tracking-[0.2em] px-8 border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <AlertTriangle className="w-5 h-5 mr-3" /> Rejeter
                      </Button>
                    </div>
                  )}

                  {replyStatus && (
                    <div className={cn(
                      "p-4 rounded-2xl text-center font-black text-sm uppercase tracking-wider animate-in fade-in slide-in-from-bottom-2",
                      replyStatus.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                      {replyStatus.message}
                    </div>
                  )}
                </div>
              </div>
            )}

            {isReclamation(activeNotif.type) && activeNotifPhotos.length > 0 && (
              <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 mb-4">
                  {isFr ? "Photos de la Réclamation" : "Reclamation Photos"}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {activeNotifPhotos.map((url, idx) => (
                    <a
                      key={`${activeNotif._id}-photo-${idx}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={url}
                        alt={`reclamation-${idx + 1}`}
                        className="h-32 w-full object-cover transition-transform duration-200 hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {isReclamation(activeNotif.type) && (
              <form onSubmit={handleReplyToReclamation} className="rounded-3xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-950">Répondre au locataire</h4>
                    <p className="text-sm font-medium text-slate-500">
                      Votre message sera envoyé dans les notifications du locataire.
                    </p>
                  </div>
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <textarea
                  value={reclamationReply}
                  onChange={(event) => setReclamationReply(event.target.value)}
                  className="min-h-28 w-full resize-none rounded-2xl border border-blue-100 bg-white p-4 text-sm font-medium outline-none ring-primary/20 transition focus:ring-4"
                  placeholder="Ecrivez votre réponse, par exemple: Je vais envoyer un technicien demain matin..."
                />
                {replyStatus && (
                  <p className={cn(
                    "mt-3 text-sm font-bold",
                    replyStatus.type === "success" ? "text-emerald-600" : "text-destructive"
                  )}>
                    {replyStatus.message}
                  </p>
                )}
                <div className="mt-4 flex justify-end">
                  <Button type="submit" disabled={isSendingReply} className="rounded-2xl px-6 font-black">
                    {isSendingReply ? "Envoi..." : "Envoyer la réponse"}
                    {!isSendingReply && <ChevronRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>
            )}

            {activeNotif.type === "Contrat" && activeNotif.contractData && (
              <div className="bg-white border border-blue-200 rounded-3xl overflow-hidden shadow-xl shadow-blue-100">
                <div className="relative h-44">
                  <img
                    src={activeNotif.contractData.propertyImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"}
                    alt="Propriete"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
                    <div className="text-white">
                      <h4 className="text-2xl font-black mb-1">{activeNotif.contractData.propertyTitle || "Contrat"}</h4>
                      <p className="text-xs opacity-80 font-medium">{activeNotif.contractData.propertyAddress || "-"}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <Button
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-base font-black"
                    onClick={() => handleViewContract(activeNotif.contractData?.contractId, activeNotif.contractData?.requestId)}
                  >
                    <FileSignature className="w-5 h-5 mr-2" />
                    {isFr ? "Consulter le Contrat" : "View Contract"}
                  </Button>
                  {viewContractError && (
                    <p className="mt-3 text-sm font-semibold text-destructive">{viewContractError}</p>
                  )}
                </div>
              </div>
            )}

            {activeNotif.type === "Vérification" && (
              <div className={cn(
                "p-6 rounded-3xl border flex items-center gap-6",
                activeNotif.title.includes("Rejeté") ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"
              )}>
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg",
                  activeNotif.title.includes("Rejeté") ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                )}>
                  {activeNotif.title.includes("Rejeté") ? <ShieldAlert className="w-8 h-8" /> : <CheckCircle className="w-8 h-8" />}
                </div>
                <div>
                  <h4 className="text-xl font-black text-foreground mb-1">
                    {activeNotif.title.includes("Rejeté") ? (isFr ? "Action Requise" : "Action Required") : (isFr ? "Succès de Vérification" : "Verification Success")}
                  </h4>
                  <p className="text-sm text-slate-500 font-medium">
                    {isFr 
                      ? "Le statut de votre profil a été mis à jour dans le système." 
                      : "Your profile status has been updated in the system."}
                  </p>
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black">
                    A
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">Administrateur</p>
                    <p className="text-[10px] font-bold">ImmoSmart Team</p>
                  </div>
               </div>
               <p className="text-[10px] font-bold italic">Réf: {activeNotif._id.substring(activeNotif._id.length - 8).toUpperCase()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
