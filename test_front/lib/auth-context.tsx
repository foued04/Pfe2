"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "admin" | "owner" | "tenant"

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
}

interface AuthContextType {
  user: User | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<{ success: boolean; message?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = user !== null

  useEffect(() => {
    // Check for stored token on initial load
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()

          // Map backend fields to frontend User interface
          const mappedUser: User = {
            id: data.user._id || data.user.id,
            name: data.user.fullName,
            email: data.user.email,
            phone: data.user.phone || "",
            role: data.user.role as UserRole,
          }

          setUser(mappedUser)
          setRole(mappedUser.role)
        } else {
          // Token is invalid or expired
          localStorage.removeItem("accessToken")
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error("Failed to verify authentication:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string, selectedRole: UserRole): Promise<{ success: boolean; message?: string }> => {
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail, password }),
      })

      if (response.ok) {
        const data = await response.json()

        // Ensure the role matches the selectedRole if provided from frontend UI
        if (data.user.role !== selectedRole) {
          return { success: false, message: `Rôle incorrect. Vous essayez de vous connecter en tant que ${selectedRole}.` }
        }

        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken)
        }

        const mappedUser: User = {
          id: data.user._id || data.user.id,
          name: data.user.fullName,
          email: data.user.email,
          phone: data.user.phone || "",
          role: data.user.role as UserRole,
        }

        setUser(mappedUser)
        setRole(mappedUser.role)
        return { success: true }
      }

      const errData = await response.json().catch(() => null)
      return { success: false, message: errData?.message || "Email ou mot de passe incorrect" }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      const normalizedEmail = data.email.trim().toLowerCase()
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: data.name, // Mapping frontend name back to backend fullName
          email: normalizedEmail,
          password: data.password,
          role: data.role,
          phone: data.phone,
        }),
      })

      if (response.ok) {
        const responseData = await response.json()

        if (responseData.accessToken) {
          localStorage.setItem("accessToken", responseData.accessToken)
        }

        const mappedUser: User = {
          id: responseData.user._id || responseData.user.id,
          name: responseData.user.fullName,
          email: responseData.user.email,
          phone: responseData.user.phone || "",
          role: responseData.user.role as UserRole,
        }

        setUser(mappedUser)
        setRole(mappedUser.role)
        return { success: true }
      }

      const errData = await response.json().catch(() => null)
      return { success: false, message: errData?.message || "Erreur lors de l'inscription" }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, message: "Erreur de connexion au serveur" }
    }
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, isLoading, login, register, logout }}>
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
