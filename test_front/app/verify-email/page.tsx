"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Home, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"

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

            <div style={{ textAlign: "left" }}>
              <label style={{ fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px", display: "block" }}>Code de vérification (6 chiffres)</label>
              <input 
                type="text" 
                maxLength={6}
                value={code} 
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setCode(val);
                  if (val.length === 6) handleVerify(email, val);
                }}
                placeholder="· · · · · ·"
                style={{ 
                  width: "100%", padding: "18px", borderRadius: "12px", 
                  border: "2px solid #e5e7eb", outline: "none", fontSize: "28px",
                  letterSpacing: "14px", textAlign: "center", fontWeight: "bold",
                  background: "#f9fafb"
                }}
              />
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
