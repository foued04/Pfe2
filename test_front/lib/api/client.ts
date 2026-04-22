import { getStoredAccessToken } from "@/lib/auth/session"

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = false, headers, ...rest } = options
  const token = auth ? getStoredAccessToken() : null

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...(headers || {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

