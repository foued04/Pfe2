"use client"

import { useState, useEffect } from "react"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { Eye, EyeOff, Home, ArrowRight, ShieldCheck, Mail, KeyRound, CheckCircle2, ChevronDown, X, Chrome } from "lucide-react"
import { useGoogleLogin } from "@react-oauth/google"
import { ImageCaptcha } from "./image-captcha"
import Image from "next/image"
import Link from "next/link"

// ─── Types ──────────────────────────────────────────────────────────────────
type View = "login" | "register" | "forgot-password" | "verify-code" | "reset-password"
type Role = "owner" | "tenant"

// ─── Animations ─────────────────────────────────────────────────────────────
const animations = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(1deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }
  @keyframes mesh {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes slideInRight {
    from { transform: translateX(40px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-float {
    animation: float 5s ease-in-out infinite;
  }
  .animate-mesh {
    background: linear-gradient(-45deg, #158C96, #2D7C84, #3E9AA3, #158C96);
    background-size: 400% 400%;
    animation: mesh 12s ease infinite;
  }
  .animate-slide {
    animation: slideInRight 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.18s; }
  .stagger-3 { animation-delay: 0.26s; }
  .stagger-4 { animation-delay: 0.34s; }
`

// ─── Left Panel ─────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div
      className="animate-mesh"
      style={{
        flex: "0 0 45%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",
        minHeight: "100vh",
        color: "#fff",
        overflow: "hidden",
        position: "relative"
      }}
    >
      <style>{animations}</style>

      {/* Ornament Glass Balls */}
      <div style={{ position: "absolute", top: "10%", left: "10%", width: "120px", height: "120px", background: "rgba(255,255,255,0.08)", borderRadius: "50%", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }} />
      <div style={{ position: "absolute", bottom: "15%", right: "10%", width: "180px", height: "180px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.05)" }} />
      
      <div className="animate-fade-in stagger-1" style={{
        width: "90px", height: "90px",
        background: "rgba(255,255,255,0.12)",
        borderRadius: "28px",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "28px",
        border: "1.5px solid rgba(255,255,255,0.15)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
      }}>
        <Home size={44} color="#fff" />
      </div>

      <h2 className="animate-fade-in stagger-2" style={{
        fontSize: "40px", fontWeight: 800,
        margin: "0 0 12px",
        letterSpacing: "-1px",
      }}>
        ImmoSmart
      </h2>
      <p className="animate-fade-in stagger-3" style={{
        color: "rgba(255,255,255,0.75)",
        fontSize: "18px", margin: "0 0 48px",
        textAlign: "center",
        fontWeight: 400,
        maxWidth: "320px",
        lineHeight: 1.4,
      }}>
        Gérez vos biens et contrats en toute simplicité
      </p>

      <div className="animate-fade-in stagger-4 animate-float" style={{
        position: "relative",
        width: "100%",
        maxWidth: "420px",
        aspectRatio: "1",
        borderRadius: "40px",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}>
        <Image
          src="/professional_exchange.png"
          alt="Échange Immobilier Professionnel"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(74,94,58,0.5), transparent 70%)",
        }} />
      </div>
    </div>
  )
}

// ─── Input Component ────────────────────────────────────────────────────────
function FormInput({ label, type, placeholder, value, onChange, showEye, onToggleEye, className, required = true }: any) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      <label style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete="off"
          style={{
            width: "100%", padding: "16px 18px", borderRadius: "14px",
            border: "1.5px solid #e5e7eb", background: "rgba(249, 250, 251, 0.8)",
            fontSize: "15px", outline: "none", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxSizing: "border-box", color: "#111827",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }}
          onFocus={(e) => { 
            e.currentTarget.style.borderColor = "#2D7C84"; 
            e.currentTarget.style.backgroundColor = "#fff"; 
            e.currentTarget.style.boxShadow = "0 8px 24px -6px rgba(45,124,132,0.15)";
            e.currentTarget.style.transform = "translateY(-1px)"
          }}
          onBlur={(e) => { 
            e.currentTarget.style.borderColor = "#e5e7eb"; 
            e.currentTarget.style.backgroundColor = "rgba(249, 250, 251, 0.8)"; 
            e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.02)";
            e.currentTarget.style.transform = "translateY(0)"
          }}
        />
        {onToggleEye && (
          <button type="button" onClick={onToggleEye} style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
            {showEye ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Professional Verification Input ────────────────────────────────────────
function VerificationInput({ length = 6, value, onChange, onComplete }: any) {
  const inputs = Array(length).fill(0)
  const [code, setCode] = useState(Array(length).fill(""))
  const inputRefs = Array(length).fill(0).map(() => ({} as any))

  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return
    
    const newCode = [...code]
    newCode[index] = val.slice(-1)
    setCode(newCode)
    onChange(newCode.join(""))

    if (val && index < length - 1) {
      inputRefs[index + 1].focus()
    }
    
    if (newCode.every(c => c !== "") && onComplete) {
      onComplete(newCode.join(""))
    }
  }

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs[index - 1].focus()
    }
  }

  const handlePaste = (e: any) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, length)
    if (!/^\d+$/.test(pastedData)) return

    const newCode = [...code]
    pastedData.split("").forEach((char: string, i: number) => {
      if (i < length) newCode[i] = char
    })
    setCode(newCode)
    onChange(newCode.join(""))
    
    const nextIndex = Math.min(pastedData.length, length - 1)
    if (inputRefs[nextIndex]) inputRefs[nextIndex].focus()
  }

  return (
    <div style={{ display: "flex", gap: "10px", justifyContent: "center", margin: "20px 0" }} onPaste={handlePaste}>
      {inputs.map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs[i] = el }}
          type="text"
          maxLength={1}
          value={code[i]}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          style={{
            width: "50px", height: "60px",
            textAlign: "center", fontSize: "24px", fontWeight: "bold",
            borderRadius: "12px", border: "2px solid #e5e7eb",
            background: "#f9fafb", outline: "none", transition: "all 0.2s",
            color: "#111827"
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#2EC4C7"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(46,196,199,0.1)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.boxShadow = "none" }}
        />
      ))}
    </div>
  )
}

// ─── Custom Google Button ──────────────────────────────────────────────────
function CustomGoogleButton({ onClick, view }: { onClick: () => void, view: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 24px",
        borderRadius: "14px",
        border: "1.5px solid #e5e7eb",
        background: "#fff",
        color: "#374151",
        fontSize: "15px",
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#d1d5db"
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"
        e.currentTarget.style.transform = "translateY(-1px)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#e5e7eb"
        e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.05)"
        e.currentTarget.style.transform = "translateY(0)"
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span style={{ fontSize: "15px" }}>
        {view === "register" ? "S'inscrire avec Google" : "Se connecter avec Google"}
      </span>
    </button>
  )
}

// ─── Main AuthForms Component ────────────────────────────────────────────────
export function AuthForms({ initialView = "login", onClose }: { initialView?: View, onClose?: () => void }) {
  const { lang } = useI18n()
  const { login, register, loginWithGoogle } = useAuth()
  const [view, setView] = useState<View>(initialView)
  const [role, setRole] = useState<UserRole>("tenant")
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreesToTerms, setAgreesToTerms] = useState(false)
  const [wantsMarketing, setWantsMarketing] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  // Password Reset Fields
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  
  // Captcha State
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [showCaptchaOverlay, setShowCaptchaOverlay] = useState(false)

  const resetFields = () => {
    setName("")
    setEmail("")
    setPhone("")
    setPassword("")
    setConfirmPassword("")
    setResetCode("")
    setNewPassword("")
    setConfirmNewPassword("")
    setError("")
    setSuccessMsg("")
  }

  useEffect(() => {
    setIsMounted(true)
    resetFields()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Clear fields when switching views
  useEffect(() => {
    resetFields()
    setIsCaptchaVerified(false)
  }, [view])


  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      setError("")
      try {
        const { success, message } = await loginWithGoogle(tokenResponse.access_token)
        if (!success) {
          setError(message || "Échec de la connexion Google")
        }
      } catch {
        setError("Erreur lors de la connexion Google")
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => setError("Erreur Google OAuth")
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setIsLoading(true)

    try {
      if (view === "login") {
        // Only enforce role if it's an admin login. Otherwise, the database determines the role.
        const loginRole = isAdminLogin ? "admin" : undefined
        const { success, message } = await login(email, password, loginRole)
        if (!success) setError(message || "Email ou mot de passe incorrect")
      } 
      else if (view === "register") {
        if (password !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas.")
          setIsLoading(false)
          return
        }
        if (!agreesToTerms) {
          setError("Veuillez accepter les conditions d'utilisation.")
          setIsLoading(false)
          return
        }
        
        // Final Human Verification Step
        if (!isCaptchaVerified) {
          setShowCaptchaOverlay(true)
          setIsLoading(false)
          return
        }

        const { success, message } = await (register as any)({ name, email, phone, password, role: role as UserRole })
        if (success) {
          window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
        } else {
          setError(message || "Erreur lors de l'inscription")
          setIsCaptchaVerified(false)
        }
      }

      else if (view === "forgot-password") {
        const res = await fetch(`${API_URL}/auth/forgot-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        })
        const data = await res.json()
        if (res.ok) {
          setSuccessMsg(data.message)
          setView("verify-code")
        } else {
          setError(data.message || "Erreur lors de la demande")
        }
      }
      else if (view === "verify-code") {
        const res = await fetch(`${API_URL}/auth/verify-reset-code`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: resetCode }),
        })
        const data = await res.json()
        if (res.ok) {
          setSuccessMsg("Code vérifié avec succès.")
          setView("reset-password")
        } else {
          setError(data.message || "Code invalide ou expiré")
        }
      }
      else if (view === "reset-password") {
        if (newPassword !== confirmNewPassword) {
          setError("Les nouveaux mots de passe ne correspondent pas.")
          setIsLoading(false)
          return
        }
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: resetCode, newPassword }),
        })
        const data = await res.json()
        if (res.ok) {
          setSuccessMsg("Mot de passe mis à jour ! Vous pouvez vous connecter.")
          setView("login")
          setPassword("")
        } else {
          setError(data.message || "Erreur lors de la réinitialisation")
        }
      }
    } catch {
      setError("Une erreur de connexion est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const roleBtnStyle = (r: Role) => ({
    flex: 1,
    padding: "14px 0",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: role === r && !isAdminLogin ? "2px solid #F27D72" : "1.5px solid #e5e7eb",
    background: role === r && !isAdminLogin ? "#FDF2F1" : "#fff",
    color: role === r && !isAdminLogin ? "#F27D72" : "#6b7280",
    boxShadow: role === r && !isAdminLogin ? "0 4px 12px rgba(242,125,114,0.15)" : "none",
  })

  // ─── Headers based on view ───
  const getHeader = () => {
    switch (view) {
      case "login": return isAdminLogin ? "Accès Admin" : "Connexion"
      case "register": return "Créer un compte"
      case "forgot-password": return "Mot de passe oublié"
      case "verify-code": return "Vérification du code"
      case "reset-password": return "Nouveau mot de passe"
    }
  }

  const getSubtext = () => {
    switch (view) {
      case "login": return isAdminLogin ? "Espace sécurisé pour l'administration" : "Bienvenue ! Connectez-vous à votre espace personnel"
      case "register": return "Inscrivez-vous en 1 minute sur ImmoSmart"
      case "forgot-password": return "Entrez votre email pour recevoir un code de récupération."
      case "verify-code": return "Entrez le code à 6 chiffres reçu par email."
      case "reset-password": return "Choisissez un nouveau mot de passe sécurisé."
    }
  }

  if (!isMounted) return null

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "#fcfcfc" }}>
      <LeftPanel />

      <div style={{ 
        flex: 1, 
        display: "flex", 
        flexDirection: "column",
        alignItems: "center", 
        justifyContent: "center", 
        padding: "60px 40px",
        position: "relative",
        background: "linear-gradient(135deg, #fcfcfc 0%, #f3f4f6 100%)",
      }}>
        {/* Subtle glass effect behind the form */}
        <div style={{
          position: "absolute",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(46,196,199,0.05) 0%, transparent 70%)",
          zIndex: 0
        }} />

        <div className="animate-slide" style={{ 
          width: "100%", 
          maxWidth: "480px", 
          position: "relative",
          zIndex: 1,
          padding: "40px",
          borderRadius: "32px",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.05)",
        }}>
          
          {/* Close Button */}
          {onClose && (
            <button
              onClick={() => {
                resetFields();
                onClose();
              }}
              style={{
                position: "absolute", right: "-20px", top: "-20px",
                background: "none", border: "none", cursor: "pointer",
                color: "#9ca3af", padding: "10px", borderRadius: "50%",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.background = "#f3f4f6" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "none" }}
            >
              <X size={24} />
            </button>
          )}

          <div style={{ textAlign: "left", marginBottom: "28px" }}>
            <h1 className="animate-fade-in stagger-1" style={{ fontSize: "32px", fontWeight: 800, color: "#111827", marginBottom: "10px", letterSpacing: "-0.5px" }}>
              {getHeader()}
            </h1>
            <p className="animate-fade-in stagger-2" style={{ color: "#4b5563", fontSize: "16px", fontWeight: 400 }}>
              {getSubtext()}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>


            {/* Dynamic Fields */}
            <div className="animate-fade-in stagger-3" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {view === "register" && (
                <FormInput label="Nom complet" placeholder="Ex: Mohamed Ben Ali" value={name} onChange={setName} />
              )}
              
              {(view === "login" || view === "register" || view === "forgot-password") && (
                <FormInput label="Email" type="email" placeholder={isAdminLogin ? "admin@immosmart.tn" : "votre@email.tn"} value={email} onChange={setEmail} />
              )}

              {(view === "login" || view === "register") && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <FormInput 
                    label="Mot de passe" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="6 caractères minimum" 
                    value={password} 
                    onChange={setPassword}
                    showEye={showPassword}
                    onToggleEye={() => setShowPassword(!showPassword)}
                  />
                  {view === "register" && (
                    <FormInput 
                      label="Confirmer le mot de passe" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Répétez le mot de passe" 
                      value={confirmPassword} 
                      onChange={setConfirmPassword}
                    />
                  )}
                  {view === "register" && (
                    <FormInput 
                      label="Téléphone" 
                      type="text" 
                      placeholder="Ex: +216 22 333 444" 
                      value={phone} 
                      onChange={setPhone} 
                    />
                  )}
                  {view === "login" && !isAdminLogin && (
                    <div style={{ textAlign: "right" }}>
                      <button 
                        type="button" 
                        onClick={() => { setView("forgot-password"); setError(""); setSuccessMsg("") }}
                        style={{ color: "#2EC4C7", fontSize: "13px", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {view === "verify-code" && (
                <FormInput label="Code de vérification (6 chiffres)" type="text" placeholder="Ex: 123456" value={resetCode} onChange={setResetCode} />
              )}

              {view === "reset-password" && (
                <>
                  <FormInput 
                    label="Nouveau mot de passe" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Nouveau mot de passe" 
                    value={newPassword} 
                    onChange={setNewPassword}
                    showEye={showPassword}
                    onToggleEye={() => setShowPassword(!showPassword)}
                  />
                  <FormInput 
                    label="Confirmer le nouveau mot de passe" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Confirmez le mot de passe" 
                    value={confirmNewPassword} 
                    onChange={setConfirmNewPassword}
                  />
                </>
              )}


              {/* Captcha is now handled as a final-step overlay upon submission */}
            </div>

            {/* Messages */}
            {error && (
              <div style={{ padding: "14px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "12px", color: "#dc2626", fontSize: "14px", fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}
            {successMsg && (
              <div style={{ padding: "14px", background: "#ecfdf5", border: "1px solid #d1fae5", borderRadius: "12px", color: "#059669", fontSize: "14px", fontWeight: 500, display: "flex", gap: "8px", alignItems: "center" }}>
                <CheckCircle2 size={18} /> {successMsg}
              </div>
            )}

            {/* Captcha Overlay (Final Step) */}
            {showCaptchaOverlay && (
              <div style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
                animation: "fadeIn 0.4s ease-out"
              }}>
                {/* Beautiful architectural backdrop */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  filter: "blur(8px) brightness(0.6)",
                  zIndex: -1,
                  transform: "scale(1.1)"
                }} />
                
                {/* Backdrop overlay for focus */}
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(10, 45, 50, 0.4)",
                  zIndex: -1
                }} />

                <div 
                  className="animate-slide"
                  style={{ 
                    position: "relative",
                    width: "100%",
                    maxWidth: "400px",
                    background: "rgba(255, 255, 255, 0.85)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "28px",
                    boxShadow: "0 40px 100px -20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.3)",
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.2)"
                  }}
                >
                  <button 
                    type="button"
                    onClick={() => setShowCaptchaOverlay(false)}
                    style={{
                      position: "absolute",
                      right: "20px",
                      top: "24px",
                      zIndex: 10,
                      background: "rgba(255,255,255,0.3)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.45)"; e.currentTarget.style.transform = "rotate(90deg)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "rotate(0deg)" }}
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                  <ImageCaptcha 
                    onVerify={(val) => {
                      if (val) {
                        setIsCaptchaVerified(true);
                        // Subtle success feedback before closing
                        setTimeout(() => {
                           setShowCaptchaOverlay(false);
                           setTimeout(() => {
                              const form = document.querySelector('form');
                              if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                           }, 400);
                        }, 600);
                      }
                    }} 
                  />
                </div>
              </div>
            )}

            {/* Role Selection (Only on Register) - Dropdown Style */}
            {view === "register" && !isAdminLogin && (
              <div className="animate-fade-in stagger-2">
                <label style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "8px", display: "block" }}>
                  Je suis un(e)
                </label>
                <div style={{ position: "relative" }}>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    style={{
                      width: "100%", padding: "12px 16px", borderRadius: "12px", 
                      border: "1px solid #e5e7eb", fontSize: "14px", color: "#374151",
                      outline: "none", appearance: "none", background: "#fff",
                      cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}
                  >
                    <option value="" disabled>Sélectionnez un type d'utilisateur</option>
                    <option value="tenant">Locataire</option>
                    <option value="owner">Propriétaire</option>
                  </select>
                  <div style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#9ca3af" }}>
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            )}

            {/* Checkboxes for Terms and Marketing */}
            {view === "register" && (
              <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px" }}>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#4b5563", cursor: "pointer", userSelect: "none" }}>
                  <input 
                    type="checkbox" 
                    checked={agreesToTerms} 
                    onChange={(e) => setAgreesToTerms(e.target.checked)}
                    style={{ marginTop: "3px", cursor: "pointer" }}
                  />
                  <span>
                    J'accepte les <span style={{ color: "#2EC4C7", fontWeight: 600 }}>Conditions d'utilisation</span> et la <span style={{ color: "#2EC4C7", fontWeight: 600 }}>Politique de confidentialité</span>
                  </span>
                </label>
                <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "13px", color: "#4b5563", cursor: "pointer", userSelect: "none" }}>
                  <input 
                    type="checkbox" 
                    checked={wantsMarketing} 
                    onChange={(e) => setWantsMarketing(e.target.checked)}
                    style={{ marginTop: "3px", cursor: "pointer" }}
                  />
                  <span>Je souhaite recevoir des emails marketing sur les nouveaux biens et services</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              className="animate-fade-in stagger-4"
              type="submit"
              disabled={isLoading || (view === "register" && !agreesToTerms)}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px",
                background: isAdminLogin ? "#111827" : "#2EC4C7",
                color: "#fff", fontWeight: 700, fontSize: "16px",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                transition: "all 0.3s",
                boxShadow: `0 8px 15px -3px ${isAdminLogin ? "rgba(17,24,39,0.3)" : "rgba(46,196,199,0.3)"}`,
              }}
            >
              {isLoading ? "Traitement..." : (
                view === "login" ? "Se connecter" : 
                view === "register" ? "S'INSCRIRE" : 
                view === "forgot-password" ? "Envoyer le code" :
                view === "verify-code" ? "Vérifier le code" : "Confirmer"
              )}
              {!isLoading && (view === "login" || view === "register") && <ArrowRight size={20} />}
            </button>

            {/* Google Authentication (Only Login/Register) */}
            {(view === "login" || view === "register") && !isAdminLogin && (
              <div className="animate-fade-in stagger-4">
                <div style={{ display: "flex", alignItems: "center", margin: "16px 0", color: "#9ca3af", fontSize: "14px", fontWeight: 500 }}>
                  <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                  <span style={{ padding: "0 12px" }}>ou</span>
                  <div style={{ flex: 1, height: "1px", background: "#e5e7eb" }} />
                </div>
                
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CustomGoogleButton onClick={() => googleLogin()} view={view} />
                </div>
              </div>
            )}

            {/* Bottom Links */}
            <div className="animate-fade-in stagger-4" style={{ textAlign: "center", fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
              {view === "login" ? (
                !isAdminLogin && (
                  <>
                    Pas encore inscrit ?{" "}
                    <button type="button" onClick={() => { setView("register"); setIsAdminLogin(false); setError("") }} style={{ color: "#F27D72", fontWeight: 800, background: "none", border: "none", cursor: "pointer", transition: "all 0.2s" }}>
                      S&apos;inscrire
                    </button>
                  </>
                )
              ) : view === "register" ? (
                <>
                  Déjà membre ?{" "}
                  <button type="button" onClick={() => { setView("login"); setError("") }} style={{ color: "#F27D72", fontWeight: 800, background: "none", border: "none", cursor: "pointer" }}>
                    Se connecter
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => { setView("login"); setError(""); setSuccessMsg("") }} style={{ color: "#6b7280", fontWeight: 600, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
                  Retour à la connexion
                </button>
              )}
            </div>



            {/* Bottom Admin Toggle */}
            {(view === "login" || view === "register") && (
              <div className="animate-fade-in stagger-4" style={{ marginTop: "10px" }}>
                <button 
                  type="button" 
                  onClick={() => {
                    const goingAdmin = !isAdminLogin;
                    setIsAdminLogin(goingAdmin);
                    setView("login");
                    setError("");
                    if (goingAdmin) {
                      setEmail("admin@immosmart.tn");
                      setPassword("admin123");
                    } else {
                      setEmail("");
                      setPassword("");
                    }
                  }}
                  style={{ 
                    margin: "0 auto", display: "flex", alignItems: "center", gap: "8px", 
                    fontSize: "13px", color: "#9ca3af", background: "rgba(243,244,246,0.5)", 
                    padding: "8px 16px", borderRadius: "100px", border: "1px solid #f3f4f6",
                    cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.background = "#f3f4f6" }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "rgba(243,244,246,0.5)" }}
                >
                  <ShieldCheck size={16} />
                  {isAdminLogin ? "Retour au portail public" : "Accès réservé à l'administration"}
                </button>
              </div>
            )}

          </form>
        </div>
      </div>
    </div>
  )
}
