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

interface OwnerPropertyFormProps {
  initialData?: any
  onSave?: (data: any) => void
  onCancel?: () => void
}

export function OwnerPropertyForm({ initialData, onSave, onCancel }: OwnerPropertyFormProps) {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    city: initialData?.city || "",
    department: initialData?.department || "",
    address: initialData?.address || "",
    rent: initialData?.rent?.toString() || "",
    deposit: initialData?.deposit?.toString() || "",
    type: initialData?.type || "",
    surface: initialData?.surface?.toString() || "",
    bedrooms: initialData?.bedrooms?.toString() || "",
    bathrooms: initialData?.bathrooms?.toString() || "",
    livingRooms: initialData?.livingRooms?.toString() || "",
    equippedKitchen: initialData?.equippedKitchen || false,
    balcony: initialData?.balcony || false,
    parking: initialData?.parking || false,
    furnished: initialData?.furnished || false,
    status: initialData?.status || "available",
  })

  // Pre-load images if they exist in initial data
  const [images, setImages] = useState<ImageUploadState>({
    cover: initialData?.images?.cover || null,
    kitchen: initialData?.images?.kitchen || null,
    bathroom: initialData?.images?.bathroom || null,
    bedroom: initialData?.images?.bedroom || null,
    livingRoom: initialData?.images?.livingRoom || null,
    exterior: initialData?.images?.exterior || null,
    gallery: initialData?.images?.gallery || [],
  })

  // Map state
  const [mapPosition, setMapPosition] = useState({ lat: 36.8065, lng: 10.1815 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      
      if (onSave) {
        // Compile final data to match mockProperties structure
        const finalData = {
          ...(initialData || {}), // preserve ID and owner email
          ...formData,
          rent: Number(formData.rent),
          surface: Number(formData.surface),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          images: {
            cover: images.cover || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
            gallery: images.gallery,
          }
        }
        onSave(finalData)
      }
    }, 800)
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (type: keyof Omit<ImageUploadState, "gallery">, file: File) => {
    // In a real app, this would upload to a server and return a URL
    const url = URL.createObjectURL(file)
    setImages((prev) => {
      // Clean up old object URL to avoid memory leaks
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
              <span className="text-sm text-muted-foreground text-center px-2">Cliquer pour uploader</span>
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
              <CardTitle className="text-xl">
                {initialData ? (t("lang") === "fr" ? "Modifier la Propriété" : "Edit Property") : "Ajouter une Propriété"}
              </CardTitle>
              <CardDescription>
                {initialData 
                  ? (t("lang") === "fr" ? "Mettez à jour les informations de votre bien" : "Update your property's details")
                  : "Remplissez les informations de votre bien immobilier"}
              </CardDescription>
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
                    <Label>Statut</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateField("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner le statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Disponible</SelectItem>
                        <SelectItem value="rented">Loué</SelectItem>
                        <SelectItem value="maintenance">En Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
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
                Ajoutez les images de votre propriété. En cas d'oubli, des images par défaut seront utilisées.
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
              <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
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
                    {"Publier l'annonce"}
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
