"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { toast } from "sonner"
import { Camera, Send, X, Upload } from "lucide-react"
interface Furniture {
  _id: string
  name: string
}

interface Property {
  id?: string
  _id?: string
  title: string
}

interface FurnitureChangeRequestModalProps {
  isOpen: boolean
  onClose: () => void
  furnitureList: Furniture[]
  contractId?: string
  propertyId?: string
  properties: Property[]
}

const isMongoObjectId = (value?: string) => Boolean(value && /^[a-f\d]{24}$/i.test(value))

export function FurnitureChangeRequestModal({
  isOpen,
  onClose,
  furnitureList,
  contractId,
  propertyId: initialPropertyId,
  properties,
}: FurnitureChangeRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId || "")
  const [formData, setFormData] = useState({
    furnitureId: "",
    furnitureName: "",
    type: "Changement",
    reason: "",
    description: "",
    photo: ""
  })

  // Sync internal selectedPropertyId with prop if it changes
  useEffect(() => {
    if (initialPropertyId) setSelectedPropertyId(initialPropertyId)
    else if (properties.length > 0 && !selectedPropertyId) setSelectedPropertyId(properties[0].id || properties[0]._id || "")
  }, [initialPropertyId, properties])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("L'image est trop volumineuse (max 5Mo)")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData(prev => ({ ...prev, photo: base64String }))
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImagePreview(null)
    setFormData(prev => ({ ...prev, photo: "" }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const handleSubmit = async () => {
    if (!selectedPropertyId) {
      toast.error("Veuillez sélectionner un logement")
      return
    }
    if (!formData.furnitureName && !formData.furnitureId) {
      toast.error("Veuillez indiquer le meuble concerné")
      return
    }
    if (!formData.reason) {
      toast.error("Veuillez indiquer le motif")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/furniture/change-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ...(isMongoObjectId(contractId) ? { contractId } : {}),
          propertyId: selectedPropertyId,
        })
      })

      if (response.ok) {
        toast.success("Demande envoyée avec succès")
        // Reset form
        setFormData({
          furnitureId: "",
          furnitureName: "",
          type: "Changement",
          reason: "",
          description: "",
          photo: ""
        })
        setImagePreview(null)
        onClose()
      } else {
        const errorData = await response.json().catch(() => null)
        toast.error(errorData?.message || "Erreur lors de l'envoi de la demande")
      }
    } catch (error) {
      console.error("Error submitting change request:", error)
      toast.error("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white border-primary/20 max-h-[95vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Demander un changement
          </DialogTitle>
          <DialogDescription>
            Si un meuble ne convient pas ou est endommagé, vous pouvez envoyer une demande de changement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {properties.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="property">Propriété / Logement *</Label>
              <Select 
                  onValueChange={setSelectedPropertyId}
                  value={selectedPropertyId}
              >
                <SelectTrigger className="rounded-xl border-muted bg-muted/30 font-bold focus:ring-primary/20">
                  <SelectValue placeholder="Choisir un logement" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(prop => (
                    <SelectItem key={prop.id || prop._id} value={prop.id || prop._id || ""}>
                      {prop.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="furniture">Meuble concerné *</Label>
            <Input 
              id="furniture" 
              placeholder="Ex: Canapé, Table, Lit..." 
              value={formData.furnitureName}
              onChange={(e) => setFormData(prev => ({ ...prev, furnitureName: e.target.value }))}
              className="rounded-xl border-muted bg-muted/30 font-bold focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Motif *</Label>
            <Input 
              id="reason" 
              placeholder="Ex: Meuble endommagé, trop grand..." 
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Plus de détails..." 
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3} 
            />
          </div>

          <div className="space-y-2">
            <Label>Photo (optionnelle)</Label>
            <div 
              onClick={() => !imagePreview && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer overflow-hidden min-h-[120px] ${
                imagePreview ? "border-primary/20 bg-primary/[0.02]" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        fileInputRef.current?.click()
                      }}
                      className="text-white hover:bg-white/20"
                    >
                      <Upload className="w-4 h-4 mr-2" /> Modifier
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImage()
                      }}
                      className="text-white hover:bg-red-500/80"
                    >
                      <X className="w-4 h-4 mr-2" /> Supprimer
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 text-center">Cliquez ici pour ajouter une photo</span>
                </>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Annuler</Button>
          <Button onClick={handleSubmit} disabled={loading} className="gap-2">
            {loading ? "Envoi..." : <><Send className="w-4 h-4" /> Envoyer</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
