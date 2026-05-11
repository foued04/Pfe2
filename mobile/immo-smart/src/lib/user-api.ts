import { http } from "./api"
import type { BackendAuthResponse } from "../types/api"

export const updateProfile = (
  data: { fullName?: string; phone?: string; address?: string; birthDate?: string; avatar?: string },
  token: string,
) => {
  return http.patch<BackendAuthResponse>("/auth/profile", data, token)
}

export const updatePassword = (
  data: { currentPassword: string; newPassword: string },
  token: string,
) => {
  return http.patch<{ message: string }>("/auth/password", data, token)
}

export const uploadVerificationDocument = (
  docType: "cin" | "rib",
  url: string,
  token: string,
) => {
  return http.post<{ message: string; documents: BackendAuthResponse["user"]["documents"] }>(
    `/verifications/upload/${docType}`,
    { url },
    token,
  )
}
export const fetchAdminUsers = (role: string, search: string, token: string) => {
  return http.get<any[]>(`/users?role=${role}&search=${search}`, token)
}

export const deleteUserByAdmin = (userId: string, token: string) => {
  return http.delete<{ message: string }>(`/users/${userId}`, token)
}
