import { http } from "./api"
import type { BackendRentalRequest } from "../types/api"

export const fetchRentalRequests = (token: string) => {
  return http.get<BackendRentalRequest[]>("/rental-requests", token)
}

export const createRentalRequest = (
  data: { property: string; message?: string },
  token: string,
) => {
  return http.post<BackendRentalRequest>("/rental-requests", data, token)
}

export const updateRentalRequestStatus = (
  requestId: string,
  status: "Acceptée" | "Refusée" | "Contrat actif",
  token: string,
) => {
  return http.put<BackendRentalRequest>(
    `/rental-requests/${requestId}/status`,
    { status },
    token,
  )
}
