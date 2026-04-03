"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface PdfLayoutProps {
  id?: string
  title: string
  documentId: string
  date: string
  infoLeft?: React.ReactNode
  infoRight?: React.ReactNode
  children: React.ReactNode
  footerNotes?: string
  className?: string
}

export function PdfLayout({
  id,
  title,
  documentId,
  date,
  infoLeft,
  infoRight,
  children,
  footerNotes,
  className
}: PdfLayoutProps) {
  return (
    <div 
      id={id}
      className={cn(
        "bg-white shadow-2xl mx-auto overflow-hidden text-foreground print:shadow-none print:m-0",
        // A4 Dimensions: 210mm x 297mm
        "w-[210mm] min-h-[297mm] p-[15mm] md:p-[20mm]",
        className
      )}
      style={{ 
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        boxSizing: "border-box"
      }}
    >
      {/* Header */}
      <header className="flex justify-between items-start mb-[15mm] border-b-[3px] border-primary pb-[10mm]">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-[14mm] w-[14mm] bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-900/20">
              IS
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-primary uppercase leading-none">
                ImmoSmart<span className="text-secondary">.</span>
              </h1>
              <p className="text-[10px] font-black text-[#6B7280] tracking-[0.2em] uppercase mt-1">
                Excellence Immobilière Premium
              </p>
            </div>
          </div>
          <div className="text-[11px] text-[#6B7280] space-y-0.5 mt-4">
            <p className="font-bold text-primary">ImmoSmart Monastir</p>
            <p>Zone Touristique Skanes, 5000 Monastir</p>
            <p>+216 73 000 000 | contact@immosmart.tn</p>
          </div>
        </div>

        <div className="text-right flex flex-col justify-between h-[25mm]">
          <div className="bg-background px-6 py-4 rounded-2xl border border-secondary/30 inline-block">
            <h2 className="text-primary font-black text-2xl uppercase tracking-tighter mb-1 leading-none">{title}</h2>
            <p className="text-[10px] font-black text-secondary uppercase tracking-widest">ID: #{documentId}</p>
          </div>
          <p className="text-[11px] font-black text-[#6B7280] mt-auto">
            DATE : <span className="text-primary font-black">{date}</span>
          </p>
        </div>
      </header>

      {/* Info Sections */}
      {(infoLeft || infoRight) && (
        <div className="grid grid-cols-2 gap-[10mm] mb-[15mm]">
          {infoLeft && (
            <div className="bg-background p-6 rounded-2xl border border-secondary/10 h-full">
              {infoLeft}
            </div>
          )}
          {infoRight && (
            <div className="bg-background p-6 rounded-2xl border border-secondary/10 h-full text-right flex flex-col items-end">
              {infoRight}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 mb-[20mm]">
        {children}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-[10mm] border-t border-background flex justify-between items-end text-[#9CA3AF]">
        <div className="max-w-[120mm]">
          {footerNotes ? (
             <p className="text-[10px] leading-relaxed italic">{footerNotes}</p>
          ) : (
            <p className="text-[10px] leading-relaxed italic">
              Ce document est généré électroniquement par le système ImmoSmart Secure v2.0. 
              Il fait office de document officiel pour le bien référencé.
            </p>
          )}
          <p className="text-[9px] font-black uppercase tracking-[0.2em] mt-4 opacity-70">
            ImmoSmart.tn — Monastir, Tunisie — MF: 1234567/A/B/C/000
          </p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] mb-1">Page 1 / 1</p>
          <div className="flex gap-2 opacity-30 grayscale items-center justify-end">
            <div className="h-6 w-12 border border-current rounded flex items-center justify-center text-[7px] font-black">VISA</div>
            <div className="h-6 w-12 border border-current rounded flex items-center justify-center text-[7px] font-black">STRIPE</div>
          </div>
        </div>
      </footer>

      {/* Global CSS for Print */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide everything except the PDF container if ID is provided */
          body > *:not(#${id || 'non-existent'}) {
            ${id ? 'display: none !important;' : ''}
          }
          #${id || 'non-existent'} {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 20mm !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: always;
          }
          /* Ensure text colors are preserved */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
        }
      `}</style>
    </div>
  )
}
