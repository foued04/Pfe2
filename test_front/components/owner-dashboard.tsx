"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { mockProperties } from "@/lib/property-data"
import { SummaryCards } from "./summary-cards"
import { OwnerPropertiesGrid } from "./owner-properties-grid"
import { OwnerPropertyForm } from "./owner-property-form"
import { PropertyMap } from "./property-map"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Plus,
  FileText,
  MessageSquare,
  BarChart3,
  User,
  Home,
  Globe,
  LogOut,
  Map,
  MapPin,
  ShoppingCart,
  Bell,
} from "lucide-react"

import { FurnitureOrderModule } from "./furniture-order-module"
import { RentalRequestsModule } from "./rental-requests-module"
import { MessagesModule } from "./messages-module"
import { OwnerProfile } from "./owner-profile"
import { NotificationsModule } from "./notifications-module"

const navItems = [
  { key: "overview", icon: LayoutDashboard, label: "overview" },
  { key: "properties", icon: Building2, label: "myProperties" },
  { key: "addProperty", icon: Plus, label: "addProperty" },
  { key: "map", icon: Map, label: "map" },
  { key: "requests", icon: FileText, label: "requests" },
  { key: "notifications", icon: Bell, label: "notifications" },
  { key: "furniture", icon: ShoppingCart, label: "furniture" },
  { key: "profile", icon: User, label: "profile" },
]

