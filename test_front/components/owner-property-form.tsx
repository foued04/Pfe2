"use client"

import { useEffect, useState } from "react"
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

import { TUNISIA_LOCATIONS } from "@/lib/tunisia-locations"

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

const normalizeText = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()

const findMatchingGovernorate = (value: string) =>
  Object.keys(TUNISIA_LOCATIONS).find((gov) => normalizeText(gov) === normalizeText(value))

const findMatchingDelegation = (governorate: string, value: string) =>
  (TUNISIA_LOCATIONS[governorate] || []).find((delegation) => normalizeText(delegation) === normalizeText(value))

const findGovernorateByDelegation = (value: string) =>
  Object.keys(TUNISIA_LOCATIONS).find((gov) =>
    TUNISIA_LOCATIONS[gov].some((delegation) => normalizeText(delegation) === normalizeText(value))
  )

const resolveLocation = (initialData?: any) => {
  const rawDepartment = typeof initialData?.department === "string" ? initialData.department : ""
  const rawCity = typeof initialData?.city === "string" ? initialData.city : ""

  const departmentAsGovernorate = rawDepartment ? findMatchingGovernorate(rawDepartment) : undefined
  const cityAsGovernorate = rawCity ? findMatchingGovernorate(rawCity) : undefined

  if (departmentAsGovernorate) {
    const matchedDelegation = rawCity ? findMatchingDelegation(departmentAsGovernorate, rawCity) : undefined
    return {
      department: departmentAsGovernorate,
      city: matchedDelegation || rawCity,
    }
  }

  if (cityAsGovernorate) {
    const matchedDelegation = rawDepartment ? findMatchingDelegation(cityAsGovernorate, rawDepartment) : undefined
    return {
      department: cityAsGovernorate,
      city: matchedDelegation || rawDepartment,
    }
  }

  const inferredGovernorate = rawCity
    ? findGovernorateByDelegation(rawCity)
    : rawDepartment
      ? findGovernorateByDelegation(rawDepartment)
      : undefined

  if (inferredGovernorate) {
    const matchedDelegation = findMatchingDelegation(inferredGovernorate, rawCity || rawDepartment)
    return {
      department: inferredGovernorate,
      city: matchedDelegation || rawCity || rawDepartment,
    }
  }

  return {
    department: rawDepartment,
    city: rawCity,
  }
}

const createInitialFormData = (initialData?: any) => {
  const resolvedLocation = resolveLocation(initialData)

  return {
    title: initialData?.title || "",
    description: initialData?.description || "",
    city: resolvedLocation.city,
    department: resolvedLocation.department,
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
    meuble: initialData?.meuble || false,
    status: initialData?.status || "available",
    lat: initialData?.lat || 36.8065,
    lng: initialData?.lng || 10.1815,
  }
}

const createInitialImages = (initialData?: any): ImageUploadState => ({
  cover: initialData?.images?.cover || null,
  kitchen: initialData?.images?.kitchen || null,
  bathroom: initialData?.images?.bathroom || null,
  bedroom: initialData?.images?.bedroom || null,
  livingRoom: initialData?.images?.livingRoom || null,
  exterior: initialData?.images?.exterior || null,
  gallery: initialData?.images?.gallery || [],
})

const DEFAULT_MAP_POSITION = { lat: 36.8065, lng: 10.1815 }

