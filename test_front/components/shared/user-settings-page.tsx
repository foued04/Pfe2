"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Bell, Globe, Lock, Monitor, Moon, Save, Settings, ShieldCheck, Sun, UserCircle2 } from "lucide-react"
import { useTheme } from "next-themes"

import { useAuth } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

type NotificationPrefs = {
  acceptedRequests: boolean
  ownerMessages: boolean
  rentReminders: boolean
}

const roleLabels = {
  fr: {
    tenant: "Locataire",
    owner: "Proprietaire",
    admin: "Administrateur",
  },
  en: {
    tenant: "Tenant",
    owner: "Owner",
    admin: "Admin",
  },
} as const

export function UserSettingsPage() {
  const { lang, setLang } = useI18n()
  const { user, role, updateProfile, updatePassword } = useAuth()
  const { toast } = useToast()
  const { resolvedTheme, setTheme, theme } = useTheme()

  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>({
    acceptedRequests: user?.notificationPrefs?.acceptedRequests ?? true,
    ownerMessages: user?.notificationPrefs?.ownerMessages ?? true,
    rentReminders: user?.notificationPrefs?.rentReminders ?? true,
  })

  useEffect(() => {
    setNotificationPrefs({
      acceptedRequests: user?.notificationPrefs?.acceptedRequests ?? true,
      ownerMessages: user?.notificationPrefs?.ownerMessages ?? true,
      rentReminders: user?.notificationPrefs?.rentReminders ?? true,
    })
  }, [user])

  const fullName = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User"
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")

  const roleLabel = useMemo(() => {
    if (!role) return ""
    return (lang === "en" ? roleLabels.en : roleLabels.fr)[role]
  }, [lang, role])

  const handleSavePreferences = async () => {
    setIsSavingProfile(true)

    const result = await updateProfile({
      notificationPrefs,
    })

    if (result.success) {
      toast({
        title: lang === "fr" ? "Parametres enregistres" : "Settings saved",
        description:
          lang === "fr"
            ? "Vos preferences ont ete mises a jour."
            : "Your preferences have been updated.",
      })
    } else {
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description: result.message || (lang === "fr" ? "Impossible d'enregistrer les modifications." : "Could not save changes."),
        variant: "destructive",
      })
    }

    setIsSavingProfile(false)
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: lang === "fr" ? "Champs requis" : "Missing fields",
        description:
          lang === "fr"
            ? "Veuillez remplir tous les champs du mot de passe."
            : "Please fill in all password fields.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: lang === "fr" ? "Confirmation invalide" : "Confirmation mismatch",
        description:
          lang === "fr"
            ? "Le nouveau mot de passe et sa confirmation ne correspondent pas."
            : "The new password and confirmation do not match.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: lang === "fr" ? "Mot de passe trop court" : "Password too short",
        description:
          lang === "fr"
            ? "Le mot de passe doit contenir au moins 6 caracteres."
            : "The password must contain at least 6 characters.",
        variant: "destructive",
      })
      return
    }

    setIsSavingPassword(true)
    const result = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword)

    if (result.success) {
      toast({
        title: lang === "fr" ? "Mot de passe mis a jour" : "Password updated",
        description:
          lang === "fr"
            ? "Votre mot de passe a ete modifie avec succes."
            : "Your password was changed successfully.",
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } else {
      toast({
        title: lang === "fr" ? "Erreur" : "Error",
        description:
          result.message ||
          (lang === "fr" ? "Impossible de modifier le mot de passe." : "Could not update password."),
        variant: "destructive",
      })
    }

    setIsSavingPassword(false)
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                {lang === "fr" ? "Parametres" : "Settings"}
              </h1>
              <p className="text-sm text-slate-500">
                {lang === "fr"
                  ? "Gerez la securite, les notifications et les preferences de votre compte."
                  : "Manage your account security, notifications, and preferences."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {initials || "U"}
          </div>
          <div>
            <p className="font-medium text-slate-900">{fullName}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-500">{user?.email}</p>
              {roleLabel ? <Badge variant="secondary">{roleLabel}</Badge> : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Globe className="h-5 w-5 text-blue-600" />
                {lang === "fr" ? "Preferences generales" : "General preferences"}
              </CardTitle>
              <CardDescription>
                {lang === "fr"
                  ? "Choisissez la langue et les notifications que vous souhaitez recevoir."
                  : "Choose your language and the notifications you want to receive."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>{lang === "fr" ? "Langue de l'interface" : "Interface language"}</Label>
                <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1">
                  <button
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      lang === "fr" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
                    }`}
                    onClick={() => setLang("fr")}
                    type="button"
                  >
                    Francais
                  </button>
                  <button
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      lang === "en" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
                    }`}
                    onClick={() => setLang("en")}
                    type="button"
                  >
                    English
                  </button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>{lang === "fr" ? "Theme de l'interface" : "Interface theme"}</Label>
                <p className="text-sm text-slate-500">
                  {lang === "fr"
                    ? "Choisissez l'apparence de votre espace de travail."
                    : "Choose the appearance of your workspace."}
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <ThemeOptionButton
                    active={theme === "light"}
                    description={lang === "fr" ? "Interface claire" : "Light interface"}
                    icon={<Sun className="h-4 w-4" />}
                    label={lang === "fr" ? "Clair" : "Light"}
                    onClick={() => setTheme("light")}
                  />
                  <ThemeOptionButton
                    active={theme === "dark"}
                    description={lang === "fr" ? "Interface sombre" : "Dark interface"}
                    icon={<Moon className="h-4 w-4" />}
                    label={lang === "fr" ? "Sombre" : "Dark"}
                    onClick={() => setTheme("dark")}
                  />
                  <ThemeOptionButton
                    active={theme === "system"}
                    description={
                      lang === "fr"
                        ? `Suit le systeme (${resolvedTheme === "dark" ? "sombre" : "clair"})`
                        : `Follow system (${resolvedTheme === "dark" ? "dark" : "light"})`
                    }
                    icon={<Monitor className="h-4 w-4" />}
                    label={lang === "fr" ? "Systeme" : "System"}
                    onClick={() => setTheme("system")}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>{lang === "fr" ? "Notifications" : "Notifications"}</Label>
                  <p className="text-sm text-slate-500">
                    {lang === "fr"
                      ? "Activez uniquement les alertes qui sont utiles pour votre compte."
                      : "Enable only the alerts that matter for your account."}
                  </p>
                </div>

                <SettingToggleRow
                  checked={notificationPrefs.acceptedRequests}
                  description={
                    lang === "fr"
                      ? "Recevoir les mises a jour sur les demandes et validations."
                      : "Receive updates about requests and approvals."
                  }
                  icon={<Bell className="h-4 w-4 text-blue-600" />}
                  label={lang === "fr" ? "Demandes et activite" : "Requests and activity"}
                  onCheckedChange={(value) =>
                    setNotificationPrefs((current) => ({ ...current, acceptedRequests: value }))
                  }
                />

                <SettingToggleRow
                  checked={notificationPrefs.ownerMessages}
                  description={
                    lang === "fr"
                      ? "Etre averti des nouveaux messages dans la plateforme."
                      : "Get notified when a new message arrives on the platform."
                  }
                  icon={<UserCircle2 className="h-4 w-4 text-blue-600" />}
                  label={lang === "fr" ? "Messages" : "Messages"}
                  onCheckedChange={(value) =>
                    setNotificationPrefs((current) => ({ ...current, ownerMessages: value }))
                  }
                />

                <SettingToggleRow
                  checked={notificationPrefs.rentReminders}
                  description={
                    lang === "fr"
                      ? "Recevoir des rappels importants lies a votre location."
                      : "Receive important reminders related to your rental activity."
                  }
                  icon={<ShieldCheck className="h-4 w-4 text-blue-600" />}
                  label={lang === "fr" ? "Rappels et echeances" : "Reminders and deadlines"}
                  onCheckedChange={(value) =>
                    setNotificationPrefs((current) => ({ ...current, rentReminders: value }))
                  }
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 bg-slate-50/60">
              <Button className="gap-2" disabled={isSavingProfile} onClick={handleSavePreferences}>
                <Save className="h-4 w-4" />
                {isSavingProfile
                  ? lang === "fr"
                    ? "Enregistrement..."
                    : "Saving..."
                  : lang === "fr"
                    ? "Enregistrer"
                    : "Save settings"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Lock className="h-5 w-5 text-blue-600" />
                {lang === "fr" ? "Securite du compte" : "Account security"}
              </CardTitle>
              <CardDescription>
                {lang === "fr"
                  ? "Modifiez votre mot de passe sans quitter cette page."
                  : "Update your password without leaving this page."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  {lang === "fr" ? "Mot de passe actuel" : "Current password"}
                </Label>
                <Input
                  id="currentPassword"
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))
                  }
                  type="password"
                  value={passwordForm.currentPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">{lang === "fr" ? "Nouveau mot de passe" : "New password"}</Label>
                <Input
                  id="newPassword"
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))
                  }
                  type="password"
                  value={passwordForm.newPassword}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {lang === "fr" ? "Confirmer le mot de passe" : "Confirm password"}
                </Label>
                <Input
                  id="confirmPassword"
                  onChange={(event) =>
                    setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  type="password"
                  value={passwordForm.confirmPassword}
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end border-t border-slate-100 bg-slate-50/60">
              <Button className="gap-2" disabled={isSavingPassword} onClick={handleChangePassword}>
                <Lock className="h-4 w-4" />
                {isSavingPassword
                  ? lang === "fr"
                    ? "Mise a jour..."
                    : "Updating..."
                  : lang === "fr"
                    ? "Mettre a jour"
                    : "Update password"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="rounded-3xl border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">{lang === "fr" ? "Informations du compte" : "Account details"}</CardTitle>
              <CardDescription>
                {lang === "fr"
                  ? "Resume simple de votre compte actuel."
                  : "A simple summary of your current account."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <InfoRow label={lang === "fr" ? "Nom" : "Name"} value={fullName} />
              <InfoRow label="Email" value={user?.email || "-"} />
              <InfoRow label={lang === "fr" ? "Telephone" : "Phone"} value={user?.phone || "-"} />
              <InfoRow label={lang === "fr" ? "Adresse" : "Address"} value={user?.address || "-"} />
              <InfoRow label={lang === "fr" ? "Role" : "Role"} value={roleLabel || "-"} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ThemeOptionButton({
  active,
  description,
  icon,
  label,
  onClick,
}: {
  active: boolean
  description: string
  icon: ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      className={`rounded-2xl border p-4 text-left transition ${
        active ? "border-blue-600 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
      }`}
      onClick={onClick}
      type="button"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>
      <p className="font-medium text-slate-900">{label}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </button>
  )
}

function SettingToggleRow({
  checked,
  description,
  icon,
  label,
  onCheckedChange,
}: {
  checked: boolean
  description: string
  icon: ReactNode
  label: string
  onCheckedChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex gap-3">
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">{icon}</div>
        <div>
          <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  )
}
