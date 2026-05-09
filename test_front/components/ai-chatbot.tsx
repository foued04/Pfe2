"use client"

import { useState, useRef, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { resolveApiUrl } from "@/lib/api/client"
import { Bot, X, Send, Sparkles, Home, Search, ClipboardList, User, MessageSquare } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: string
  role: "user" | "model"
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  isOpen: boolean
  onClose: () => void
}

const suggestions = {
  tenant: [
    { icon: Search, text: "Trouver un S+2 à Tunis" },
    { icon: Home, text: "Propriétés avec parking" },
    { icon: ClipboardList, text: "Comment envoyer une demande?" },
  ],
  owner: [
    { icon: Home, text: "Comment ajouter une propriété?" },
    { icon: ClipboardList, text: "Voir mes demandes" },
    { icon: Search, text: "Conseils pour louer rapidement" },
  ],
  admin: [
    { icon: User, text: "Statistiques utilisateurs" },
    { icon: Home, text: "Propriétés en attente" },
    { icon: ClipboardList, text: "Rapports mensuels" },
  ],
  none: [
    { icon: Home, text: "C'est quoi ImmoSmart ?" },
    { icon: Search, text: "Quels types de biens proposez-vous ?" },
    { icon: User, text: "Comment créer un compte ?" },
  ]
}

export function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const { t } = useI18n()
  const { user, token } = useAuth()
  const userRole = user?.role || "none"
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize welcome message only on client to avoid hydration mismatch
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "model",
        content: t("chatbot.welcome"),
        timestamp: new Date(),
      },
    ])
  }, [t])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    try {
      // Prepare history for API
      const history = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }))

      const apiUrl = `${resolveApiUrl()}/chatbot/ask`

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: text,
          history: history
        })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) throw new Error(data?.message || data?.error || "Erreur serveur")

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "model",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Chatbot Error:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "model",
        content: `❌ Erreur : ${error.message}`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {

      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (text: string) => {
    handleSend(text)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-20 right-3 z-50 flex h-[min(36rem,calc(100vh-6.5rem))] w-[calc(100vw-1.5rem)] max-w-[380px] flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300 dark:bg-slate-900/80 sm:bottom-24 sm:right-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-500 to-blue-600 p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-400" />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight">{t("chatbot.title")}</h3>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[10px] uppercase font-bold text-white/80 tracking-widest text-xs">AI EXPERT</p>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/20 transition-all active:scale-95"
        >
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-700">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {message.role === "model" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Bot className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                message.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-teal-500 text-white rounded-tr-none"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p className={cn(
                "text-[9px] mt-1 opacity-60",
                message.role === "user" ? "text-right" : "text-left"
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 animate-in fade-in duration-300">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
              <Bot className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="rounded-2xl rounded-tl-none bg-white dark:bg-slate-800 px-4 py-3 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 5 && !isTyping && (
        <div className="p-4 pt-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            {t("chatbot.suggestions")}
          </p>
          <div className="flex flex-wrap gap-2">
            {(suggestions[userRole as keyof typeof suggestions] || suggestions.none).map((suggestion, index) => {
              const Icon = suggestion.icon
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-200 dark:hover:border-teal-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-teal-500" />
                  {suggestion.text}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 pt-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2 items-center bg-white dark:bg-slate-800 rounded-2xl p-1 shadow-inner border border-slate-100 dark:border-slate-700"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chatbot.placeholder")}
            className="flex-1 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm h-10"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="h-9 w-9 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 p-0 text-white shadow-md hover:shadow-lg transition-all hover:rotate-3 active:scale-90 flex items-center justify-center shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-2 italic">
          Propulsé par Gemini AI • Expert Cloud ImmoSmart
        </p>
      </div>
    </div>
  )
}

export function ChatbotTrigger() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        suppressHydrationWarning
        className={cn(
          "fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 group sm:bottom-6 sm:right-6",
          isOpen 
            ? "bg-slate-800 rotate-90" 
            : "bg-gradient-to-br from-teal-400 to-blue-600 hover:rotate-12"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-300"></span>
            </span>
          </div>
        )}
      </button>
      <AIChatbot isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}

