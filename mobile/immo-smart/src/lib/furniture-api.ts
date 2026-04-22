import { http } from "./api"
import type {
  BackendFurniture,
  BackendFurnitureChangeRequest,
  BackendFurnitureOrder,
} from "../types/api"

export const fetchFurniture = (token?: string) => {
  return http.get<BackendFurniture[]>("/furniture", token)
}

export const saveFurnitureOrder = (
  payload: {
    contractId?: string
    propertyId?: string
    items: Array<{ furniture: string; quantity: number; price: number }>
    total: number
    paymentMethod?: string
  },
  token: string,
) => {
  return http.post<BackendFurnitureOrder>("/furniture/order", payload, token)
}

export const createFurnitureChangeRequest = (
  payload: {
    furnitureId: string
    contractId?: string
    propertyId?: string
    type: string
    reason: string
    description?: string
    photo?: string
  },
  token: string,
) => {
  return http.post<BackendFurnitureChangeRequest>("/furniture/change-requests", payload, token)
}
