import { http } from "./api"
import type { BackendProperty, CreatePropertyPayload } from "../types/api"

export const fetchProperties = (token?: string) => {
  return http.get<BackendProperty[]>("/properties", token)
}

export const fetchOwnerDashboardProperties = (token: string) => {
  return http.get<BackendProperty[]>("/properties", token)
}

export const fetchProperty = (propertyId: string, token?: string) => {
  return http.get<BackendProperty>(`/properties/${propertyId}`, token)
}

export const fetchMyRentals = (token: string) => {
  return http.get<BackendProperty[]>("/properties/my-rentals", token)
}

export const createProperty = (data: CreatePropertyPayload, token: string) => {
  return http.post<BackendProperty>("/properties", data, token)
}

export const updateProperty = (propertyId: string, data: Partial<CreatePropertyPayload>, token: string) => {
  return http.put<BackendProperty>(`/properties/${propertyId}`, data, token)
}

export const deleteProperty = (propertyId: string, token: string) => {
  return http.delete<{ message: string }>(`/properties/${propertyId}`, token)
}
