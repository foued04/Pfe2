let scriptPromise: Promise<void> | null = null

type TokenResponse = {
  access_token: string
  error?: string
  error_description?: string
}

function loadGoogleScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google OAuth indisponible"))
  }

  if (window.google?.accounts?.oauth2) {
    return Promise.resolve()
  }

  if (scriptPromise) {
    return scriptPromise
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-google-oauth="true"]')
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Impossible de charger Google OAuth")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.dataset.googleOauth = "true"
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Impossible de charger Google OAuth"))
    document.head.appendChild(script)
  })

  return scriptPromise
}

export async function requestGoogleAccessToken() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

  if (!clientId) {
    throw new Error("Google OAuth n'est pas configure.")
  }

  await loadGoogleScript()

  return new Promise<string>((resolve, reject) => {
    const googleOauth = window.google?.accounts.oauth2
    if (!googleOauth) {
      reject(new Error("Google OAuth indisponible"))
      return
    }

    const tokenClient = googleOauth.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response: TokenResponse) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || response.error || "Erreur Google OAuth"))
          return
        }

        resolve(response.access_token)
      },
    })

    tokenClient.requestAccessToken({ prompt: "select_account" })
  })
}
