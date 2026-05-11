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
  ShieldCheck,
  HousePlus,
  RotateCcw,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { mockProperties } from "@/lib/property-data"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from "recharts"
import { useToast } from "@/components/ui/use-toast"
import { AdminProfile } from "./admin-profile"
import { AdminPropertiesManagement } from "./admin-properties-management"
import { AdminFurnitureManagement } from "./admin-furniture-management"
import { AdminReports } from "./admin-reports"
import { AdminVerificationModule } from "./admin-verification-module"
import { AdminHousingNeedsPage } from "./dashboard/admin/admin-housing-needs-page"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

const navItems = [
  { key: "dashboard", icon: LayoutDashboard, label: "Tableau de Bord", labelEn: "Dashboard" },
  { key: "users", icon: Users, label: "Utilisateurs", labelEn: "Users" },
  { key: "properties", icon: Building, label: "Gestion des Biens", labelEn: "Property Management" },
  { key: "furniture", icon: Sofa, label: "Mobilier & Équipements", labelEn: "Furniture & Equipment" },
  { key: "map", icon: Map, label: "Carte Interactive", labelEn: "Interactive Map" },
  { key: "verifications", icon: ShieldCheck, label: "Vérifications", labelEn: "Verifications" },
  { key: "housing-needs", icon: HousePlus, label: "Besoins Logement", labelEn: "Housing Needs" },
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
  { name: "Locateurs", value: 423, color: "#158C96" },
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
    label: { fr: "Locateurs", en: "Owners" },
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

export function AdminDashboard({
  initialSection = "dashboard",
  standaloneLayout = true,
}: {
  initialSection?: string
  standaloneLayout?: boolean
}) {
  const { t, lang, setLang } = useI18n()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const [activeSection, setActiveSection] = useState(initialSection)
  const [users, setUsers] = useState<any[]>([])
  const [userFilters, setUserFilters] = useState({ search: "", role: "owner", status: "all" })

  useEffect(() => {
    setActiveSection(initialSection)
  }, [initialSection])
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
  const [pendingFurniture, setPendingFurniture] = useState<any[]>([])
  const [recentHousingNeeds, setRecentHousingNeeds] = useState<any[]>([])

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
          label: { fr: "Locateurs", en: "Owners" },
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
      
      const furnitureResp = await fetch(`${API_URL}/furniture`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      if (furnitureResp.ok) {
        const furnData = await furnitureResp.json()
        setPendingFurniture(furnData.filter((i: any) => i.status === "pending"))
      }

      const housingResp = await fetch(`${API_URL}/housing-needs/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      })
      if (housingResp.ok) {
        const housingData = await housingResp.json()
        setRecentHousingNeeds(housingData.slice(0, 5))
      }
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
    if (activeSection === "dashboard" || activeSection === "users") {
      fetchDashboardStats()
    }
    fetchPendingVerificationsCount()
    const interval = setInterval(() => {
      fetchPendingVerificationsCount()
      if (activeSection === "dashboard") fetchDashboardStats()
    }, 30000)
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

  const handleDeleteUser = async (userId: string) => {
    if (!userId) return
    
    const confirmation = window.confirm(
      "ATTENTION: Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT cet utilisateur ?\n\n" +
      "Cette action est irréversible et supprimera TOUTES les données associées :\n" +
      "- Propriétés et annonces\n" +
      "- Demandes de location et contrats\n" +
      "- Messages et conversations\n" +
      "- Notifications et alertes\n\n" +
      "L'utilisateur perdra tout accès immédiatement. Voulez-vous continuer ?"
    )

    if (!confirmation) return
    
    setUpdatingUserId(userId)
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Erreur de suppression",
          description: data?.message || "Une erreur est survenue lors de la suppression de l'utilisateur."
        })
        return
      }

      setUsers((prev) => prev.filter((user) => user._id !== userId))
      
      toast({
        title: "Utilisateur supprimé",
        description: "Le compte et toutes ses données associées ont été effacés définitivement.",
      })

      fetchDashboardStats()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        variant: "destructive",
        title: "Erreur de connexion",
        description: "Impossible de joindre le serveur pour effectuer la suppression."
      })
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Gestion des utilisateurs</h1>
                <p className="text-muted-foreground font-medium">Consultez et gérez tous les comptes de la plateforme par catégorie</p>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Rechercher par nom, email..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-card border-none shadow-sm text-sm focus:ring-2 focus:ring-primary/20"
                  value={userFilters.search}
                  onChange={(e) => setUserFilters({ ...userFilters, search: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { label: "Total Utilisateurs", value: statsData[0]?.value || "0", icon: Users, color: "text-primary bg-primary/10" },
                { label: "Locateurs", value: statsData[1]?.value || "0", icon: Building, color: "text-primary bg-primary/10" },
                { label: "Locataires", value: statsData[2]?.value || "0", icon: UserCheck, color: "text-emerald-600 bg-emerald-50" },
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

            {/* Tabs for Role Separation */}
            <Tabs 
              value={userFilters.role} 
              onValueChange={(value) => setUserFilters({ ...userFilters, role: value })}
              className="w-full space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <TabsList className="bg-muted/50 p-1 rounded-2xl h-auto w-fit border border-border/50">
                  <TabsTrigger 
                    value="owner" 
                    className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all"
                  >
                    <Building className="w-4 h-4 mr-2" />
                    Locateurs
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tenant" 
                    className="rounded-xl px-6 py-2.5 data-[state=active]:bg-primary data-[state=active]:text-white font-bold transition-all"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Locataires
                  </TabsTrigger>
                </TabsList>

                <Button 
                  onClick={fetchUsers} 
                  disabled={isUserLoading} 
                  variant="outline" 
                  className="rounded-xl px-6 font-bold border-primary/20 text-primary hover:bg-primary/5"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {isUserLoading ? "Mise à jour..." : "Actualiser la liste"}
                </Button>
              </div>

              {/* Role Sections Content */}
              <TabsContent value="owner" className="mt-0 outline-none">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-foreground">Locateurs ({owners.length})</h2>
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
                           <Button
                             onClick={() => handleDeleteUser(user._id)}
                             disabled={updatingUserId === user._id}
                             variant="outline"
                             size="sm"
                             className="rounded-xl border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600"
                           >
                             {updatingUserId === user._id ? "..." : <Trash2 className="w-4 h-4" />}
                           </Button>
                        </div>
                      </Card>
                    ))}
                    {owners.length === 0 && <p className="text-muted-foreground italic col-span-full">Aucun propriétaire trouvé.</p>}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="tenant" className="mt-0 outline-none">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1.5 bg-primary rounded-full" />
                    <h2 className="text-xl font-black text-foreground">Locataires enregistrés ({tenants.length})</h2>
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
              </TabsContent>

              <TabsContent value="admin" className="mt-0 outline-none">
                {/* Section Administrateur supprimée selon la demande */}
              </TabsContent>
            </Tabs>
          </div>
        )
      case "properties":
        return <AdminPropertiesManagement />
      case "furniture":
        return <AdminFurnitureManagement />
      case "rapports":
      case "reports":
        return <AdminReports />
      case "verifications":
        return <AdminVerificationModule />
      case "housing-needs":
        return <AdminHousingNeedsPage />
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
            <div className="rounded-[2rem] border border-slate-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_100%)] p-7 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Tableau de bord administrateur</h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground">Suivez les indicateurs essentiels, les activites recentes et les annonces a moderer depuis une vue d&apos;ensemble plus claire.</p>
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
              <Card 
                onClick={() => setActiveSection("furniture")}
                className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] cursor-pointer hover:border-primary/30 transition-all group"
              >
                <CardHeader className="px-0 pt-0 mb-8 border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-primary group-hover:text-primary/80">Suggestions Mobilier</CardTitle>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Nouvelles propositions des propriétaires</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-600 border-none font-black px-3 py-1 rounded-full text-[11px] animate-pulse">
                      {pendingFurniture.length} À VALIDER
                    </Badge>
                </CardHeader>
                <div className="space-y-8 relative before:absolute before:left-[21px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/40">
                  {pendingFurniture.length === 0 ? (
                    <div className="text-center py-10 opacity-30 italic font-medium">Aucune suggestion en attente</div>
                  ) : (
                    pendingFurniture.map((activity, index) => {
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
                    const status = (activity.status as any) || "pending"
                    const StatusIcon = (statusIcons as any)[status] || Clock
                    return (
                      <div key={index} className="flex items-start gap-6 relative z-10 transition-transform hover:translate-x-1 duration-300">
                        <div className={cn("p-2 rounded-full border-2 border-white shadow-md", (statusColors as any)[status] || statusColors.pending)}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-foreground leading-snug">{activity.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="secondary" className="px-2 py-0 h-4 text-[9px] font-black uppercase tracking-tighter rounded-sm">
                              {activity.category}
                            </Badge>
                            <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{activity.requesterName || "Locateur"}</p>
                          </div>
                        </div>
                      </div>
                    )
                  }))}
                </div>
              </Card>

              {/* Recent Housing Needs */}
              <Card 
                onClick={() => setActiveSection("housing-needs")}
                className="rounded-[2rem] border border-slate-200/70 bg-white/95 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] cursor-pointer hover:border-primary/30 transition-all group lg:col-span-2"
              >
                <CardHeader className="px-0 pt-0 mb-8 border-b border-border/50 pb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-primary group-hover:text-primary/80">Nouveaux Besoins Logement</CardTitle>
                      <p className="text-xs text-muted-foreground font-bold mt-1">Dernières demandes soumises par les locataires</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-1 rounded-full text-[11px]">
                      {recentHousingNeeds.length} RÉCENTS
                    </Badge>
                </CardHeader>
                <div className="grid gap-4 sm:grid-cols-2">
                  {recentHousingNeeds.length === 0 ? (
                    <div className="text-center py-10 opacity-30 italic font-medium col-span-full">Aucune demande récente</div>
                  ) : (
                    recentHousingNeeds.map((need, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {need.tenant?.fullName?.[0] || "L"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate">{need.tenant?.fullName}</p>
                          <p className="text-xs text-muted-foreground truncate">{need.desiredCity} ({need.department})</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-primary">{need.maxBudget || '---'} TND</p>
                          <p className="text-[9px] text-muted-foreground">{new Date(need.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </main>
        )
    }
  }

  if (!standaloneLayout) {
    return <>{renderContent()}</>
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-[linear-gradient(180deg,#1d3f96_0%,#214db7_48%,#1f46a8_100%)] text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 border-b border-white/12 px-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">ImmoSmart</h1>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/70">{t("role.admin")}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1.5 p-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm transition-all duration-300",
                    isActive
                      ? "bg-white text-blue-700 shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
                      : "text-white/82 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{lang === "fr" ? item.label : item.labelEn}</span>
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
          <div className="border-t border-white/12 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/12 bg-white/10 p-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/18 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                <p className="text-xs text-white/72">{user?.email}</p>
              </div>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/85 transition-all duration-200 hover:bg-red-500/20 hover:text-red-100"
            >
              <LogOut className="h-5 w-5" />
              <span>{lang === "fr" ? "Deconnexion" : "Logout"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64 bg-slate-50/50 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/60 bg-white/88 px-8 py-4 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-500">Monastir, Tunisie</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm md:block">
              {lang === "fr" ? "Bienvenue," : "Welcome,"} <span className="font-medium text-slate-800">{user?.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLang(lang === "fr" ? "en" : "fr")}
              className="gap-2 rounded-full border-slate-200 bg-white px-4 shadow-sm"
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
