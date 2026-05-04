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
