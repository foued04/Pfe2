"use client"

import { useState, useRef, useEffect } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { useToast } from "./ui/use-toast"
import { Switch } from "./ui/switch"
import { 
  User, 
  Lock, 
  Camera, 
  Save, 
  FileText, 
  Settings,
  Bell,
  Globe,
  ShieldAlert,
  Clock,
  Users,
  BarChart3,
  PieChart,
  ArrowUpRight,
  TrendingUp,
  Server
} from "lucide-react"
import { Progress } from "./ui/progress"

export function AdminProfile() {
  const { lang, setLang } = useI18n()
  const { user, updateProfile, updatePassword } = useAuth()
  const { toast } = useToast()

  const isFr = lang === "fr"

  // Admin Analytics (Mock)
  const adminStats = {
    totalUsers: 1450,
    userGrowth: 12,
    totalProperties: 482,
    pendingProperties: 15,
    systemHealth: 98,
    activeSessions: 42
  }

  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── States ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    office: "Bureau 402 - Siège ImmoSmart", // Mock
    adminId: "ADM-99-X2J", // Mock
    avatar: user?.avatar || ""
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || ""
      }))
    }
  }, [user])

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setIsLoading(true)
    const result = await updateProfile({
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim()
    })
    
    if (result.success) {
      toast({
        title: lang === "fr" ? "Profil administrateur mis à jour" : "Admin profile updated",
        description: "Vos modifications de session ont été enregistrées.",
      })
    } else {
      toast({
        title: "Erreur",
        description: result.message,
        variant: "destructive"
      })
    }
    setIsLoading(false)
  }

  const handleUpdatePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" })
      return
    }
    setIsLoading(true)
    const result = await updatePassword(securityData.currentPassword, securityData.newPassword)
    if (result.success) {
      toast({ title: "Succès", description: "Votre niveau de sécurité a été renforcé." })
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    }
    setIsLoading(false)
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Admin Specific Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            {lang === "fr" ? "Compte Administrateur" : "Administrator Account"}
          </h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            {lang === "fr" ? "Accès de niveau système - Confidentialité requise" : "System-level access - Confidentiality required"}
          </p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-2 rounded-full font-bold">
          ADMIN v2.0
        </Badge>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-card border border-border/50 p-1 w-full flex flex-wrap h-auto shadow-sm rounded-xl">
          <TabsTrigger value="personal" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <User className="h-4 w-4" />
            <span className="font-semibold">Informations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <Lock className="h-4 w-4" />
            <span className="font-semibold">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <Settings className="h-4 w-4" />
            <span className="font-semibold">Paramètres</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <Activity className="h-4 w-4" />
            <span className="font-semibold">Diagnostic</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <FileText className="h-4 w-4" />
            <span className="font-semibold">Documents</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 shadow-sm border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Avatar Système</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-primary/20 shadow-xl flex items-center justify-center">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Admin" className="w-full h-full object-cover" />
                    ) : (
                      <ShieldAlert className="h-12 w-12 text-primary/40" />
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2 border-dashed">
                  <Camera className="h-4 w-4" />
                  Changer l'image
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Données Administratives</CardTitle>
                <CardDescription>Identificateurs système et contacts professionnels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 font-bold">
                    <Label className="text-muted-foreground uppercase text-[10px]">ID Admin</Label>
                    <Input value={formData.adminId} readOnly className="bg-muted/50 font-mono tracking-tighter" />
                  </div>
                  <div className="space-y-1.5 font-bold">
                    <Label className="text-muted-foreground uppercase text-[10px]">Statut</Label>
                    <div className="h-10 flex items-center px-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 text-sm">
                      Super-Administrateur
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Prénom</Label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Nom</Label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Email Professionnel</Label>
                    <Input value={formData.email} readOnly className="bg-muted/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Bureau / Siège</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input value={formData.office} className="pl-10" onChange={(e) => setFormData({...formData, office: e.target.value})} />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t py-4 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isLoading} className="gap-2 font-black">
                  <Save className="h-4 w-4" />
                  Valider les modifications
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="max-w-xl border-emerald-100 bg-emerald-50/10">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                Protection du Compte Admin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Label>Mot de passe actuel</Label>
                  <Input type="password" placeholder="••••••••" value={securityData.currentPassword} onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} />
               </div>
               <Separator />
               <div className="space-y-2">
                  <Label>Nouveau mot de passe de sécurité</Label>
                  <Input type="password" placeholder="••••••••" value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label>Confirmer nouveau mot de passe</Label>
                  <Input type="password" placeholder="••••••••" value={securityData.confirmPassword} onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} />
               </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUpdatePassword} disabled={isLoading} className="gap-2">
                Renforcer la sécurité
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="max-w-2xl border-border/50">
            <CardHeader>
              <CardTitle>Préférences Système</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-white border border-border shadow-sm rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Alertes Critiques</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Notifier immédiatement en cas d'erreur serveur majeure.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-6 bg-white border border-border shadow-sm rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <LayoutDashboard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold">Mode Analytique par défaut</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Ouvrir les graphiques haute résolution au démarrage.</p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-6">
          <div className="space-y-6">
            
            {/* Platform KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border/50 shadow-none">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <Users className="h-4 w-4 text-primary" />
                    <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[8px] font-bold">+{adminStats.userGrowth}%</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mt-2">{isFr ? "Utilisateurs" : "Users"}</p>
                  <h3 className="text-xl font-black">{adminStats.totalUsers}</h3>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 shadow-none">
                <CardContent className="p-4 flex flex-col gap-1">
                  <Building className="h-4 w-4 text-primary" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mt-2">{isFr ? "Propriétés" : "Properties"}</p>
                  <h3 className="text-xl font-black">{adminStats.totalProperties}</h3>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 shadow-none">
                <CardContent className="p-4 flex flex-col gap-1">
                  <Server className="h-4 w-4 text-emerald-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mt-2">{isFr ? "Santé Système" : "System Health"}</p>
                  <h3 className="text-xl font-black text-emerald-600">{adminStats.systemHealth}%</h3>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50 shadow-none">
                <CardContent className="p-4 flex flex-col gap-1">
                  <Activity className="h-4 w-4 text-amber-500" />
                  <p className="text-[10px] text-muted-foreground uppercase font-bold mt-2">{isFr ? "Sessions Actives" : "Sessions"}</p>
                  <h3 className="text-xl font-black">{adminStats.activeSessions}</h3>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent System Activity */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    {isFr ? "Activité Système" : "System Activity"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {[
                      { action: "Permissions mises à jour", env: "PROD", time: "10m", user: "Admin" },
                      { action: "Backup hebdomadaire", env: "DB", time: "2h", user: "Auto" },
                      { action: "CORS Policy Modifiée", env: "API", time: "5h", user: "Admin" },
                    ].map((log, i) => (
                      <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{log.action}</p>
                            <p className="text-[10px] text-muted-foreground">{log.user} • {log.time}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px] font-bold opacity-70">{log.env}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Critical Alerts */}
              <Card className="border-red-100 bg-red-50/20 shadow-none">
                <CardHeader>
                  <CardTitle className="text-sm font-bold text-red-900 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-red-600" />
                    {isFr ? "Alertes Critiques" : "Critical Alerts"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-red-200 bg-white/60">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="text-[10px] font-black text-red-900 uppercase">Load Balancer</p>
                        <span className="text-[9px] font-bold text-red-600">NOW</span>
                      </div>
                      <p className="text-xs font-bold mt-1">{isFr ? "Pic de trafic détecté" : "Traffic spike detected"}</p>
                      <p className="text-[10px] text-red-800/70 mt-0.5">{isFr ? "Latence augmentée sur /api/properties" : "Increased latency on /api/properties"}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-xs font-bold border-red-200 text-red-700 bg-white hover:bg-red-50 rounded-xl">
                    {isFr ? "Consulter les logs complets" : "View full logs"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Platform Utilization */}
            <Card className="border-border/50 bg-muted/5 shadow-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-primary" />
                    {isFr ? "Utilisation des Ressources" : "Resource Utilization"}
                  </h4>
                  <span className="text-xs font-black text-primary">78%</span>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>{isFr ? "Stockage Cloud" : "Cloud Storage"}</span>
                      <span>850 GB / 1 TB</span>
                    </div>
                    <Progress value={85} className="h-1.5" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span>{isFr ? "Base de données" : "Database"}</span>
                      <span>42% {isFr ? "utilisé" : "used"}</span>
                    </div>
                    <Progress value={42} className="h-1.5" />
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Bibliothèque Administrative</CardTitle>
                <CardDescription>Rapports et documents officiels de la plateforme.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border rounded-2xl bg-card flex flex-col items-center gap-2 hover:border-primary transition-colors cursor-pointer">
                       <FileText className="h-8 w-8 text-primary/60" />
                       <span className="text-[10px] font-bold text-center">Rapport_Mensuel_Mars.pdf</span>
                    </div>
                    <div className="p-4 border rounded-2xl bg-card flex flex-col items-center gap-2 hover:border-primary transition-colors cursor-pointer">
                       <ShieldCheck className="h-8 w-8 text-emerald-600/60" />
                       <span className="text-[10px] font-bold text-center">Politique_Confidentalité_v2.pdf</span>
                    </div>
                 </div>
              </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
