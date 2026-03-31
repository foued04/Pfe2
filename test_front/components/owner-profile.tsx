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
  Building2
} from "lucide-react"

export function OwnerProfile() {
  const { lang, setLang } = useI18n()
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  // ─── Personal Info State ───────────────────────────────────────────────
  const [profileData, setProfileData] = useState({
    name: user?.name || "Mohamed Ben Ali",
    email: user?.email || "proprietaire@example.com",
    phone: "+216 22 123 456",
    address: "Avenue Habib Bourguiba, Monastir",
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
    
    // Simulate API call to /api/users/profile
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // In a real app, you would send profileData to backend here.
    toast({
      title: lang === "fr" ? "Profil mis à jour" : "Profile updated",
      description: lang === "fr" ? "Vos informations personnelles ont été enregistrées avec succès." : "Your personal information has been saved successfully.",
      variant: "default"
    })
    
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

    if (passwords.new.length < 8) {
      toast({
        title: lang === "fr" ? "Mot de passe trop court" : "Password too short",
        description: lang === "fr" ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must contain at least 8 characters.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    // Simulate API call to /api/users/password
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setPasswords({ current: "", new: "", confirm: "" })
    
    toast({
      title: lang === "fr" ? "Mot de passe modifié" : "Password changed",
      description: lang === "fr" ? "Votre mot de passe a été mis à jour avec sécurité." : "Your password was securely updated.",
      variant: "default"
    })
    
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

        {/* ─── DIAGNOSTIC ────────────────────────────────────────────────── */}
        <TabsContent value="diagnostic">
          <Card className="w-full shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                {lang === "fr" ? "Diagnostic de votre compte" : "Account Diagnostic"}
              </CardTitle>
              <CardDescription>
                {lang === "fr" ? "L'état de votre profil, de vos biens et vos actions requises." : "The state of your profile, properties, and required actions."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              {/* 1. État du profil */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {lang === "fr" ? "1. État du Profil" : "1. Profile State"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {profileData.avatarUrl ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "Photo de profil ajoutée" : "Profile picture added"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "Ajoutez une photo de profil" : "Add a profile picture"}</span>
                    </div>
                  )}
                  {(!profileData.address || !profileData.phone) ? (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "Coordonnées incomplètes (Adresse/Tél)" : "Incomplete contact info (Address/Phone)"}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "Informations de contact complètes" : "Contact info complete"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. État des biens */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {lang === "fr" ? "2. État des Biens" : "2. Properties State"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                    <CheckCircle2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-medium text-foreground">{lang === "fr" ? "3 biens actifs et disponibles" : "3 active and available properties"}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 group cursor-pointer hover:bg-amber-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "1 bien n'a pas de photo" : "1 property has no photo"}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 group cursor-pointer hover:bg-amber-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-amber-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "1 bien sans description" : "1 property without description"}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm font-medium">{lang === "fr" ? "Aucun bien indisponible" : "No unavailable properties"}</span>
                  </div>
                </div>
              </div>

              {/* 3. État administratif */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  {lang === "fr" ? "3. État Administratif" : "3. Administrative State"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 group cursor-pointer hover:bg-blue-100 transition-colors md:col-span-2">
                    <div className="flex items-center gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "Une demande de location est en attente (Studio Cozy Skanes)" : "A rental request is pending (Studio Cozy Skanes)"}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-red-200 bg-red-50 text-red-800 group cursor-pointer hover:bg-red-100 transition-colors md:col-span-2">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                      <span className="text-sm font-medium">{lang === "fr" ? "Un contrat attend votre signature (Villa Luxe S+4 Khnis)" : "A contract is awaiting your signature (Villa Luxe S+4 Khnis)"}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-red-600 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 md:col-span-2">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span className="text-sm font-medium">{lang === "fr" ? "Ajoutez un RIB (Documents) pour faciliter les paiements" : "Add bank details (Documents) to facilitate payments"}</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
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
