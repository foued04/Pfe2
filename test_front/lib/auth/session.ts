export const ACCESS_TOKEN_KEY = "accessToken"

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  if (!token || token === "undefined") return null
  return token
}

export function clearStoredSession() {
  if (typeof window === "undefined") return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

