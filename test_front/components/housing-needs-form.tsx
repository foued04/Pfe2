"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ClipboardList, Send, User, Mail, Phone, MapPin, Wallet, Home, Calendar, Clock } from "lucide-react"

const propertyTypes = [
  { value: "s0", label: "S+0 (Studio)" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

const bedroomOptions = [
  { value: "1", label: "1 chambre" },
  { value: "2", label: "2 chambres" },
  { value: "3", label: "3 chambres" },
  { value: "4+", label: "4+ chambres" },
]

const durationOptions = [
  { value: "6", label: "6 mois" },
  { value: "12", label: "1 an" },
  { value: "24", label: "2 ans" },
  { value: "36+", label: "3 ans ou plus" },
]

export function HousingNeedsForm() {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    desiredCity: "",
    department: "",
    minBudget: "",
    maxBudget: "",
    propertyType: "",
    bedrooms: "",
    moveInDate: "",
    duration: "",
    furnished: false,
    parking: false,
    nearCenter: false,
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      desiredCity: "",
      department: "",
      minBudget: "",
      maxBudget: "",
      propertyType: "",
      bedrooms: "",
      moveInDate: "",
      duration: "",
      furnished: false,
      parking: false,
      nearCenter: false,
      notes: "",
    })
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{t("housing.title")}</CardTitle>
              <CardDescription>{t("housing.subtitle")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informations Personnelles
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("housing.fullName")}</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    placeholder="Marie Martin"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t("housing.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+216 XX XXX XXX"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">{t("housing.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="marie.martin@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localisation Souhaitée
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="desiredCity">{t("housing.desiredCity")}</Label>
                  <Input
                    id="desiredCity"
                    value={formData.desiredCity}
                    onChange={(e) => updateField("desiredCity", e.target.value)}
                    placeholder="Tunis, La Marsa, Sousse..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t("housing.desiredDepartment")}</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    placeholder="Grand Tunis, Sahel..."
                  />
                </div>
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Budget
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="minBudget">{t("housing.minBudget")} (TND)</Label>
                  <Input
                    id="minBudget"
                    type="number"
                    value={formData.minBudget}
                    onChange={(e) => updateField("minBudget", e.target.value)}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxBudget">{t("housing.maxBudget")} (TND)</Label>
                  <Input
                    id="maxBudget"
                    type="number"
                    value={formData.maxBudget}
                    onChange={(e) => updateField("maxBudget", e.target.value)}
                    placeholder="1500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Type de Bien
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("housing.desiredType")}</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value) => updateField("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("housing.desiredBedrooms")}</Label>
                  <Select
                    value={formData.bedrooms}
                    onValueChange={(value) => updateField("bedrooms", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {bedroomOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Dates
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="moveInDate">{t("housing.moveInDate")}</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => updateField("moveInDate", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("housing.duration")}</Label>
                  <Select
                    value={formData.duration}
                    onValueChange={(value) => updateField("duration", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Préférences</h3>
              <div className="space-y-4 rounded-lg border border-border p-4 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <Label htmlFor="furnished" className="cursor-pointer">{t("housing.furnished")}</Label>
                  <Switch
                    id="furnished"
                    checked={formData.furnished}
                    onCheckedChange={(checked) => updateField("furnished", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="parking" className="cursor-pointer">{t("housing.parking")}</Label>
                  <Switch
                    id="parking"
                    checked={formData.parking}
                    onCheckedChange={(checked) => updateField("parking", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="nearCenter" className="cursor-pointer">{t("housing.nearCenter")}</Label>
                  <Switch
                    id="nearCenter"
                    checked={formData.nearCenter}
                    onCheckedChange={(checked) => updateField("nearCenter", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t("housing.notes")}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Décrivez vos besoins spécifiques..."
                rows={4}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base"
            >
              {isSubmitting ? (
                <span className="animate-pulse">{t("general.loading")}</span>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {t("housing.submit")}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
