"use client"

import { useState, useRef, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Bot, X, Send, Sparkles, Home, Search, ClipboardList, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatbotProps {
  isOpen: boolean
  onClose: () => void
  userRole: "admin" | "owner" | "tenant"
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
}

const mockResponses: Record<string, string> = {
  "trouver": "J'ai trouvé plusieurs S+2 disponibles à Tunis. Voici les meilleures options:\n\n1. **Appartement Moderne S+2 Centre-Ville** - 1200 TND/mois\n2. **S+2 Lac 2** - 1500 TND/mois\n\nVoulez-vous que je vous montre plus de détails sur l'un d'eux?",
  "parking": "Voici les propriétés avec parking disponibles:\n\n- **Villa Luxueuse Gammarth** - 4500 TND/mois (garage privé)\n- **S+4 Standing Lac 2** - 2800 TND/mois (2 places)\n- **S+3 Familial Sousse** - 1500 TND/mois (1 place)\n\nJe peux filtrer par budget si vous le souhaitez.",
  "demande": "Pour envoyer une demande de location:\n\n1. Cliquez sur **'Voir Détails'** sur la propriété\n2. Cliquez sur **'Envoyer Demande'**\n3. Remplissez le formulaire avec vos coordonnées\n4. Le propriétaire recevra votre demande par email\n\nBesoin d'aide pour autre chose?",
  "ajouter": "Pour ajouter une nouvelle propriété:\n\n1. Allez dans **'Ajouter'** dans le menu\n2. Remplissez tous les champs obligatoires\n3. Uploadez vos photos (minimum 6 images)\n4. Placez le marqueur sur la carte\n5. Cliquez sur **'Soumettre'**\n\nVotre propriété sera publiée après validation.",
  "default": "Je suis l'assistant ImmoSmart. Je peux vous aider à:\n\n- Trouver des propriétés selon vos critères\n- Expliquer le processus de location\n- Répondre à vos questions sur la plateforme\n\nQue puis-je faire pour vous?",
}

export function AIChatbot({ isOpen, onClose, userRole }: AIChatbotProps) {
  const { t } = useI18n()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: t("chatbot.welcome"),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    const lowerText = text.toLowerCase()
    let response = mockResponses.default

    for (const key of Object.keys(mockResponses)) {
      if (lowerText.includes(key)) {
        response = mockResponses[key]
        break
      }
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleSuggestionClick = (text: string) => {
    handleSend(text)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] h-[600px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-primary p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-primary-foreground">{t("chatbot.title")}</h3>
            <p className="text-xs text-primary-foreground/70">En ligne</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-primary-foreground/20 transition-colors"
        >
          <X className="h-5 w-5 text-primary-foreground" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {message.role === "assistant" && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              )}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 3 && (
        <div className="border-t border-border p-3">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            {t("chatbot.suggestions")}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions[userRole].map((suggestion, index) => {
              const Icon = suggestion.icon
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
                >
                  <Icon className="h-3 w-3" />
                  {suggestion.text}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("chatbot.placeholder")}
            className="flex-1 rounded-full border-border bg-muted"
            disabled={isTyping}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="h-10 w-10 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
