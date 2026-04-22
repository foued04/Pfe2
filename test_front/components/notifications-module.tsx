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
  ShieldAlert
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
}

export function NotificationsModule() {
  const { lang, isFr } = useI18n()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeType, setActiveType] = useState<string | "Tous">("Tous")
  const [activeNotifId, setActiveNotifId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [contractToView, setContractToView] = useState<Contract | null>(null)
  const [viewContractError, setViewContractError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

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
  }, [activeNotifId])

  const filteredNotifs = useMemo(() => {
    return notifications
      .filter(n => activeType === "Tous" || n.type === activeType)
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
    switch (type) {
      case "Vérification":
        return { color: "text-emerald-700 bg-emerald-100 border-emerald-200", icon: ShieldCheck }
      case "Contrat":
        return { color: "text-blue-700 bg-blue-100 border-blue-200", icon: FileSignature }
      case "Réclamation":
        return { color: "text-orange-700 bg-orange-100 border-orange-200", icon: Wrench }
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
            {["Tous", "Réclamation", "Vérification", "Contrat", "Système"].map((type) => (
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
                           <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {formatDate(n.createdAt)}
                          </span>
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
                {activeNotif.type}
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

            <div className="prose prose-slate max-w-none">
              <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl shadow-inner">
                <p className="text-lg text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {activeNotif.content}
                </p>
              </div>
            </div>

            {activeNotif.type.toLowerCase().includes("clamation") && activeNotifPhotos.length > 0 && (
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
