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
  ClipboardCheck,
  CreditCard,
  Wrench,
  CalendarDays,
  Wallet,
  Clock,
  Key,
  ShieldCheck,
  Home
} from "lucide-react"
import { Progress } from "./ui/progress"

export function TenantProfileSettings() {
  const { lang, setLang } = useI18n()
  const { user, updateProfile, updatePassword } = useAuth()
  const { toast } = useToast()

  const isFr = lang === "fr"

  // Analytics Data (Mock)
  const tenantStats = {
    contractStatus: "Actif",
    remainingMonths: 8,
    property: "Appartement Moderne S+2 Centre Monastir",
    occupancyPercent: 33,
    nextPayment: 800,
    dueDate: "05/04/2024",
    regularityScore: 100
  }

  const paymentHistory = [
    { month: "Mars 2024", amount: 800, date: "05/03/2024" },
    { month: "Fév 2024", amount: 800, date: "04/02/2024" },
    { month: "Jan 2024", amount: 800, date: "05/01/2024" },
  ]

  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ─── States ───────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    cin: "12345678", // Mock data
    contractRef: "CT-2026-042", // Mock data
    avatar: user?.avatar || ""
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [notifPrefs, setNotifPrefs] = useState({
    acceptedRequests: user?.notificationPrefs?.acceptedRequests ?? true,
    ownerMessages: user?.notificationPrefs?.ownerMessages ?? true,
    rentReminders: user?.notificationPrefs?.rentReminders ?? true
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar: user.avatar || ""
      }))
    }
  }, [user])

  // ─── Handlers ─────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    setIsLoading(true)
    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      address: formData.address,
      avatar: formData.avatar,
      notificationPrefs: notifPrefs
    })
    
    if (result.success) {
      toast({
        title: lang === "fr" ? "Profil mis à jour" : "Profile updated",
        description: lang === "fr" ? "Vos informations ont été enregistrées." : "Your information has been saved.",
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

  const handleUpdatePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      })
      return
    }

    if (securityData.newPassword.length < 6) {
      toast({
        title: lang === "fr" ? "Mot de passe trop court" : "Password too short",
        description: lang === "fr" ? "Le mot de passe doit contenir au moins 6 caractères." : "Password must contain at least 6 characters.",
        variant: "destructive"
      })
      return
    }
    
    setIsLoading(true)
    const result = await updatePassword(securityData.currentPassword, securityData.newPassword)
    if (result.success) {
      toast({
        title: "Succès",
        description: "Mot de passe modifié avec succès.",
      })
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } else {
      toast({
        title: "Erreur",
        description: result.message || "Erreur lors du changement de mot de passe",
        variant: "destructive"
      })
    }
    setIsLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, avatar: event.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          {lang === "fr" ? "Profil Locataire" : "Tenant Profile"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {lang === "fr" 
            ? "Gérez votre dossier de location, vos paiements et votre sécurité." 
            : "Manage your rental file, payments, and security."}
        </p>
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
                  {lang === "fr" ? "Une photo professionnelle facilite vos échanges." : "A professional photo facilitates interaction."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-6">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg flex items-center justify-center relative">
                    {formData.avatar ? (
                      <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground/50" />
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                         onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {lang === "fr" ? "Télécharger" : "Upload"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Info Form Card */}
            <Card className="md:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{lang === "fr" ? "Informations Personnelles" : "Personal Details"}</CardTitle>
                <CardDescription>
                  {lang === "fr" ? "Mettez à jour vos coordonnées de locataire." : "Update your tenant contact information."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Prénom" : "First Name"}</Label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Nom" : "Last Name"}</Label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Email</Label>
                    <Input value={formData.email} readOnly className="bg-muted/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Téléphone" : "Phone"}</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Numéro CIN" : "CIN Number"}</Label>
                    <Input value={formData.cin} onChange={(e) => setFormData({...formData, cin: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Réf. Contrat" : "Contract Ref"}</Label>
                    <Input value={formData.contractRef} readOnly className="bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">{lang === "fr" ? "Adresse" : "Address"}</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t border-border/50 py-4 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isLoading} className="gap-2 font-semibold">
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
              <CardTitle className="text-lg">{lang === "fr" ? "Sécurité" : "Security"}</CardTitle>
              <CardDescription>Gérez votre mot de passe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Mot de passe actuel" : "Current Password"}</Label>
                <Input type="password" value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{lang === "fr" ? "Nouveau" : "New"}</Label>
                  <Input type="password" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === "fr" ? "Confirmer" : "Confirm"}</Label>
                  <Input type="password" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUpdatePassword} disabled={isLoading} className="gap-2">
                <Lock className="h-4 w-4" />
                {lang === "fr" ? "Mettre à jour" : "Update"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* ─── SETTINGS ─────────────────────────────────────────────────── */}
        <TabsContent value="settings">
          <Card className="max-w-2xl shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{lang === "fr" ? "Paramètres" : "Settings"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-center gap-4">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <h4 className="font-semibold text-sm">{lang === "fr" ? "Langue" : "Language"}</h4>
                  </div>
                </div>
                <div className="flex border rounded-lg overflow-hidden">
                  <button onClick={() => setLang("fr")} className={`px-3 py-1.5 text-xs ${lang === "fr" ? "bg-primary text-white" : ""}`}>Fr</button>
                  <button onClick={() => setLang("en")} className={`px-3 py-1.5 text-xs ${lang === "en" ? "bg-primary text-white" : ""}`}>En</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
                <div className="flex items-center gap-4">
                  <Bell className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <Switch checked={notifPrefs.acceptedRequests} onCheckedChange={(val) => setNotifPrefs({...notifPrefs, acceptedRequests: val})} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── DIAGNOSTIC / ANALYTIQUE ───────────────────────────────────── */}
        <TabsContent value="diagnostic">
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Situation Locative */}
              <Card className="lg:col-span-2 border-primary/20 shadow-none overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    {isFr ? "Situation Locative" : "Rental Situation"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{isFr ? "Propriété actuelle" : "Current property"}</p>
                      <p className="text-sm font-bold text-foreground mt-1">{tenantStats.property}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="text-primary h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold">{isFr ? "Statut du contrat" : "Contract status"}</p>
                        <p className="text-xs font-black text-primary flex items-center gap-1 uppercase">
                          <CheckCircle2 className="h-3 w-3" /> {tenantStats.contractStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{tenantStats.remainingMonths} {isFr ? "mois restants" : "months remaining"}</span>
                      <Badge className="bg-primary/5 text-primary border-primary/20 text-[9px] font-bold">33% écoulé</Badge>
                    </div>
                    <Progress value={tenantStats.occupancyPercent} className="h-1.5" />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <ShieldCheck className="h-3 w-3" />
                      {isFr ? "Caution sécurisée" : "Deposit secured"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Prochain Paiement */}
              <Card className="bg-indigo-50/30 border-indigo-100 shadow-none relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-900">
                    <Wallet className="h-4 w-4 text-indigo-600" />
                    {isFr ? "Prochain Loyer" : "Next Payment"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{isFr ? "Échéance le" : "Due on"}</p>
                  <p className="text-sm font-black text-foreground mb-4">{tenantStats.dueDate}</p>
                  <h3 className="text-3xl font-black text-indigo-700">{tenantStats.nextPayment} <span className="text-sm opacity-50 font-medium">TND</span></h3>
                  <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs gap-2 rounded-xl">
                    <CreditCard className="h-3.5 w-3.5" />
                    {isFr ? "Régler maintenant" : "Pay now"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Historique */}
              <Card className="shadow-none border-border/50">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      {isFr ? "Historique" : "History"}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 text-[10px] font-black text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {tenantStats.regularityScore}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {paymentHistory.map((p, i) => (
                      <div key={i} className="px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{p.month}</p>
                            <p className="text-[10px] text-muted-foreground">{isFr ? "Paiement le" : "Paid on"} {p.date}</p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-foreground">{p.amount} TND</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance */}
              <Card className="shadow-none border-border/50">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-amber-500" />
                    {isFr ? "Maintenance" : "Maintenance"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="p-3 border border-amber-100 bg-amber-50/50 rounded-xl flex items-start gap-3">
                    <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">{isFr ? "Réparation plomberie" : "Plumbing repair"}</p>
                      <p className="text-[10px] text-amber-800/70 mt-1">{isFr ? "Intervention planifiée pour demain" : "Intervention scheduled for tomorrow"}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-xs font-bold gap-2 rounded-xl border-dashed">
                    <Activity className="h-3 w-3" />
                    {isFr ? "Signaler un problème" : "Report an issue"}
                  </Button>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>

        {/* ─── DOCUMENTS ────────────────────────────────────────────────── */}
        <TabsContent value="documents">
          <Card className="max-w-3xl shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{lang === "fr" ? "Documents Locataire" : "Tenant Documents"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl bg-card flex flex-col items-center justify-center text-center gap-3 h-40 border-primary/20">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="font-bold text-sm">Contrat_Bail.pdf</h4>
                    <p className="text-[10px] text-muted-foreground">Signé le 01/01/2026</p>
                  </div>
                </div>
                <div className="p-4 border border-dashed rounded-xl flex flex-col items-center justify-center text-center gap-3 h-40 hover:bg-muted/50 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <h4 className="font-semibold text-sm">{lang === "fr" ? "Ajouter un justificatif" : "Add proof of income"}</h4>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
