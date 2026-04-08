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
