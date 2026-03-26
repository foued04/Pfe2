"use client"

import { useState, useCallback } from "react"
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
import {
  Home,
  MapPin,
  Wallet,
  Image as ImageIcon,
  Upload,
  X,
  Plus,
  Calendar,
  Send,
  Bed,
  Bath,
  Sofa,
  ChefHat,
  Car,
} from "lucide-react"
import Image from "next/image"

const propertyTypes = [
  { value: "s0", label: "S+0 (Studio)" },
  { value: "s1", label: "S+1" },
  { value: "s2", label: "S+2" },
  { value: "s3", label: "S+3" },
  { value: "s4", label: "S+4" },
  { value: "villa", label: "Villa" },
]

interface ImageUploadState {
  cover: string | null
  kitchen: string | null
  bathroom: string | null
  bedroom: string | null
  livingRoom: string | null
  exterior: string | null
  gallery: string[]
}

export function OwnerPropertyForm() {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    department: "",
    address: "",
    rent: "",
    deposit: "",
    type: "",
    surface: "",
    bedrooms: "",
    bathrooms: "",
    livingRooms: "",
    equippedKitchen: false,
    balcony: false,
    parking: false,
    furnished: false,
    availability: "",
  })

  const [images, setImages] = useState<ImageUploadState>({
    cover: null,
    kitchen: null,
    bathroom: null,
    bedroom: null,
    livingRoom: null,
    exterior: null,
    gallery: [],
  })

  const [mapPosition, setMapPosition] = useState({ lat: 36.8065, lng: 10.1815 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSubmitting(false)
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (type: keyof Omit<ImageUploadState, "gallery">, file: File) => {
    const url = URL.createObjectURL(file)
    setImages((prev) => {
      // Revoke old URL if it exists
      if (prev[type]) URL.revokeObjectURL(prev[type]!)
      return { ...prev, [type]: url }
    })
  }

  const removeImage = (type: keyof Omit<ImageUploadState, "gallery">) => {
    setImages((prev) => {
      if (prev[type]) URL.revokeObjectURL(prev[type]!)
      return { ...prev, [type]: null }
    })
  }

  const ImageUploadBox = ({
    type,
    label,
    image,
  }: {
    type: keyof Omit<ImageUploadState, "gallery">
    label: string
    image: string | null
  }) => {
    const inputId = `image-upload-${type}`

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleImageUpload(type, file)
      }
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={inputId}>{label}</Label>
        <div
          className={`
            relative aspect-video rounded-lg border-2 border-dashed border-border 
            bg-muted/50 transition-all hover:border-primary/50 hover:bg-muted
            ${image ? "border-solid border-primary/30" : "cursor-pointer"}
          `}
          onClick={() => {
            if (!image) {
              document.getElementById(inputId)?.click()
            }
          }}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
          {image ? (
            <>
              <Image
                src={image}
                alt={label}
                fill
                className="rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(type)
                }}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-md transition-transform hover:scale-110"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Cliquer pour uploader</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <Card className="border-border bg-card max-w-4xl mx-auto">
        <CardHeader className="border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Ajouter une Propriété</CardTitle>
              <CardDescription>Remplissez les informations de votre bien immobilier</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Informations Générales
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("form.title")}</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Appartement Moderne S+2 Centre-Ville"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("form.description")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Décrivez votre propriété en détail..."
                    rows={4}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("form.type")}</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => updateField("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le type" />
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
                    <Label htmlFor="availability">{t("form.availability")}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="availability"
                        type="date"
                        value={formData.availability}
                        onChange={(e) => updateField("availability", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localisation
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">{t("form.city")}</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Tunis"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">{t("form.department")}</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    placeholder="Grand Tunis"
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">{t("form.address")}</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="15 Avenue Habib Bourguiba, Tunis 1000"
                    required
                  />
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="aspect-video rounded-lg bg-secondary flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop')] bg-cover bg-center opacity-50" />
                  <div className="relative z-10 text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-sm text-foreground font-medium">Cliquez pour placer le marqueur</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Lat: {mapPosition.lat.toFixed(4)} | Lng: {mapPosition.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Prix
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rent">{t("form.rent")} (TND)</Label>
                  <Input
                    id="rent"
                    type="number"
                    value={formData.rent}
                    onChange={(e) => updateField("rent", e.target.value)}
                    placeholder="1200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit">{t("form.deposit")} (TND)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={formData.deposit}
                    onChange={(e) => updateField("deposit", e.target.value)}
                    placeholder="2400"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                Caractéristiques
              </h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="surface">{t("form.surface")}</Label>
                  <Input
                    id="surface"
                    type="number"
                    value={formData.surface}
                    onChange={(e) => updateField("surface", e.target.value)}
                    placeholder="85"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">{t("form.bedrooms")}</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => updateField("bedrooms", e.target.value)}
                    placeholder="2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">{t("form.bathrooms")}</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => updateField("bathrooms", e.target.value)}
                    placeholder="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="livingRooms">{t("form.livingRooms")}</Label>
                  <Input
                    id="livingRooms"
                    type="number"
                    value={formData.livingRooms}
                    onChange={(e) => updateField("livingRooms", e.target.value)}
                    placeholder="1"
                    required
                  />
                </div>
              </div>

              {/* Amenities Switches */}
              <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-border p-4 bg-secondary/20">
                <div className="flex items-center justify-between">
                  <Label htmlFor="equippedKitchen" className="cursor-pointer flex items-center gap-2">
                    <ChefHat className="h-4 w-4 text-muted-foreground" />
                    {t("form.equippedKitchen")}
                  </Label>
                  <Switch
                    id="equippedKitchen"
                    checked={formData.equippedKitchen}
                    onCheckedChange={(checked) => updateField("equippedKitchen", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="balcony" className="cursor-pointer flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    {t("form.balcony")}
                  </Label>
                  <Switch
                    id="balcony"
                    checked={formData.balcony}
                    onCheckedChange={(checked) => updateField("balcony", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="parking" className="cursor-pointer flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    {t("form.parking")}
                  </Label>
                  <Switch
                    id="parking"
                    checked={formData.parking}
                    onCheckedChange={(checked) => updateField("parking", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="furnished" className="cursor-pointer flex items-center gap-2">
                    <Sofa className="h-4 w-4 text-muted-foreground" />
                    {t("form.furnished")}
                  </Label>
                  <Switch
                    id="furnished"
                    checked={formData.furnished}
                    onCheckedChange={(checked) => updateField("furnished", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                Images
              </h3>
              <p className="text-sm text-muted-foreground">
                Ajoutez au moins 6 images de votre propriété (couverture, cuisine, salle de bain, chambre, salon, extérieur)
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <ImageUploadBox type="cover" label={t("form.coverImage")} image={images.cover} />
                <ImageUploadBox type="kitchen" label={t("form.kitchenImage")} image={images.kitchen} />
                <ImageUploadBox type="bathroom" label={t("form.bathroomImage")} image={images.bathroom} />
                <ImageUploadBox type="bedroom" label={t("form.bedroomImage")} image={images.bedroom} />
                <ImageUploadBox type="livingRoom" label={t("form.livingRoomImage")} image={images.livingRoom} />
                <ImageUploadBox type="exterior" label={t("form.exteriorImage")} image={images.exterior} />
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" className="flex-1">
                {t("form.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">{t("general.loading")}</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    {t("form.submit")}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
