import { IonIcon, IonSpinner } from "@ionic/react"
import { sendOutline } from "ionicons/icons"
import React, { useEffect, useRef, useState } from "react"
import { useAuth } from "../lib/auth-context"
import { fetchConversationByContext, sendConversationMessage, type MobileMessage } from "../lib/messages-api"

interface MobileChatProps {
  contextId: string
  contextTitle: string
  recipientId: string
  category: "Demandes" | "Contrats" | "Maintenance"
}

const MobileChat: React.FC<MobileChatProps> = ({ contextId, contextTitle, recipientId, category }) => {
  const { token, user } = useAuth()
  const [messages, setMessages] = useState<MobileMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [draft, setDraft] = useState("")
  const [error, setError] = useState("")
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const currentUserId = String(user?.id || "")

  const loadChat = async () => {
    if (!token || !contextId) return
    try {
      const data = await fetchConversationByContext(contextId, token)
      if (data && data.conversation) {
        setConversationId(data.conversation._id)
        setMessages(data.messages || [])
      }
    } catch (err) {
      console.error("Error loading chat:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadChat()
    const interval = setInterval(loadChat, 5000)
    return () => clearInterval(interval)
  }, [contextId, token])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!token || !draft.trim() || sending) return

    setSending(true)
    setError("")

    try {
      await sendConversationMessage(
        {
          conversationId: conversationId || undefined,
          content: draft.trim(),
          contextId,
          contextTitle,
          recipientId,
          category,
        },
        token,
      )
      setDraft("")
      await loadChat()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur envoi")
    } finally {
      setSending(false)
    }
  }

  if (loading && messages.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        <IonSpinner name="crescent" color="primary" />
      </div>
    )
  }

  return (
    <div className="mobile-chat-container">
      <div className="mobile-chat-messages">
        {messages.length === 0 ? (
          <p className="no-messages">Aucun message pour le moment. Envoyez-en un !</p>
        ) : (
          messages.map((msg) => {
            const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender
            const isMine = String(senderId) === currentUserId
            return (
              <div key={msg._id} className={`chat-bubble-wrapper ${isMine ? "mine" : "theirs"}`}>
                <div className="chat-bubble">
                  <p>{msg.content}</p>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            )
          })
        )}
        <div ref={scrollRef} />
      </div>

      <div className="mobile-chat-input">
        <textarea
          placeholder="Écrivez votre message..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={1}
          onKeyDown={(e) => {
             if (e.key === 'Enter' && !e.shiftKey) {
                 e.preventDefault();
                 handleSend();
             }
          }}
        />
        <button type="button" onClick={handleSend} disabled={sending || !draft.trim()}>
          {sending ? <IonSpinner name="dots" /> : <IonIcon icon={sendOutline} />}
        </button>
      </div>
      {error && <p className="chat-error">{error}</p>}

      <style dangerouslySetInnerHTML={{ __html: `
        .mobile-chat-container {
          display: flex;
          flex-direction: column;
          background: #f9f9f9;
          border-radius: 12px;
          border: 1px solid #eee;
          margin-top: 10px;
          overflow: hidden;
          max-height: 400px;
        }
        .mobile-chat-messages {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-height: 150px;
        }
        .no-messages {
          text-align: center;
          font-size: 13px;
          color: #888;
          margin: 20px 0;
        }
        .chat-bubble-wrapper {
          display: flex;
          width: 100%;
        }
        .chat-bubble-wrapper.mine {
          justify-content: flex-end;
        }
        .chat-bubble-wrapper.theirs {
          justify-content: flex-start;
        }
        .chat-bubble {
          max-width: 80%;
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 14px;
          position: relative;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .mine .chat-bubble {
          background: #3880ff;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .theirs .chat-bubble {
          background: #e5e5ea;
          color: black;
          border-bottom-left-radius: 4px;
        }
        .chat-bubble span {
          display: block;
          font-size: 10px;
          opacity: 0.7;
          margin-top: 4px;
          text-align: right;
        }
        .mobile-chat-input {
          display: flex;
          padding: 10px;
          background: white;
          border-top: 1px solid #eee;
          gap: 10px;
          align-items: center;
        }
        .mobile-chat-input textarea {
          flex: 1;
          border: 1px solid #ddd;
          border-radius: 20px;
          padding: 10px 15px;
          font-size: 14px;
          outline: none;
          resize: none;
          max-height: 100px;
        }
        .mobile-chat-input button {
          background: #3880ff;
          color: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transition: transform 0.1s;
        }
        .mobile-chat-input button:active {
          transform: scale(0.9);
        }
        .mobile-chat-input button:disabled {
          background: #ccc;
        }
        .chat-error {
          color: red;
          font-size: 12px;
          padding: 0 15px 10px;
          margin: 0;
        }
      `}} />
    </div>
  )
}

export default MobileChat
