"use client"

import { useState, useEffect, useRef } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import { cn } from "@/lib/utils"
import { Send, MessageSquare, Phone, Video, PlusCircle, Image as ImageIcon, Smile, ThumbsUp } from "lucide-react"

interface ChatModuleProps {
  contextId: string
  contextTitle: string
  recipientId: string
  category: "Demandes" | "Contrats" | "Maintenance"
}

export function ChatModule({ contextId, contextTitle, recipientId, category }: ChatModuleProps) {
  const { lang } = useI18n()
  const { user } = useAuth()
  const currentUserId = String(user?.id || "")
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const fetchChat = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/messages/context/${contextId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        if (data && data.conversation) {
          setMessages(data.messages || [])
          setConversationId(data.conversation._id)
        } else {
          setMessages([])
          setConversationId(null)
        }
      }
    } catch (err) {
      console.error("Fetch chat error:", err)
    }
  }

  useEffect(() => {
    fetchChat()
    const interval = setInterval(fetchChat, 5000) // Poll every 5s
    return () => clearInterval(interval)
  }, [contextId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return
    setIsLoading(true)
    setSendError(null)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId,
          content: newMessage,
          category,
          contextId,
          contextTitle,
          recipientId
        })
      })
      if (response.ok) {
        setNewMessage("")
        await fetchChat()
      } else {
        const err = await response.json().catch(() => null)
        setSendError(err?.message || (lang === "fr" ? "Message non envoye." : "Message not sent."))
      }
    } catch (err) {
      console.error("Send message error:", err)
      setSendError(lang === "fr" ? "Erreur de connexion." : "Connection error.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-2xl flex flex-col h-[400px]">
      <div className="flex items-center justify-between p-4 border-b border-border/40 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black shadow-inner">
             {messages.find(m => String(m.sender?._id || m.sender) !== currentUserId)?.sender?.fullName?.charAt(0) || "?"}
          </div>
          <div>
            <h3 className="font-black text-sm text-[#050505]">
              {messages.find(m => String(m.sender?._id || m.sender) !== currentUserId)?.sender?.fullName || (lang === "fr" ? "Discussion" : "Chat")}
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest leading-none">
                {lang === "fr" ? "Actif maintenant" : "Active now"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shadow-none">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary shadow-none">
            <Video className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 bg-white">
        <div className="flex flex-col gap-1 w-full pb-8">
          {messages.length === 0 && (
            <div className="text-center py-20 text-muted-foreground italic text-sm font-bold">
              {lang === "fr" ? "Dites bonjour !" : "Say hello!"}
            </div>
          )}
          {messages.map((msg, idx) => {
            const senderId = String(msg.sender?._id || msg.sender || "")
            const senderRole = String(msg.sender?.role || "").toLowerCase()
            const currentUserRole = String(user?.role || "").toLowerCase()
            const isMe = senderId === currentUserId || (senderRole && senderRole === currentUserRole)
            
            const prevMsg = idx > 0 ? messages[idx - 1] : null
            const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null
            
            const prevSenderId = prevMsg ? (prevMsg.sender?._id || prevMsg.sender) : null
            const nextSenderId = nextMsg ? (nextMsg.sender?._id || nextMsg.sender) : null
            
            const isFirstInGroup = senderId !== prevSenderId
            const isLastInGroup = senderId !== nextSenderId
            
            return (
              <div key={msg._id} className={cn(
                "flex w-full mb-0.5 animate-in fade-in duration-300",
                isMe ? "justify-end pr-4" : "justify-start pl-4",
                isFirstInGroup && idx !== 0 ? "mt-4" : ""
              )}>
                <div className={cn(
                  "flex items-end gap-2 max-w-[85%] sm:max-w-[75%]",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}>
                  {/* Avatar for receiver (only show for last message in group) */}
                  <div className="w-7 h-7 flex-shrink-0">
                    {!isMe && isLastInGroup && (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shadow-sm">
                         {msg.sender?.fullName?.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className={cn(
                    "flex flex-col",
                    isMe ? "items-end" : "items-start"
                  )}>
                    {/* Compact Name Header for others */}
                    {!isMe && isFirstInGroup && (
                      <span className="text-[10px] text-muted-foreground/50 font-black ml-1 mb-1 uppercase tracking-widest leading-none">
                        {msg.sender?.fullName}
                      </span>
                    )}

                    <div className={cn(
                      "px-4 py-2 text-sm transition-all group relative",
                      isMe 
                        ? "bg-[#0084FF] text-white shadow-sm" 
                        : "bg-[#E4E6EB] text-[#050505]",
                      
                      // Precise Messenger Radii logic
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
                      
                      {/* Floating Timestamp on Hover */}
                      <div className={cn(
                        "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-[8px] font-black px-2 py-1 rounded shadow-lg z-40 pointer-events-none whitespace-nowrap",
                        isMe ? "-left-16" : "-right-16"
                      )} suppressHydrationWarning>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      <div className="p-4 bg-white/80 backdrop-blur-md border-t border-border/40">
        {sendError && (
          <p className="mb-2 text-xs font-bold text-destructive">{sendError}</p>
        )}
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex gap-2 mb-1.5 opacity-60">
            <PlusCircle className="h-5 w-5 text-primary cursor-pointer hover:opacity-100" />
            <ImageIcon className="h-5 w-5 text-primary cursor-pointer hover:opacity-100" />
            <Smile className="h-5 w-5 text-primary cursor-pointer hover:opacity-100" />
          </div>
          <div className="flex-1 relative">
            <Input 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={lang === "fr" ? "Aa" : "Aa"}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              className="rounded-full bg-[#F0F2F5] border-0 focus-visible:ring-primary/20 h-10 px-4 placeholder:text-muted-foreground/60"
            />
          </div>
          <button 
            onClick={handleSendMessage} 
            disabled={isLoading || !newMessage.trim()} 
            className={cn(
              "h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full transition-all active:scale-90",
              newMessage.trim() ? "bg-[#0084FF] text-white shadow-blue-500/30 shadow-lg" : "text-primary bg-transparent opacity-50"
            )}
          >
            {newMessage.trim() ? <Send className="h-5 w-5 fill-current" /> : <ThumbsUp className="h-6 w-6 fill-current" />}
          </button>
        </div>
      </div>
    </div>
  )
}
