import { getStoredAccessToken } from "@/lib/auth/session"

const DEFAULT_API_PORT = "5000"
const DEFAULT_API_PATH = "/api"
const DEFAULT_BROWSER_API_URL = `http://localhost:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`

function getRuntimeApiOrigin() {
  if (typeof window === "undefined") {
    return null
  }

  const { protocol, hostname } = window.location

  if (!hostname) {
    return null
  }

  if (hostname === "10.0.2.2") {
    return `http://10.0.2.2:${DEFAULT_API_PORT}`
  }

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:${DEFAULT_API_PORT}`
  }

  return `${protocol}//${hostname}:${DEFAULT_API_PORT}`
}

export function resolveApiUrl() {
  const envApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (envApiUrl) {
    if (typeof window !== "undefined" && window.location.hostname === "10.0.2.2") {
      const normalizedEnvUrl = envApiUrl.replace(/\/+$/, "")

      if (
        normalizedEnvUrl === `http://localhost:${DEFAULT_API_PORT}${DEFAULT_API_PATH}` ||
        normalizedEnvUrl === `http://127.0.0.1:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`
      ) {
        return `http://10.0.2.2:${DEFAULT_API_PORT}${DEFAULT_API_PATH}`
      }
    }

    return envApiUrl.replace(/\/+$/, "")
  }

  const runtimeOrigin = getRuntimeApiOrigin()
  if (runtimeOrigin) {
    return `${runtimeOrigin}${DEFAULT_API_PATH}`
  }

  return DEFAULT_BROWSER_API_URL
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { auth = false, headers, ...rest } = options
  const token = auth ? getStoredAccessToken() : null
  const apiUrl = resolveApiUrl()

  let response: Response

  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...rest,
      headers: {
        ...(headers || {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch (error) {
    if (
      error instanceof TypeError ||
      (error instanceof Error &&
        (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")))
    ) {
      throw new Error(`Impossible de joindre l'API (${apiUrl}). Verifiez que le backend est demarre.`)
    }

    throw error
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null as T
  }

  const rawBody = await response.text()

  if (!rawBody.trim()) {
    return null as T
  }

  return JSON.parse(rawBody) as T
}
