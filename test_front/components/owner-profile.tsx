"use client"

import { useState, useRef } from "react"
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
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Camera, 
  Save, 
  FileText, 
  Settings,
  Bell,
  Globe,
  Upload,
  Trash2,
  Activity,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  Image as ImageIcon,
  Building2,
  DollarSign,
  TrendingUp,
  Wrench,
  ShieldCheck
} from "lucide-react"
import { Progress } from "./ui/progress"

export function OwnerProfile() {
  const { lang, setLang } = useI18n()
  const { user, updateProfile, updatePassword } = useAuth()
  const { toast } = useToast()

  const isFr = lang === "fr"

  // Analytics Data (Mock)
  const ownerStats = {
    totalProperties: 12,
    rentedProperties: 8,
    occupancyRate: 66,
    monthlyRevenue: 9800,
  }

  const revenueData = [
    { month: "Jan", amount: 7500 },
    { month: "Fév", amount: 8200 },
    { month: "Mar", amount: 9800 },
    { month: "Avr", amount: 9800 },
    { month: "Mai", amount: 10500 },
    { month: "Juin", amount: 12000 },
  ]

  const [isLoading, setIsLoading] = useState(false)

  // ─── Personal Info State ───────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    avatarUrl: user?.avatar || "",
  })

  // ─── Security State ────────────────────────────────────────────────────
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  })

  // ─── File Upload Ref ───────────────────────────────────────────────────
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── Handlers ──────────────────────────────────────────────────────────

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: lang === "fr" ? "Fichier trop volumineux" : "File too large",
          description: lang === "fr" ? "L'image ne doit pas dépasser 5 Mo." : "Image must not exceed 5 MB.",
          variant: "destructive"
        })
        return
      }
      
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileData(prev => ({ ...prev, avatarUrl: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setProfileData(prev => ({ ...prev, avatarUrl: "" }))
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    
    const result = await updateProfile({
      name: profileData.name,
      phone: profileData.phone,
      address: profileData.address,
      avatar: profileData.avatarUrl
    })
    
    if (result.success) {
      toast({
        title: lang === "fr" ? "Profil mis à jour" : "Profile updated",
        description: lang === "fr" ? "Vos informations personnelles ont été enregistrées avec succès." : "Your personal information has been saved successfully.",
        variant: "default"
      })
    } else {
      toast({
        title: "Erreur",
        description: result.message || "Erreur lors de la mise à jour",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  const handleSavePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description: lang === "fr" ? "Les nouveaux mots de passe ne correspondent pas." : "New passwords do not match.",
        variant: "destructive"
      })
      return
    }

    if (passwords.new.length < 6) {
      toast({
        title: lang === "fr" ? "Mot de passe trop court" : "Password too short",
        description: lang === "fr" ? "Le mot de passe doit contenir au moins 6 caractères." : "Password must contain at least 6 characters.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    const result = await updatePassword(passwords.current, passwords.new)
    
    if (result.success) {
      setPasswords({ current: "", new: "", confirm: "" })
      toast({
        title: lang === "fr" ? "Mot de passe modifié" : "Password changed",
        description: lang === "fr" ? "Votre mot de passe a été mis à jour avec sécurité." : "Your password was securely updated.",
        variant: "default"
      })
    } else {
      toast({
        title: "Erreur",
        description: result.message || "Erreur lors du changement de mot de passe",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            {lang === "fr" ? "Mon Profil" : "My Profile"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {lang === "fr" 
              ? "Gérez vos informations personnelles, votre sécurité et vos paramètres." 
              : "Manage your personal information, security, and settings."}
          </p>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-card border border-border/50 p-1 w-full flex flex-wrap h-auto shadow-sm rounded-xl">
          <TabsTrigger value="personal" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <User className="h-4 w-4" />
            <span className="font-semibold">{lang === "fr" ? "Informations" : "Personal Info"}</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <Lock className="h-4 w-4" />
            <span className="font-semibold">{lang === "fr" ? "Sécurité" : "Security"}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <Settings className="h-4 w-4" />
            <span className="font-semibold">{lang === "fr" ? "Paramètres" : "Settings"}</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <Activity className="h-4 w-4" />
            <span className="font-semibold">{lang === "fr" ? "Diagnostic" : "Diagnostic"}</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex-1 min-w-[120px] gap-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary h-10">
            <FileText className="h-4 w-4" />
            <span className="font-semibold">{lang === "fr" ? "Documents" : "Documents"}</span>
          </TabsTrigger>
        </TabsList>

        {/* ─── PERSONAL INFO ──────────────────────────────────────────────── */}
        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Avatar Card */}
            <Card className="md:col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{lang === "fr" ? "Photo de profil" : "Profile Picture"}</CardTitle>
                <CardDescription>
                  {lang === "fr" ? "Une photo aide les locataires à vous identifier." : "A photo helps tenants identify you."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg flex items-center justify-center relative">
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground/50" />
                    )}
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                         onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  
                  {profileData.avatarUrl && (
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full shadow-sm"
                      onClick={handleRemoveImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 w-full">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {lang === "fr" ? "Télécharger" : "Upload"}
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground">
                    {lang === "fr" ? "JPG, PNG ou GIF. Max 5Mo." : "JPG, PNG or GIF. Max 5MB."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Info Form Card */}
            <Card className="md:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{lang === "fr" ? "Informations Personnelles" : "Personal Details"}</CardTitle>
                <CardDescription>
                  {lang === "fr" ? "Mettez à jour vos informations de contact." : "Update your contact information."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-foreground font-semibold">{lang === "fr" ? "Nom complet" : "Full Name"}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="name" value={profileData.name} onChange={(e) => handleProfileChange("name", e.target.value)} className="pl-9" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-foreground font-semibold">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="email" type="email" value={profileData.email} onChange={(e) => handleProfileChange("email", e.target.value)} className="pl-9" />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="phone" className="text-foreground font-semibold">{lang === "fr" ? "Numéro de téléphone" : "Phone Number"}</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="phone" type="tel" value={profileData.phone} onChange={(e) => handleProfileChange("phone", e.target.value)} className="pl-9" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-foreground font-semibold">{lang === "fr" ? "Adresse" : "Address"}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="address" value={profileData.address} onChange={(e) => handleProfileChange("address", e.target.value)} className="pl-9" />
                    </div>
                  </div>
                </div>

              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isLoading} className="gap-2 shadow-sm font-semibold">
                  <Save className="h-4 w-4" />
                  {lang === "fr" ? "Enregistrer les modifications" : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>

          </div>
        </TabsContent>

        {/* ─── SECURITY ─────────────────────────────────────────────────── */}
        <TabsContent value="security">
          <Card className="max-w-2xl shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{lang === "fr" ? "Sécurité du compte" : "Account Security"}</CardTitle>
              <CardDescription>
                {lang === "fr" ? "Gérez votre mot de passe pour sécuriser votre compte." : "Manage your password to secure your account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current-pw" className="text-foreground font-semibold">{lang === "fr" ? "Mot de passe actuel" : "Current Password"}</Label>
                  <Input 
                    id="current-pw" 
                    type="password" 
                    value={passwords.current} 
                    onChange={(e) => handlePasswordChange("current", e.target.value)} 
                    placeholder="••••••••"
                  />
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-1.5">
                  <Label htmlFor="new-pw" className="text-foreground font-semibold">{lang === "fr" ? "Nouveau mot de passe" : "New Password"}</Label>
                  <Input 
                    id="new-pw" 
                    type="password" 
                    value={passwords.new} 
                    onChange={(e) => handlePasswordChange("new", e.target.value)}
                    placeholder="••••••••" 
                  />
                  <p className="text-[10px] text-muted-foreground">
                    {lang === "fr" ? "Au moins 8 caractères." : "At least 8 characters long."}
                  </p>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pw" className="text-foreground font-semibold">{lang === "fr" ? "Confirmer le nouveau mot de passe" : "Confirm New Password"}</Label>
                  <Input 
                    id="confirm-pw" 
                    type="password" 
                    value={passwords.confirm} 
                    onChange={(e) => handlePasswordChange("confirm", e.target.value)}
                    placeholder="••••••••" 
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
              <Button 
                onClick={handleSavePassword} 
                disabled={isLoading || !passwords.current || !passwords.new} 
                className="gap-2 shadow-sm font-semibold"
              >
                <Lock className="h-4 w-4" />
                {lang === "fr" ? "Modifier le mot de passe" : "Change Password"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ─── SETTINGS ─────────────────────────────────────────────────── */}
        <TabsContent value="settings">
          <Card className="max-w-2xl shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{lang === "fr" ? "Paramètres du compte" : "Account Settings"}</CardTitle>
              <CardDescription>
                {lang === "fr" ? "Configurez vos préférences système et notifications." : "Configure your system preferences and notifications."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Language Settings */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{lang === "fr" ? "Langue de l'interface" : "Interface Language"}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lang === "fr" ? "Choisissez votre langue préférée." : "Choose your preferred language."}
                    </p>
                  </div>
                </div>
                <div className="flex bg-background border border-border rounded-lg overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setLang("fr")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${lang === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    Français
                  </button>
                  <button 
                    onClick={() => setLang("en")}
                    className={`px-3 py-1.5 text-xs font-bold transition-colors ${lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 opacity-70">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-background rounded-lg shadow-sm border border-border/50">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{lang === "fr" ? "Notifications Email" : "Email Notifications"}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lang === "fr" ? "M'alerter lors d'une nouvelle demande (Bientôt disponible)." : "Alert me on new requests (Coming soon)."}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  {lang === "fr" ? "Activé" : "Enabled"}
                </Button>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DIAGNOSTIC / ANALYTIQUE ───────────────────────────────────── */}
        <TabsContent value="diagnostic">
          <div className="space-y-6">
            
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20 shadow-none">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {isFr ? "Total des biens" : "Total Properties"}
                  </p>
                  <h3 className="text-2xl font-black text-foreground">{ownerStats.totalProperties}</h3>
                </CardContent>
              </Card>

              <Card className="bg-emerald-50/50 border-emerald-100 shadow-none">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-medium text-emerald-700/70 uppercase tracking-wider">
                      {isFr ? "Biens loués" : "Rented Properties"}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600">{ownerStats.occupancyRate}%</span>
                  </div>
                  <h3 className="text-2xl font-black text-emerald-700">{ownerStats.rentedProperties}</h3>
                  <Progress value={ownerStats.occupancyRate} className="h-1 bg-emerald-100" />
                </CardContent>
              </Card>

              <Card className="bg-indigo-50/50 border-indigo-100 shadow-none">
                <CardContent className="p-5 flex flex-col gap-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-xs font-medium text-indigo-700/70 uppercase tracking-wider">
                      {isFr ? "Revenu Mensuel" : "Monthly Revenue"}
                    </p>
                    <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[9px] px-1.5 h-4">+12%</Badge>
                  </div>
                  <h3 className="text-2xl font-black text-indigo-900">{ownerStats.monthlyRevenue} <span className="text-xs opacity-50">TND</span></h3>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Evolution Chart */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {isFr ? "Évolution des Revenus" : "Revenue Evolution"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end gap-2 pt-6">
                    {revenueData.map((data, i) => {
                      const max = Math.max(...revenueData.map(d => d.amount));
                      const height = `${(data.amount / max) * 100}%`;
                      return (
                        <div key={i} className="flex-1 flex flex-col justify-end items-center gap-2 group">
                          <div className="w-full relative flex justify-center">
                            <div 
                              className="w-full max-w-[24px] bg-primary/20 rounded-t-lg group-hover:bg-primary transition-all duration-300"
                              style={{ height }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">{data.month}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance & Alerts */}
              <Card className="shadow-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Bell className="h-4 w-4 text-amber-500" />
                    {isFr ? "Alertes & Maintenance" : "Alerts & Maintenance"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                    <Wrench className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">{isFr ? "Fuite d'eau signalée" : "Water leak reported"}</p>
                      <p className="text-[10px] text-amber-800/70 mt-0.5">{isFr ? "Villa Monastir - Intervention urgente recommandée." : "Monastir Villa - Urgent action recommended."}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-blue-100 bg-blue-50/30">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-[10px] font-bold text-blue-900">{isFr ? "2 nouveaux contrats à signer" : "2 new contracts to sign"}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-blue-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Score Component */}
            <Card className="border-border/50 bg-muted/5">
              <CardContent className="p-6 flex flex-col md:flex-row items-center gap-8">
                <div className="relative h-24 w-24 shrink-0">
                  <svg className="h-full w-full" viewBox="0 0 100 100">
                    <circle className="text-muted/20 stroke-current" strokeWidth="8" fill="transparent" r="38" cx="50" cy="50" />
                    <circle 
                      className="text-primary stroke-current" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="38" cx="50" cy="50" 
                      strokeDasharray="238.76" 
                      strokeDashoffset="35.8" // 85% score
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-foreground">85</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Score</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    {isFr ? "Excellent Santé de Gestion" : "Excellent Management Health"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {isFr 
                      ? "Votre portefeuille est performant. Vos paiements sont à jour et le taux d'occupation est stable. Optimisez vos revenus en finalisant l'annonce du Studio Skanes." 
                      : "Your portfolio is performing well. Payments are up to date and occupancy is stable. Optimize your income by finalizing the Skanes Studio listing."}
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* ─── DOCUMENTS ────────────────────────────────────────────────── */}
        <TabsContent value="documents">
          <Card className="max-w-3xl shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{lang === "fr" ? "Documents & Justificatifs" : "Documents & Proofs"}</CardTitle>
              <CardDescription>
                {lang === "fr" ? "Gérez les documents d'identité liés à votre profil propriétaire." : "Manage the identity documents linked to your owner profile."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ID Document */}
                <div className="p-4 border border-border/50 rounded-xl bg-card hover:border-primary/50 transition-colors group cursor-pointer relative overflow-hidden flex flex-col items-center justify-center text-center gap-3 h-40">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] px-1.5 py-0">Valide</Badge>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{lang === "fr" ? "Pièce d'Identité.pdf" : "ID_Document.pdf"}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Ajouté le 15 Mars 2026 • 2.4 Mo</p>
                  </div>
                </div>

                {/* Property Proof / RIB */}
                <div className="p-4 border border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-3 h-40">
                  <div className="h-12 w-12 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{lang === "fr" ? "Ajouter un RIB" : "Add Bank Details (RIB)"}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Format PDF uniquement</p>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  )
}
