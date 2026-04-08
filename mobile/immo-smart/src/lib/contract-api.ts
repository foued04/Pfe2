import { http } from "./api"
import type { BackendContract } from "../types/api"

export const generateContract = (
  data: { rentalRequest: string },
  token: string,
) => {
  return http.post<BackendContract>("/contracts/generate", data, token)
}

export const fetchContract = (requestId: string, token: string) => {
  return http.get<BackendContract>(`/contracts/request/${requestId}`, token)
}

export const signContract = (
  contractId: string,
  data: { signature: string },
  token: string,
) => {
  return http.put<BackendContract>(`/contracts/${contractId}/sign`, data, token)
}
