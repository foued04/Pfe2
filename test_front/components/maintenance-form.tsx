"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Wrench, AlertTriangle, CheckCircle2, Image as ImageIcon, ArrowRight } from "lucide-react"

export function MaintenanceForm() {
  const { t } = useI18n()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
    }, 1500)
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto mt-8 border-emerald-100 bg-emerald-50/30">
        <CardContent className="pt-10 pb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-emerald-100 p-3">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          <CardTitle className="text-2xl mb-2 text-emerald-900">
            {t("general.success")}
          </CardTitle>

          <CardDescription className="text-emerald-700 text-lg">
            {t("maintenance.success")}
          </CardDescription>

          <Button
            onClick={() => setIsSubmitted(false)}
            className="mt-8 bg-emerald-600 hover:bg-emerald-700"
          >
            {t("general.back")}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Wrench className="w-8 h-8 text-primary" />
          {t("maintenance.title")}
        </h2>
        <p className="text-muted-foreground mt-2 text-lg">
          {t("maintenance.subtitle")}
        </p>
      </div>

      <Card className="border-border shadow-lg">
        <CardHeader className="bg-secondary/10 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Détails de l&apos;intervention
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.subject")}</label>
                <Input placeholder="Ex: Fuite d'eau cuisine" required />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.unit")}</label>
                <Select defaultValue="unit1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit1">Appartement S+2 - Résidence Ennassim</SelectItem>
                    <SelectItem value="unit2">Studio - Marina Monastir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.category")}</label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">{t("maintenance.cat.plumbing")}</SelectItem>
                    <SelectItem value="electricity">{t("maintenance.cat.electricity")}</SelectItem>
                    <SelectItem value="heating">{t("maintenance.cat.heating")}</SelectItem>
                    <SelectItem value="appliance">{t("maintenance.cat.appliance")}</SelectItem>
                    <SelectItem value="other">{t("maintenance.cat.other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">{t("maintenance.priority")}</label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t("maintenance.pri.low")}</SelectItem>
                    <SelectItem value="medium">{t("maintenance.pri.medium")}</SelectItem>
                    <SelectItem value="high" className="text-red-500 font-bold">
                      {t("maintenance.pri.high")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">{t("maintenance.description")}</label>
              <Textarea
                placeholder="Veuillez décrire le problème avec précision."
                className="min-h-[150px] resize-none"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Photos (Optionnel)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-xl cursor-pointer bg-secondary/5 hover:bg-secondary/10 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour ajouter des photos
                    </p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" />
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button type="button" variant="outline" className="px-8">
                {t("form.cancel")}
              </Button>

              <Button type="submit" className="px-10 gap-2" disabled={isLoading}>
                {isLoading ? t("general.loading") : t("maintenance.submit")}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 p-4 rounded-lg bg-amber-50 border border-amber-100 flex gap-3 text-amber-800 text-sm">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <p>
          <strong>Note :</strong> Pour les urgences vitales (fuite de gaz, incendie),
          veuillez contacter directement les services d&apos;urgence au 198 ou 190.
        </p>
      </div>
    </div>
  )
}
