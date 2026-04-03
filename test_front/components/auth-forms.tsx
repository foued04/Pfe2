"use client"

import { useState, useEffect } from "react"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { useI18n } from "@/lib/i18n"
import { Eye, EyeOff, Home, ArrowRight, ShieldCheck, Mail, KeyRound, CheckCircle2 } from "lucide-react"
import { GoogleLogin } from "@react-oauth/google"
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
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
  @keyframes slideInRight {
    from { transform: translateX(30px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  .animate-fade-in {
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .animate-float {
    animation: float 4s ease-in-out infinite;
  }
  .animate-slide {
    animation: slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .stagger-1 { animation-delay: 0.1s; }
  .stagger-2 { animation-delay: 0.2s; }
  .stagger-3 { animation-delay: 0.3s; }
  .stagger-4 { animation-delay: 0.4s; }
`

// ─── Left Panel ─────────────────────────────────────────────────────────────
function LeftPanel() {
  return (
    <div
      style={{
        flex: "0 0 45%",
        background: "#158C96",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 40px",
        minHeight: "100vh",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <style>{animations}</style>
      
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
          style={{
            width: "100%", padding: "16px 18px", borderRadius: "14px",
            border: "1.5px solid #e5e7eb", background: "#f9fafb",
            fontSize: "15px", outline: "none", transition: "all 0.25s",
            boxSizing: "border-box", color: "#111827",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#2D7C84"; e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(74,94,58,0.1)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.backgroundColor = "#f9fafb"; e.currentTarget.style.boxShadow = "none" }}
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

// ─── Main AuthForms Component ────────────────────────────────────────────────
export function AuthForms() {
  const { lang } = useI18n()
  const { login, register, loginWithGoogle } = useAuth()
  const [view, setView] = useState<View>("login")
  const [role, setRole] = useState<UserRole>("tenant")
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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
  const [captchaAnswer, setCaptchaAnswer] = useState("")
  const [captchaExpected, setCaptchaExpected] = useState(0)
  const [captchaQuestion, setCaptchaQuestion] = useState("")

  useEffect(() => {
    setIsMounted(true)
    generateCaptcha()
  }, [])

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1
    const b = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`Combien font ${a} + ${b} ?`)
    setCaptchaExpected(a + b)
    setCaptchaAnswer("")
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

  const handleGoogleSuccess = async (response: any) => {
    setIsLoading(true)
    setError("")
    try {
      const { success, message } = await loginWithGoogle(response.credential)
      if (!success) {
        setError(message || "Échec de la connexion Google")
      }
    } catch {
      setError("Erreur lors de la connexion Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setIsLoading(true)

    try {
      if (view === "login") {
        const loginRole = isAdminLogin ? "admin" : role
        const { success, message } = await login(email, password, loginRole)
        if (!success) setError(message || "Email ou mot de passe incorrect")
      } 
      else if (view === "register") {
        if (password !== confirmPassword) {
          setError("Les mots de passe ne correspondent pas.")
          setIsLoading(false)
          return
        }
        if (parseInt(captchaAnswer) !== captchaExpected) {
          setError("Réponse de vérification humaine incorrecte.")
          generateCaptcha()
          setIsLoading(false)
          return
        }
        const { success, message } = await (register as any)({ name, email, phone, password, role: role as UserRole })
        if (success) {
          window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
        } else {
          setError(message || "Erreur lors de l'inscription")
          generateCaptcha()
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
      }}>
        <div className="animate-slide" style={{ width: "100%", maxWidth: "440px" }}>
          
          <div style={{ textAlign: "left", marginBottom: "28px" }}>
            <h1 className="animate-fade-in stagger-1" style={{ fontSize: "32px", fontWeight: 800, color: "#111827", marginBottom: "10px", letterSpacing: "-0.5px" }}>
              {getHeader()}
            </h1>
            <p className="animate-fade-in stagger-2" style={{ color: "#4b5563", fontSize: "16px", fontWeight: 400 }}>
              {getSubtext()}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Role Selection (Only on Login/Register) */}
            {(view === "login" || view === "register") && !isAdminLogin && (
              <div className="animate-fade-in stagger-2">
                <label style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "12px", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Je suis un(e)
                </label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button type="button" onClick={() => setRole("owner")} style={roleBtnStyle("owner")}>Propriétaire</button>
                  <button type="button" onClick={() => setRole("tenant")} style={roleBtnStyle("tenant")}>Locataire</button>
                </div>
              </div>
            )}

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
                  <div style={{ textAlign: "right", marginTop: "8px" }}>
                    <Link href={`/verify-email?email=${encodeURIComponent(email)}`} style={{ color: "#158C96", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>
                      Vérifier mon compte
                    </Link>
                  </div>
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


              {/* Bot Check for Register */}
              {view === "register" && (
                 <div style={{ background: "#f3f4f6", padding: "16px", borderRadius: "14px", border: "1px dashed #d1d5db" }}>
                   <label style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "8px", display: "block" }}>
                     Anti-bot : {captchaQuestion}
                   </label>
                   <input
                     type="number"
                     value={captchaAnswer}
                     onChange={(e) => setCaptchaAnswer(e.target.value)}
                     required
                     placeholder="Votre réponse"
                     style={{
                       width: "100%", padding: "10px 14px", borderRadius: "8px",
                       border: "1px solid #d1d5db", fontSize: "14px", outline: "none"
                     }}
                   />
                 </div>
              )}
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

            {/* Submit Button */}
            <button
              className="animate-fade-in stagger-4"
              type="submit"
              disabled={isLoading}
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
                view === "register" ? "Créer mon compte" : 
                view === "forgot-password" ? "Envoyer le code" :
                view === "verify-code" ? "Vérifier le code" : "Confirmer le mot de passe"
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
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setError("Erreur Google OAuth")}
                    useOneTap
                    theme="outline"
                    size="large"
                    shape="pill"
                    width="100%"
                  />
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
