import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { http } from "./api"
import type { AuthUser, BackendAuthResponse } from "../types/api"

const TOKEN_KEY = "accessToken"

type RegisterPayload = {
  name: string
  email: string
  password: string
  role: "owner" | "tenant"
  phone?: string
}

type LoginResult = {
  success: boolean
  message?: string
  role?: AuthUser["role"]
}

type RegisterResult = {
  success: boolean
  message?: string
  emailDelivered?: boolean
}

type AuthContextType = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string, expectedRole?: AuthUser["role"]) => Promise<LoginResult>
  register: (payload: RegisterPayload) => Promise<RegisterResult>
  verifyEmail: (email: string, code: string) => Promise<LoginResult>
  loginWithGoogle: (
    credential: string,
    mode: "login" | "register",
    role?: AuthUser["role"],
  ) => Promise<LoginResult>
  logout: () => void
  setUser: (user: AuthUser | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mapUser = (backendUser: BackendAuthResponse["user"]): AuthUser => ({
  id: backendUser._id || backendUser.id || "",
  name: backendUser.fullName,
  firstName: backendUser.firstName,
  lastName: backendUser.lastName,
  email: backendUser.email,
  phone: backendUser.phone || "",
  role: backendUser.role,
  avatar: backendUser.avatar,
  address: backendUser.address,
  birthDate: backendUser.birthDate,
  documents: backendUser.documents,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [loading, setLoading] = useState(true)

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
  }

  const setSession = (data: BackendAuthResponse) => {
    if (!data.accessToken) {
      throw new Error("No access token returned")
    }

    localStorage.setItem(TOKEN_KEY, data.accessToken)
    setToken(data.accessToken)
    setUser(mapUser(data.user))
  }

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await http.get<BackendAuthResponse>("/auth/me", token)
        setUser(mapUser(data.user))
      } catch {
        clearSession()
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [token])

  const login = async (email: string, password: string, expectedRole?: AuthUser["role"]): Promise<LoginResult> => {
    try {
      const data = await http.post<BackendAuthResponse>("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      })

      if (expectedRole && data.user.role !== expectedRole) {
        return {
          success: false,
          message: `Role incorrect. Vous essayez de vous connecter en tant que ${expectedRole}.`,
        }
      }

      setSession(data)
      return { success: true, role: data.user.role }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Email ou mot de passe incorrect",
      }
    }
  }

  const register = async (payload: RegisterPayload): Promise<RegisterResult> => {
    try {
      const data = await http.post<BackendAuthResponse>("/auth/signup", {
        fullName: payload.name,
        password: payload.password,
        role: payload.role,
        phone: payload.phone,
        email: payload.email.trim().toLowerCase(),
      })

      return {
        success: true,
        message: data.message,
        emailDelivered: data.emailDelivered,
      }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Erreur lors de l'inscription",
      }
    }
  }

  const verifyEmail = async (email: string, code: string): Promise<LoginResult> => {
    try {
      const data = await http.post<BackendAuthResponse>("/auth/verify-email", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      })

      setSession(data)
      return { success: true, message: data.message, role: data.user.role }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Impossible de verifier l'email",
      }
    }
  }

  const loginWithGoogle = async (
    credential: string,
    mode: "login" | "register",
    role?: AuthUser["role"],
  ): Promise<LoginResult> => {
    try {
      const data = await http.post<BackendAuthResponse>("/auth/google", {
        token: credential,
        mode,
        role,
      })

      setSession(data)
      return { success: true, role: data.user.role }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Echec de la connexion Google",
      }
    }
  }

  const logout = () => {
    clearSession()
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      register,
      verifyEmail,
      loginWithGoogle,
      logout,
      setUser,
    }),
    [user, token, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return ctx
}
