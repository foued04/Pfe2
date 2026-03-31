"use client"

import { useState } from "react"
import { useI18n } from "@/lib/i18n"
import { FurnitureOrder } from "@/lib/furniture-data"
import { Button } from "./ui/button"
import { Printer, ArrowLeft, Download, FileText, CheckCircle2, CreditCard, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <div className="flex items-center justify-between print:hidden bg-background/80 backdrop-blur-md p-4 rounded-xl border border-border/50 sticky top-20 z-10 shadow-sm">
        <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
          {t("furn.back")}
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2 border-primary/20 hover:bg-primary/5 text-primary"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </Button>
          <Button className="gap-2 shadow-lg shadow-primary/20" onClick={handlePrint}>
            <Printer className="w-4 h-4" />
            {t("furn.print")}
          </Button>
        </div>
      </div>

      {/* Receipt Content */}
      <div id="receipt-content" className="bg-card border border-border/50 shadow-2xl p-8 md:p-12 print:p-0 print:border-none print:shadow-none rounded-2xl overflow-hidden relative">
        {/* Header Decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-primary/20 print:hidden" />
        
        {/* Receipt Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-lg">IS</div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-foreground uppercase">ImmoSmart<span className="text-primary italic">.</span></h1>
                <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase">Gestion Immobilière & Mobilier</p>
              </div>
            </div>
            <div className="mt-6 text-sm space-y-1">
              <p className="font-bold text-foreground">ImmoSmart Monastir</p>
              <p className="text-muted-foreground">Zone Touristique Skanes, 5000 Monastir</p>
              <p className="text-muted-foreground">+216 73 000 000 | contact@immosmart.tn</p>
            </div>
          </div>
          <div className="text-right flex flex-col justify-between items-end">
            <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/10">
              <h2 className="text-primary font-black text-xl uppercase tracking-tighter">{t("furn.receipt")}</h2>
              <p className="text-xs font-medium text-muted-foreground">ID: #{order.id}</p>
            </div>
            <div className="mt-4 text-sm text-right bg-muted/30 p-3 rounded-lg border border-border/50">
              <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider mb-1">Détails Commande</p>
              <p className="font-medium text-foreground"><span className="text-muted-foreground">{t("filter.availability")}:</span> {order.date}</p>
              <p className="font-medium text-foreground"><span className="text-muted-foreground">{t("furn.status")}:</span> {getStatusLabel(order.status)}</p>
            </div>
          </div>
        </div>

        {/* Client & Property Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-y border-border/50 py-8">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Information Propriétaire</p>
            <div className="flex items-start gap-3 bg-muted/20 p-4 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-foreground">Mohamed Ben Ali</p>
                <p className="text-muted-foreground">mohamed.benali@email.com</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest">Bien Immobilier À Équiper</p>
            <div className="flex items-start gap-3 bg-muted/20 p-4 rounded-xl">
              <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-bold text-foreground">{order.propertyName}</p>
                <p className="text-muted-foreground">ID: {order.propertyId}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12 overflow-hidden rounded-xl border border-border/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border/50">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t("furn.item")}</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">{t("furn.quantity")}</th>
                <th className="py-4 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t("furn.price")}</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">{t("furn.subtotal")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-sm text-foreground">{item.name}</div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">{item.category}</div>
                  </td>
                  <td className="py-4 px-4 text-center font-bold text-sm">x{item.quantity}</td>
                  <td className="py-4 px-4 text-right text-sm font-medium">{item.price.toLocaleString()} TND</td>
                  <td className="py-4 px-6 text-right font-black text-sm text-primary">{(item.price * item.quantity).toLocaleString()} TND</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t border-border/50">
          <div className="flex-1 space-y-4 max-w-sm">
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Mode de Règlement & Notes</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm font-bold text-foreground capitalize">{getPaymentLabel(order.paymentMethod)}</span>
              </div>
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                Le règlement s'effectuera selon les termes convenus avec ImmoSmart. Ce document fait office de bon de commande officiel.
              </p>
            </div>
            <div className="flex justify-center md:justify-start gap-4">
               {/* Signature blocks placeholder */}
               <div className="border-t-2 border-dashed border-border/50 pt-2 text-center w-32">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">ImmoSmart</p>
               </div>
               <div className="border-t-2 border-dashed border-border/50 pt-2 text-center w-32">
                 <p className="text-[8px] font-bold text-muted-foreground uppercase">Client</p>
               </div>
            </div>
          </div>
          
          <div className="w-full md:w-72 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground font-medium uppercase tracking-tighter">{t("furn.subtotal")}</span>
              <span className="font-bold">{order.total.toLocaleString()} TND</span>
            </div>
            <div className="flex justify-between items-center text-sm pb-4 border-b border-border/50">
              <span className="text-muted-foreground font-medium uppercase tracking-tighter">Taxe / Frais (0%)</span>
              <span className="font-bold">0 TND</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-black text-foreground uppercase tracking-tighter">{t("furn.total")}</span>
              <div className="text-2xl font-black text-primary underline underline-offset-4 decoration-primary/20">
                {order.total.toLocaleString()} TND
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">Merci pour votre confiance avec ImmoSmart.tn</p>
          <p className="text-[8px] text-muted-foreground mt-1">ImmoSmart SARL - Monastir - Tunisie - Matricule Fiscal: 1234567/A/B/C/000</p>
        </div>
      </div>
      
      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content, #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}
