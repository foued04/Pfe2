"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { toast } from "sonner"
import { Camera, Send, X } from "lucide-react"

interface Furniture {
  _id: string
  name: string
}

interface FurnitureChangeRequestModalProps {
  isOpen: boolean
  onClose: () => void
  furnitureList: Furniture[]
  contractId?: string
  propertyId?: string
}

const isMongoObjectId = (value?: string) => Boolean(value && /^[a-f\d]{24}$/i.test(value))

export function FurnitureChangeRequestModal({
  isOpen,
  onClose,
  furnitureList,
  contractId,
  propertyId,
}: FurnitureChangeRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    furnitureId: "",
    type: "",
    reason: "",
    description: "",
    photo: ""
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

  const handleSubmit = async () => {
    if (!formData.furnitureId || !formData.type || !formData.reason) {
      toast.error("Veuillez remplir tous les champs obligatoires")
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${API_URL}/api/furniture/change-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          ...(isMongoObjectId(contractId) ? { contractId } : {}),
          ...(propertyId ? { propertyId } : {}),
        })
      })

      if (response.ok) {
        toast.success("Votre demande a été envoyée avec succès")
        onClose()
      } else {
        toast.error("Erreur lors de l'envoi de la demande")
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
      <DialogContent className="max-w-md bg-white border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            Demander un changement
          </DialogTitle>
          <DialogDescription>
            Si un meuble ne convient pas ou est endommagé, vous pouvez envoyer une demande de changement.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="furniture">Meuble concerné *</Label>
            <Select 
                onValueChange={(val) => setFormData(prev => ({ ...prev, furnitureId: val }))}
                value={formData.furnitureId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un meuble" />
              </SelectTrigger>
              <SelectContent>
                {furnitureList.map(item => (
                  <SelectItem key={item._id} value={item._id}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type de demande *</Label>
            <Select 
                onValueChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                value={formData.type}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Remplacement">Remplacement</SelectItem>
                <SelectItem value="Échange">Échange</SelectItem>
                <SelectItem value="Réparation">Réparation</SelectItem>
                <SelectItem value="Suppression">Suppression</SelectItem>
                <SelectItem value="Ajout">Ajout</SelectItem>
              </SelectContent>
            </Select>
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
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-colors cursor-pointer">
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-500 text-center">Cliquez ici pour ajouter une photo</span>
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
