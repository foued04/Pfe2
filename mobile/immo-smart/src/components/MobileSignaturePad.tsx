import { IonButton, IonIcon } from "@ionic/react"
import { checkmarkOutline, refreshOutline } from "ionicons/icons"
import React, { useEffect, useRef, useState } from "react"

interface MobileSignaturePadProps {
  onSign: (dataUrl: string) => void
  existingSignature?: string
  label: string
  disabled?: boolean
}

const MobileSignaturePad: React.FC<MobileSignaturePadProps> = ({ onSign, existingSignature, label, disabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size based on offset size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * 2
      canvas.height = rect.height * 2
      ctx.scale(2, 2)
      
      ctx.strokeStyle = "#172554" // Dark blue
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      
      // Draw baseline
      ctx.setLineDash([4, 4])
      ctx.strokeStyle = "#cbd5e1"
      ctx.beginPath()
      ctx.moveTo(20, rect.height - 30)
      ctx.lineTo(rect.width - 20, rect.height - 30)
      ctx.stroke()
      ctx.setLineDash([])
      ctx.strokeStyle = "#172554"
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  const getPos = (e: React.MouseEvent | React.TouchEvent | any) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    let clientX, clientY
    
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled || existingSignature) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    
    setIsDrawing(true)
    const { x, y } = getPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    // Prevent scrolling when drawing
    if (e.cancelable) e.preventDefault()
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled || existingSignature) return
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return
    
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    setHasDrawn(true)
    
    if (e.cancelable) e.preventDefault()
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
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Reset scale and redraw baseline
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(2, 2)
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = "#cbd5e1"
    ctx.beginPath()
    ctx.moveTo(20, rect.height - 30)
    ctx.lineTo(rect.width - 20, rect.height - 30)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.strokeStyle = "#172554"
    
    setHasDrawn(false)
  }

  const confirmSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasDrawn) return
    const dataUrl = canvas.toDataURL("image/png")
    onSign(dataUrl)
  }

  return (
    <div className="mobile-signature-pad">
      <div className="signature-header">
        <span className="signature-label">{label}</span>
        {existingSignature && (
          <span className="signature-badge verified">✓ Validée</span>
        )}
      </div>

      <div className={`signature-canvas-container ${disabled ? "disabled" : ""}`}>
        {existingSignature ? (
          <div className="signature-preview">
            <img src={existingSignature} alt="Signature" />
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            {!disabled && (
              <div className="signature-actions">
                <IonButton fill="clear" size="small" color="medium" onClick={clearCanvas} disabled={!hasDrawn}>
                  <IonIcon slot="start" icon={refreshOutline} />
                  Effacer
                </IonButton>
                <IonButton size="small" color="primary" onClick={confirmSignature} disabled={!hasDrawn}>
                  <IonIcon slot="start" icon={checkmarkOutline} />
                  Confirmer
                </IonButton>
              </div>
            )}
            {disabled && (
              <div className="signature-placeholder">
                <p>Signature non disponible</p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .mobile-signature-pad {
          margin-top: 16px;
        }
        .signature-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .signature-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .signature-badge.verified {
          background: #ecfdf5;
          color: #10b981;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 999px;
        }
        .signature-canvas-container {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          min-height: 140px;
        }
        .signature-canvas-container.disabled {
          background: #f8fafc;
        }
        canvas {
          width: 100%;
          height: 140px;
          display: block;
          touch-action: none;
        }
        .signature-preview {
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .signature-preview img {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        }
        .signature-actions {
          position: absolute;
          bottom: 4px;
          right: 4px;
          display: flex;
          gap: 4px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(4px);
          border-radius: 8px;
          padding: 2px;
        }
        .signature-placeholder {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

export default MobileSignaturePad
