import { http } from "./api"
import type { BackendNotification } from "../types/api"

export const fetchNotifications = (token: string) => {
  return http.get<BackendNotification[]>("/notifications", token)
}

export const fetchUnreadNotificationsCount = (token: string) => {
  return http.get<{ count: number }>("/notifications/unread-count", token)
}

export const markAllNotificationsRead = (token: string) => {
  return http.patch<{ message: string }>("/notifications/read-all", {}, token)
}

export const createNotification = (
  data: {
    recipient: string
    type: string
    title: string
    preview: string
    content: string
    status: string
    attachments: string[]
    claimMeta: {
      claimId?: string
      tenantId: string
      tenantName: string
      ownerId: string
      propertyId: string
      propertyTitle: string
      propertyAddress: string
      subject: string
      category: string
      priority: string
      description: string
      source: string
      photos: string[]
    }
  },
  token: string,
) => {
  return http.post<BackendNotification>("/notifications", data, token)
}

export const markNotificationRead = (notificationId: string, token: string) => {
  return http.patch<BackendNotification>(
    `/notifications/${notificationId}/read`,
    {},
    token,
  )
}

export const fetchSentReclamations = (token: string) => {
  return http.get<BackendNotification[]>("/notifications/reclamations/sent", token)
}

export const updateReclamation = (id: string, data: any, token: string) => {
  return http.put<BackendNotification>(`/notifications/reclamations/${id}`, data, token)
}

export const deleteReclamation = (id: string, token: string) => {
  return http.delete<{ message: string }>(`/notifications/reclamations/${id}`, token)
}
