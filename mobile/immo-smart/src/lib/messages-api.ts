import { http } from "./api"

export type MobileConversation = {
  _id: string
  category?: string
  contextId?: string
  contextTitle?: string
  participants: Array<{
    _id: string
    fullName: string
    role: string
    email?: string
  }>
  updatedAt: string
}

export type MobileMessage = {
  _id: string
  conversation: string
  sender: {
    _id?: string
    fullName?: string
    role?: string
  } | string
  content: string
  createdAt: string
  isRead?: boolean
  metadata?: Record<string, unknown>
}

export const fetchConversations = (token: string) => {
  return http.get<MobileConversation[]>("/messages", token)
}

export const fetchConversationMessages = (conversationId: string, token: string) => {
  return http.get<MobileMessage[]>(`/messages/${conversationId}/messages`, token)
}

export const fetchUnreadMessagesCount = (token: string) => {
  return http.get<{ count: number }>("/messages/unread-count", token)
}

export const fetchConversationByContext = (contextId: string, token: string) => {
  return http.get<{ conversation: MobileConversation; messages: MobileMessage[] }>(`/messages/context/${contextId}`, token)
}

export const sendConversationMessage = (
  data: {
    conversationId?: string
    content: string
    category?: string
    contextId?: string
    contextTitle?: string
    recipientId?: string
  },
  token: string,
) => {
  return http.post<MobileMessage>("/messages", data, token)
}
