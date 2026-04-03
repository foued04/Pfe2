"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useI18n } from "@/lib/i18n"
import {
  MessageCategory,
  Conversation,
  Message,
  mockConversations,
  mockMessages,
  mockCurrentUser,
  messageCategoryConfig,
} from "@/lib/messages-data"
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
  Bell
} from "lucide-react"

export function MessagesModule() {
  const { lang } = useI18n()
  
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [activeCategory, setActiveCategory] = useState<MessageCategory>("Tous")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [sendViaEmail, setSendViaEmail] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, activeConversationId])

  // Mark conversation as read when opened
  useEffect(() => {
    if (activeConversationId) {
      setMessages(prev => prev.map(m => 
        (m.conversationId === activeConversationId && m.senderId !== mockCurrentUser.id && !m.isRead)
        ? { ...m, isRead: true }
        : m
      ))
    }
  }, [activeConversationId])

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    return conversations
      .filter(c => activeCategory === "Tous" || c.category === activeCategory)
      .filter(c => {
        const otherParticipant = c.participants.find(p => p.id !== mockCurrentUser.id)
        const searchTarget = `${otherParticipant?.name} ${c.contextTitle}`.toLowerCase()
        return searchTarget.includes(searchQuery.toLowerCase())
      })
      .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
  }, [conversations, activeCategory, searchQuery])

  // Active conversation data
  const activeConversation = conversations.find(c => c.id === activeConversationId)
  const otherParticipant = activeConversation?.participants.find(p => p.id !== mockCurrentUser.id)
  
  const activeMessages = useMemo(() => {
    return messages
      .filter(m => m.conversationId === activeConversationId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }, [messages, activeConversationId])

  // Handlers
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversationId) return

    const newMsg: Message = {
      id: "msg-" + Date.now().toString(),
      conversationId: activeConversationId,
      senderId: mockCurrentUser.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
      source: sendViaEmail ? "email" : "platform"
    }

    setMessages(prev => [...prev, newMsg])
    setNewMessage("")

    // Update conversation last activity
    setConversations(prev => prev.map(c => 
      c.id === activeConversationId 
        ? { ...c, lastUpdatedAt: newMsg.timestamp }
        : c
    ))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getUnreadCount = (convId: string) => {
    return messages.filter(m => m.conversationId === convId && m.senderId !== mockCurrentUser.id && !m.isRead).length
  }

  const getTotalUnreadCount = () => {
    return messages.filter(m => m.senderId !== mockCurrentUser.id && !m.isRead).length
  }

  const getIconForCategory = (cat: string) => {
    switch(cat) {
      case "Demandes": return <FileText className="w-4 h-4" />
      case "Contrats": return <FileSignature className="w-4 h-4" />
      case "Maintenance": return <Wrench className="w-4 h-4" />
      case "Admin": return <ShieldAlert className="w-4 h-4" />
      default: return <Inbox className="w-4 h-4" />
    }
  }

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    return d.toLocaleTimeString(lang === "fr" ? "fr-FR" : "en-US", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (ts: string) => {
    const d = new Date(ts)
    if (new Date().toDateString() === d.toDateString()) {
      return formatTime(ts)
    }
    return d.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { day: "2-digit", month: "short" })
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden bg-background">
      
      {/* ─── SIDEBAR (Liste des conversations) ─────────────────────────── */}
      <div className="w-full md:w-[400px] flex-shrink-0 border-r border-border/50 flex flex-col bg-muted/5">
        
        {/* Header & Search */}
        <div className="p-6 space-y-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-foreground flex items-center gap-3 tracking-tighter">
              <Bell className="w-8 h-8 text-[#158C96]" />
              {lang === "fr" ? "Notifications" : "Notifications"}
              {getTotalUnreadCount() > 0 && (
                <Badge className="bg-[#158C96] text-white text-[10px] ml-2 rounded-full h-5 px-1.5 border-none font-black flex items-center justify-center">
                  {getTotalUnreadCount()}
                </Badge>
              )}
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={lang === "fr" ? "Rechercher un message..." : "Search messages..."} 
              className="pl-9 bg-muted/50 border-transparent focus:border-primary focus:bg-background transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 py-3 flex gap-2 overflow-x-auto border-b border-border/50 scrollbar-hide bg-background/30">
          {(Object.keys(messageCategoryConfig) as MessageCategory[]).map(cat => {
            const config = messageCategoryConfig[cat]
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-5 py-2 rounded-full text-[11px] uppercase font-black whitespace-nowrap transition-all border tracking-widest",
                  isActive 
                    ? `bg-[#158C96] text-white border-[#158C96] shadow-lg shadow-[#158C96]/20` 
                    : `bg-card text-muted-foreground border-border/50 hover:bg-muted/50 hover:text-foreground`
                )}
              >
                {lang === "fr" ? config.label_fr : config.label_en}
              </button>
            )
          })}
        </div>

        {/* Conversations List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">{lang === "fr" ? "Aucune conversation" : "No conversations"}</p>
              </div>
            ) : (
              filteredConversations.map(conv => {
                const other = conv.participants.find(p => p.id !== mockCurrentUser.id)
                const lastMessage = messages.filter(m => m.conversationId === conv.id).pop()
                const isActive = activeConversationId === conv.id
                const unreadCount = getUnreadCount(conv.id)
                const config = messageCategoryConfig[conv.category]

                return (
                  <button
                    key={conv.id}
                    onClick={() => setActiveConversationId(conv.id)}
                    className={cn(
                      "w-full text-left p-6 rounded-2xl transition-all duration-300 border mb-3",
                      isActive 
                        ? "bg-white border-primary/20 shadow-xl shadow-primary/5 ring-1 ring-primary/5" 
                        : "bg-transparent border-transparent hover:bg-white/50 hover:border-border/30"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={cn(
                        "text-[9px] px-2 py-0.5 h-4 font-black uppercase tracking-widest border-transparent",
                        config.bgColor, config.color
                      )}>
                        {lang === "fr" ? config.label_fr : config.label_en}
                      </Badge>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest opacity-60",
                        unreadCount > 0 ? "text-primary opacity-100" : "text-muted-foreground"
                      )}>
                        {formatDate(conv.lastUpdatedAt)}
                      </span>
                    </div>

                    <h3 className={cn(
                      "text-[15px] font-black text-foreground tracking-tight mb-1 line-clamp-1",
                      unreadCount > 0 ? "opacity-100" : "opacity-80"
                    )}>
                      {conv.contextTitle || other?.name}
                    </h3>

                    <p className={cn(
                      "text-xs line-clamp-2 leading-relaxed mb-3",
                      unreadCount > 0 ? "text-foreground/80 font-bold" : "text-muted-foreground font-medium"
                    )}>
                      {lastMessage?.content || "..."}
                    </p>

                    {unreadCount > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#FF4747] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-[#FF4747] uppercase tracking-tighter">Nouveau</span>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* ─── MAIN AREA (Conversation active) ───────────────────────────── */}
      <div className="hidden md:flex flex-col flex-1 bg-card/10">
        {!activeConversation ? (
          <div className="m-auto flex flex-col items-center justify-center text-center p-8 max-w-sm animate-in fade-in zoom-in duration-700">
            <div className="h-24 w-24 bg-primary/5 rounded-full flex items-center justify-center mb-8 shadow-inner">
              <Mail className="h-10 w-10 text-[#158C96] opacity-20" />
            </div>
            <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">
              {lang === "fr" ? "Vos messages" : "Your messages"}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
              {lang === "fr" 
                ? "Sélectionnez une conversation à gauche pour gérer vos échanges, contrats et demandes techniques en toute simplicité."
                : "Select a conversation on the left to manage your exchanges, contracts and technical requests with ease."}
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header (Clean style from image) */}
            <div className="h-20 px-8 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-6">
                <Badge className={cn("px-4 py-1 text-[10px] uppercase font-black border-transparent tracking-[0.2em] shadow-sm", messageCategoryConfig[activeConversation.category].color, messageCategoryConfig[activeConversation.category].bgColor)}>
                  {lang === "fr" ? messageCategoryConfig[activeConversation.category].label_fr : messageCategoryConfig[activeConversation.category].label_en}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[11px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                   <Clock className="w-4 h-4" />
                   {formatDate(activeConversation.lastUpdatedAt)}
                </div>
                <Badge variant="outline" className="bg-[#E9F7F8] text-[#158C96] border-[#158C96]/20 text-[11px] font-black px-3 py-1 lowercase first-letter:uppercase tracking-normal rounded-full">
                  {lang === "fr" ? "Vue par le locataire" : "Viewed by tenant"}
                </Badge>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 rounded-2xl ml-2">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <ScrollArea className="flex-1 p-12 bg-background">
              <div className="max-w-5xl mx-auto mb-16 animate-in fade-in slide-in-from-right-4 duration-700">
                <h1 className="text-6xl font-black text-foreground tracking-tighter mb-8 leading-tight">
                  {activeConversation.contextTitle || (lang === "fr" ? "Discussion libre" : "Open discussion")}
                </h1>
                
                <div className="flex items-center gap-4 mb-16">
                  <div className="h-14 w-14 rounded-full bg-[#D1F2F4] flex items-center justify-center text-[#158C96] font-black text-2xl shadow-sm ring-4 ring-background">
                    {otherParticipant?.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground">{otherParticipant?.name}</p>
                    <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">{otherParticipant?.role === 'Tenant' ? (lang === 'fr' ? 'Locataire' : 'Tenant') : otherParticipant?.role}</p>
                  </div>
                </div>

                {/* Timeline Styles / Info Blocks Start Here */}
                <div className="space-y-12">
                  <div className="bg-[#F8FAFB] p-10 rounded-[2.5rem] border border-border/30 relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-6 text-[11px] font-black text-[#158C96] uppercase tracking-[0.3em]">
                      <Inbox className="w-5 h-5" />
                      DÉTAILS DE LA DEMANDE
                    </div>
                    <p className="text-2xl text-foreground font-serif italic leading-relaxed opacity-90">
                      "{lang === "fr" ? "Bonjour; j'ai une fuite au niveau de l'évier de la cuisine depuis ce matin. J'ai coupé l'eau en attendant." : "Details of the request from the image..."}"
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-16 max-w-5xl mx-auto pb-24 relative px-4">
                {/* Timeline connector (vertical line) */}
                <div className="absolute left-11 -top-12 bottom-32 w-[2px] bg-[#D1F2F4] hidden md:block" />
                
                {activeMessages.map((msg, idx) => {
                  const isMe = msg.senderId === mockCurrentUser.id
                  const showHeader = idx === 0 || activeMessages[idx - 1].senderId !== msg.senderId
                  
                  return (
                    <div key={msg.id} className="relative pl-0 md:pl-24 animate-in fade-in slide-in-from-bottom-6 duration-600">
                      {/* Timeline Node (Image style: turquoise circle with check) */}
                      {showHeader && (
                        <div className={cn(
                          "absolute left-4 top-0 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ring-8 ring-background z-10 hidden md:flex transition-transform hover:scale-110",
                          isMe ? "bg-[#158C96] text-white" : "bg-white border-2 border-[#158C96] text-[#158C96]"
                        )}>
                          {isMe ? <Check className="w-8 h-8" /> : <Mail className="w-7 h-7" />}
                        </div>
                      )}

                      <div className={cn(
                        "p-10 rounded-[2.5rem] border transition-all duration-300",
                        isMe 
                          ? "bg-[#D1F2F4]/30 border-[#158C96]/10 shadow-sm" 
                          : "bg-white border-border/50 shadow-sm"
                      )}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <p className={cn(
                              "text-[11px] font-black uppercase tracking-[0.3em] mb-2",
                              isMe ? "text-[#158C96]" : "text-violet-600"
                            )}>
                              {isMe ? (lang === "fr" ? "LOCATEUR" : "OWNER") : (lang === "fr" ? "LOCATAIRE" : "TENANT")}
                            </p>
                            <h4 className="text-3xl font-black text-foreground tracking-tight">
                              {isMe ? (lang === "fr" ? "Réponse Envoyée" : "Response Sent") : (lang === "fr" ? "Message Reçu" : "Message Received")}
                            </h4>
                          </div>
                        </div>

                        <p className="text-2xl text-foreground font-medium leading-relaxed opacity-90">
                          {msg.content}
                        </p>

                        <div className="mt-10 flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">
                          <span className="flex items-center gap-2">
                             {msg.source === "email" ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                             par {msg.source}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input Box */}
            <div className="p-6 bg-background border-t border-border/50 flex-shrink-0">
              <div className="max-w-4xl mx-auto flex flex-col gap-4">
                <div className="relative rounded-[2rem] bg-muted/30 border-2 border-transparent focus-within:border-[#158C96]/20 focus-within:bg-background transition-all shadow-lg overflow-hidden">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={lang === "fr" ? "Écrivez votre message ici..." : "Type your message here..."}
                    className="min-h-[80px] max-h-[250px] w-full resize-none border-0 bg-transparent py-5 pl-6 pr-20 text-base focus-visible:ring-0 whitespace-pre-wrap font-medium"
                  />
                  <div className="absolute right-3 bottom-3">
                    <Button
                      size="icon"
                      className={cn(
                        "h-12 w-12 rounded-2xl transition-all duration-300",
                        newMessage.trim() 
                          ? "bg-[#158C96] text-white shadow-xl shadow-[#158C96]/30 scale-100 rotate-0" 
                          : "bg-muted text-muted-foreground scale-90 opacity-50 -rotate-12"
                      )}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                    >
                      <Send className="w-5 h-5 ml-0.5" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2">
                  <label className="flex items-center gap-3 text-xs font-black text-muted-foreground cursor-pointer hover:text-[#158C96] transition-colors select-none uppercase tracking-widest">
                    <div className={cn(
                      "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                      sendViaEmail ? "bg-[#158C96] border-[#158C96] text-white" : "border-muted-foreground/30 text-transparent"
                    )}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={sendViaEmail}
                      onChange={(e) => setSendViaEmail(e.target.checked)}
                    />
                    <Mail className="w-4 h-4" />
                    {lang === "fr" ? "Marquer comme envoyé par email (trace uniquement)" : "Mark as sent via email (trace only)"}
                  </label>
                  <Badge variant="outline" className="px-3 py-1 rounded-full border-[#158C96]/10 bg-[#158C96]/5 text-[#158C96] text-[10px] font-black uppercase tracking-tighter self-start sm:self-auto">
                    {lang === "fr" ? "Dossier : " : "Task: "} {activeConversation?.contextTitle || "Général"}
                  </Badge>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
