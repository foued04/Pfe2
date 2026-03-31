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
  Mail
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
      <div className="w-full md:w-96 flex-shrink-0 border-r border-border/50 flex flex-col bg-card/30">
        
        {/* Header & Search */}
        <div className="p-4 space-y-4 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              {lang === "fr" ? "Messagerie" : "Messages"}
              {getTotalUnreadCount() > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs ml-2 rounded-full h-5 px-1.5 border-none">
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
        <div className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-border/50 hide-scrollbar bg-background/30">
          {(Object.keys(messageCategoryConfig) as MessageCategory[]).map(cat => {
            const config = messageCategoryConfig[cat]
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border",
                  isActive 
                    ? `bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20` 
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
                      "w-full text-left p-3 rounded-xl transition-all border",
                      isActive 
                        ? "bg-primary/5 border-primary/20 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border/50"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                        <span className="truncate max-w-[150px]">{other?.name}</span>
                        {unreadCount > 0 && (
                          <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
                        )}
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold whitespace-nowrap",
                        unreadCount > 0 ? "text-primary" : "text-muted-foreground"
                      )}>
                        {formatDate(conv.lastUpdatedAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Badge variant="outline" className={cn(
                        "text-[9px] px-1.5 py-0 h-4 font-bold border-transparent",
                        config.bgColor, config.color
                      )}>
                        {lang === "fr" ? config.label_fr : config.label_en}
                      </Badge>
                      {other?.role === "Admin" && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-bold text-violet-700 bg-violet-50 border-violet-200">
                          Support
                        </Badge>
                      )}
                    </div>

                    <p className={cn(
                      "text-xs truncate",
                      unreadCount > 0 ? "text-foreground font-semibold" : "text-muted-foreground"
                    )}>
                      {lastMessage?.senderId === mockCurrentUser.id && <span className="mr-1">Vous:</span>}
                      {lastMessage?.content || "..."}
                    </p>
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
          <div className="m-auto flex flex-col items-center justify-center text-center p-8 max-w-sm">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-black text-foreground mb-2">
              {lang === "fr" ? "Vos messages" : "Your messages"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {lang === "fr" 
                ? "Sélectionnez une conversation à gauche pour afficher les échanges ou gérer les demandes locatives et de maintenance."
                : "Select a conversation on the left to view messages or manage rental requests and maintenance."}
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-20 px-6 border-b border-border/50 bg-background/50 backdrop-blur-md flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-black text-lg">
                    {otherParticipant?.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    {otherParticipant?.name}
                    {otherParticipant?.role === "Admin" && (
                      <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[10px] h-5 px-1.5">Support ImmoSmart</Badge>
                    )}
                  </h3>
                  {activeConversation.contextTitle && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5 font-medium">
                      {getIconForCategory(activeConversation.category)}
                      <span className="truncate max-w-[300px]">{activeConversation.contextTitle}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Scroll Area */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6 max-w-3xl mx-auto">
                {activeMessages.map((msg, idx) => {
                  const isMe = msg.senderId === mockCurrentUser.id
                  const showAvatar = !isMe && (idx === 0 || activeMessages[idx - 1].senderId !== msg.senderId)

                  return (
                    <div key={msg.id} className={cn(
                      "flex gap-3",
                      isMe ? "justify-end" : "justify-start"
                    )}>
                      {/* Avatar placeholder for them */}
                      {!isMe ? (
                        <div className="w-8 flex-shrink-0 flex items-end">
                          {showAvatar && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-bold text-muted-foreground">
                                {otherParticipant?.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {/* Bubble */}
                      <div className={cn(
                        "flex flex-col gap-1 max-w-[80%] md:max-w-[70%]",
                        isMe ? "items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "px-5 py-3 rounded-2xl text-sm leading-relaxed",
                          isMe 
                            ? "bg-primary text-primary-foreground rounded-br-sm shadow-sm"
                            : "bg-card border border-border/50 text-foreground rounded-bl-sm shadow-sm"
                        )}>
                          {msg.content}
                        </div>
                        <div className={cn("flex items-center gap-2 px-1", isMe ? "flex-row-reverse" : "flex-row")}>
                          <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                            {msg.source === "email" ? <Mail className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                            {msg.source === "email" ? (lang === "fr" ? "Email" : "Email") : (lang === "fr" ? "Plateforme" : "Platform")}
                            <span className="opacity-50">•</span>
                            {formatTime(msg.timestamp)}
                          </span>
                          {isMe && (
                            msg.isRead 
                              ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                              : <Check className="w-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input Box */}
            <div className="p-4 bg-background border-t border-border/50 flex-shrink-0">
              <div className="max-w-3xl mx-auto flex flex-col gap-2">
                <div className="relative rounded-2xl bg-muted/30 border border-border/50 focus-within:border-primary focus-within:bg-background transition-all shadow-sm">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={lang === "fr" ? "Écrivez une trace ou un message..." : "Type a trace or message..."}
                    className="min-h-[60px] max-h-[200px] w-full resize-none border-0 bg-transparent py-4 pl-4 pr-16 text-sm focus-visible:ring-0 whitespace-pre-wrap"
                  />
                  <Button
                    size="icon"
                    className={cn(
                      "absolute right-2 bottom-2 h-10 w-10 rounded-xl transition-all",
                      newMessage.trim() ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" : "bg-muted text-muted-foreground scale-95 opacity-50"
                    )}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="w-4 h-4 ml-0.5" />
                  </Button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                  <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                    <input 
                      type="checkbox" 
                      className="rounded border-muted-foreground/30 text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                      checked={sendViaEmail}
                      onChange={(e) => setSendViaEmail(e.target.checked)}
                    />
                    <Mail className="w-4 h-4" />
                    {lang === "fr" ? "Marquer comme envoyé par email (trace uniquement)" : "Mark as sent via email (trace only)"}
                  </label>
                  <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">
                    {lang === "fr" ? "Dossier lié : " : "Linked context: "} {activeConversation.contextTitle || "Général"}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  )
}