export function OwnerDashboard() {
  const { t, lang, setLang } = useI18n()
  const { user, logout } = useAuth()
  
  const [activeSection, setActiveSection] = useState("overview")
  const [preSelectedPropertyId, setPreSelectedPropertyId] = useState<string | null>(null)
  const [properties, setProperties] = useState<any[]>([])
  const [editingProperty, setEditingProperty] = useState<any | null>(null)
  const [newPropertyFormKey, setNewPropertyFormKey] = useState(0)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [requestCount, setRequestCount] = useState(0)
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const fetchProperties = async () => {
    if (!user) return
    setIsFetching(true)
    setError(null)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProperties(data)
      } else {
        setError(lang === "fr" ? "Erreur lors du chargement des propriétés." : "Error loading properties.")
      }
    } catch (err) {
      console.error("Fetch properties error:", err)
      setError(lang === "fr" ? "Impossible de contacter le serveur." : "Could not connect to server.")
    } finally {
      setIsFetching(false)
    }
  }

  const handleDeleteProperty = async (id: string) => {
    if (!confirm(lang === "fr" ? "Êtes-vous sûr de vouloir supprimer ce bien ?" : "Are you sure you want to delete this property?")) return
    
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        setProperties(prev => prev.filter(p => (p.id || p._id) !== id))
      } else {
        alert(lang === "fr" ? "Erreur lors de la suppression." : "Error during deletion.")
      }
    } catch (err) {
      console.error("Delete property error:", err)
      alert(lang === "fr" ? "Erreur de connexion." : "Connection error.")
    }
  }

  const fetchRequestsCount = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/rental-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        const dataArray = Array.isArray(data) ? data : []
        const pendingCount = dataArray.filter((r: any) => r.status === "En attente").length
        setRequestCount(pendingCount)
      }
    } catch (err) {
      console.error("Fetch requests count error:", err)
    }
  }

  const fetchUnreadMessageCount = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return
      const response = await fetch(`${API_URL}/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUnreadMessageCount(data.count || 0)
      }
    } catch (err) {
      console.error("Fetch unread messages count error:", err)
    }
  }

  const fetchUnreadNotificationCount = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) return
      const response = await fetch(`${API_URL}/notifications/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUnreadNotificationCount(data.count || 0)
      }
    } catch (err) {
      console.error("Fetch unread notifications count error:", err)
    }
  }

  useEffect(() => {
    fetchProperties()
    fetchRequestsCount()
    fetchUnreadMessageCount()
    fetchUnreadNotificationCount()
    
    // Refresh counts every 30 seconds
    const interval = setInterval(() => {
      fetchRequestsCount()
      fetchUnreadMessageCount()
      fetchUnreadNotificationCount()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [user])

  const openNewPropertyForm = () => {
    setEditingProperty(null)
    setNewPropertyFormKey((prev) => prev + 1)
    setActiveSection("addProperty")
  }

  const handleEditProperty = (property: any) => {
    setEditingProperty(property)
    setActiveSection("editProperty")
  }

  const handleSaveProperty = async (savedData: any) => {
    setIsFetching(true)
    try {
      const token = localStorage.getItem("accessToken")
      if (!token || token === "undefined") {
        alert(lang === "fr" ? "Votre session a expiré. Veuillez vous reconnecter." : "Your session has expired. Please log in again.")
        logout()
        setIsFetching(false)
        return
      }
      const isEdit = !!editingProperty
      const url = isEdit ? `${API_URL}/properties/${editingProperty.id || editingProperty._id}` : `${API_URL}/properties`
      const method = isEdit ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(savedData),
      })

      if (response.ok) {
        const result = await response.json()
        if (isEdit) {
          setProperties(prev => prev.map(p => ((p.id || p._id) === result._id ? result : p)))
        } else {
          setProperties(prev => [result, ...prev])
          setNewPropertyFormKey((prev) => prev + 1)
        }
        setEditingProperty(null)
        setActiveSection("properties")
      } else if (response.status === 401) {
        alert(lang === "fr" ? "Votre session a expiré. Veuillez vous reconnecter." : "Your session has expired. Please log in again.")
        logout()
      } else {
        const err = await response.json().catch(() => null)
        alert(err?.message || (lang === "fr" ? "Erreur lors de l'enregistrement." : "Error saving property."))
      }
    } catch (err) {
      console.error("Save property error:", err)
      alert(lang === "fr" ? "Erreur de connexion." : "Connection error.")
    } finally {
      setIsFetching(false)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case "addProperty":
        return <OwnerPropertyForm key={newPropertyFormKey} onSave={handleSaveProperty} onCancel={() => setActiveSection("properties")} />
      case "editProperty":
        return <OwnerPropertyForm initialData={editingProperty} onSave={handleSaveProperty} onCancel={() => setActiveSection("properties")} />
      case "furniture":
        return <FurnitureOrderModule initialPropertyId={preSelectedPropertyId} />
      case "requests":
        return <RentalRequestsModule />
      case "notifications":
        return <NotificationsModule />
      case "profile":
        return <OwnerProfile properties={properties} requestCount={requestCount} />
      case "map":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                {lang === "fr" ? "Mes Propriétés - Carte" : "My Properties - Map"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {lang === "fr" 
                  ? "Visualisez vos propriétés sur la carte de Monastir" 
                  : "View your properties on the Monastir map"}
              </p>
            </div>
            <PropertyMap 
              properties={properties}
              height="500px"
            />
          </div>
        )
      case "properties":
        return (
          <div className="p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {t("nav.myProperties")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {lang === "fr" ? "Gérez vos biens immobiliers à Monastir" : "Manage your Monastir properties"}
                </p>
              </div>
              <Button 
                onClick={openNewPropertyForm}
                variant="default"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                {lang === "fr" ? "Ajouter un bien" : "Add Property"}
              </Button>
            </div>
            {isFetching && (
              <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {error && (
              <div className="p-4 mb-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
                {error}
              </div>
            )}
            {!isFetching && !error && (
              <OwnerPropertiesGrid 
                properties={properties}
                onManageFurniture={(id) => {
                  setPreSelectedPropertyId(id)
                  setActiveSection("furniture")
                }}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            )}
          </div>
        )
      default:
        return (
          <main className="p-6">
            <section className="mb-8">
              <SummaryCards properties={properties} requestsCount={requestCount} />
            </section>
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {t("nav.myProperties")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {lang === "fr" ? "Gérez vos biens immobiliers à Monastir" : "Manage your Monastir properties"}
                  </p>
                </div>
                <Button 
                  onClick={openNewPropertyForm}
                  variant="outline" className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {lang === "fr" ? "Ajouter" : "Add"}
                </Button>
              </div>
              {isFetching ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <OwnerPropertiesGrid 
                  properties={properties.slice(0, 3)}
                  onManageFurniture={(id) => {
                    setPreSelectedPropertyId(id)
                    setActiveSection("furniture")
                  }}
                  onEdit={handleEditProperty}
                  onDelete={handleDeleteProperty}
                />
              )}
            </section>
          </main>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#e9eef7]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-[#1e3a8a] to-[#1d4ed8] text-white">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-white/20 px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ImmoSmart</h1>
              <p className="text-xs text-white/80">{t("role.owner")}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              let isActive = activeSection === item.key
              if (item.key === "addProperty" && activeSection === "editProperty") {
                isActive = true
              }

              return (
                <button
                  key={item.key}
                  onClick={() => {
                    if (item.key === "addProperty") {
                      openNewPropertyForm()
                      return
                    }
                    setActiveSection(item.key)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#3b82f6] text-white shadow-md"
                      : "text-white/85 hover:bg-white/15 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t(item.label)}</span>
                  {item.key === "requests" && requestCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-sm">
                      {requestCount}
                    </span>
                  )}
                  {item.key === "notifications" && (unreadMessageCount + unreadNotificationCount) > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white shadow-sm">
                      {unreadMessageCount + unreadNotificationCount}
                    </span>
                  )}
                  {item.key !== "requests" && item.key !== "messages" && item.badge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-white/20 px-1.5 text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-white/20 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{user?.name || "Propriétaire"}</p>
                <p className="text-xs text-white/75">{user?.email}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/85 transition-all duration-200 hover:bg-red-500/20 hover:text-red-100"
            >
              <LogOut className="h-5 w-5" />
              <span>{lang === "fr" ? "Déconnexion" : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-blue-100 bg-white/90 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-500">Monastir, Tunisie</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">
              {lang === "fr" ? "Bienvenue," : "Welcome,"} <span className="font-medium text-slate-800">{user?.name}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {lang === "fr" ? "FR" : "EN"}
            </Button>
          </div>
        </header>

        {renderContent()}
      </div>

    </div>
  )
}
