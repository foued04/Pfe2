"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { AIChatbot } from "./ai-chatbot"
import { PropertyMap } from "./property-map"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Globe,
  LayoutDashboard,
  Users,
  Home,
  FileText,
  Settings,
  TrendingUp,
  TrendingDown,
  Bot,
  Shield,
  Building,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Map,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mockProperties } from "@/lib/property-data"

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, label: "nav.dashboard" },
  { key: "users", icon: Users, label: "nav.users" },
  { key: "properties", icon: Home, label: "nav.allProperties" },
  { key: "map", icon: Map, label: "nav.map" },
  { key: "reports", icon: FileText, label: "nav.reports" },
  { key: "settings", icon: Settings, label: "nav.settings" },
]

const statsData = [
  {
    label: { fr: "Utilisateurs Totaux", en: "Total Users" },
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600 bg-blue-100",
  },
  {
    label: { fr: "Proprietaires", en: "Owners" },
    value: "423",
    change: "+8.2%",
    trend: "up",
    icon: Building,
    color: "text-primary bg-primary/10",
  },
  {
    label: { fr: "Locataires", en: "Tenants" },
    value: "2,424",
    change: "+15.3%",
    trend: "up",
    icon: UserCheck,
    color: "text-green-600 bg-green-100",
  },
  {
    label: { fr: "Proprietes Monastir", en: "Monastir Properties" },
    value: "1,256",
    change: "+5.1%",
    trend: "up",
    icon: Home,
    color: "text-amber-600 bg-amber-100",
  },
]

const recentActivities = [
  { type: "property", message: { fr: "Nouvelle propriete ajoutee par Mohamed Ben Ali", en: "New property added by Mohamed Ben Ali" }, time: { fr: "Il y a 5 min", en: "5 min ago" }, status: "pending" },
  { type: "user", message: { fr: "Nouvel utilisateur inscrit: Sarra Bouaziz", en: "New user registered: Sarra Bouaziz" }, time: { fr: "Il y a 12 min", en: "12 min ago" }, status: "success" },
  { type: "request", message: { fr: "Demande de location pour Villa Kantaoui", en: "Rental request for Villa Kantaoui" }, time: { fr: "Il y a 25 min", en: "25 min ago" }, status: "pending" },
  { type: "property", message: { fr: "Propriete mise a jour: S+2 Marina", en: "Property updated: S+2 Marina" }, time: { fr: "Il y a 1h", en: "1h ago" }, status: "success" },
  { type: "alert", message: { fr: "Signalement: Annonce suspecte detectee", en: "Report: Suspicious listing detected" }, time: { fr: "Il y a 2h", en: "2h ago" }, status: "warning" },
]

const pendingProperties = mockProperties.slice(0, 4)

export function AdminDashboard() {
  const { t, lang, setLang } = useI18n()
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  const renderContent = () => {
    switch (activeSection) {
      case "map":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                {lang === "fr" ? "Carte de Monastir - Toutes les Proprietes" : "Monastir Map - All Properties"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {lang === "fr" 
                  ? "Vue d'ensemble de toutes les proprietes sur la plateforme" 
                  : "Overview of all properties on the platform"}
              </p>
            </div>
            <PropertyMap 
              properties={mockProperties}
              height="500px"
            />
          </div>
        )
      default:
        return (
          <main className="p-6">
            {/* Stats Cards */}
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat, index) => {
                const Icon = stat.icon
                const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
                return (
                  <Card key={index} className="border-border bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", stat.color)}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 text-sm font-medium",
                          stat.trend === "up" ? "text-green-600" : "text-red-600"
                        )}>
                          <TrendIcon className="h-4 w-4" />
                          {stat.change}
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label[lang as "fr" | "en"]}</p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {lang === "fr" ? "Activite Recente" : "Recent Activity"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentActivities.map((activity, index) => {
                    const statusIcons = {
                      success: CheckCircle,
                      pending: Clock,
                      warning: AlertCircle,
                    }
                    const statusColors = {
                      success: "text-green-600",
                      pending: "text-amber-600",
                      warning: "text-red-600",
                    }
                    const StatusIcon = statusIcons[activity.status as keyof typeof statusIcons]
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 rounded-lg border border-border p-3 bg-secondary/20"
                      >
                        <StatusIcon className={cn("h-5 w-5 mt-0.5", statusColors[activity.status as keyof typeof statusColors])} />
                        <div className="flex-1">
                          <p className="text-sm text-foreground">{activity.message[lang as "fr" | "en"]}</p>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time[lang as "fr" | "en"]}</p>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Pending Properties */}
              <Card className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {lang === "fr" ? "Proprietes en Attente" : "Pending Properties"}
                  </CardTitle>
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                    4 {lang === "fr" ? "en attente" : "pending"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  {pendingProperties.map((property) => (
                    <div
                      key={property.id}
                      className="flex items-center gap-4 rounded-lg border border-border p-3"
                    >
                      <div
                        className="h-16 w-24 rounded-lg bg-cover bg-center"
                        style={{ backgroundImage: `url(${property.images.cover})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground line-clamp-1">{property.title}</h4>
                        <p className="text-sm text-muted-foreground">Monastir - {property.rent} DT/{lang === "fr" ? "mois" : "month"}</p>
                        <p className="text-xs text-muted-foreground">{property.ownerName}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                          {lang === "fr" ? "Approuver" : "Approve"}
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          {lang === "fr" ? "Rejeter" : "Reject"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
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
              <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ImmoSmart</h1>
              <p className="text-xs text-sidebar-foreground/70">{t("role.admin")}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{t(item.label)}</span>
                </button>
              )
            })}
          </nav>

          {/* Admin Info & Logout */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                <p className="text-xs text-sidebar-foreground/70">{user?.email}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span>{lang === "fr" ? "Deconnexion" : "Logout"}</span>
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
        userRole="admin"
      />
    </div>
  )
}
