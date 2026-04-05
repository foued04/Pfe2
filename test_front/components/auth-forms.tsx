"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useAuth, type UserRole } from "@/lib/auth-context"
import { ArrowRight, BadgeCheck, Building2, Eye, EyeOff, Home, KeyRound, ShieldCheck, Sparkles, X } from "lucide-react"
import { useGoogleLogin } from "@react-oauth/google"
import { ImageCaptcha } from "./image-captcha"
import styles from "./auth-forms.module.css"

type View = "login" | "register" | "forgot-password" | "verify-code" | "reset-password"

const ADMIN_EMAIL = "admin@immosmart.tn"
const ADMIN_PASSWORD = "admin123"

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  action,
  autoComplete = "off",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  icon?: ReactNode
  action?: ReactNode
  autoComplete?: string
}) {
  return (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <span className={styles.inputWrap}>
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <input
          className={`${styles.input} ${icon ? styles.withIcon : ""} ${action ? styles.withAction : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          required
        />
        {action ? <span className={styles.action}>{action}</span> : null}
      </span>
    </label>
  )
}

function CodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "")

  return (
    <label className={styles.field}>
      <span className={styles.label}>Code de verification</span>
      <div
        className={styles.codeRow}
        onPaste={(e) => {
          e.preventDefault()
          onChange(e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6))
        }}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(node) => {
              refs.current[i] = node
            }}
            className={styles.code}
            value={digit}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, "").slice(-1)
              const next = digits.slice()
              next[i] = d
              onChange(next.join(""))
              if (d && i < 5) refs.current[i + 1]?.focus()
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
            }}
          />
        ))}
      </div>
    </label>
  )
}

function GoogleButton({ view, onClick }: { view: View; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={styles.googleButton}>
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
      <span>{view === "register" ? "S'inscrire avec Google" : "Se connecter avec Google"}</span>
    </button>
  )
}

export function AuthForms({ initialView = "login", onClose }: { initialView?: View; onClose?: () => void }) {
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
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false)
  const [showCaptchaOverlay, setShowCaptchaOverlay] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

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
    setShowPassword(false)
  }

  useEffect(() => setIsMounted(true), [])
  useEffect(() => setView(initialView), [initialView])
  useEffect(() => {
    resetFields()
    setIsCaptchaVerified(false)
  }, [view])

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true)
      setError("")
      try {
        const { success, message } = await loginWithGoogle(tokenResponse.access_token)
        if (!success) setError(message || "Echec de la connexion Google")
      } catch {
        setError("Erreur lors de la connexion Google")
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => setError("Erreur Google OAuth"),
  })

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setIsLoading(true)
    try {
      if (view === "login") {
        const r = await login(email, password, isAdminLogin ? "admin" : undefined)
        if (!r.success) setError(r.message || "Email ou mot de passe incorrect")
      } else if (view === "register") {
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
        if (!isCaptchaVerified) {
          setShowCaptchaOverlay(true)
          setIsLoading(false)
          return
        }
        const r = await register({ name, email, phone, password, role })
        if (r.success) window.location.href = `/verify-email?email=${encodeURIComponent(email)}`
        else {
          setError(r.message || "Erreur lors de l'inscription")
          setIsCaptchaVerified(false)
        }
      } else if (view === "forgot-password") {
        const res = await fetch(`${API_URL}/auth/forgot-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
        const data = await res.json()
        if (res.ok) {
          setSuccessMsg(data.message)
          setView("verify-code")
        } else setError(data.message || "Erreur lors de la demande")
      } else if (view === "verify-code") {
        const res = await fetch(`${API_URL}/auth/verify-reset-code`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code: resetCode }) })
        const data = await res.json()
        if (res.ok) {
          setSuccessMsg("Code verifie avec succes.")
          setView("reset-password")
        } else setError(data.message || "Code invalide ou expire")
      } else {
        if (newPassword !== confirmNewPassword) {
          setError("Les nouveaux mots de passe ne correspondent pas.")
          setIsLoading(false)
          return
        }
        const res = await fetch(`${API_URL}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code: resetCode, newPassword }) })
        const data = await res.json()
        if (res.ok) {
          setSuccessMsg("Mot de passe mis a jour. Vous pouvez vous connecter.")
          setView("login")
        } else setError(data.message || "Erreur lors de la reinitialisation")
      }
    } catch {
      setError("Une erreur de connexion est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isMounted) return null

  const title = view === "login" ? (isAdminLogin ? "Acces administrateur" : "Connexion") : view === "register" ? "Creer un compte" : view === "forgot-password" ? "Mot de passe oublie" : view === "verify-code" ? "Verification du code" : "Nouveau mot de passe"
  const text = view === "login" ? (isAdminLogin ? "Acces reserve a l'administration ImmoSmart." : "Connectez-vous a votre espace immobilier.") : view === "register" ? "Creez votre compte pour gerer vos locations et vos biens." : view === "forgot-password" ? "Recevez un code par email pour recuperer votre acces." : view === "verify-code" ? "Entrez le code recu par email." : "Choisissez un nouveau mot de passe securise."
  const heroMetrics = [
    { value: "150+", label: "Biens verifies" },
    { value: "98%", label: "Clients satisfaits" },
    { value: "24h", label: "Reponse moyenne" },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <aside className={styles.left}>
          <div className={styles.leftOverlay}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}><Home size={18} /></span>
              <span className={styles.badgeText}>ImmoSmart</span>
            </div>
            <div className={styles.hero}>
              <p className={styles.kicker}>Plateforme immobiliere</p>
              <h2>
                Trouvez votre bien
                <br />
                avec une
                <br />
                <span className={styles.highlight}>experience premium</span>
              </h2>
              <p className={styles.copy}>Locations, annonces et contrats dans une interface claire, moderne et inspiree de l'univers ImmoSmart.</p>
              <div className={styles.metrics}>
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className={styles.metric}>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.right}>
          <div className={styles.card}>
            {onClose ? <button type="button" className={styles.close} onClick={() => { resetFields(); onClose() }}><X size={18} /></button> : null}
            <div className={styles.header}>
              <div className={styles.eyebrow}><Sparkles size={14} /> {isAdminLogin ? "Espace securise" : "Bienvenue"}</div>
              <h1>{title}</h1>
              <p>{text}</p>
            </div>

            {(view === "login" || view === "register") && (
              <div className={styles.tabs}>
                <button type="button" className={view === "login" ? styles.tabActive : styles.tab} onClick={() => setView("login")}>Connexion</button>
                {!isAdminLogin && <button type="button" className={view === "register" ? styles.tabActive : styles.tab} onClick={() => setView("register")}>Inscription</button>}
              </div>
            )}

            <form className={styles.form} onSubmit={submit}>
              {view === "register" && <Field label="Nom complet" value={name} onChange={setName} placeholder="Ex: Mohamed Ben Ali" icon={<BadgeCheck size={18} />} autoComplete="name" />}
              {(view === "login" || view === "register" || view === "forgot-password") && <Field label="Email" value={email} onChange={setEmail} placeholder={isAdminLogin ? ADMIN_EMAIL : "votre@email.tn"} type="email" icon={<Home size={18} />} autoComplete="email" />}
              {(view === "login" || view === "register") && <Field label="Mot de passe" value={password} onChange={setPassword} placeholder="6 caracteres minimum" type={showPassword ? "text" : "password"} icon={<KeyRound size={18} />} autoComplete={view === "login" ? "current-password" : "new-password"} action={<button type="button" className={styles.eye} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />}
              {view === "register" && <Field label="Confirmer le mot de passe" value={confirmPassword} onChange={setConfirmPassword} placeholder="Repetez le mot de passe" type={showPassword ? "text" : "password"} icon={<ShieldCheck size={18} />} autoComplete="new-password" />}
              {view === "register" && <Field label="Telephone" value={phone} onChange={setPhone} placeholder="Ex: +216 22 333 444" icon={<Building2 size={18} />} autoComplete="tel" />}
              {view === "login" && !isAdminLogin && <div className={styles.rowRight}><button type="button" className={styles.link} onClick={() => { setView("forgot-password"); setError(""); setSuccessMsg("") }}>Mot de passe oublie ?</button></div>}
              {view === "verify-code" && <CodeInput value={resetCode} onChange={setResetCode} />}
              {view === "reset-password" && <Field label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} placeholder="Nouveau mot de passe" type={showPassword ? "text" : "password"} icon={<KeyRound size={18} />} autoComplete="new-password" action={<button type="button" className={styles.eye} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>} />}
              {view === "reset-password" && <Field label="Confirmer le nouveau mot de passe" value={confirmNewPassword} onChange={setConfirmNewPassword} placeholder="Confirmez le mot de passe" type={showPassword ? "text" : "password"} icon={<ShieldCheck size={18} />} autoComplete="new-password" />}
              {view === "register" && !isAdminLogin && (
                <label className={styles.field}>
                  <span className={styles.label}>Type de compte</span>
                  <select className={styles.input} value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                    <option value="tenant">Locataire</option>
                    <option value="owner">Proprietaire</option>
                  </select>
                </label>
              )}
              {error ? <div className={`${styles.notice} ${styles.error}`}>{error}</div> : null}
              {successMsg ? <div className={`${styles.notice} ${styles.success}`}>{successMsg}</div> : null}
              {view === "register" && (
                <div className={styles.checks}>
                  <label><input type="checkbox" checked={agreesToTerms} onChange={(e) => setAgreesToTerms(e.target.checked)} /> J'accepte les conditions d'utilisation et la politique de confidentialite.</label>
                  <label><input type="checkbox" checked={wantsMarketing} onChange={(e) => setWantsMarketing(e.target.checked)} /> Je souhaite recevoir les nouveautes et offres d'ImmoSmart.</label>
                </div>
              )}
              <button type="submit" className={`${styles.submit} ${isAdminLogin ? styles.submitAdmin : ""}`} disabled={isLoading || (view === "register" && !agreesToTerms)}>
                {isLoading ? "Traitement..." : view === "login" ? "Se connecter" : view === "register" ? "Creer mon compte" : view === "forgot-password" ? "Envoyer le code" : view === "verify-code" ? "Verifier le code" : "Confirmer"}
                {!isLoading && (view === "login" || view === "register") ? <ArrowRight size={18} /> : null}
              </button>
              {(view === "login" || view === "register") && !isAdminLogin && <>
                <div className={styles.divider}><span>ou</span></div>
                <GoogleButton view={view} onClick={() => googleLogin()} />
              </>}
              <div className={styles.footer}>
                {view === "login" && !isAdminLogin && <p>Pas encore inscrit ? <button type="button" className={styles.linkAccent} onClick={() => { setView("register"); setError("") }}>Creer un compte</button></p>}
                {view === "register" && <p>Vous avez deja un compte ? <button type="button" className={styles.linkAccent} onClick={() => { setView("login"); setError("") }}>Se connecter</button></p>}
                {(view === "forgot-password" || view === "verify-code" || view === "reset-password") && <button type="button" className={styles.back} onClick={() => { setView("login"); setError(""); setSuccessMsg("") }}>Retour a la connexion</button>}
              </div>
              {(view === "login" || view === "register") && <button type="button" className={styles.admin} onClick={() => {
                const next = !isAdminLogin
                setIsAdminLogin(next)
                setView("login")
                setError("")
                setSuccessMsg("")
                if (next) {
                  setEmail(ADMIN_EMAIL)
                  setPassword(ADMIN_PASSWORD)
                } else {
                  setEmail("")
                  setPassword("")
                }
              }}><ShieldCheck size={16} /> {isAdminLogin ? "Retour au portail public" : "Acces reserve a l'administration"}</button>}
            </form>
          </div>
        </section>
      </div>

      {showCaptchaOverlay && (
        <div className={styles.overlay}>
          <div className={styles.overlayBg} onClick={() => setShowCaptchaOverlay(false)} />
          <div className={styles.overlayCard}>
            <button type="button" className={styles.close} onClick={() => setShowCaptchaOverlay(false)}><X size={18} /></button>
            <div className={styles.overlayHead}>
              <p>Verification finale</p>
              <h3>Confirmez que vous etes une personne reelle</h3>
            </div>
            <ImageCaptcha onVerify={(ok) => {
              if (!ok) return
              setIsCaptchaVerified(true)
              setTimeout(() => {
                setShowCaptchaOverlay(false)
                setTimeout(() => {
                  const form = document.querySelector("form")
                  if (form) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
                }, 120)
              }, 500)
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
