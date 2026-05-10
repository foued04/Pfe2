import { http } from "./api"
import type { BackendHousingNeed, BackendHousingNeedResponse } from "../types/api"

export const fetchMyHousingNeed = (token: string) => {
  return http.get<BackendHousingNeed | null>("/housing-needs/me", token)
}

export const saveMyHousingNeed = (
  data: {
    desiredCity: string
    department: string
    minBudget: string
    maxBudget: string
    propertyType: string
    bedrooms: string
    moveInDate: string
    duration: string
    meuble: boolean
    parking: boolean
    nearCenter: boolean
    notes: string
  },
  token: string,
) => {
  return http.post<BackendHousingNeedResponse>("/housing-needs/me", data, token)
}

export const fetchAllHousingNeeds = (token: string) => {
  return http.get<BackendHousingNeed[]>("/housing-needs/all", token)
}
