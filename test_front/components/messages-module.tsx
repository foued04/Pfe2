"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import {
  MessageCategory,
  messageCategoryConfig,
} from "@/lib/messages-data"
import { Conversation, Message } from "@/lib/messages-data"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
  Search, 
  Send, 
  MessageSquare, 
  Clock, 
  Check, 
  CheckCheck,
  MoreVertical,
  Wrench,
  FileText,
  FileSignature,
  ShieldAlert,
  Inbox,
  Mail,
  Bell,
  Phone,
  Video,
  Info,
  PlusCircle,
  Image as ImageIcon,
  Smile,
  ThumbsUp,
  ExternalLink
} from "lucide-react"
import { ContractView } from "./contract-view"
import { Contract } from "@/lib/rental-request-data"
import { Card, CardContent } from "./ui/card"

export function MessagesModule() {
  const { lang } = useI18n()
  const { logout, user } = useAuth()
  const currentUserId = String(user?.id || "")
  
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [activeCategory, setActiveCategory] = useState<MessageCategory>("Tous")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sendViaEmail, setSendViaEmail] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [contractToView, setContractToView] = useState<Contract | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const handleUnauthorized = () => {
    setSessionExpired(true)
    setConversations([])
    setMessages([])
    setActiveConversationId(null)
    logout()
  }

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      if (response.ok) {
        const data = await response.json()
        const dataArray = Array.isArray(data) ? data : []
        setConversations(dataArray.map((c: any) => ({
          id: c._id,
          category: c.category,
          contextId: c.contextId,
          contextTitle: c.contextTitle,
          participants: c.participants.map((p: any) => ({
            id: p._id,
            name: p.fullName,
            role: p.role
          })),
          lastUpdatedAt: c.updatedAt
        })))
      }
    } catch (err) {
      console.error("Fetch conversations error:", err)
    }
  }

  const fetchMessages = async (convId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/messages/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      if (response.ok) {
        const data = await response.json()
        setMessages(data.map((m: any) => ({
          id: m._id,
          conversationId: m.conversation,
          senderId: String(m.sender._id || m.sender || ""),
          senderRole: String(m.sender?.role || "").toLowerCase(),
          content: m.content,
          timestamp: m.createdAt,
          isRead: m.isRead,
          source: m.source,
          metadata: m.metadata
        })))
        // Refresh sidebar counts since backend marks messages as read on fetch
        window.dispatchEvent(new CustomEvent("refresh-dashboard-counts"))
      }
    } catch (err) {
      console.error("Fetch messages error:", err)
    }
  }

  const handleViewContract = async (contractId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      if (response.ok) {
        const data = await response.json()
        const contract: Contract = {
          id: data._id,
          requestId: data.request?._id || data.request,
          propertyId: data.property?._id || data.property,
          propertyImage: data.property?.images?.cover || "",
          propertyTitle: data.property?.title || "...",
          ownerName: data.owner?.fullName || "...",
          ownerEmail: data.owner?.email || "...",
          ownerPhone: data.owner?.phone || "...",
          tenantName: data.tenant?.fullName || "...",
          tenantEmail: data.tenant?.email || "...",
          tenantPhone: data.tenant?.phone || "...",
          propertyRent: data.rentAmount,
          propertyDeposit: data.depositAmount,
          propertySurface: data.property?.surface || 0,
          propertyAddress: data.property?.address || "...",
          propertyType: data.property?.type || "Appartement",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          duration: data.request?.duration || "12 mois",
          status: data.status,
          ownerSignature: data.ownerSignature,
          tenantSignature: data.tenantSignature,
          createdAt: data.createdAt
        }
        setContractToView(contract)
      }
    } catch (err) {
      console.error("View contract error:", err)
    }
  }

  const handleViewContractByRequest = async (requestId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/request/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      if (response.ok) {
        const data = await response.json()
        const contract: Contract = {
          id: data._id,
          requestId: data.request?._id || data.request,
          propertyId: data.property?._id || data.property,
          propertyImage: data.property?.images?.cover || "",
          propertyTitle: data.property?.title || "...",
          ownerName: data.owner?.fullName || "...",
          ownerEmail: data.owner?.email || "...",
          ownerPhone: data.owner?.phone || "...",
          tenantName: data.tenant?.fullName || "...",
          tenantEmail: data.tenant?.email || "...",
          tenantPhone: data.tenant?.phone || "...",
          propertyRent: data.rentAmount,
          propertyDeposit: data.depositAmount,
          propertySurface: data.property?.surface || 0,
          propertyAddress: data.property?.address || "...",
          propertyType: data.property?.type || "Appartement",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          duration: data.request?.duration || "12 mois",
          status: data.status,
          ownerSignature: data.ownerSignature,
          tenantSignature: data.tenantSignature,
          createdAt: data.createdAt
        }
        setContractToView(contract)
      }
    } catch (err) {
      console.error("View contract by request error:", err)
    }
  }

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
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      if (response.ok) {
        const updated = await response.json()
        setContractToView(prev => prev ? { ...prev, tenantSignature: signature, status: updated.status } : null)
        alert(lang === "fr" ? "Contrat signé avec succès !" : "Contract signed successfully!")
      }
    } catch (err) {
      console.error("Sign contract error:", err)
    }
  }

  const handleTenantSendBack = async (message: string) => {
    if (!contractToView) return
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/contracts/${contractToView.id}/send-back`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ message })
      })
      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (response.ok) {
        const updated = await response.json()
        setContractToView(prev => prev ? { ...prev, status: updated.status || "SignedByTenant" } : null)
        alert(lang === "fr" ? "Contrat renvoyé au locateur." : "Contract sent back to owner.")
      }
    } catch (err) {
      console.error("Send back contract error:", err)
    }
  }

  useEffect(() => {
    if (sessionExpired) return
    fetchConversations()
    const interval = setInterval(fetchConversations, 10000)
    return () => clearInterval(interval)
  }, [sessionExpired])

  useEffect(() => {
    if (sessionExpired) return
    if (activeConversationId) {
      fetchMessages(activeConversationId)
      const interval = setInterval(() => fetchMessages(activeConversationId), 5000)
      return () => clearInterval(interval)
    }
  }, [activeConversationId, sessionExpired])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeConversationId])

  const filteredConversations = useMemo(() => {
    return conversations
      .filter(c => activeCategory === "Tous" || (c.category as string) === activeCategory)
      .filter(c => {
        const otherParticipant = c.participants.find(p => String(p.id) !== currentUserId)
        const searchTarget = `${otherParticipant?.name || ""} ${c.contextTitle || ""}`.toLowerCase()
        return searchTarget.includes(searchQuery.toLowerCase())
      })
      .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
  }, [conversations, activeCategory, searchQuery, user])

  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const otherParticipant = activeConversation?.participants.find(p => String(p.id) !== currentUserId)
  
  const activeMessages = useMemo(() => {
    return messages
      .filter(m => m.conversationId === activeConversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [messages, activeConversationId])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId || isLoading || sessionExpired) return
    setIsLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: activeConversationId,
          content: newMessage.trim()
        })
      })
      if (response.status === 401) {
        handleUnauthorized()
        return
      }
      if (response.ok) {
        setNewMessage("")
        fetchMessages(activeConversationId)
      }
    } catch (err) {
      console.error("Send message error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getUnreadCount = (convId: string) => {
    return messages.filter(m => m.conversationId === convId && String(m.senderId) !== currentUserId && !m.isRead).length
  }

  const getTotalUnreadCount = () => {
    return messages.filter(m => String(m.senderId) !== currentUserId && !m.isRead).length
  }

  const getIconForCategory = (cat: string) => {
    const config = messageCategoryConfig[cat as MessageCategory] || messageCategoryConfig["Tous"]
    const Icon = {
      Inbox,
      FileText,
      FileSignature,
      Wrench,
      ShieldAlert,
    }[config.icon] || MessageSquare
    return Icon
  }

  if (sessionExpired) {
    return (
      <Card className="rounded-3xl border border-orange-200 bg-orange-50/60 shadow-sm">
        <CardContent className="flex min-h-[360px] flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-orange-500 shadow-sm">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">
              {lang === "fr" ? "Session expiree" : "Session expired"}
            </h3>
            <p className="max-w-md text-sm text-slate-600">
              {lang === "fr"
                ? "Votre session a expire. Veuillez vous reconnecter pour acceder a vos messages."
                : "Your session expired. Please sign in again to access your messages."}
            </p>
          </div>
          <Button asChild>
            <Link href="/login">
              {lang === "fr" ? "Se reconnecter" : "Sign in again"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {contractToView && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative">
              <ContractView 
                contract={contractToView}
                onBack={() => setContractToView(null)}
                onOwnerSign={() => {}} // Owner signatures are handled in RentalRequestsModule
                onTenantSign={handleTenantSign}
                onSendToTenant={handleTenantSendBack}
                userRole={user?.role as any}
              />
           </div>
        </div>
      )}
      <div className="flex h-[calc(100vh-140px)] bg-white rounded-3xl border border-border/10 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      {/* Sidebar - Messenger Style */}
      <div className="w-80 lg:w-96 border-r border-border/10 flex flex-col bg-white">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#050505] tracking-tight">Chats</h2>
            <div className="flex gap-2">
               <button className="p-2 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors">
                 <MoreVertical className="w-5 h-5 text-[#050505]" />
               </button>
               <button className="p-2 rounded-full bg-[#F0F2F5] hover:bg-[#E4E6EB] transition-colors">
                 <FileSignature className="w-5 h-5 text-[#050505]" />
               </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={lang === "fr" ? "Rechercher dans Messenger" : "Search Messenger"}
              className="pl-9 bg-[#F0F2F5] border-0 rounded-full h-10 placeholder:text-muted-foreground/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories as Pills */}
        <div className="px-6 pb-2">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-3">
              {(Object.keys(messageCategoryConfig) as MessageCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    activeCategory === cat 
                      ? "bg-[#0084FF]/10 text-[#0084FF]" 
                      : "text-muted-foreground hover:bg-[#F0F2F5]"
                  )}
                >
                  {lang === "fr" ? messageCategoryConfig[cat].label_fr : messageCategoryConfig[cat].label_en}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="px-3 pb-4 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center opacity-30">
                <p className="text-sm font-bold">{lang === "fr" ? "Aucun chat" : "No chats"}</p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const other = conv.participants.find(p => String(p.id) !== currentUserId)
                const isActive = activeConversationId === conv.id
                const unread = getUnreadCount(conv.id)

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={cn(
                      "w-full p-3 rounded-xl flex items-center gap-3 transition-colors relative group",
                      isActive ? "bg-[#0084FF]/5" : "hover:bg-[#F0F2F5]"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary/10 to-primary/30 flex items-center justify-center border border-border/10 shadow-sm">
                        <span className="text-primary font-black text-xl">{other?.name.charAt(0)}</span>
                      </div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm" />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h4 className={cn("font-bold truncate text-[15px] tracking-tight", unread > 0 ? "text-[#050505] font-black" : "text-[#050505]/80")}>
                          {other?.name}
                        </h4>
                        <span className="text-[11px] text-muted-foreground" suppressHydrationWarning>
                          {new Date(conv.lastUpdatedAt).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-[13px] truncate", unread > 0 ? "text-[#050505] font-bold" : "text-muted-foreground")}>
                          {conv.contextTitle}
                        </p>
                        {unread > 0 && (
                          <div className="w-2.5 h-2.5 bg-[#0084FF] rounded-full flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Primary Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {!activeConversationId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-20 h-20 bg-[#F0F2F5] rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-primary opacity-20" />
            </div>
            <h3 className="text-xl font-black text-[#050505]">{lang === "fr" ? "Sélectionnez un chat" : "Select a Chat"}</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-[240px]">
              {lang === "fr" ? "Envoyez des messages, des photos et des emojis à vos contacts." : "Send messages, photos, and emojis to your contacts."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/10 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0084FF] to-[#00C6FF] flex items-center justify-center text-white font-black shadow-lg">
                  {otherParticipant?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-[#050505] leading-none">{otherParticipant?.name}</h3>
                  <span className="text-[11px] text-green-500 font-bold mt-1 inline-block">Online</span>
                </div>
              </div>
              <div className="flex gap-1">
                 <Button variant="ghost" size="icon" className="text-[#0084FF] hover:bg-[#F0F2F5] rounded-full"><Phone className="w-5 h-5" /></Button>
                 <Button variant="ghost" size="icon" className="text-[#0084FF] hover:bg-[#F0F2F5] rounded-full"><Video className="w-5 h-5" /></Button>
                 <Button variant="ghost" size="icon" className="text-[#0084FF] hover:bg-[#F0F2F5] rounded-full"><Info className="w-5 h-5" /></Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-white">
              <div className="flex flex-col gap-0.5 max-w-4xl mx-auto pb-6">
                {activeMessages.map((msg, idx) => {
                  const isMe = String(msg.senderId || "") === currentUserId || String(msg.senderRole || "").toLowerCase() === String(user?.role || "").toLowerCase()
                  const prevMsg = idx > 0 ? activeMessages[idx - 1] : null
                  const nextMsg = idx < activeMessages.length - 1 ? activeMessages[idx + 1] : null
                  
                  const isFirstInGroup = !prevMsg || prevMsg.senderId !== msg.senderId
                  const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId
                  
                  const contractId = (msg as any).metadata?.contractId
                  const requestId = (msg as any).metadata?.requestId
                  
                  return (
                    <div 
                      key={msg.id} 
                      className={cn(
                        "flex w-full mb-4",
                        isMe ? "justify-end pr-4" : "justify-start pl-4"
                      )}
                    >
                      <div className={cn(
                        "flex items-end gap-2 max-w-[85%] sm:max-w-[70%]",
                        isMe ? "flex-row-reverse" : "flex-row"
                      )}>
                        <div className="w-7 h-7 flex-shrink-0">
                          {!isMe && isLastInGroup && (
                            <div className="w-7 h-7 rounded-full bg-[#E4E6EB] flex items-center justify-center text-[10px] font-bold text-[#050505]/60 overflow-hidden">
                              {otherParticipant?.name.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                          {!isMe && isFirstInGroup && (
                            <span className="text-[11px] text-muted-foreground/60 ml-1 mb-1 font-bold">
                              {otherParticipant?.name}
                            </span>
                          )}
                          <div className={cn(
                            "px-4 py-2 text-[15px] transition-all group relative",
                            isMe 
                              ? "bg-gradient-to-br from-[#0084FF] to-[#00C6FF] text-white shadow-sm" 
                              : "bg-[#E4E6EB] text-[#050505]",
                            isMe 
                              ? (isFirstInGroup && isLastInGroup ? "rounded-[18px]" :
                                 isFirstInGroup ? "rounded-[18px] rounded-br-[4px]" :
                                 isLastInGroup ? "rounded-[18px] rounded-tr-[4px]" :
                                 "rounded-[18px] rounded-tr-[4px] rounded-br-[4px]")
                              : (isFirstInGroup && isLastInGroup ? "rounded-[18px]" :
                                 isFirstInGroup ? "rounded-[18px] rounded-bl-[4px]" :
                                 isLastInGroup ? "rounded-[18px] rounded-tl-[4px]" :
                                 "rounded-[18px] rounded-tl-[4px] rounded-bl-[4px]")
                          )}>
                            <p className="leading-snug break-words whitespace-pre-wrap">{msg.content}</p>
                            
                            {/* Contract Action Button */}
                            {(contractId || requestId) && (
                                <div className="mt-4 pt-3 border-t border-white/20">
                                    <Button 
                                        onClick={() => {
                                          if (contractId) {
                                            handleViewContract(contractId)
                                            return
                                          }
                                          if (requestId) {
                                            handleViewContractByRequest(requestId)
                                          }
                                        }}
                                        variant="outline" 
                                        size="sm"
                                        className={cn(
                                            "w-full gap-2 font-bold shadow-md",
                                            isMe 
                                                ? "bg-white/10 border-white/20 text-white hover:bg-white/20" 
                                                : "bg-[#0084FF] border-transparent text-white hover:bg-[#0073e6]"
                                        )}
                                    >
                                        <FileSignature className="w-4 h-4" />
                                        {lang === "fr" ? "Consulter le Contrat" : "View Contract"}
                                        <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                                    </Button>
                                    <p className={cn(
                                        "text-[10px] mt-2 font-medium opacity-70",
                                        isMe ? "text-white/80" : "text-slate-500"
                                    )}>
                                        {lang === "fr" ? "Cliquez pour signer ou imprimer" : "Click to sign or print"}
                                    </p>
                                </div>
                            )}

                            <div className={cn(
                              "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg z-50 pointer-events-none whitespace-nowrap",
                              isMe ? "-left-16" : "-right-16"
                            )}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 bg-white">
              <div className="max-w-4xl mx-auto flex items-end gap-2">
                 <div className="flex gap-2 mb-2 opacity-50">
                    <PlusCircle className="w-5 h-5 text-[#0084FF] cursor-pointer" />
                    <ImageIcon className="w-5 h-5 text-[#0084FF] cursor-pointer" />
                    <Smile className="w-5 h-5 text-[#0084FF] cursor-pointer" />
                 </div>
                 <div className="flex-1 bg-[#F0F2F5] rounded-3xl px-4 py-2 flex items-end gap-2 border border-transparent focus-within:border-primary/10 transition-all">
                    <Textarea 
                      placeholder="Aa"
                      className="bg-transparent border-0 focus-visible:ring-0 resize-none min-h-[36px] max-h-32 py-1.5 px-0 text-[15px]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                 </div>
                 <button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  className={cn(
                    "mb-1 h-9 w-9 flex items-center justify-center rounded-full transition-all",
                    newMessage.trim() ? "bg-[#0084FF] text-white shadow-lg" : "text-[#0084FF] opacity-50"
                  )}
                 >
                   {newMessage.trim() ? <Send className="w-5 h-5 fill-current" /> : <ThumbsUp className="w-6 h-6 fill-current" />}
                 </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  )
}
