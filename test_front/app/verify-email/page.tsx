"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Home, ArrowLeft, Loader2, Mail } from "lucide-react"
import Link from "next/link"

// ─── Professional Verification Input ────────────────────────────────────────
function VerificationInput({ length = 6, onChange, onComplete }: any) {
  const [code, setCode] = useState(Array(length).fill(""))
  const inputRefs = Array(length).fill(0).map(() => ({} as any))

  const handleChange = (val: string, index: number) => {
    // Only allow numbers
    const cleanVal = val.replace(/\D/g, "")
    if (!cleanVal && val !== "") return
    
    const newCode = [...code]
    newCode[index] = cleanVal.slice(-1)
    setCode(newCode)
    
    const combinedCode = newCode.join("")
    onChange(combinedCode)

    if (cleanVal && index < length - 1) {
      inputRefs[index + 1].focus()
    }
    
    if (newCode.every(c => c !== "") && onComplete) {
      onComplete(combinedCode)
    }
  }

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].focus()
    }
  }

  const handlePaste = (e: any) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim().slice(0, length)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = [...code]
    pastedData.split("").forEach((char: string, i: number) => {
      if (i < length) newCode[i] = char
    })
    setCode(newCode)
    
    const combinedCode = newCode.join("")
    onChange(combinedCode)
    
    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, length - 1)
    if (inputRefs[nextIndex]) inputRefs[nextIndex].focus()

    if (pastedData.length === length && onComplete) {
      onComplete(combinedCode)
    }
  }

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "24px 0" }} onPaste={handlePaste}>
      {Array(length).fill(0).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs[i] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[i]}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          style={{
            width: "50px", height: "64px",
            textAlign: "center", fontSize: "28px", fontWeight: "bold",
            borderRadius: "14px", border: "2px solid #e5e7eb",
            background: "#f9fafb", outline: "none", transition: "all 0.2s",
            color: "#111827",
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
          }}
          onFocus={(e) => { 
            e.currentTarget.style.borderColor = "#2EC4C7"
            e.currentTarget.style.background = "#fff"
            e.currentTarget.style.boxShadow = "0 0 0 4px rgba(46,196,199,0.1)" 
          }}
          onBlur={(e) => { 
            e.currentTarget.style.borderColor = "#e5e7eb"
            e.currentTarget.style.background = "#f9fafb"
            e.currentTarget.style.boxShadow = "none" 
          }}
        />
      ))}
    </div>
  )
}

function VerificationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState(searchParams.get("email") || "")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const handleVerify = async (targetEmail: string, targetCode: string) => {
    if (!targetEmail || targetCode.length < 6) return
    setIsLoading(true)
    setError("")
    try {
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, code: targetCode }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken)
          setTimeout(() => {
            window.location.href = "/" // Redirect to home/dashboard
          }, 2000)
        }
      } else {
        setError(data.message || "Code invalide ou expiré")
      }
    } catch {
      setError("Erreur de connexion au serveur")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0 || !email) return
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setResendTimer(60)
      } else {
        setError("Erreur lors du renvoi")
      }
    } catch {
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh", background: "#fcfcfc", 
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "20px", fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ 
        width: "100%", maxWidth: "450px", 
        background: "#fff", padding: "40px",
        borderRadius: "24px", boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
        border: "1px solid #f3f4f6",
        textAlign: "center"
      }}>
        <div style={{ 
          width: "70px", height: "70px", background: "#f0fdfa", 
          borderRadius: "20px", display: "flex", alignItems: "center", 
          justifyContent: "center", margin: "0 auto 24px",
          color: "#2EC4C7"
        }}>
          <Home size={32} />
        </div>

        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", marginBottom: "10px" }}>
          Vérification du compte
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "32px", lineHeight: "1.5" }}>
          {success 
            ? "Activation réussie ! Redirection vers votre tableau de bord..." 
            : `Veuillez entrer le code de 6 chiffres envoyé à ${email}.`}
        </p>

        {!success ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.tn"
                style={{ 
                  width: "100%", padding: "14px 18px", borderRadius: "12px", 
                  border: "1.5px solid #e5e7eb", outline: "none", fontSize: "15px"
                }}
              />
            </div>

            <div style={{ textAlign: "center" }}>
              <label style={{ fontSize: "14px", fontWeight: 700, color: "#374151", marginBottom: "12px", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Code de vérification
              </label>
              
              <VerificationInput 
                length={6} 
                onChange={setCode}
                onComplete={(val: string) => handleVerify(email, val)}
              />

              <p style={{ fontSize: "13px", color: "#9ca3af", marginTop: "8px" }}>
                Vous pouvez copier et coller le code reçu par email
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px", background: "#fef2f2", color: "#dc2626", borderRadius: "10px", fontSize: "14px" }}>
                {error}
              </div>
            )}

            <button 
              onClick={() => handleVerify(email, code)}
              disabled={isLoading || code.length < 6}
              style={{ 
                width: "100%", padding: "16px", borderRadius: "12px",
                background: "#2EC4C7", color: "#fff", fontWeight: 700,
                border: "none", cursor: "pointer", fontSize: "16px",
                transition: "all 0.2s", opacity: (isLoading || code.length < 6) ? 0.7 : 1
              }}
            >
              {isLoading ? <Loader2 className="animate-spin inline mr-2" size={20} /> : null}
              {isLoading ? "Vérification..." : "Vérifier le compte"}
            </button>

            <button 
              onClick={handleResend}
              disabled={resendTimer > 0 || !email}
              style={{ background: "none", border: "none", color: "#158C96", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}
            >
              {resendTimer > 0 ? `Renvoyer le code dans ${resendTimer}s` : "Je n'ai pas reçu le code"}
            </button>
          </div>
        ) : (
          <div style={{ color: "#059669", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px" }}>
            <CheckCircle2 size={60} />
            <span style={{ fontSize: "18px", fontWeight: 700 }}>Compte activé !</span>
          </div>
        )}

        <div style={{ marginTop: "40px", borderTop: "1px solid #f3f4f6", paddingTop: "20px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", color: "#9ca3af", fontSize: "14px", textDecoration: "none" }}>
            <ArrowLeft size={16} /> Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerificationContent />
    </Suspense>
  )
}
