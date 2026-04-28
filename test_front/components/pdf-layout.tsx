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
  className,
}: PdfLayoutProps) {
  return (
    <div
      id={id}
      className={cn(
        "relative mx-auto min-h-[297mm] w-[210mm] overflow-hidden bg-white p-[15mm] text-[#0f172a] shadow-2xl transition-all duration-500 print:m-0 print:shadow-none md:p-[20mm]",
        className
      )}
      style={{
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
        boxSizing: "border-box",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        backgroundBlendMode: "overlay",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 z-0 flex rotate-[-45deg] select-none items-center justify-center opacity-[0.03]">
        <p className="whitespace-nowrap text-[120px] font-black uppercase tracking-tighter">
          ImmoSmart Secure
        </p>
      </div>

      <div className="pointer-events-none absolute right-[10mm] top-[10mm] z-0 opacity-[0.05]">
        <div className="flex h-[40mm] w-[40mm] flex-col items-center justify-center rounded-full border-[2px] border-[#2563eb] p-4 text-center">
          <p className="text-[10px] font-black uppercase tracking-tight">Document</p>
          <p className="text-[14px] font-black uppercase text-[#2563eb]">Officiel</p>
          <div className="my-1 h-0.5 w-full bg-[#2563eb]" />
          <p className="text-[8px] font-bold">Numerise</p>
        </div>
      </div>

      <header className="mb-[15mm] flex items-start justify-between border-b-[3px] border-[#2563eb] pb-[10mm]">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-[14mm] w-[14mm] items-center justify-center rounded-2xl bg-[#2563eb] text-2xl font-black text-white shadow-xl">
              IS
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase leading-none tracking-tight text-[#2563eb]">
                ImmoSmart<span className="text-[#f59e0b]">.</span>
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#6b7280]">
                Excellence Immobiliere Premium
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-0.5 text-[11px] text-[#6b7280]">
            <p className="font-bold text-[#2563eb]">ImmoSmart Monastir</p>
            <p>Zone Touristique Skanes, 5000 Monastir</p>
            <p>+216 73 000 000 | contact@immosmart.tn</p>
          </div>
        </div>

        <div className="flex h-[25mm] flex-col justify-between text-right">
          <div className="inline-block rounded-2xl border border-[#fcd34d] bg-[#f8fafc] px-6 py-4">
            <h2 className="mb-1 text-2xl font-black uppercase leading-none tracking-tighter text-[#2563eb]">
              {title}
            </h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">
              ID: #{documentId}
            </p>
          </div>
          <p className="mt-auto text-[11px] font-black text-[#6b7280]">
            DATE : <span className="font-black text-[#2563eb]">{date}</span>
          </p>
        </div>
      </header>

      {(infoLeft || infoRight) && (
        <div className="mb-[15mm] grid grid-cols-2 gap-[10mm]">
          {infoLeft ? (
            <div className="h-full rounded-2xl border border-[#fef3c7] bg-[#f8fafc] p-6">{infoLeft}</div>
          ) : null}
          {infoRight ? (
            <div className="flex h-full flex-col items-end rounded-2xl border border-[#fef3c7] bg-[#f8fafc] p-6 text-right">
              {infoRight}
            </div>
          ) : null}
        </div>
      )}

      <main className="mb-[20mm] flex-1">{children}</main>

      <footer className="mt-auto flex items-end justify-between border-t border-[#e5e7eb] pt-[10mm] text-[#9ca3af]">
        <div className="max-w-[120mm]">
          {footerNotes ? (
            <p className="text-[10px] italic leading-relaxed">{footerNotes}</p>
          ) : (
            <p className="text-[10px] italic leading-relaxed">
              Ce document est genere electroniquement par le systeme ImmoSmart Secure v2.0.
              Il fait office de document officiel pour le bien reference.
            </p>
          )}
          <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] opacity-70">
            ImmoSmart.tn - Monastir, Tunisie - MF: 1234567/A/B/C/000
          </p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.1em]">Page 1 / 1</p>
          <div className="flex items-center justify-end gap-2 opacity-30 grayscale">
            <div className="flex h-6 w-12 items-center justify-center rounded border border-current text-[7px] font-black">VISA</div>
            <div className="flex h-6 w-12 items-center justify-center rounded border border-current text-[7px] font-black">STRIPE</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
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
