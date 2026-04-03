"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { FurnitureOrder } from "@/lib/furniture-data"
import { Button } from "./ui/button"
import { Printer, ArrowLeft, Download, FileText, CheckCircle2, CreditCard, Loader2, User as UserIcon, Building2, Landmark } from "lucide-react"
import { cn } from "@/lib/utils"
import { PdfLayout } from "./pdf-layout"

interface FurnitureReceiptProps {
  order: FurnitureOrder
  onBack: () => void
}

export function FurnitureReceipt({ order, onBack }: FurnitureReceiptProps) {
  const { t, lang } = useI18n()
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true)
      // Dynamically import to avoid SSR errors
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('receipt-content');
      
      if (!element) return;
      
      const opt = {
        margin:       10,
        filename:     `Commande-ImmoSmart-${order.id}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
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
    return t(`furn.payment.${method}`)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Controls - Hidden on print */}
      <div className="flex items-center justify-between print:hidden bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-primary/10 sticky top-20 z-10 shadow-sm">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {t("furn.back")}
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold rounded-xl"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </Button>
          <Button className="gap-2 bg-primary hover:opacity-80 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/10" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            {t("furn.print")}
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <PdfLayout
        id="receipt-content"
        title="Bon de Commande"
        documentId={order.id}
        date={order.date}
        infoLeft={
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Information Propriétaire</p>
            <div className="flex items-center gap-2">
              <UserIcon className="w-3 h-3 text-primary" />
              <p className="font-black text-primary">Mohamed Ben Ali</p>
            </div>
            <p className="text-[11px] text-muted-foreground italic">mohamed.benali@email.com</p>
            <p className="text-[11px] text-muted-foreground">+216 73 461 234</p>
          </div>
        }
        infoRight={
          <div className="space-y-2 text-right">
            <p className="text-[10px] font-black uppercase text-secondary tracking-widest">Bien Immobilier À Équiper</p>
            <div className="flex items-center gap-2 justify-end">
              <p className="font-black text-primary">{order.propertyName}</p>
              <Building2 className="w-3 h-3 text-primary" />
            </div>
            <p className="text-[11px] text-muted-foreground">ID Propriété: {order.propertyId}</p>
            <p className="text-[10px] text-secondary uppercase font-black tracking-widest italic">Validation ImmoSmart</p>
          </div>
        }
        footerNotes="Le règlement s'effectuera selon les termes convenus avec ImmoSmart. Ce document officiel valide la commande du mobilier pour le bien référencé."
      >
        <div className="space-y-[10mm]">
          <div className="mt-4 flex items-center justify-end gap-2 text-xs">
            <span className="text-muted-foreground font-medium italic">{t("furn.status")}:</span>
            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-tighter">
              {getStatusLabel(order.status)}
            </span>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-[3px] border-primary">
                <th className="py-4 text-[10px] font-black uppercase text-primary">{t("furn.item")}</th>
                <th className="py-4 text-center text-[10px] font-black uppercase text-primary">{t("furn.quantity")}</th>
                <th className="py-4 text-right text-[10px] font-black uppercase text-primary">{t("furn.price")}</th>
                <th className="py-4 text-right text-[10px] font-black uppercase text-primary">{t("furn.subtotal")}</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-background">
                  <td className="py-6">
                    <div className="font-bold text-sm text-primary">{item.name}</div>
                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">{item.category}</div>
                  </td>
                  <td className="py-6 text-center font-bold">{item.quantity}</td>
                  <td className="py-6 text-right text-sm font-medium">{item.price.toLocaleString()} DT</td>
                  <td className="py-6 text-right font-black text-primary">{(item.price * item.quantity).toLocaleString()} DT</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-6">
            <div className="w-[80mm] space-y-4">
              <div className="flex justify-between items-center text-[12px] text-[#6B7280] font-bold">
                <span>{t("furn.subtotal")}</span>
                <span>{order.total.toLocaleString()} DT</span>
              </div>
              <div className="flex justify-between items-center text-[12px] text-emerald-600 font-bold uppercase tracking-tighter">
                <span>Livraison (0%)</span>
                <span>OFFERTE</span>
              </div>
              <div className="bg-primary p-6 rounded-2xl text-white flex justify-between items-center shadow-xl shadow-emerald-900/10">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">Total à Régler</p>
                  <p className="text-[11px] font-medium opacity-80 italic italic">{getPaymentLabel(order.paymentMethod)}</p>
                </div>
                <p className="text-3xl font-black">{order.total.toLocaleString()} DT</p>
              </div>
            </div>
          </div>

          <div className="mt-20 flex justify-between gap-[30mm]">
            <div className="flex-1 text-center space-y-4">
              <div className="h-[25mm] border-b border-[#E5E7EB] flex items-end justify-center pb-2">
                 <p className="text-[10px] text-[#9CA3AF] italic">Signer ici</p>
              </div>
              <div>
                <p className="text-[12px] font-black text-primary">Direction ImmoSmart</p>
                <p className="text-[10px] text-[#9CA3AF]">Cachet et Signature</p>
              </div>
            </div>
            <div className="flex-1 text-center space-y-4">
              <div className="h-[25mm] border-b border-[#E5E7EB] flex items-end justify-center pb-2">
                 <p className="text-[10px] text-[#9CA3AF] italic">Signer ici</p>
              </div>
              <div>
                <p className="text-[12px] font-black text-primary">Propriétaire</p>
                <p className="text-[10px] text-[#9CA3AF]">Lu et Approuvé</p>
              </div>
            </div>
          </div>
        </div>
      </PdfLayout>
    </div>
  )
}
