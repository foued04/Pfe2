"use client"

import { useState, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
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
  Shield,
  Building,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Map,
  MapPin,
  MessageSquare,
  Activity,
  Star,
  Search,
  Phone,
  Sofa,
  Package,
  Layers,
  Check,
  X,
  Eye,
  MoreVertical,
  User,
  BookOpen,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mockProperties } from "@/lib/property-data"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts"
import { AdminProfile } from "./admin-profile"
import { AdminPropertiesManagement } from "./admin-properties-management"
import { AdminFurnitureManagement } from "./admin-furniture-management"
import { AdminReports } from "./admin-reports"
import { AdminVerificationModule } from "./admin-verification-module"

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, label: "Tableau de Bord", labelEn: "Dashboard" },
  { key: "users", icon: Users, label: "Utilisateurs", labelEn: "Users" },
  { key: "properties", icon: Building, label: "Gestion des Biens", labelEn: "Property Management" },
  { key: "furniture", icon: Sofa, label: "Mobilier & Équipements", labelEn: "Furniture & Equipment" },
  { key: "map", icon: Map, label: "Carte Interactive", labelEn: "Interactive Map" },
  { key: "verifications", icon: ShieldCheck, label: "Vérifications", labelEn: "Verifications" },
  { key: "reports", icon: TrendingUp, label: "Rapports & Stats", labelEn: "Reports & Analytics" },
  { key: "settings", icon: Settings, label: "Paramètres", labelEn: "Settings" },
]

const initialUserGrowthData = [
  { month: "Oct", users: 1500, properties: 400 },
  { month: "Nov", users: 1800, properties: 480 },
  { month: "Dec", users: 2100, properties: 600 },
  { month: "Jan", users: 2400, properties: 750 },
  { month: "Feb", users: 2600, properties: 920 },
  { month: "Mar", users: 2847, properties: 1256 },
]

const initialPropertyTypeData = [
  { name: "Appartement", value: 450, color: "#2EC4C7" },
  { name: "Villa", value: 150, color: "#F27D72" },
  { name: "Studio", value: 300, color: "#63D8DA" },
  { name: "Local", value: 100, color: "#158C96" },
]

const initialUserRoleData = [
  { name: "Propriétaires", value: 423, color: "#158C96" },
  { name: "Locataires", value: 2424, color: "#2EC4C7" },
]


const initialStatsData = [
  {
    label: { fr: "Utilisateurs Totaux", en: "Total Users" },
    value: "2,847",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-orange-600 bg-orange-100",
  },
  {
    label: { fr: "Propriétaires", en: "Owners" },
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
    color: "text-emerald-600 bg-emerald-100",
  },
  {
    label: { fr: "Propriétés", en: "Properties" },
    value: "1,256",
    change: "+5.1%",
    trend: "up",
    icon: Home,
    color: "text-orange-500 bg-orange-50",
  },
]

const recentActivities = [
  { type: "property", message: { fr: "Nouvelle propriete ajoutee par Mohamed Ben Ali", en: "New property added by Mohamed Ben Ali" }, time: { fr: "Il y a 5 min", en: "5 min ago" }, status: "pending" },
  { type: "user", message: { fr: "Nouvel utilisateur inscrit: Sarra Bouaziz", en: "New user registered: Sarra Bouaziz" }, time: { fr: "Il y a 12 min", en: "12 min ago" }, status: "success" },
  { type: "request", message: { fr: "Demande de location pour Villa Kantaoui", en: "Rental request for Villa Kantaoui" }, time: { fr: "Il y a 25 min", en: "25 min ago" }, status: "pending" },
  { type: "property", message: { fr: "Propriete mise a jour: S+2 Marina", en: "Property updated: S+2 Marina" }, time: { fr: "Il y a 1h", en: "1h ago" }, status: "success" },
  { type: "alert", message: { fr: "Signalement: Annonce suspecte detectee", en: "Report: Suspicious listing detected" }, time: { fr: "Il y a 2h", en: "2h ago" }, status: "warning" },
]

const initialPendingProperties = mockProperties.slice(0, 4)

