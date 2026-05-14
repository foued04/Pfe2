"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import { resolveApiUrl } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Camera, 
  Save, 
  FileText,  Bell,  Upload,
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
  ShieldCheck,
  RefreshCw,
  ExternalLink, Landmark, Fingerprint
} from "lucide-react"
import { Progress } from "./ui/progress"

export function OwnerProfile({ properties = [], requestCount = 0 }: { properties?: any[], requestCount?: number }) {
  const { lang } = useI18n()
  const { user, updateProfile, updatePassword } = useAuth()
  const { toast } = useToast()
  const isFr = lang === "fr"

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

  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  // ─── Documents State ───────────────────────────────────────────────────
  const [uploadingType, setUploadingType] = useState<"id" | "rib" | "other">("other")
  const [viewingDoc, setViewingDoc] = useState<{ name: string, url: string, type: string } | null>(null)
  const [documents, setDocuments] = useState<any[]>(() => {
    const docs = []
    
    // Identity Document (CIN)
    if (user?.documents?.cin?.url) {
      docs.push({
        id: "cin",
        name: isFr ? "Pièce d'Identité.pdf" : "ID_Document.pdf",
        date: user.documents.cin.uploadedAt ? new Date(user.documents.cin.uploadedAt).toLocaleDateString() : "---",
        status: user.documents.cin.status,
        comment: user.documents.cin.comment,
        type: "id",
        previewUrl: user.documents.cin.url
      })
    }

    // Bank Details (RIB)
    if (user?.documents?.rib?.url) {
      docs.push({
        id: "rib",
        name: isFr ? "Relevé Bancaire (RIB).pdf" : "Bank_Details_RIB.pdf",
        date: user.documents.rib.uploadedAt ? new Date(user.documents.rib.uploadedAt).toLocaleDateString() : "---",
        status: user.documents.rib.status,
        comment: user.documents.rib.comment,
        type: "rib",
        previewUrl: user.documents.rib.url
      })
    }

    return docs
  })

  // ─── Real-Time Analytics Logic ────────────────────────────────────────
  const ownerStats = useMemo(() => {
    const total = properties.length
    const rented = properties.filter(p => p.status === 'rented').length
    const maintenance = properties.filter(p => p.status === 'maintenance').length
    const occupancy = total > 0 ? Math.round((rented / total) * 100) : 0
    const revenue = properties
      .filter(p => p.status === 'rented')
      .reduce((sum, p) => sum + (p.rent || 0), 0)

    // Management Health Score Algorithm (Weighted out of 100)
    // 1. Occupancy Rate (45%)
    const occupancyPoints = (occupancy / 100) * 45
    
    // 2. Maintenance Status (15%) - Deduct 5 points per inactive/maintenance property
    const maintenancePoints = Math.max(0, 15 - (maintenance * 5))
    
    // 3. Document Compliance (20%)
    // Only count documents that have been MANUALY VERIFIED by an admin
    const cinVerified = documents.find(d => d.type === 'id')?.status === 'verified'
    const ribVerified = documents.find(d => d.type === 'rib')?.status === 'verified'
    const docPoints = (cinVerified ? 10 : 0) + (ribVerified ? 10 : 0)
    
    // 4. Financial Stability (20%) - Bonus for at least one active revenue stream
    const stabilityPoints = rented > 0 ? 20 : 5
    
    const rawScore = Math.round(occupancyPoints + maintenancePoints + docPoints + stabilityPoints)
    // Floor the score at 20 if they have a profile, but show real progress
    const managementScore = total === 0 ? Math.min(40, 20 + docPoints) : rawScore

    return {
      totalProperties: total,
      rentedProperties: rented,
      occupancyRate: occupancy,
      monthlyRevenue: revenue,
      managementScore,
      maintenanceAlerts: maintenance
    }
  }, [properties, documents])

  // ─── Sync Documents with User Context ──────────────────────────────────
  useEffect(() => {
    if (!user?.documents) return;
    
    setDocuments(prev => prev.map(d => {
      const typeKey = d.type === 'id' ? 'cin' : d.type === 'rib' ? 'rib' : null;
      if (!typeKey) return d;
      
      const docData = user.documents![typeKey as keyof typeof user.documents];
      if (!docData) return d;

      return {
        ...d,
        name: docData.url ? (typeKey === 'cin' ? (isFr ? "CIN_Importé.pdf" : "ID_Uploaded.pdf") : (isFr ? "RIB_Importé.pdf" : "RIB_Uploaded.pdf")) : d.name,
        date: docData.uploadedAt ? new Date(docData.uploadedAt).toLocaleDateString() : d.date,
        status: docData.status,
        comment: docData.comment,
        previewUrl: docData.url || d.previewUrl
      }
    }));
  }, [user?.documents, isFr]);

  // Simulated revenue data based on current monthly revenue
  const revenueData = useMemo(() => {
    const base = ownerStats.monthlyRevenue
    return [
      { month: "Jan", amount: Math.round(base * 0.8) },
      { month: "Fév", amount: Math.round(base * 0.9) },
      { month: "Mar", amount: base },
      { month: "Avr", amount: base },
      { month: "Mai", amount: Math.round(base * 1.05) },
      { month: "Juin", amount: Math.round(base * 1.1) },
    ]
  }, [ownerStats.monthlyRevenue])

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

  const triggerUpload = (type: "id" | "rib" | "other") => {
    setUploadingType(type)
    docInputRef.current?.click()
  }

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("Unable to read file"))
      reader.readAsDataURL(file)
    })

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const docType = uploadingType
      const previewUrl = await readFileAsDataUrl(file)
      
      const API_URL = resolveApiUrl()
      
      try {
        const response = await fetch(`${API_URL}/verifications/upload/${docType === 'id' ? 'cin' : 'rib'}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ url: previewUrl })
        })

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null)
          throw new Error(errorBody?.message || "Upload failed")
        }

        await response.json()
        
        const newDoc = {
          id: docType,
          name: file.name,
          date: new Date().toLocaleDateString(),
          size: (file.size / (1024 * 1024)).toFixed(1) + " Mo",
          status: 'pending',
          type: docType,
          previewUrl: previewUrl
        }

        setDocuments(prev => {
          const filtered = prev.filter(d => d.type !== docType)
          return [...filtered, newDoc]
        })

        toast({
          title: isFr ? "Document envoyé" : "Document submitted",
          description: isFr 
            ? "Votre document est en attente de vérification par un administrateur." 
            : "Your document is pending administrator verification.",
        })
      } catch (error) {
        console.error("Upload error:", error)
        toast({
          title: "Erreur",
          description: error instanceof Error ? error.message : "Impossible d'envoyer le document.",
          variant: "destructive"
        })
      }
      
      if (docInputRef.current) docInputRef.current.value = ""
    }
  }

  const removeDocument = (id: string) => {
    // Revoke URL if it exists to prevent leaks
    const doc = documents.find(d => d.id === id)
    if (doc?.previewUrl) URL.revokeObjectURL(doc.previewUrl)
    
    setDocuments(prev => prev.filter(d => d.id !== id))
    toast({
      title: isFr ? "Document supprimé" : "Document removed",
      variant: "destructive"
    })
  }

  const openPreview = (doc: any) => {
    if (!doc.previewUrl) {
      toast({
        title: isFr ? "Aperçu non disponible" : "Preview not available",
        description: isFr ? "Ce document a été généré par le système et ne possède pas d'aperçu." : "This document was system-generated and has no live preview.",
      })
      return
    }

    if (doc.name.toLowerCase().endsWith('.pdf')) {
      window.open(doc.previewUrl, '_blank')
    } else {
      setViewingDoc({ name: doc.name, url: doc.previewUrl, type: doc.type })
    }
  }

  // Helper to check if a RIB exists
  const hasRIB = documents.some(doc => doc.type === "rib")

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
                    <Badge className="bg-indigo-100 text-indigo-700 border-0 text-[10px] px-1.5 h-4 flex items-center gap-1">
                      <TrendingUp className="h-2 w-2" />
                      Stable
                    </Badge>
                  </div>
                  <h3 className="text-2xl font-black text-indigo-900">
                    {ownerStats.monthlyRevenue.toLocaleString()} <span className="text-xs opacity-50 font-bold uppercase ml-1">TND</span>
                  </h3>
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
                  {properties.filter((p: any) => p.status === 'maintenance').length > 0 ? (
                    properties.filter((p: any) => p.status === 'maintenance').map((p: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
                        <Wrench className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-amber-900">{p.title}</p>
                          <p className="text-[10px] text-amber-800/70 mt-0.5">{isFr ? "En maintenance - Intervention recommandée." : "Under maintenance - Action recommended."}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">{isFr ? "Aucune alerte" : "No active alerts"}</p>
                        <p className="text-[10px] text-emerald-800/70 mt-0.5">{isFr ? "Tous vos biens sont en bon état." : "All your properties are in good condition."}</p>
                      </div>
                    </div>
                  )}

                  {requestCount > 0 && (
                    <div className="flex items-center justify-between p-3 rounded-xl border border-blue-100 bg-blue-50/30">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-[10px] font-bold text-blue-900">
                          {isFr ? `${requestCount} nouvelles demandes de location` : `${requestCount} new rental requests`}
                        </span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-blue-400" />
                    </div>
                  )}
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
                      className="text-primary stroke-current transition-all duration-1000 ease-in-out" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      fill="transparent" 
                      r="38" cx="50" cy="50" 
                      strokeDasharray="238.76" 
                      style={{ 
                        strokeDashoffset: 238.76 - (238.76 * ownerStats.managementScore) / 100 
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-foreground">{ownerStats.managementScore}</span>
                    <span className="text-[8px] font-bold text-muted-foreground uppercase">Score</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className={cn("h-4 w-4", ownerStats.managementScore > 70 ? "text-emerald-600" : "text-amber-500")} />
                    {ownerStats.managementScore > 80 
                      ? (isFr ? "Excellente Santé de Gestion" : "Excellent Management Health")
                      : ownerStats.managementScore > 50
                      ? (isFr ? "Bonne Santé de Gestion" : "Good Management Health")
                      : (isFr ? "Optimisation Requise" : "Optimization Required")}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {ownerStats.managementScore > 80 
                      ? (isFr 
                          ? "Votre portefeuille est performant. Vos paiements sont à jour et le taux d'occupation est excellent. Continuez ainsi !" 
                          : "Your portfolio is performing well. Payments are up to date and occupancy is excellent. Keep it up!")
                      : (isFr 
                          ? `Votre score est de ${ownerStats.managementScore}. Augmentez votre taux d'occupation et téléchargez vos documents pour améliorer votre santé de gestion.` 
                          : `Your score is ${ownerStats.managementScore}. Increase your occupancy rate and upload your documents to improve your management health.`)}
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
                {lang === "fr" ? "Gérez les documents d'identité liés à votre profil locateur." : "Manage the identity documents linked to your owner profile."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <input 
                  type="file" 
                  className="hidden" 
                  ref={docInputRef} 
                  onChange={handleDocUpload}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                
                {/* ─── SLOT 1: CIN (Pièce d'Identité) ─── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Fingerprint className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      {isFr ? "Pièce d'Identité (CIN)" : "Identity Card (CIN)"}
                    </span>
                  </div>
                  
                  {(() => {
                    const doc = documents.find(d => d.type === 'id')
                    return doc ? (
                      <div className="group relative">
                        <div 
                          className="p-4 border border-border/50 rounded-xl bg-card hover:border-primary/50 transition-all relative overflow-hidden flex flex-col items-center justify-center text-center gap-3 h-44 cursor-pointer group/card"
                          onClick={() => doc.previewUrl && openPreview(doc)}
                        >
                          {/* Status Badge */}
                          {doc.status && doc.status !== 'none' && (
                            <Badge className={cn(
                              "absolute top-3 right-3 font-black text-[9px] px-2 py-0.5 rounded-sm border shadow-sm",
                              doc.status === 'pending' ? "bg-orange-100 text-orange-600 border-orange-200" :
                              doc.status === 'verified' ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                              "bg-red-100 text-red-600 border-red-200"
                            )}>
                              {doc.status === 'pending' ? (isFr ? "EN ATTENTE" : "PENDING") :
                               doc.status === 'verified' ? (isFr ? "VÉRIFIÉ" : "VERIFIED") :
                               (isFr ? "REJETÉ" : "REJECTED")}
                            </Badge>
                          )}
                          
                          {/* Hover Actions */}
                          {doc.previewUrl && (
                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                               <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-8 px-3 rounded-lg shadow-sm font-bold text-[10px] gap-1.5"
                                onClick={(e) => { e.stopPropagation(); triggerUpload('id'); }}
                              >
                                <RefreshCw className="h-3 w-3" />
                                {isFr ? "REMPLACER" : "REPLACE"}
                              </Button>
                            </div>
                          )}
  
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="px-2 w-full">
                            <h4 className="font-bold text-sm text-foreground truncate">{doc.name}</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {isFr ? "Ajouté le" : "Added on"} {doc.date}
                            </p>
                          </div>
                        </div>
                        {/* Deletion disabled to maintain permanent slots as per request */}
                      </div>
                    ) : (
                      <div 
                        onClick={() => triggerUpload('id')}
                        className="p-4 border border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-3 h-44 group"
                      >
                        <div className="h-12 w-12 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{isFr ? "Importer CIN" : "Upload CIN"}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{isFr ? "PDF, JPG ou PNG" : "PDF, JPG or PNG"}</p>
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* ─── SLOT 2: RIB (Bancaire) ─── */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <Landmark className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                      {isFr ? "Relevé Bancaire (RIB)" : "Bank Details (RIB)"}
                    </span>
                  </div>
                  
                  {(() => {
                    const doc = documents.find(d => d.type === 'rib')
                    return doc ? (
                      <div className="group relative">
                        <div 
                          className="p-4 border border-border/50 rounded-xl bg-card hover:border-primary/50 transition-all relative overflow-hidden flex flex-col items-center justify-center text-center gap-3 h-44 cursor-pointer group/card"
                          onClick={() => doc.previewUrl && openPreview(doc)}
                        >
                          {/* Status Badge */}
                          {doc.status && doc.status !== 'none' && (
                            <Badge className={cn(
                              "absolute top-3 right-3 font-black text-[9px] px-2 py-0.5 rounded-sm border shadow-sm",
                              doc.status === 'pending' ? "bg-orange-100 text-orange-600 border-orange-200" :
                              doc.status === 'verified' ? "bg-emerald-100 text-emerald-600 border-emerald-200" :
                              "bg-red-100 text-red-600 border-red-200"
                            )}>
                              {doc.status === 'pending' ? (isFr ? "EN ATTENTE" : "PENDING") :
                               doc.status === 'verified' ? (isFr ? "VÉRIFIÉ" : "VERIFIED") :
                               (isFr ? "REJETÉ" : "REJECTED")}
                            </Badge>
                          )}
                          
                          {/* Hover Actions */}
                          {doc.previewUrl && (
                            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
                               <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-8 px-3 rounded-lg shadow-sm font-bold text-[10px] gap-1.5"
                                onClick={(e) => { e.stopPropagation(); triggerUpload('rib'); }}
                              >
                                <RefreshCw className="h-3 w-3" />
                                {isFr ? "REMPLACER" : "REPLACE"}
                              </Button>
                            </div>
                          )}
  
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                            <FileText className="h-6 w-6" />
                          </div>
                          <div className="px-2 w-full">
                            <h4 className="font-bold text-sm text-foreground truncate">{doc.name}</h4>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {isFr ? "Ajouté le" : "Added on"} {doc.date}
                            </p>
                          </div>
                        </div>
                        {/* Deletion disabled to maintain permanent slots as per request */}
                      </div>
                    ) : (
                      <div 
                        onClick={() => triggerUpload('rib')}
                        className="p-4 border border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-3 h-44 group"
                      >
                        <div className="h-12 w-12 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">{isFr ? "Importer un RIB" : "Import Bank Details (RIB)"}</h4>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{isFr ? "PDF, JPG ou PNG" : "PDF, JPG or PNG"}</p>
                        </div>
                      </div>
                    )
                  })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          <div className="relative w-full max-h-[85vh] flex flex-col items-center gap-4">
            <div className="bg-card w-full p-4 rounded-t-xl border-b border-border flex justify-between items-center">
              <DialogTitle className="text-sm font-bold truncate pr-8">{viewingDoc?.name}</DialogTitle>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-2xl overflow-auto max-w-full">
              {viewingDoc?.url && (
                <img 
                  src={viewingDoc.url} 
                  alt={viewingDoc.name} 
                  className="max-w-full h-auto rounded-lg"
                />
              )}
            </div>
            <p className="text-white/70 text-xs font-medium">ImmoSmart Document Viewer</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


