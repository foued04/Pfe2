import { Capacitor } from "@capacitor/core"
import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in"

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
      existing.remove() // Clean up potentially broken script
    }

    const script = document.createElement("script")
    script.src = "https://accounts.google.com/gsi/client"
    script.async = true
    script.defer = true
    script.dataset.googleOauth = "true"
    
    script.onload = () => {
      console.log("✅ Google OAuth script loaded successfully")
      resolve()
    }
    
    script.onerror = (err) => {
      console.error("❌ Google OAuth script failed to load:", err)
      reject(new Error("Impossible de charger Google OAuth. Verifiez votre connexion ou desactivez vos bloqueurs de contenu."))
    }
    
    document.head.appendChild(script)
  })

  return scriptPromise
}

export async function requestGoogleAccessToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()

  if (!clientId) {
    throw new Error("Google OAuth n'est pas configure.")
  }

  // --- NATIVE MOBILE FLOW ---
  if (Capacitor.isNativePlatform()) {
    try {
      await GoogleSignIn.initialize({
        clientId: clientId,
      })
      const result = await GoogleSignIn.signIn()
      // Support different versions of the plugin response structure
      const token = (result as any).authentication?.idToken || 
                    (result as any).idToken || 
                    (result as any).authentication?.accessToken || 
                    (result as any).accessToken
      
      if (!token) {
        console.error("❌ Full Google result:", result)
        throw new Error("Aucun jeton recu de Google")
      }
      return token
    } catch (err: any) {
      // User canceled or something else
      if (err.message?.includes("cancel")) {
        throw new Error("Connexion annulee")
      }
      console.error("❌ Native Google Auth error:", err)
      throw new Error("Erreur Google Auth Native: " + (err.message || "Inconnue"))
    }
  }

  // --- WEB FLOW ---
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
