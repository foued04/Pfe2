"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Eraser, Check, PenTool } from "lucide-react"

interface SignaturePadProps {
  onSign: (dataUrl: string) => void
  existingSignature?: string
  label: string
  disabled?: boolean
}

export function SignaturePad({ onSign, existingSignature, label, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Style
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Draw baseline
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "#d1d5db"
    ctx.beginPath()
    ctx.moveTo(20, rect.height - 30)
    ctx.lineTo(rect.width - 20, rect.height - 30)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = "#1a1a2e"
  }, [])

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (disabled || existingSignature) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled || existingSignature) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    const { x, y } = getPos(e)
    ctx.strokeStyle = "#1a1a2e"
    ctx.lineWidth = 2
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
  }

  const stopDraw = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Redraw baseline
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "#d1d5db"
    ctx.beginPath()
    ctx.moveTo(20, rect.height - 30)
    ctx.lineTo(rect.width - 20, rect.height - 30)
    ctx.stroke()
    ctx.setLineDash([])

    setHasDrawn(false)
  }

  const confirmSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return
    const dataUrl = canvas.toDataURL("image/png")
    onSign(dataUrl)
  }

  if (existingSignature) {
    return (
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
        <div className="relative group overflow-hidden border-2 border-emerald-500/20 bg-emerald-50/30 rounded-2xl p-6 transition-all hover:bg-emerald-50/50">
          {/* Decorative Security Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden rotate-[-15deg] scale-150 flex flex-col gap-4">
             {Array.from({ length: 12 }).map((_, i) => (
               <p key={i} className="whitespace-nowrap font-black text-emerald-950 text-xl tracking-widest">
                 CERTIFIED DIGITAL SIGNATURE • IMMOSMART SECURE • ORIGINAL DOCUMENT • 
               </p>
             ))}
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="bg-emerald-100/50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 self-start">
              <Check className="h-3.5 w-3.5" />
              Signature Validée
            </div>
            
            {existingSignature !== "signed" ? (
              <img 
                src={existingSignature} 
                alt="Signature" 
                className="h-20 object-contain mix-blend-multiply opacity-90 drop-shadow-sm transition-transform group-hover:scale-105" 
              />
            ) : (
              <div className="h-20 flex items-center justify-center">
                <p className="text-emerald-700 text-lg italic font-serif">✓ Signé électroniquement</p>
              </div>
            )}

            <div className="w-full h-px bg-emerald-500/10 mt-2" />
            <div className="flex justify-between w-full items-center">
              <p className="text-[9px] text-emerald-600/60 font-medium">Secured by ImmoSmart ID Verification</p>
              <p className="text-[9px] text-emerald-600/60 font-mono">HASH: {(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <div className="border border-border rounded-xl bg-background overflow-hidden">
        <div className="bg-muted/30 px-4 py-2 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PenTool className="h-3.5 w-3.5" />
            {disabled ? "Signature non disponible" : "Dessinez votre signature ci-dessous"}
          </div>
          {!disabled && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={clearCanvas}
                disabled={!hasDrawn}
              >
                <Eraser className="h-3 w-3" />
                Effacer
              </Button>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={confirmSignature}
                disabled={!hasDrawn}
              >
                <Check className="h-3 w-3" />
                Confirmer
              </Button>
            </div>
          )}
        </div>
        <canvas
          ref={canvasRef}
          className={`w-full h-32 ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-crosshair"}`}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
      </div>
    </div>
  )
}
