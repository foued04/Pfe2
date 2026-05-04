"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { resolveApiUrl } from "@/lib/api/client"
import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Progress } from "./ui/progress"
import { Separator } from "./ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { useToast } from "./ui/use-toast"
import {
  Activity,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  Fingerprint,
  Home,
  Landmark,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
  Upload,
  User,
  Wallet,
  Wrench,
} from "lucide-react"

type TenantDocument = {
  id: string
  name: string
  date: string
  status: string
  comment: string
  type: "id" | "rib"
  previewUrl: string
}

function mapUserDocuments(user: any, isFr: boolean): TenantDocument[] {
  const docs: TenantDocument[] = []

  if (user?.documents?.cin?.url) {
    docs.push({
      id: "cin",
      name: isFr ? "CIN_Importe.pdf" : "ID_Uploaded.pdf",
      date: user.documents.cin.uploadedAt ? new Date(user.documents.cin.uploadedAt).toLocaleDateString() : "---",
      status: user.documents.cin.status || "pending",
      comment: user.documents.cin.comment || "",
      type: "id",
      previewUrl: user.documents.cin.url,
    })
  }

  if (user?.documents?.rib?.url) {
    docs.push({
      id: "rib",
      name: isFr ? "RIB_Importe.pdf" : "RIB_Uploaded.pdf",
      date: user.documents.rib.uploadedAt ? new Date(user.documents.rib.uploadedAt).toLocaleDateString() : "---",
      status: user.documents.rib.status || "pending",
      comment: user.documents.rib.comment || "",
      type: "rib",
      previewUrl: user.documents.rib.url,
    })
  }

  return docs
}

