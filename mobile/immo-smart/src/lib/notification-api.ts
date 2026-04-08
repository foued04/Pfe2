import { http } from "./api"
import type { BackendNotification } from "../types/api"

export const fetchNotifications = (token: string) => {
  return http.get<BackendNotification[]>("/notifications", token)
}

export const markNotificationRead = (notificationId: string, token: string) => {
  return http.patch<BackendNotification>(
    `/notifications/${notificationId}/read`,
    {},
    token,
  )
}