export function AdminDashboard() {
  const { t, lang, setLang } = useI18n()
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [users, setUsers] = useState<any[]>([])
  const [userFilters, setUserFilters] = useState({ search: "", role: "all", status: "all" })
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [statsData, setStatsData] = useState(initialStatsData)
  const [userGrowthData, setUserGrowthData] = useState(initialUserGrowthData)
  const [propertyTypeData, setPropertyTypeData] = useState(initialPropertyTypeData)
  const [userRoleData, setUserRoleData] = useState(initialUserRoleData)
  const [pendingProperties, setPendingProperties] = useState(initialPendingProperties)
  const [isStatsLoading, setIsStatsLoading] = useState(false)
  const [moderatingPropertyId, setModeratingPropertyId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const fetchDashboardStats = async () => {
    setIsStatsLoading(true)
    try {
      const response = await fetch(`${API_URL}/users/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (!response.ok) return

      const data = await response.json()

      setStatsData([
        {
          label: { fr: "Utilisateurs Totaux", en: "Total Users" },
          value: (data.totals?.totalUsers || 0).toLocaleString("fr-FR"),
          change: `${data.totals?.occupancyRate || 0}%`,
          trend: "up",
          icon: Users,
          color: "text-orange-600 bg-orange-100",
        },
        {
          label: { fr: "Propriétaires", en: "Owners" },
          value: (data.totals?.owners || 0).toLocaleString("fr-FR"),
          change: `${data.totals?.availableProperties || 0}`,
          trend: "up",
          icon: Building,
          color: "text-primary bg-primary/10",
        },
        {
          label: { fr: "Locataires", en: "Tenants" },
          value: (data.totals?.tenants || 0).toLocaleString("fr-FR"),
          change: `${data.totals?.requestsThisWeek || 0}`,
          trend: "up",
          icon: UserCheck,
          color: "text-emerald-600 bg-emerald-100",
        },
        {
          label: { fr: "Propriétés", en: "Properties" },
          value: (data.totals?.totalProperties || 0).toLocaleString("fr-FR"),
          change: `${data.totals?.rentedProperties || 0}`,
          trend: "up",
          icon: Home,
          color: "text-orange-500 bg-orange-50",
        },
      ])

      setUserGrowthData(data.growth || [])
      setPropertyTypeData(data.propertyTypeData || [])
      setUserRoleData(data.userRoleData || [])
      setPendingProperties(data.pendingProperties || [])
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsStatsLoading(false)
    }
  }

  const fetchUsers = async () => {
    setIsUserLoading(true)
    try {
      const response = await fetch(`${API_URL}/users?role=${userFilters.role}&search=${userFilters.search}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsUserLoading(false)
    }
  }

  useEffect(() => {
    if (activeSection === "users") {
      fetchUsers()
    }
  }, [activeSection, userFilters.role, userFilters.search])

  const fetchPendingVerificationsCount = async () => {
    try {
      const response = await fetch(`${API_URL}/verifications/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPendingVerificationsCount(data.length)
      }
    } catch (error) {
      console.error("Error fetching verifications count:", error)
    }
  }

  useEffect(() => {
    if (activeSection === "dashboard") {
      fetchDashboardStats()
    }
    fetchPendingVerificationsCount()
    const interval = setInterval(fetchPendingVerificationsCount, 30000)
    return () => clearInterval(interval)
  }, [activeSection])

  const handleModerateProperty = async (propertyId: string, moderationStatus: "approved" | "rejected") => {
    setModeratingPropertyId(propertyId)
    try {
      const response = await fetch(`${API_URL}/properties/${propertyId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ moderationStatus })
      })

      if (!response.ok) {
        const error = await response.json().catch(() => null)
        alert(error?.message || "Erreur lors de la modération.")
        return
      }

      setPendingProperties((prev) => prev.filter((property) => property.id !== propertyId))
      fetchDashboardStats()
    } catch (error) {
      console.error("Error moderating property:", error)
      alert("Erreur de connexion.")
    } finally {
      setModeratingPropertyId(null)
    }
  }

  const handleToggleUserSuspension = async (targetUser: any) => {
    if (!targetUser?._id) return
    setUpdatingUserId(targetUser._id)
    try {
      const response = await fetch(`${API_URL}/users/${targetUser._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ isSuspended: !targetUser.isSuspended })
      })

      const data = await response.json().catch(() => null)
      if (!response.ok) {
        alert(data?.message || "Erreur lors de la mise a jour du compte.")
        return
      }

      setUsers((prev) => prev.map((user) => user._id === targetUser._id ? data : user))
      setSelectedUser((prev: any) => prev && prev._id === targetUser._id ? data : prev)
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Erreur de connexion.")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const owners = users.filter(u => u.role === 'owner')
  const tenants = users.filter(u => u.role === 'tenant')
  const admins = users.filter(u => u.role === 'admin')

  const renderContent = () => {
    switch (activeSection) {
      case "map":
        return (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                {lang === "fr" ? "Carte de Monastir - Toutes les Propriétés" : "Monastir Map - All Properties"}
              </h2>
              <p className="text-muted-foreground mt-1">
                {lang === "fr" 
                  ? "Vue d'ensemble de toutes les propriétés sur la plateforme" 
                  : "Overview of all properties on the platform"}
              </p>
            </div>
            <PropertyMap 
              properties={mockProperties}
              height="500px"
            />
          </div>
        )
      case "users":
        return (
          <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des utilisateurs</h1>
              <p className="text-muted-foreground font-medium">Consultez et gérez tous les comptes de la plateforme</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: "Total Utilisateurs", value: users.length, icon: Users, color: "text-primary bg-primary/10" },
                { label: "Propriétaires", value: owners.length, icon: Building, color: "text-primary bg-primary/10" },
                { label: "Locataires", value: tenants.length, icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-lg bg-card p-6 flex items-center gap-5">
                   <div className={cn("p-4 rounded-2xl", stat.color)}>
                     <stat.icon className="w-6 h-6" />
                   </div>
                   <div>
                     <p className="text-2xl font-black text-foreground">{stat.value}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">{stat.label}</p>
                   </div>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="border-none shadow-lg bg-card p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom, email, téléphone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted/50 border-none text-sm focus:ring-2 focus:ring-primary/20"
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select 
                  className="bg-muted/50 border-none rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground"
                  value={userFilters.role}
                  onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                >
                  <option value="all">Tous les rôles</option>
                  <option value="owner">Propriétaires</option>
                  <option value="tenant">Locataires</option>
                  <option value="admin">Administrateurs</option>
                </select>
                <Button onClick={fetchUsers} disabled={isUserLoading} variant="default" className="rounded-xl px-6">
                  {isUserLoading ? "..." : "Actualiser"}
                </Button>
              </div>
            </Card>

            {/* Role Sections */}
            <div className="space-y-12">
              {/* Owners Section */}
              {(userFilters.role === "all" || userFilters.role === "owner") && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-foreground">Propriétaires ({owners.length})</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {owners.map((user) => (
                      <Card key={user._id} className="border-none shadow-xl bg-card p-6 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                              {user.fullName[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-black text-foreground text-base tracking-tight">{user.fullName}</h3>
                              <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px]">OWNER</Badge>
                            {user.isSuspended && (
                              <Badge className="bg-red-100 text-red-600 border-none font-bold text-[10px]">SUSPENDU</Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 mb-6">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                             <Phone className="w-3.5 h-3.5 text-primary" /> {user.phone || "Non renseigné"}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                             <MapPin className="w-3.5 h-3.5 text-primary" /> {user.address || "Monastir, Tunisie"}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                             <Home className="w-3.5 h-3.5 text-primary" /> {user.propertyCount || 0} biens possédés
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <Button onClick={() => setSelectedUser(user)} variant="outline" size="sm" className="flex-1 rounded-xl text-[10px] font-black uppercase">Details</Button>
                           <Button
                             onClick={() => handleToggleUserSuspension(user)}
                             disabled={updatingUserId === user._id}
                             variant="outline"
                             size="sm"
                             className={cn(
                               "flex-1 rounded-xl text-[10px] font-black uppercase",
                               user.isSuspended
                                 ? "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                 : "border-red-100 text-red-500 hover:bg-red-50"
                             )}
                           >
                             {updatingUserId === user._id ? "..." : user.isSuspended ? "Reactiver" : "Suspendre"}
                           </Button>
                        </div>
                      </Card>
                    ))}
                    {owners.length === 0 && <p className="text-muted-foreground italic col-span-full">Aucun propriétaire trouvé.</p>}
                  </div>
                </div>
              )}

              {/* Tenants Section */}
              {(userFilters.role === "all" || userFilters.role === "tenant") && (
                <div className="space-y-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-foreground">Locataires ({tenants.length})</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {tenants.map((user) => (
                      <Card key={user._id} className="border-none shadow-xl bg-card p-6 group hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                              {user.fullName[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-black text-foreground text-base tracking-tight">{user.fullName}</h3>
                              <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className="bg-emerald-100 text-emerald-600 border-none font-bold text-[10px]">TENANT</Badge>
                            {user.isSuspended && (
                              <Badge className="bg-red-100 text-red-600 border-none font-bold text-[10px]">SUSPENDU</Badge>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2 mb-6">
                           <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                             <Phone className="w-3.5 h-3.5 text-primary" /> {user.phone || "Non renseigné"}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                             <MapPin className="w-3.5 h-3.5 text-primary" /> {user.address || " Tunisie"}
                           </div>
                           <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                             <FileText className="w-3.5 h-3.5 text-primary" /> {user.requestCount || 0} demandes émises
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <Button onClick={() => setSelectedUser(user)} variant="outline" size="sm" className="flex-1 rounded-xl text-[10px] font-black uppercase">Details</Button>
                           <Button
                             onClick={() => handleToggleUserSuspension(user)}
                             disabled={updatingUserId === user._id}
                             variant="outline"
                             size="sm"
                             className={cn(
                               "flex-1 rounded-xl text-[10px] font-black uppercase",
                               user.isSuspended
                                 ? "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                 : "border-red-100 text-red-500 hover:bg-red-50"
                             )}
                           >
                             {updatingUserId === user._id ? "..." : user.isSuspended ? "Reactiver" : "Suspendre"}
                           </Button>
                        </div>
                      </Card>
                    ))}
                    {tenants.length === 0 && <p className="text-muted-foreground italic col-span-full">Aucun locataire trouvé.</p>}
                  </div>
                </div>
              )}

              {/* Admins Section */}
              {(userFilters.role === "all" || userFilters.role === "admin") && admins.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-gray-800 rounded-full" />
                    <h2 className="text-xl font-black text-foreground">Administrateurs ({admins.length})</h2>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {admins.map((user) => (
                      <Card key={user._id} className="border-none shadow-xl bg-card p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                              {user.fullName[0].toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-black text-foreground text-base tracking-tight">{user.fullName}</h3>
                              <p className="text-xs text-muted-foreground font-medium">{user.email}</p>
                            </div>
                          </div>
                          <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px]">ADMIN</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      case "properties":
        return <AdminPropertiesManagement />
      case "furniture":
        return <AdminFurnitureManagement />
      case "rapports":
        return <AdminReportsModule />
      case "verifications":
        return <AdminVerificationModule />
      case "profil":
        return (
          <main className="p-8 space-y-8 animate-in fade-in duration-700">
            <AdminProfile />
          </main>
        )
      default:
        return (
          <main className="p-8 space-y-8 animate-in fade-in duration-700">
            {/* Header / Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Tableau de bord de performance</h1>
                <p className="text-muted-foreground font-medium">Vue d&apos;ensemble analytique de la plateforme ImmoSmart</p>
              </div>
              <div className="flex items-center gap-3">
                 <Badge variant="outline" className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 font-bold">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                   Système en ligne
                 </Badge>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {statsData.map((stat, index) => {
                const Icon = stat.icon
                const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown
                return (
                  <Card key={index} className="border-none shadow-lg shadow-black/5 bg-card overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6 relative">
                      <div className="flex items-center justify-between relative z-10">
                        <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner", stat.color)}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <div className={cn(
                          "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black",
                          stat.trend === "up" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                        )}>
                          <TrendIcon className="h-3.5 w-3.5" />
                          {stat.change}
                        </div>
                      </div>
                      <div className="mt-5 relative z-10">
                        <p className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</p>
                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground opacity-60 mt-1">{stat.label[lang as "fr" | "en"]}</p>
                      </div>
                      {/* Decorative Background Icon */}
                      <Icon className="absolute -bottom-4 -right-4 h-24 w-24 text-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Charts Section */}
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Main Growth Chart */}
              <Card className="lg:col-span-2 border-none shadow-xl bg-card p-6">
                <CardHeader className="px-0 pt-0 pb-10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-primary">Croissance Utilisateurs & Biens</CardTitle>
                    <p className="text-xs text-muted-foreground font-bold mt-1">Évolution sur les 6 derniers mois</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-[10px] font-bold uppercase">Utilisateurs</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /><span className="text-[10px] font-bold uppercase">Propriétés</span></div>
                  </div>
                </CardHeader>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2EC4C7" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2EC4C7" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F27D72" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#F27D72" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill:'#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 700, fill:'#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border:'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '16px' }}
                        labelStyle={{ fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}
                      />
                      <Area type="monotone" dataKey="users" stroke="#2EC4C7" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
                      <Area type="monotone" dataKey="properties" stroke="#F27D72" strokeWidth={4} fillOpacity={1} fill="url(#colorProps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Distribution Chart */}
              <Card className="border-none shadow-xl bg-card p-6">
                <CardHeader className="px-0 pt-0 pb-10">
                  <CardTitle className="text-xl font-black text-primary uppercase tracking-tight">Répartition Immobilière</CardTitle>
                  <p className="text-xs text-muted-foreground font-bold mt-1">Par type de bien</p>
                </CardHeader>
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypeData}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {propertyTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ borderRadius: '16px', border:'none', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
                    <span className="text-3xl font-black text-foreground">{(statsData[3]?.value || "0")}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
                  </div>
                </div>
                <div className="mt-8 space-y-3">
                  {propertyTypeData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-bold text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-xs font-black text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              {/* Recent Activity Timeline */}
              <Card className="border-none shadow-xl bg-card p-8">
                <CardHeader className="px-0 pt-0 mb-8 border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-primary">Journal d&apos;activité</CardTitle>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Suivi en temps réel des actions système</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase">Tout voir</Button>
                  </div>
                </CardHeader>
                <div className="space-y-8 relative before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
                  {recentActivities.map((activity, index) => {
                    const statusIcons = {
                      success: CheckCircle,
                      pending: Clock,
                      warning: AlertCircle,
                    }
                    const statusColors = {
                      success: "bg-emerald-100 text-emerald-600 border-emerald-200",
                      pending: "bg-orange-100 text-orange-600 border-orange-200",
                      warning: "bg-red-100 text-red-600 border-red-200",
                    }
                    const StatusIcon = statusIcons[activity.status as keyof typeof statusIcons]
                    return (
                      <div key={index} className="flex items-start gap-6 relative z-10 transition-transform hover:translate-x-1 duration-300">
                        <div className={cn("p-2 rounded-full border-2 border-white shadow-md", statusColors[activity.status as keyof typeof statusColors])}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-foreground leading-snug">{activity.message[lang as "fr" | "en"]}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="secondary" className="px-2 py-0 h-4 text-[9px] font-black uppercase tracking-tighter rounded-sm">
                              {activity.type}
                            </Badge>
                            <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{activity.time[lang as "fr" | "en"]}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Pending Properties Table */}
              <Card className="border-none shadow-xl bg-card p-8">
                <CardHeader className="px-0 pt-0 mb-8 border-b border-border/50 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-primary">Biens en attente</CardTitle>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Modération des annonces prioritaires</p>
                    </div>
                    <Badge className="bg-orange-500 text-white border-none font-black px-3 py-1 rounded-full text-[11px] animate-pulse">
                      {pendingProperties.length} À TRAITER
                    </Badge>
                  </div>
                </CardHeader>
                <div className="space-y-5">
                  {pendingProperties.map((property) => (
                    <div
                      key={property.id}
                      className="group flex items-center gap-5 p-4 rounded-3xl border border-border/30 hover:border-primary/30 hover:bg-muted/5 transition-all duration-300"
                    >
                      <div
                        className="h-20 w-28 flex-shrink-0 rounded-2xl bg-cover bg-center shadow-lg group-hover:scale-105 transition-transform duration-500"
                        style={{ backgroundImage: property.images?.cover ? `url(${property.images.cover})` : undefined }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-foreground text-sm line-clamp-1 mb-1 tracking-tight">{property.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                           <Badge variant="outline" className="text-[9px] font-black uppercase rounded-sm border-primary/20 text-primary">
                             {property.rent} DT
                           </Badge>
                           <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{property.ownerName}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={moderatingPropertyId === property.id}
                            onClick={() => handleModerateProperty(property.id, "approved")}
                            className="h-8 flex-1 rounded-xl bg-emerald-50 text-emerald-700 border-emerald-200 border-2 font-black text-[10px] uppercase tracking-tighter hover:bg-emerald-100 disabled:opacity-60"
                          >
                             {moderatingPropertyId === property.id ? "..." : "Approuver"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={moderatingPropertyId === property.id}
                            onClick={() => handleModerateProperty(property.id, "rejected")}
                            className="h-8 flex-1 rounded-xl bg-red-50 text-red-600 border-red-200 border-2 font-black text-[10px] uppercase tracking-tighter hover:bg-red-100 disabled:opacity-60"
                          >
                             {moderatingPropertyId === property.id ? "..." : "Rejeter"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingProperties.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-border/40 bg-muted/10 px-6 py-10 text-center">
                      <p className="text-sm font-black text-foreground">Aucun bien en attente</p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        Toutes les annonces ont deja ete moderees.
                      </p>
                    </div>
                  )}
                  <Button variant="ghost" className="w-full h-12 rounded-2xl font-black text-[11px] uppercase tracking-widest text-muted-foreground/60 border-2 border-dashed border-border/40 hover:bg-muted/30">
                    Gérer tout le catalogue
                  </Button>
                </div>
              </Card>
            </div>

            {/* Diagnostic Summary Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                 {[
                 { label: "Taux d'occupation", value: `${statsData[0]?.change || "0%"}`, icon: TrendingUp, color: "text-emerald-600" },
                 { label: "Demandes / Semaine", value: `${statsData[2]?.change || "0"}`, icon: MessageSquare, color: "text-primary" },
                 { label: "Biens loués", value: `${statsData[3]?.change || "0"}`, icon: Activity, color: "text-orange-500" },
                 { label: "Propriétés actives", value: `${statsData[3]?.value || "0"}`, icon: Star, color: "text-orange-400" },
               ].map((item, i) => (
                 <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/30 rounded-3xl p-5 flex items-center gap-4 transition-all hover:bg-card">
                   <div className={cn("p-3 rounded-2xl bg-background shadow-inner", item.color)}>
                     <item.icon className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="text-xl font-black text-foreground leading-none">{item.value}</p>
                     <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-50">{item.label}</p>
                   </div>
                 </div>
               ))}
            </div>
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
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ImmoSmart</h1>
              <p className="text-xs text-white/80">{t("role.admin")}</p>
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
                      ? "bg-[#3b82f6] text-white shadow-md"
                      : "text-white/85 hover:bg-white/15 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{lang === "fr" ? item.label : item.labelEn}</span>
                  {item.key === "verifications" && pendingVerificationsCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-black text-white shadow-lg animate-bounce-short">
                      {pendingVerificationsCount}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Admin Info & Logout */}
          <div className="border-t border-white/20 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-lg bg-white/10 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                <p className="text-xs text-white/80">{user?.email}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white/85 hover:bg-red-500/20 hover:text-red-100 transition-all duration-200"
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

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-lg border-none shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-primary">
                    {selectedUser.role === "owner" ? "Proprietaire" : selectedUser.role === "tenant" ? "Locataire" : "Administrateur"}
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-foreground">{selectedUser.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedUser(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Telephone</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{selectedUser.phone || "Non renseigne"}</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adresse</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{selectedUser.address || "Non renseignee"}</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification email</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{selectedUser.isEmailVerified ? "Verifie" : "Non verifie"}</p>
                </div>
                <div className="rounded-2xl bg-muted/40 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Statut du compte</p>
                  <p className="mt-2 text-sm font-bold text-foreground">{selectedUser.isSuspended ? "Suspendu" : "Actif"}</p>
                </div>
                {selectedUser.role === "owner" && (
                  <div className="rounded-2xl bg-muted/40 p-4 sm:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Biens possedes</p>
                    <p className="mt-2 text-sm font-bold text-foreground">{selectedUser.propertyCount || 0}</p>
                  </div>
                )}
                {selectedUser.role === "tenant" && (
                  <div className="rounded-2xl bg-muted/40 p-4 sm:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Demandes emises</p>
                    <p className="mt-2 text-sm font-bold text-foreground">{selectedUser.requestCount || 0}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                {selectedUser.role !== "admin" && (
                  <Button
                    onClick={() => handleToggleUserSuspension(selectedUser)}
                    disabled={updatingUserId === selectedUser._id}
                    variant="outline"
                    className={cn(
                      "flex-1 rounded-xl font-black uppercase",
                      selectedUser.isSuspended
                        ? "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        : "border-red-200 text-red-500 hover:bg-red-50"
                    )}
                  >
                    {updatingUserId === selectedUser._id ? "..." : selectedUser.isSuspended ? "Reactiver le compte" : "Suspendre le compte"}
                  </Button>
                )}
                <Button variant="ghost" className="flex-1 rounded-xl font-black uppercase" onClick={() => setSelectedUser(null)}>
                  Fermer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  )
}