export function TenantProfileSettings() {
  const { lang } = useI18n()
  const { user, updateProfile, updatePassword } = useAuth()
  const { toast } = useToast()
  const isFr = lang === "fr"

  const [isLoading, setIsLoading] = useState(false)
  const [uploadingType, setUploadingType] = useState<"id" | "rib" | "other">("other")
  const [viewingDoc, setViewingDoc] = useState<{ name: string; url: string; type: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)

  const nameParts = (user?.name || "").split(" ")
  const defaultFirstName = nameParts[0] || ""
  const defaultLastName = nameParts.slice(1).join(" ") || ""

  const [formData, setFormData] = useState({
    firstName: user?.firstName || defaultFirstName,
    lastName: user?.lastName || defaultLastName,
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    cin: "",
    contractRef: "CT-2026-042",
    avatar: user?.avatar || "",
  })

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [documents, setDocuments] = useState<TenantDocument[]>(() => mapUserDocuments(user, isFr))

  useEffect(() => {
    if (!user) return

    const parts = (user.name || "").split(" ")
    const syncedDocs = mapUserDocuments(user, isFr)

    setFormData((prev) => ({
      ...prev,
      firstName: user.firstName || parts[0] || "",
      lastName: user.lastName || parts.slice(1).join(" ") || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      cin: user.documents?.cin?.url ? "Document importe" : prev.cin,
      avatar: user.avatar || "",
    }))
    setDocuments(syncedDocs)
  }, [user, isFr])

  const tenantStats = {
    contractStatus: isFr ? "Actif" : "Active",
    remainingMonths: 8,
    property: "Appartement Moderne S+2 Centre Monastir",
    occupancyPercent: 33,
    nextPayment: 800,
    dueDate: "05/04/2024",
    regularityScore: 100,
  }

  const paymentHistory = [
    { month: "Mars 2024", amount: 800, date: "05/03/2024" },
    { month: "Fev 2024", amount: 800, date: "04/02/2024" },
    { month: "Jan 2024", amount: 800, date: "05/01/2024" },
  ]

  const handleSaveProfile = async () => {
    setIsLoading(true)

    const result = await updateProfile({
      firstName: formData.firstName,
      lastName: formData.lastName,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      phone: formData.phone,
      address: formData.address,
      avatar: formData.avatar,
    })

    if (result.success) {
      toast({
        title: isFr ? "Profil mis a jour" : "Profile updated",
        description: isFr ? "Vos informations ont ete enregistrees." : "Your information has been saved.",
      })
    } else {
      toast({
        title: "Erreur",
        description: result.message || "Erreur lors de la mise a jour",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleUpdatePassword = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: "Erreur",
        description: isFr ? "Les mots de passe ne correspondent pas." : "Passwords do not match.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await updatePassword(securityData.currentPassword, securityData.newPassword)

    if (result.success) {
      toast({
        title: isFr ? "Succes" : "Success",
        description: isFr ? "Mot de passe modifie avec succes." : "Password updated successfully.",
      })
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } else {
      toast({
        title: "Erreur",
        description: result.message || "Erreur lors du changement de mot de passe",
        variant: "destructive",
      })
    }

    setIsLoading(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, avatar: event.target?.result as string }))
    }
    reader.readAsDataURL(file)
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
    if (!file) return

    const docType = uploadingType
    const previewUrl = await readFileAsDataUrl(file)
    const API_URL = resolveApiUrl()

    try {
      const response = await fetch(`${API_URL}/verifications/upload/${docType === "id" ? "cin" : "rib"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ url: previewUrl }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.message || "Upload failed")
      }

      const newDoc: TenantDocument = {
        id: docType === "id" ? "cin" : "rib",
        name: file.name,
        date: new Date().toLocaleDateString(),
        status: "pending",
        comment: "",
        type: docType as "id" | "rib",
        previewUrl,
      }

      setDocuments((prev) => [...prev.filter((doc) => doc.type !== docType), newDoc])
      toast({
        title: isFr ? "Document envoye" : "Document submitted",
        description: isFr
          ? "Votre document est en attente de verification par un administrateur."
          : "Your document is pending administrator verification.",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : isFr ? "Impossible d'envoyer le document." : "Could not upload the document.",
        variant: "destructive",
      })
    }

    if (docInputRef.current) docInputRef.current.value = ""
  }

  const openPreview = (doc: TenantDocument) => {
    if (doc.name.toLowerCase().endsWith(".pdf")) {
      window.open(doc.previewUrl, "_blank")
      return
    }
    setViewingDoc({ name: doc.name, url: doc.previewUrl, type: doc.type })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-foreground tracking-tight">
          {lang === "fr" ? "Profil Locataire" : "Tenant Profile"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {lang === "fr"
            ? "Gerez votre dossier de location, vos paiements et votre securite."
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
            <span className="font-semibold">{lang === "fr" ? "Securite" : "Security"}</span>
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
            <Card className="md:col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{lang === "fr" ? "Photo de profil" : "Profile Picture"}</CardTitle>
                <CardDescription>
                  {lang === "fr" ? "Une photo professionnelle facilite vos echanges." : "A professional photo helps interactions."}
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
                    <div
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                <Button variant="outline" className="w-full gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" />
                  {lang === "fr" ? "Telecharger" : "Upload"}
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">{lang === "fr" ? "Informations Personnelles" : "Personal Details"}</CardTitle>
                <CardDescription>
                  {lang === "fr" ? "Mettez a jour vos coordonnees de locataire." : "Update your tenant contact information."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Prenom" : "First Name"}</Label>
                    <Input value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Nom" : "Last Name"}</Label>
                    <Input value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Email</Label>
                    <Input value={formData.email} readOnly className="bg-muted/50" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Telephone" : "Phone"}</Label>
                    <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Numero CIN" : "CIN Number"}</Label>
                    <Input value={formData.cin} onChange={(e) => setFormData({ ...formData, cin: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold">{lang === "fr" ? "Ref. Contrat" : "Contract Ref"}</Label>
                    <Input value={formData.contractRef} readOnly className="bg-muted/50" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="font-semibold">{lang === "fr" ? "Adresse" : "Address"}</Label>
                  <Input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
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

        <TabsContent value="security">
          <Card className="max-w-2xl shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{lang === "fr" ? "Securite" : "Security"}</CardTitle>
              <CardDescription>{lang === "fr" ? "Gerez votre mot de passe." : "Manage your password."}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Mot de passe actuel" : "Current Password"}</Label>
                <Input type="password" value={securityData.currentPassword} onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{lang === "fr" ? "Nouveau" : "New"}</Label>
                  <Input type="password" value={securityData.newPassword} onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === "fr" ? "Confirmer" : "Confirm"}</Label>
                  <Input type="password" value={securityData.confirmPassword} onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })} />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleUpdatePassword} disabled={isLoading} className="gap-2">
                <Lock className="h-4 w-4" />
                {lang === "fr" ? "Mettre a jour" : "Update"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 border-primary/20 shadow-none overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Home className="h-4 w-4 text-primary" />
                    {lang === "fr" ? "Situation Locative" : "Rental Situation"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                        {lang === "fr" ? "Propriete actuelle" : "Current property"}
                      </p>
                      <p className="text-sm font-bold text-foreground mt-1">{tenantStats.property}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-muted/40 p-3 rounded-xl border border-border">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <FileText className="text-primary h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-bold">{lang === "fr" ? "Statut du contrat" : "Contract status"}</p>
                        <p className="text-xs font-black text-primary flex items-center gap-1 uppercase">
                          <CheckCircle2 className="h-3 w-3" /> {tenantStats.contractStatus}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">
                        {tenantStats.remainingMonths} {lang === "fr" ? "mois restants" : "months remaining"}
                      </span>
                      <Badge className="bg-primary/5 text-primary border-primary/20 text-[9px] font-bold">33% ecoule</Badge>
                    </div>
                    <Progress value={tenantStats.occupancyPercent} className="h-1.5" />
                    <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                      <ShieldCheck className="h-3 w-3" />
                      {lang === "fr" ? "Caution securisee" : "Deposit secured"}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-indigo-50/30 border-indigo-100 shadow-none relative overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-indigo-900">
                    <Wallet className="h-4 w-4 text-indigo-600" />
                    {lang === "fr" ? "Prochain Loyer" : "Next Payment"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{lang === "fr" ? "Echeance le" : "Due on"}</p>
                  <p className="text-sm font-black text-foreground mb-4">{tenantStats.dueDate}</p>
                  <h3 className="text-3xl font-black text-indigo-700">
                    {tenantStats.nextPayment} <span className="text-sm opacity-50 font-medium">TND</span>
                  </h3>
                  <Button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs gap-2 rounded-xl">
                    <CreditCard className="h-3.5 w-3.5" />
                    {lang === "fr" ? "Regler maintenant" : "Pay now"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-none border-border/50">
                <CardHeader className="pb-3 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      {lang === "fr" ? "Historique" : "History"}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 text-[10px] font-black text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" />
                      {tenantStats.regularityScore}%
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {paymentHistory.map((payment) => (
                      <div key={payment.month} className="px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{payment.month}</p>
                            <p className="text-[10px] text-muted-foreground">{lang === "fr" ? "Paiement le" : "Paid on"} {payment.date}</p>
                          </div>
                        </div>
                        <p className="text-xs font-black text-foreground">{payment.amount} TND</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-none border-border/50">
                <CardHeader className="pb-3 border-b border-border/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-amber-500" />
                    {lang === "fr" ? "Maintenance" : "Maintenance"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="p-3 border border-amber-100 bg-amber-50/50 rounded-xl flex items-start gap-3">
                    <Clock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">{lang === "fr" ? "Reparation plomberie" : "Plumbing repair"}</p>
                      <p className="text-[10px] text-amber-800/70 mt-1">
                        {lang === "fr" ? "Intervention planifiee pour demain" : "Intervention scheduled for tomorrow"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full text-xs font-bold gap-2 rounded-xl border-dashed">
                    <Activity className="h-3 w-3" />
                    {lang === "fr" ? "Signaler un probleme" : "Report an issue"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card className="max-w-3xl shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">{lang === "fr" ? "Documents & Justificatifs" : "Documents & Proofs"}</CardTitle>
              <CardDescription>
                {lang === "fr" ? "Gerez les documents d'identite lies a votre profil locataire." : "Manage the identity documents linked to your tenant profile."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <input type="file" className="hidden" ref={docInputRef} onChange={handleDocUpload} accept=".pdf,.jpg,.jpeg,.png" />

              <DocumentSlot
                doc={documents.find((doc) => doc.type === "id") || null}
                emptyLabel={isFr ? "Importer CIN" : "Upload CIN"}
                filledLabel={isFr ? "Piece d'Identite (CIN)" : "Identity Card (CIN)"}
                icon={<Fingerprint className="h-4 w-4 text-primary" />}
                isFr={isFr}
                onOpen={openPreview}
                onReplace={() => triggerUpload("id")}
              />

              <DocumentSlot
                doc={documents.find((doc) => doc.type === "rib") || null}
                emptyLabel={isFr ? "Importer un RIB" : "Import Bank Details (RIB)"}
                filledLabel={isFr ? "Releve Bancaire (RIB)" : "Bank Details (RIB)"}
                icon={<Landmark className="h-4 w-4 text-primary" />}
                isFr={isFr}
                onOpen={openPreview}
                onReplace={() => triggerUpload("rib")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none flex items-center justify-center">
          <div className="relative w-full max-h-[85vh] flex flex-col items-center gap-4">
            <div className="bg-card w-full p-4 rounded-t-xl border-b border-border flex justify-between items-center">
              <DialogTitle className="text-sm font-bold truncate pr-8">{viewingDoc?.name}</DialogTitle>
            </div>
            <div className="bg-white p-2 rounded-xl shadow-2xl overflow-auto max-w-full">
              {viewingDoc?.url ? <img src={viewingDoc.url} alt={viewingDoc.name} className="max-w-full h-auto rounded-lg" /> : null}
            </div>
            <p className="text-white/70 text-xs font-medium">ImmoSmart Document Viewer</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DocumentSlot({
  doc,
  emptyLabel,
  filledLabel,
  icon,
  isFr,
  onOpen,
  onReplace,
}: {
  doc: TenantDocument | null
  emptyLabel: string
  filledLabel: string
  icon: ReactNode
  isFr: boolean
  onOpen: (doc: TenantDocument) => void
  onReplace: () => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        {icon}
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">{filledLabel}</span>
      </div>

      {doc ? (
        <div className="group relative">
          <div
            className="p-4 border border-border/50 rounded-xl bg-card hover:border-primary/50 transition-all relative overflow-hidden flex flex-col items-center justify-center text-center gap-3 h-44 cursor-pointer group/card"
            onClick={() => onOpen(doc)}
          >
            <Badge
              className={cn(
                "absolute top-3 right-3 font-black text-[9px] px-2 py-0.5 rounded-sm border shadow-sm",
                doc.status === "pending"
                  ? "bg-orange-100 text-orange-600 border-orange-200"
                  : doc.status === "verified"
                    ? "bg-emerald-100 text-emerald-600 border-emerald-200"
                    : "bg-red-100 text-red-600 border-red-200",
              )}
            >
              {doc.status === "pending"
                ? isFr
                  ? "EN ATTENTE"
                  : "PENDING"
                : doc.status === "verified"
                  ? isFr
                    ? "VERIFIE"
                    : "VERIFIED"
                  : isFr
                    ? "REJETE"
                    : "REJECTED"}
            </Badge>

            <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3 rounded-lg shadow-sm font-bold text-[10px] gap-1.5"
                onClick={(event) => {
                  event.stopPropagation()
                  onReplace()
                }}
              >
                <RefreshCw className="h-3 w-3" />
                {isFr ? "REMPLACER" : "REPLACE"}
              </Button>
            </div>

            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
              <FileText className="h-6 w-6" />
            </div>
            <div className="px-2 w-full">
              <h4 className="font-bold text-sm text-foreground truncate">{doc.name}</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {isFr ? "Ajoute le" : "Added on"} {doc.date}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={onReplace}
          className="p-4 border border-dashed border-border rounded-xl bg-muted/20 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center text-center gap-3 h-44 group"
        >
          <div className="h-12 w-12 rounded-full bg-background border shadow-sm flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">{emptyLabel}</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">{isFr ? "PDF, JPG ou PNG" : "PDF, JPG or PNG"}</p>
          </div>
        </div>
      )}
    </div>
  )
}