export function OwnerPropertyForm({ initialData, onSave, onCancel }: OwnerPropertyFormProps) {
  const { t } = useI18n()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState(createInitialFormData(initialData))
  const [images, setImages] = useState<ImageUploadState>(createInitialImages(initialData))
  const [mapPosition, setMapPosition] = useState(DEFAULT_MAP_POSITION)

  useEffect(() => {
    setFormData(createInitialFormData(initialData))
    setImages(createInitialImages(initialData))
    setMapPosition(DEFAULT_MAP_POSITION)
    setIsSubmitting(false)
    setSubmitError(null)
  }, [initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    const uploadedImagesCount = Object.values(images).filter(v => v !== null && (typeof v === 'string' ? v.length > 0 : Array.isArray(v) ? v.length > 0 : false)).length
    
    if (uploadedImagesCount < 3) {
      setSubmitError(t("form.minImagesError") || "Veuillez uploader au moins 3 images pour votre propriété.")
      setIsSubmitting(false)
      return
    }

    const finalData = {
      ...formData,
      rent: Number(formData.rent),
      deposit: Number(formData.deposit),
      surface: Number(formData.surface),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      livingRooms: Number(formData.livingRooms),
      availability: initialData?.availability || new Date().toISOString().slice(0, 10),
      images: {
        cover: images.cover,
        kitchen: images.kitchen,
        bathroom: images.bathroom,
        bedroom: images.bedroom,
        livingRoom: images.livingRoom,
        exterior: images.exterior,
        gallery: [
          images.kitchen,
          images.bathroom,
          images.bedroom,
          images.livingRoom,
          images.exterior,
          ...images.gallery
        ].filter(Boolean) as string[],
      }
    }

    try {
      if (onSave) {
        await onSave(finalData)
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : (t("general.saveError") || "Erreur lors de l'enregistrement du bien."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = (type: keyof Omit<ImageUploadState, "gallery">, file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null
      if (!result) return
      setImages((prev) => ({ ...prev, [type]: result }))
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (type: keyof Omit<ImageUploadState, "gallery">) => {
    setImages((prev) => ({ ...prev, [type]: null }))
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
              <span className="text-sm text-muted-foreground text-center px-2">{t("form.clickToUpload") || "Cliquer pour uploader"}</span>
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
                {initialData ? t("form.editPropertyTitle") : t("form.addPropertyTitle")}
              </CardTitle>
              <CardDescription>
                {initialData 
                  ? t("form.editPropertyDesc")
                  : t("form.addPropertyDesc")}
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
                {t("form.generalInfo") || "Informations Générales"}
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">{t("form.title")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder={t("form.titlePlaceholder") || "Appartement Moderne S+2 Centre-Ville"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t("form.description")} <span className="text-destructive">*</span></Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder={t("form.descriptionPlaceholder") || "Décrivez votre propriété en détail..."}
                    rows={4}
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("form.type")} <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => updateField("type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectType") || "Sélectionner le type"} />
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
                    <Label>{t("form.status") || "Statut"} <span className="text-destructive">*</span></Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => updateField("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("form.selectStatus") || "Sélectionner le statut"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">{t("status.available")}</SelectItem>
                        <SelectItem value="rented">{t("status.rented")}</SelectItem>
                        <SelectItem value="maintenance">{t("status.maintenance")}</SelectItem>
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
                {t("form.location") || "Localisation"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t("form.governorate") || "Gouvernorat"} <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.department}
                    onValueChange={(val) => {
                      updateField("department", val)
                      updateField("city", "")
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("form.selectGovernorate") || "Sélectionner le gouvernorat"} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(TUNISIA_LOCATIONS).sort().map((gov) => (
                        <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("form.delegation") || "Délégation"} <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.city}
                    onValueChange={(val) => updateField("city", val)}
                    disabled={!formData.department}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formData.department ? (t("form.selectDelegation") || "Sélectionner la délégation") : (t("form.chooseGovFirst") || "Choisir d'abord un gouvernorat")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(TUNISIA_LOCATIONS[formData.department] || []).map((del) => (
                        <SelectItem key={del} value={del}>{del}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">{t("form.address")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder={t("form.addressPlaceholder") || "15 Avenue Habib Bourguiba, Tunis 1000"}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                {t("form.price") || "Prix"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rent">{t("form.rent")} (TND) <span className="text-destructive">*</span></Label>
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
                  <Label htmlFor="deposit">{t("form.deposit")} (TND) <span className="text-destructive">*</span></Label>
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
                {t("form.features") || "Caractéristiques"}
              </h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="surface">{t("form.surface")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="surface"
                    type="number"
                    min={9}
                    max={1000}
                    value={formData.surface}
                    onChange={(e) => {
                      const v = Math.min(1000, Math.max(0, Number(e.target.value)))
                      updateField("surface", v ? String(v) : "")
                    }}
                    placeholder="85"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">{t("form.bedrooms")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min={0}
                    max={10}
                    value={formData.bedrooms}
                    onChange={(e) => {
                      const v = Math.min(10, Math.max(0, Number(e.target.value)))
                      updateField("bedrooms", String(v))
                    }}
                    placeholder="2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">{t("form.bathrooms")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min={0}
                    max={5}
                    value={formData.bathrooms}
                    onChange={(e) => {
                      const v = Math.min(5, Math.max(0, Number(e.target.value)))
                      updateField("bathrooms", String(v))
                    }}
                    placeholder="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="livingRooms">{t("form.livingRooms")} <span className="text-destructive">*</span></Label>
                  <Input
                    id="livingRooms"
                    type="number"
                    min={0}
                    max={5}
                    value={formData.livingRooms}
                    onChange={(e) => {
                      const v = Math.min(5, Math.max(0, Number(e.target.value)))
                      updateField("livingRooms", String(v))
                    }}
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
                  <Label htmlFor="meuble" className="cursor-pointer flex items-center gap-2">
                    <Sofa className="h-4 w-4 text-muted-foreground" />
                    {t("form.meuble")}
                  </Label>
                  <Switch
                    id="meuble"
                    checked={formData.meuble}
                    onCheckedChange={(checked) => updateField("meuble", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {t("form.images") || "Images"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("form.imagesDesc") || "Ajoutez les images de votre bien. Au moins 3 images sont obligatoires pour publier l'annonce."}
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
                    {initialData ? t("form.updateProperty") : t("form.publishProperty")}
                  </>
                )}
              </Button>
            </div>
            {submitError ? (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {submitError}
              </div>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
