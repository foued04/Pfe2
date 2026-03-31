"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { mockProperties } from "@/lib/property-data"
import { SummaryCards } from "./summary-cards"
import { OwnerPropertiesGrid } from "./owner-properties-grid"
import { OwnerPropertyForm } from "./owner-property-form"
import { PropertyMap } from "./property-map"
import { AIChatbot } from "./ai-chatbot"
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
  Bot,
  LogOut,
  Map,
  MapPin,
  ShoppingCart,
} from "lucide-react"

import { FurnitureOrderModule } from "./furniture-order-module"
import { RentalRequestsModule } from "./rental-requests-module"
import { MessagesModule } from "./messages-module"
import { OwnerProfile } from "./owner-profile"

const navItems = [
  { key: "overview", icon: LayoutDashboard, label: "nav.overview" },
  { key: "properties", icon: Building2, label: "nav.myProperties" },
  { key: "addProperty", icon: Plus, label: "nav.addProperty" },
  { key: "map", icon: Map, label: "nav.map" },
  { key: "requests", icon: FileText, label: "nav.requests", badge: 5 },
  { key: "messages", icon: MessageSquare, label: "nav.messages", badge: 3 },
  { key: "analytics", icon: BarChart3, label: "nav.analytics" },
  { key: "furniture", icon: ShoppingCart, label: "nav.furniture" },
  { key: "profile", icon: User, label: "nav.profile" },
]

export function OwnerDashboard() {
  const { t, lang, setLang } = useI18n()
  const { user, logout } = useAuth()
  
  const [activeSection, setActiveSection] = useState("overview")
  const [preSelectedPropertyId, setPreSelectedPropertyId] = useState<string | null>(null)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  // Initialize properties state with mock data so the UI remains populated and functional
  const [properties, setProperties] = useState<any[]>(
    mockProperties.filter(p => !user || p.ownerEmail === user.email || true) // fallback to showing all for demo
  )
  const [editingProperty, setEditingProperty] = useState<any | null>(null)

  const handleDeleteProperty = (id: string) => {
    // Cannot delete if there's an active rental or request (simulated logic)
    const propertyToDelete = properties.find(p => p.id === id || p._id === id)
    if (propertyToDelete?.status === 'rented') {
      alert(lang === "fr" ? "Impossible de supprimer un bien actuellement loué." : "Cannot delete a currently rented property.")
      return
    }
    setProperties(prev => prev.filter(p => p.id !== id && p._id !== id))
  }

  const handleEditProperty = (property: any) => {
    setEditingProperty(property)
    setActiveSection("editProperty")
  }

  const handleSaveProperty = (savedProperty: any) => {
    if (savedProperty.id) {
      // Update existing
      setProperties(prev => prev.map(p => p.id === savedProperty.id ? { ...p, ...savedProperty } : p))
    } else {
      // Create new (simulate ID)
      const newProp = { ...savedProperty, id: "prop-" + Date.now().toString() }
      setProperties(prev => [newProp, ...prev])
    }
    setEditingProperty(null)
    setActiveSection("properties")
  }

  const renderContent = () => {
    switch (activeSection) {
      case "addProperty":
        return <OwnerPropertyForm onSave={handleSaveProperty} onCancel={() => setActiveSection("properties")} />
      case "editProperty":
        return <OwnerPropertyForm initialData={editingProperty} onSave={handleSaveProperty} onCancel={() => setActiveSection("properties")} />
      case "furniture":
        return <FurnitureOrderModule initialPropertyId={preSelectedPropertyId} />
      case "requests":
        return <RentalRequestsModule />
      case "messages":
        return <MessagesModule />
      case "profile":
        return <OwnerProfile />
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
                onClick={() => {
                  setEditingProperty(null)
                  setActiveSection("addProperty")
                }}
                className="bg-primary hover:bg-primary/90 text-white gap-2"
              >
                <Plus className="h-4 w-4" />
                {lang === "fr" ? "Ajouter un bien" : "Add Property"}
              </Button>
            </div>
            <OwnerPropertiesGrid 
              properties={properties}
              onManageFurniture={(id) => {
                setPreSelectedPropertyId(id)
                setActiveSection("furniture")
              }}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
            />
          </div>
        )
      default:
        return (
          <main className="p-6">
            <section className="mb-8">
              <SummaryCards />
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
                  onClick={() => {
                    setEditingProperty(null)
                    setActiveSection("addProperty")
                  }}
                  variant="outline" className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {lang === "fr" ? "Ajouter" : "Add"}
                </Button>
              </div>
              <OwnerPropertiesGrid 
                properties={properties.slice(0, 3)} // limit for overview
                onManageFurniture={(id) => {
                  setPreSelectedPropertyId(id)
                  setActiveSection("furniture")
                }}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            </section>
          </main>
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar text-sidebar-foreground">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
              <Home className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ImmoSmart</h1>
              <p className="text-xs text-sidebar-foreground/70">{t("role.owner")}</p>
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
                    if (item.key === "addProperty") setEditingProperty(null)
                    setActiveSection(item.key)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t(item.label)}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-foreground/20 px-1.5 text-xs font-medium">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{user?.name || "Propriétaire"}</p>
                <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
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
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/95 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Monastir, Tunisie</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {lang === "fr" ? "Bienvenue," : "Welcome,"} <span className="font-medium text-foreground">{user?.name}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChatbotOpen(true)}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              AI
            </Button>
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

      {/* AI Chatbot */}
      <AIChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        userRole="owner"
      />
    </div>
  )
}
