import { http } from "./api"
import type { BackendNotification } from "../types/api"

export const fetchNotifications = (token: string) => {
  return http.get<BackendNotification[]>("/notifications", token)
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
      claimId: string
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
