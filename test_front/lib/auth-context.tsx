"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

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
  login: (email: string, password: string, role: UserRole) => Promise<boolean>
  register: (data: RegisterData) => Promise<boolean>
  logout: () => void
}

interface RegisterData {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}

// Mock user database
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin ImmoSmart",
    email: "admin@immosmart.tn",
    phone: "+216 73 461 000",
    role: "admin",
  },
  {
    id: "2",
    name: "Mohamed Ben Ali",
    email: "proprietaire@email.com",
    phone: "+216 73 461 234",
    role: "owner",
  },
  {
    id: "3",
    name: "Sarra Bouaziz",
    email: "locataire@email.com",
    phone: "+216 73 462 345",
    role: "tenant",
  },
]

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)

  const isAuthenticated = user !== null

  const login = async (email: string, password: string, selectedRole: UserRole): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // Find user with matching email and role
    const foundUser = mockUsers.find(u => u.email === email && u.role === selectedRole)

    if (foundUser && password === "demo123") {
      setUser(foundUser)
      setRole(foundUser.role)
      return true
    }

    return false
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === data.email)
    if (existingUser) {
      return false
    }

    // Create new user
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    }

    mockUsers.push(newUser)
    setUser(newUser)
    setRole(newUser.role)
    return true
  }

  const logout = () => {
    setUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated, login, register, logout }}>
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
