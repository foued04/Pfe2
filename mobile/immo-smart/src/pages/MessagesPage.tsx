import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  arrowBackOutline,
  chatbubblesOutline,
  mailOutline,
  searchOutline,
  sendOutline,
} from "ionicons/icons"
import { useEffect, useMemo, useRef, useState } from "react"
import EmptyState from "../components/EmptyState"
import LoadingSpinner from "../components/LoadingSpinner"
import SectionHeader from "../components/SectionHeader"
import { useAuth } from "../lib/auth-context"
import {
  fetchConversationMessages,
  fetchConversations,
  sendConversationMessage,
  type MobileConversation,
  type MobileMessage,
} from "../lib/messages-api"
import "./OwnerDashboard.css"

const MessagesPage: React.FC = () => {
  const { token, user } = useAuth()
  const [conversations, setConversations] = useState<MobileConversation[]>([])
  const [messages, setMessages] = useState<MobileMessage[]>([])
  const [activeConversationId, setActiveConversationId] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!token) return

    let active = true
    const load = async () => {
      try {
        const data = await fetchConversations(token)
        if (!active) return
        const next = Array.isArray(data) ? data : []
        setConversations(next)
        setActiveConversationId((current) => current || next[0]?._id || "")
        setError("")
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des conversations.")
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    const interval = window.setInterval(load, 10000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [token])

  useEffect(() => {
    if (!token || !activeConversationId) {
      setMessages([])
      return
    }

    let active = true
    const loadMessages = async () => {
      try {
        const data = await fetchConversationMessages(activeConversationId, token)
        if (!active) return
        setMessages(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : "Erreur lors du chargement des messages.")
      }
    }

    loadMessages()
    const interval = window.setInterval(loadMessages, 5000)
    return () => {
      active = false
      window.clearInterval(interval)
    }
  }, [activeConversationId, token])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const currentUserId = String(user?.id || "")

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return conversations.filter((conversation) => {
      const other = conversation.participants.find((participant) => String(participant._id) !== currentUserId)
      const haystack = `${other?.fullName || ""} ${conversation.contextTitle || ""}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [conversations, currentUserId, search])

  const activeConversation = conversations.find((conversation) => conversation._id === activeConversationId) || null
  const activeRecipient =
    activeConversation?.participants.find((participant) => String(participant._id) !== currentUserId) || null

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [messages],
  )

  const formatDate = (value?: string) => {
    if (!value) return ""
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return date.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
  }

  const handleSend = async () => {
    if (!token || !activeConversationId || !draft.trim() || sending) return

    setSending(true)
    setError("")

    try {
      await sendConversationMessage({ conversationId: activeConversationId, content: draft.trim() }, token)
      setDraft("")
      const refreshed = await fetchConversationMessages(activeConversationId, token)
      setMessages(Array.isArray(refreshed) ? refreshed : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le message.")
    } finally {
      setSending(false)
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="mobile-content">
        <div className="mobile-page notifications-page">
          <SectionHeader
            badge={user?.role === "owner" ? "Owner" : "Tenant"}
            title="Messages"
            subtitle="Suivez vos conversations locataires et vos echanges lies a vos demandes depuis une experience mobile proche du web."
          />

          {loading ? (
            <LoadingSpinner message="Chargement des messages..." />
          ) : error && conversations.length === 0 ? (
            <div className="empty-state error-state">
              <p>{error}</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <EmptyState
              icon={chatbubblesOutline}
              title="Aucune conversation"
              message="Vos conversations apparaitront ici des qu'un echange sera cree."
            />
          ) : (
            <div className="owner-messages-shell">
              <section className="owner-messages-list">
                <div className="owner-messages-toolbar">
                  <div className="search-input furniture-search-input">
                    <IonIcon icon={searchOutline} />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Rechercher une conversation"
                    />
                  </div>
                </div>

                <div className="owner-messages-conversations">
                  {filteredConversations.map((conversation) => {
                    const other = conversation.participants.find((participant) => String(participant._id) !== currentUserId)
                    const isActive = conversation._id === activeConversationId

                    return (
                      <button
                        key={conversation._id}
                        type="button"
                        className={`owner-conversation-card ${isActive ? "active" : ""}`}
                        onClick={() => setActiveConversationId(conversation._id)}
                      >
                        <div className="owner-conversation-avatar">
                          {(other?.fullName || "?").slice(0, 1).toUpperCase()}
                        </div>
                        <div className="owner-conversation-copy">
                          <div className="owner-conversation-row">
                            <strong>{other?.fullName || "Conversation"}</strong>
                            <span>{formatDate(conversation.updatedAt)}</span>
                          </div>
                          <p>{conversation.contextTitle || "Echange ImmoSmart"}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>

              <section className="owner-messages-thread">
                {!activeConversation ? (
                  <EmptyState
                    icon={mailOutline}
                    title="Choisissez une conversation"
                    message="Selectionnez un echange pour afficher les messages."
                  />
                ) : (
                  <>
                    <div className="owner-thread-head">
                      <div>
                        <button type="button" className="link-btn owner-thread-back" onClick={() => setActiveConversationId("")}>
                          <IonIcon icon={arrowBackOutline} />
                          Retour
                        </button>
                        <h3>{activeRecipient?.fullName || "Conversation"}</h3>
                        <p>{activeConversation.contextTitle || "Echange ImmoSmart"}</p>
                      </div>
                    </div>

                    <div className="owner-thread-body">
                      {sortedMessages.map((message) => {
                        const senderId =
                          typeof message.sender === "object" && message.sender !== null ? String(message.sender._id || "") : String(message.sender || "")
                        const isMine = senderId === currentUserId

                        return (
                          <div key={message._id} className={`owner-thread-message ${isMine ? "mine" : ""}`}>
                            <div className="owner-thread-bubble">
                              <p>{message.content}</p>
                              <span>{formatDate(message.createdAt)}</span>
                            </div>
                          </div>
                        )
                      })}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="owner-thread-compose">
                      <textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder="Ecrire un message..."
                        rows={3}
                      />
                      <button type="button" className="detail-cta notification-send-btn" disabled={sending || !draft.trim()} onClick={handleSend}>
                        <IonIcon icon={sendOutline} />
                        {sending ? "Envoi..." : "Envoyer"}
                      </button>
                    </div>
                  </>
                )}
              </section>
            </div>
          )}

          {error && conversations.length > 0 ? <p className="auth-status error">{error}</p> : null}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default MessagesPage
