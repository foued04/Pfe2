"use client"

import { useState, useEffect } from "react"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { Eye, EyeOff, Home, UserCheck, ArrowRight, ShieldCheck } from "lucide-react"
import Image from "next/image"

// ─── Types ──────────────────────────────────────────────────────────────────
type View = "login" | "register"
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
        background: "#4a5e3a",
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
      
      {/* Logo Container */}
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

      {/* Brand Name */}
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

      {/* Professional Symbolic Illustration */}
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
function FormInput({ label, type, placeholder, value, onChange, showEye, onToggleEye, className }: any) {
  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
      <label style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          style={{
            width: "100%", padding: "16px 18px", borderRadius: "14px",
            border: "1.5px solid #e5e7eb", background: "#f9fafb",
            fontSize: "15px", outline: "none", transition: "all 0.25s",
            boxSizing: "border-box", color: "#111827",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#4a5e3a"; e.currentTarget.style.backgroundColor = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(74,94,58,0.1)" }}
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

// ─── Main AuthForms Component ────────────────────────────────────────────────
export function AuthForms() {
  const { login, register } = useAuth()
  const [view, setView] = useState<View>("login")
  const [role, setRole] = useState<UserRole>("tenant")
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Fields
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      if (view === "login") {
        const loginRole = isAdminLogin ? "admin" : role
        const ok = await login(email, password, loginRole)
        if (!ok) setError("Email ou mot de passe incorrect")
      } else {
        const ok = await register({ name, email, phone: "", password, role: role as UserRole })
        if (!ok) setError("Cet email existe déjà")
      }
    } catch {
      setError("Une erreur est survenue")
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
    border: role === r && !isAdminLogin ? "2px solid #f59e0b" : "1.5px solid #e5e7eb",
    background: role === r && !isAdminLogin ? "#fffbeb" : "#fff",
    color: role === r && !isAdminLogin ? "#f59e0b" : "#6b7280",
    boxShadow: role === r && !isAdminLogin ? "0 4px 12px rgba(245,158,11,0.15)" : "none",
    transform: role === r && !isAdminLogin ? "scale(1.02)" : "scale(1)",
  })

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
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Header */}
            <div style={{ textAlign: "left" }}>
              <h1 className="animate-fade-in stagger-1" style={{ fontSize: "32px", fontWeight: 800, color: "#111827", marginBottom: "10px", letterSpacing: "-0.5px" }}>
                {view === "login" ? (isAdminLogin ? "Accès Admin" : "Connexion") : "Créer un compte"}
              </h1>
              <p className="animate-fade-in stagger-2" style={{ color: "#4b5563", fontSize: "16px", fontWeight: 400 }}>
                {view === "login" 
                  ? (isAdminLogin ? "Espace sécurisé pour l'administration de la plateforme" : "Bienvenue ! Connectez-vous à votre espace personnel") 
                  : "Inscrivez-vous en 1 minute sur ImmoSmart"}
              </p>
            </div>

            {/* Role Selection */}
            {!isAdminLogin && (
              <div className="animate-fade-in stagger-2">
                <label style={{ fontSize: "14px", fontWeight: 700, color: "#1f2937", marginBottom: "12px", display: "block", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Je suis un(e)
                </label>
                <div style={{ display: "flex", gap: "16px" }}>
                  <button type="button" onClick={() => setRole("owner")} style={roleBtnStyle("owner")}>
                    🏡 Propriétaire
                  </button>
                  <button type="button" onClick={() => setRole("tenant")} style={roleBtnStyle("tenant")}>
                    🔑 Locataire
                  </button>
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="animate-fade-in stagger-3" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {view === "register" && (
                <FormInput label="Nom complet" placeholder="Ex: Mohamed Ben Ali" value={name} onChange={setName} />
              )}
              <FormInput label="Email" type="email" placeholder={isAdminLogin ? "admin@immosmart.tn" : "votre@email.tn"} value={email} onChange={setEmail} />
              <FormInput 
                label="Mot de passe" 
                type={showPassword ? "text" : "password"} 
                placeholder="6 caractères minimum" 
                value={password} 
                onChange={setPassword}
                showEye={showPassword}
                onToggleEye={() => setShowPassword(!showPassword)}
              />
            </div>

            {error && (
              <div style={{ padding: "16px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "14px", color: "#dc2626", fontSize: "14px", fontWeight: 500 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              className="animate-fade-in stagger-4"
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", padding: "16px", borderRadius: "14px",
                background: isAdminLogin ? "#111827" : "#4a5e3a",
                color: "#fff", fontWeight: 700, fontSize: "16px",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
                transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                boxShadow: `0 10px 15px -3px ${isAdminLogin ? "rgba(17,24,39,0.3)" : "rgba(74,94,58,0.3)"}`,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px) scale(1.02)"; e.currentTarget.style.boxShadow = `0 15px 25px -5px ${isAdminLogin ? "rgba(17,24,39,0.4)" : "rgba(74,94,58,0.4)"}` }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0) scale(1)"; e.currentTarget.style.boxShadow = `0 10px 15px -3px ${isAdminLogin ? "rgba(17,24,39,0.3)" : "rgba(74,94,58,0.3)"}` }}
            >
              {isLoading ? "Vérification..." : (view === "login" ? "Se connecter" : "Créer mon compte")}
              {!isLoading && <ArrowRight size={20} />}
            </button>

            {/* Switch View */}
            <div className="animate-fade-in stagger-4" style={{ textAlign: "center", fontSize: "15px", color: "#6b7280" }}>
              {view === "login" ? (
                <>
                  Pas encore inscrit ?{" "}
                  <button type="button" onClick={() => { setView("register"); setIsAdminLogin(false) }} style={{ color: "#f59e0b", fontWeight: 800, background: "none", border: "none", cursor: "pointer", padding: "0 4px", transition: "all 0.2s" }}>
                    S&apos;inscrire
                  </button>
                </>
              ) : (
                <>
                  Déjà membre ?{" "}
                  <button type="button" onClick={() => setView("login")} style={{ color: "#f59e0b", fontWeight: 800, background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>
                    Se connecter
                  </button>
                </>
              )}
            </div>

            {/* Bottom Admin Toggle */}
            <div className="animate-fade-in stagger-4" style={{ marginTop: "10px" }}>
               <button 
                 type="button" 
                 onClick={() => { setIsAdminLogin(!isAdminLogin); setView("login"); setError("") }}
                 style={{ 
                   margin: "0 auto", 
                   display: "flex", 
                   alignItems: "center", 
                   gap: "8px", 
                   fontSize: "13px", 
                   color: "#9ca3af", 
                   background: "rgba(243,244,246,0.5)", 
                   padding: "8px 16px",
                   borderRadius: "100px",
                   border: "1px solid #f3f4f6",
                   cursor: "pointer",
                   transition: "all 0.2s"
                 }}
                 onMouseEnter={(e) => { e.currentTarget.style.color = "#4b5563"; e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.transform = "scale(1.05)" }}
                 onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; e.currentTarget.style.background = "rgba(243,244,246,0.5)"; e.currentTarget.style.transform = "scale(1)" }}
               >
                 <ShieldCheck size={16} />
                 {isAdminLogin ? "Retour au portail public" : "Accès réservé à l'administration"}
               </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
