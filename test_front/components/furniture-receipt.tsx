"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { FurnitureOrder } from "@/lib/furniture-data"
import { Button } from "./ui/button"
import { ArrowLeft, Building2, Download, Loader2, Printer, User as UserIcon } from "lucide-react"
import { PdfLayout } from "./pdf-layout"

interface FurnitureReceiptProps {
  order: FurnitureOrder
  onBack: () => void
}

export function FurnitureReceipt({ order, onBack }: FurnitureReceiptProps) {
  const { t } = useI18n()
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePrint = () => {
    const element = document.getElementById("receipt-content")
    if (!element) return

    const printWindow = window.open("", "_blank", "width=900,height=1200")
    if (!printWindow) return

    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join("")

    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>Commande ImmoSmart ${order.id}</title>
          ${styles}
        </head>
        <body style="margin:0;background:#ffffff;">
          ${element.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      const html2pdf = (await import("html2pdf.js")).default
      const element = document.getElementById("receipt-content")

      if (!element) return

      const opt = {
        margin: 10,
        filename: `Commande-ImmoSmart-${order.id}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm" as const, format: "a4" as const, orientation: "portrait" as const },
      }

      await html2pdf().set(opt).from(element).save()
    } catch (error) {
      console.error("Error generating PDF:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusLabel = (status: string) => {
    const key = status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return t(`furn.status.${key}`)
  }

  const getPaymentLabel = (method: string) => {
    const translation = t(`furn.payment.${method}`)
    if (translation === `furn.payment.${method}`) return method || t("furn.payment.other")
    return translation
  }

  return (
    <div className="mx-auto max-w-4xl animate-in space-y-8 fade-in slide-in-from-bottom-4 duration-500">
      <div className="sticky top-20 z-10 flex items-center justify-between rounded-2xl border border-[#2563eb]/10 bg-white/80 p-4 shadow-sm backdrop-blur-md print:hidden">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-[#2563eb]" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          {t("furn.back")}
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="gap-2 rounded-xl border-[#2563eb]/20 font-bold text-[#2563eb] hover:bg-[#eff6ff]"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            PDF
          </Button>
          <Button
            className="gap-2 rounded-xl bg-[#2563eb] font-bold text-white shadow-lg shadow-blue-900/10 hover:opacity-90"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            {t("furn.print")}
          </Button>
        </div>
      </div>

      <PdfLayout
        id="receipt-content"
        title="Bon de Commande"
        documentId={order.id}
        date={order.date}
        infoLeft={
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">Information Locateur</p>
            <div className="flex items-center gap-2">
              <UserIcon className="h-3 w-3 text-[#2563eb]" />
              <p className="font-black text-[#2563eb]">Mohamed Ben Ali</p>
            </div>
            <p className="text-[11px] italic text-[#6b7280]">mohamed.benali@email.com</p>
            <p className="text-[11px] text-[#6b7280]">+216 73 461 234</p>
          </div>
        }
        infoRight={
          <div className="space-y-2 text-right">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">Bien Immobilier A Equiper</p>
            <div className="flex items-center justify-end gap-2">
              <p className="font-black text-[#2563eb]">{order.propertyName}</p>
              <Building2 className="h-3 w-3 text-[#2563eb]" />
            </div>
            <p className="text-[11px] text-[#6b7280]">ID Propriete: {order.propertyId}</p>
            <p className="text-[10px] font-black uppercase italic tracking-widest text-[#f59e0b]">Validation ImmoSmart</p>
          </div>
        }
        footerNotes="Le reglement s'effectuera selon les termes convenus avec ImmoSmart. Ce document officiel valide la commande du mobilier pour le bien reference."
      >
        <div className="space-y-[10mm]">
          <div className="mt-4 flex items-center justify-end gap-2 text-xs">
            <span className="font-medium italic text-[#6b7280]">{t("furn.status")}:</span>
            <span className="rounded-md bg-[#dbeafe] px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-[#2563eb]">
              {getStatusLabel(order.status)}
            </span>
          </div>

          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-[3px] border-[#2563eb]">
                <th className="py-4 text-[10px] font-black uppercase text-[#2563eb]">{t("furn.item")}</th>
                <th className="py-4 text-center text-[10px] font-black uppercase text-[#2563eb]">{t("furn.quantity")}</th>
                <th className="py-4 text-right text-[10px] font-black uppercase text-[#2563eb]">{t("furn.price")}</th>
                <th className="py-4 text-right text-[10px] font-black uppercase text-[#2563eb]">{t("furn.subtotal")}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-[#e5e7eb]">
                  <td className="py-6">
                    <div className="text-sm font-bold text-[#2563eb]">{item.name}</div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-[#6b7280]">{item.category}</div>
                  </td>
                  <td className="py-6 text-center font-bold">{item.quantity}</td>
                  <td className="py-6 text-right text-sm font-medium">{item.price.toLocaleString()} DT</td>
                  <td className="py-6 text-right font-black text-[#2563eb]">{(item.price * item.quantity).toLocaleString()} DT</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-6">
            <div className="w-[80mm] space-y-4">
              <div className="flex items-center justify-between text-[12px] font-bold text-[#6b7280]">
                <span>{t("furn.subtotal")}</span>
                <span>{order.total.toLocaleString()} DT</span>
              </div>
              <div className="flex items-center justify-between text-[12px] font-bold uppercase tracking-tighter text-[#059669]">
                <span>Livraison (0%)</span>
                <span>OFFERTE</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#2563eb] p-6 text-white shadow-xl">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-60 leading-none">Total a Regler</p>
                  <p className="text-[11px] italic font-medium opacity-80">{getPaymentLabel(order.paymentMethod)}</p>
                </div>
                <p className="text-3xl font-black">{order.total.toLocaleString()} DT</p>
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-between gap-[30mm]">
            <div className="flex-1 space-y-4 text-center">
              <div className="flex h-[25mm] items-end justify-center border-b border-[#e5e7eb] pb-2">
                <p className="text-[10px] italic text-[#9ca3af]">Signer ici</p>
              </div>
              <div>
                <p className="text-[12px] font-black text-[#2563eb]">Direction ImmoSmart</p>
                <p className="text-[10px] text-[#9ca3af]">Cachet et Signature</p>
              </div>
            </div>
            <div className="flex-1 space-y-4 text-center">
              <div className="flex h-[25mm] items-end justify-center border-b border-[#e5e7eb] pb-2">
                <p className="text-[10px] italic text-[#9ca3af]">Signer ici</p>
              </div>
              <div>
                <p className="text-[12px] font-black text-[#2563eb]">Locateur</p>
                <p className="text-[10px] text-[#9ca3af]">Lu et Approuve</p>
              </div>
            </div>
          </div>
        </div>
      </PdfLayout>
    </div>
  )
}
