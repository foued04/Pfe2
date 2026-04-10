"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { useAuth } from "@/lib/auth-context"
import type { Property } from "@/lib/property-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Send, Home, MapPin, Calendar } from "lucide-react"
import Image from "next/image"

interface ContactOwnerFormProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ContactOwnerForm({ property, isOpen, onClose, onSuccess }: ContactOwnerFormProps) {
  const { t, lang } = useI18n()
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    message: "",
    duration: "12 mois",
    visitDate: "",
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  if (!property) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert(t("auth.loginRequired") || "Vous devez être connecté pour envoyer une demande.")
      return
    }
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/rental-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property: (property as any)._id || property.id,
          duration: formData.duration,
          message: `${formData.message}${formData.visitDate ? ` (Date de visite souhaitée: ${formData.visitDate})` : ""}`,
        }),
      })

      if (response.ok) {
        setIsSubmitting(false)
        onClose()
        // Reset form
        setFormData(prev => ({ ...prev, message: "", visitDate: "" }))
        alert(lang === "fr" ? "Demande envoyée avec succès !" : "Request sent successfully!")
        if (onSuccess) onSuccess()
      } else {
        const err = await response.json()
        alert(err.message || "Erreur lors de l'envoi de la demande.")
      }
    } catch (err) {
      console.error("Submit rental request error:", err)
      alert("Erreur de connexion au serveur.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 bg-card overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">
              {t("contact.title")}
            </DialogTitle>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        {/* Property Preview */}
        <div className="mx-6 mb-4 flex gap-4 rounded-lg border border-border p-3 bg-secondary/30">
          <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
            <Image
              src={property.images.cover}
              alt={property.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground line-clamp-1">{property.title}</h4>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{property.city}</span>
            </div>
            <p className="text-sm font-semibold text-primary mt-1">
              {property.rent} TND{t("property.perMonth")}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-name">{t("contact.name")}</Label>
              <Input
                id="contact-name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Marie Martin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">{t("contact.phone")}</Label>
              <Input
                id="contact-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+216 XX XXX XXX"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">{t("contact.email")}</Label>
            <Input
              id="contact-email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="marie.martin@email.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact-visit">{t("contact.visitDate")}</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact-visit"
                  type="date"
                  value={formData.visitDate}
                  onChange={(e) => updateField("visitDate", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-duration">{lang === "fr" ? "Durée" : "Duration"}</Label>
              <Select
                value={formData.duration}
                onValueChange={(val) => updateField("duration", val)}
              >
                <SelectTrigger id="contact-duration">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 mois">1 mois</SelectItem>
                  <SelectItem value="3 mois">3 mois</SelectItem>
                  <SelectItem value="6 mois">6 mois</SelectItem>
                  <SelectItem value="12 mois">12 mois</SelectItem>
                  <SelectItem value="24 mois">24 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-message">{t("contact.message")}</Label>
            <Textarea
              id="contact-message"
              value={formData.message}
              onChange={(e) => updateField("message", e.target.value)}
              placeholder="Bonjour, je suis interessé(e) par ce bien..."
              rows={4}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? (
              <span className="animate-pulse">{t("general.loading")}</span>
            ) : (
              <>
                <Send className="h-4 w-4" />
                {t("contact.send")}
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
