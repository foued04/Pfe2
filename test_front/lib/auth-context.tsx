"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "admin" | "owner" | "tenant"

interface User {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  address?: string
  birthDate?: string
  notificationPrefs?: {
    acceptedRequests: boolean
    ownerMessages: boolean
    rentReminders: boolean
  }
  documents?: {
    cin?: { url: string; status: string; comment: string; uploadedAt?: string }
    rib?: { url: string; status: string; comment: string; uploadedAt?: string }
  }
}

interface AuthContextType {
  user: User | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string; role?: UserRole }>
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string; devCode?: string }>
  logout: () => void
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message?: string }>
  loginWithGoogle: (credential: string, mode: "login" | "register", role?: UserRole) => Promise<{ success: boolean; message?: string; role?: UserRole }>
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null

  const mapBackendUser = (backendUser: any): User => {
    return {
      id: backendUser._id || backendUser.id,
      name: backendUser.fullName,
      firstName: backendUser.firstName || "",
      lastName: backendUser.lastName || "",
      email: backendUser.email,
      phone: backendUser.phone || "",
      role: backendUser.role as UserRole,
      avatar: backendUser.avatar || "",
      address: backendUser.address || "",
      birthDate: backendUser.birthDate || "",
      notificationPrefs: backendUser.notificationPrefs || {
        acceptedRequests: true,
        ownerMessages: true,
        rentReminders: true
      },
      documents: backendUser.documents
    }
  }

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null
      
      if (!token || token === "undefined") {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data && data.user) {
            const mappedUser = mapBackendUser(data.user)
            setUser(mappedUser)
            setRole(mappedUser.role)
          }
        } else {
          // Token might be expired or invalid
          if (response.status === 401) {
             localStorage.removeItem("accessToken")
             setUser(null)
             setRole(null)
          }
        }
      } catch (error) {
        // This handles "Failed to fetch" errors gracefully
        console.warn("Auth check failed (Server might be down or network issue):", error)
        // We don't clear the token here in case it's just a temporary network issue
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string, selectedRole?: UserRole): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      })

      if (response.ok) {
        const data = await response.json()

        if (selectedRole && data.user.role !== selectedRole) {
          return { success: false, message: `Rôle incorrect. Vous essayez de vous connecter en tant que ${selectedRole}.` }
        }

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken)
        }

        const mappedUser = mapBackendUser(data.user)
        setUser(mappedUser)
        setRole(mappedUser.role)
        return { success: true, role: mappedUser.role }
      }

      const errData = await response.json().catch(() => null)
      return { success: false, message: errData?.message || "Email ou mot de passe incorrect" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string; devCode?: string }> => {
    try {
      const normalizedEmail = data.email.trim().toLowerCase()
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name,
          email: normalizedEmail,
          password: data.password,
          role: data.role,
          phone: data.phone,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()

        // In a verified flow, we don't set the user until email is verified.
        // We will just return success and let the UI redirect to the verification page.
        return { success: true, devCode: responseData.devCode }
      }

      const errData = await response.json().catch(() => null)
      return { success: false, message: errData?.message || "Erreur lors de l'inscription" }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const updateProfile = async (profileData: Partial<User>): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...profileData,
          fullName: profileData.name || user?.name // Backend expects fullName
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const mappedUser = mapBackendUser(data.user)
        setUser(mappedUser)
        return { success: true, message: data.message }
      }

      const errData = await response.json().catch(() => null)
      return { success: false, message: errData?.message || "Erreur lors de la mise à jour du profil" }
    } catch (error) {
      console.error("Profile update error:", error)
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/auth/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (response.ok) {
        const data = await response.json()
        return { success: true, message: data.message }
      }

      const errData = await response.json().catch(() => null)
      return { success: false, message: errData?.message || "Erreur lors du changement de mot de passe" }
    } catch (error) {
      console.error("Password update error:", error)
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const loginWithGoogle = async (
    credential: string,
    mode: "login" | "register",
    role?: UserRole
  ): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credential, mode, role }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken)
        }

        const mappedUser = mapBackendUser(data.user)
        setUser(mappedUser)
        setRole(mappedUser.role)
        return { success: true, role: mappedUser.role }
      }

      const errData = await response.json().catch(() => null)
      return { success: false, message: errData?.message || "Échec de la connexion Google" }
    } catch (error) {
      console.error("Google login error:", error)
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, isLoading, login, register, logout, updateProfile, updatePassword, loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
