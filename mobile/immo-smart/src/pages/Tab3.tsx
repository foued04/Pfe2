import { IonContent, IonPage } from "@ionic/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { ImageCaptcha } from "../components/ImageCaptcha"
import { useAuth } from "../lib/auth-context"
import { http } from "../lib/api"
import { requestGoogleAccessToken } from "../lib/google-oauth"
import type { UserRole } from "../types/api"
import "./Tab3.css"

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
    <label className="auth-field">
      <span className="auth-label">{label}</span>
      <span className="auth-input-wrap">
        {icon ? <span className="auth-icon">{icon}</span> : null}
        <input
          className={`auth-input ${icon ? "with-icon" : ""} ${action ? "with-action" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          required
        />
        {action ? <span className="auth-action">{action}</span> : null}
      </span>
    </label>
  )
}

function CodeInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "")

  return (
    <label className="auth-field">
      <span className="auth-label">Code de verification</span>
      <div
        className="auth-code-row"
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
            className="auth-code"
            value={digit}
            inputMode="numeric"
            maxLength={1}
            onChange={(e) => {
              const nextDigit = e.target.value.replace(/\D/g, "").slice(-1)
              const next = digits.slice()
              next[i] = nextDigit
              onChange(next.join(""))
              if (nextDigit && i < 5) refs.current[i + 1]?.focus()
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
    <button type="button" onClick={onClick} className="google-button">
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

const getDashboardPath = (userRole?: UserRole | null) => {
  if (userRole === "owner" || userRole === "tenant") return "/tab3"
  if (userRole === "admin") return "/account"
  return "/tab3"
}

const Tab3: React.FC = () => {
  const { isAuthenticated, loading, user, login, register, loginWithGoogle } = useAuth()
  const history = useHistory()
  const location = useLocation()
  const [view, setView] = useState<View>("login")
  const [role, setRole] = useState<Extract<UserRole, "owner" | "tenant">>("tenant")
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [agreesToTerms, setAgreesToTerms] = useState(false)
  const [wantsMarketing, setWantsMarketing] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
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

  const heroMetrics = [
    { value: "150+", label: "Biens verifies" },
    { value: "98%", label: "Clients satisfaits" },
    { value: "24h", label: "Reponse moyenne" },
  ]

  const handleFieldChange = (setter: (val: string) => void) => (val: string) => {
    setter(val)
    if (error) setError("")
  }

  const resolveRedirect = (fallbackRole?: UserRole | null) => {
    const redirect = new URLSearchParams(location.search).get("redirect")
    return redirect || getDashboardPath(fallbackRole)
  }

  const navigateToAuthRoute = (nextView: Extract<View, "login" | "register">) => {
    const targetPath = nextView === "register" ? "/register" : "/login"
    history.replace(`${targetPath}${location.search}`)
  }

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
    setShowConfirmPassword(false)
    setShowConfirmNewPassword(false)
  }

  useEffect(() => {
    if (location.pathname === "/register") {
      setView("register")
      return
    }

    setView("login")
  }, [location.pathname])

  useEffect(() => {
    resetFields()
    setIsCaptchaVerified(false)
  }, [view])

  useEffect(() => {
    if (loading || !isAuthenticated) return

    if (location.pathname === "/account") {
      history.replace("/profile")
      return
    }

    if (location.pathname === "/login" || location.pathname === "/register") {
      history.replace(resolveRedirect(user?.role))
    }
  }, [history, isAuthenticated, loading, location.pathname, location.search, user?.role])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    setIsLoading(true)

    try {
      if (view === "login") {
        const result = await login(email, password, isAdminLogin ? "admin" : undefined)
        if (!result.success) {
          setError(result.message || "Email ou mot de passe incorrect")
          return
        }

        history.replace(resolveRedirect(result.role))
        return
      }

      if (view === "register") {
        if (password.length < 6) {
          setError("Le mot de passe doit contenir au moins 6 caracteres.")
          return
        }
        if (password !== confirmPassword) {
          setError("Les deux mots de passe ne correspondent pas.")
          return
        }
        if (!agreesToTerms) {
          setError("Veuillez accepter les conditions d'utilisation.")
          return
        }
        if (!isCaptchaVerified) {
          setShowCaptchaOverlay(true)
          return
        }

        const result = await register({ name, email, phone, password, role })
        if (!result.success) {
          setError(result.message || "Erreur lors de l'inscription")
          setIsCaptchaVerified(false)
          return
        }

        history.replace({
          pathname: "/verify-email",
          search: `?email=${encodeURIComponent(email)}`,
          state: {
            info: result.message,
            emailDelivered: result.emailDelivered,
          },
        })
        return
      }

      if (view === "forgot-password") {
        const data = await http.post<{ message: string }>("/auth/forgot-password", { email })
        setSuccessMsg(data.message)
        setView("verify-code")
        return
      }

      if (view === "verify-code") {
        await http.post<{ message: string }>("/auth/verify-reset-code", { email, code: resetCode })
        setSuccessMsg("Code verifie avec succes.")
        setView("reset-password")
        return
      }

      if (newPassword !== confirmNewPassword) {
        setError("Les nouveaux mots de passe ne correspondent pas.")
        return
      }

      await http.post<{ message: string }>("/auth/reset-password", {
        email,
        code: resetCode,
        newPassword,
      })
      setSuccessMsg("Mot de passe mis a jour. Vous pouvez vous connecter.")
      navigateToAuthRoute("login")
    } catch {
      setError("Une erreur de connexion est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuthClick = async () => {
    setError("")
    setIsLoading(true)

    try {
      const token = await requestGoogleAccessToken()
      const googleMode = view === "register" ? "register" : "login"
      const result = await loginWithGoogle(token, googleMode, googleMode === "register" ? role : undefined)

      if (!result.success) {
        setError(result.message || "Echec de la connexion Google")
        return
      }

      history.replace(resolveRedirect(result.role))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la connexion Google")
    } finally {
      setIsLoading(false)
    }
  }

  const title =
    view === "login"
      ? isAdminLogin
        ? "Acces administrateur"
        : "Connexion"
      : view === "register"
        ? "Creer un compte"
        : view === "forgot-password"
          ? "Mot de passe oublie"
          : view === "verify-code"
            ? "Verification du code"
            : "Nouveau mot de passe"

  const text =
    view === "login"
      ? isAdminLogin
        ? "Acces reserve a l'administration ImmoSmart."
        : "Connectez-vous a votre espace immobilier."
      : view === "register"
        ? "Creez votre compte pour gerer vos locations et vos biens."
        : view === "forgot-password"
          ? "Recevez un code par email pour recuperer votre acces."
          : view === "verify-code"
            ? "Entrez le code recu par email."
            : "Choisissez un nouveau mot de passe securise."

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <div className="auth-page">
          <div className="auth-shell">
            <aside className="auth-left">
              <div className="auth-left-overlay">
                <button type="button" className="auth-badge" onClick={() => history.push("/")}>
                  <span className="auth-badge-icon">IS</span>
                  <span className="auth-badge-text">ImmoSmart</span>
                </button>

                <div className="auth-hero">
                  <p className="auth-kicker">Plateforme immobiliere</p>
                  <h2>
                    Trouvez votre bien
                    <br />
                    avec une
                    <br />
                    <span className="auth-highlight">experience premium</span>
                  </h2>
                  <p className="auth-copy">
                    Locations, annonces et contrats dans une interface claire, moderne et inspiree de l'univers ImmoSmart.
                  </p>

                  <div className="auth-metrics">
                    {heroMetrics.map((metric) => (
                      <div key={metric.label} className="auth-metric">
                        <strong>{metric.value}</strong>
                        <span>{metric.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            <section className="auth-right">
              <div className="auth-card">
                <div className="auth-header">
                  <div className="auth-eyebrow">{isAdminLogin ? "Espace securise" : "Bienvenue"}</div>
                  <h1>{title}</h1>
                  <p>{text}</p>
                </div>

                {(view === "login" || view === "register") && (
                  <div className="auth-tabs">
                    <button type="button" className={view === "login" ? "auth-tab active" : "auth-tab"} onClick={() => navigateToAuthRoute("login")}>
                      Connexion
                    </button>
                    {!isAdminLogin ? (
                      <button
                        type="button"
                        className={view === "register" ? "auth-tab active" : "auth-tab"}
                        onClick={() => navigateToAuthRoute("register")}
                      >
                        Inscription
                      </button>
                    ) : null}
                  </div>
                )}

                <form className="auth-form" onSubmit={submit}>
                  {view === "register" ? (
                    <Field label="Nom complet" value={name} onChange={handleFieldChange(setName)} placeholder="Ex: Mohamed Ben Ali" icon="N" autoComplete="name" />
                  ) : null}

                  {(view === "login" || view === "register" || view === "forgot-password") ? (
                    <Field
                      label="Email"
                      value={email}
                      onChange={handleFieldChange(setEmail)}
                      placeholder={isAdminLogin ? ADMIN_EMAIL : "votre@email.tn"}
                      type="email"
                      icon="@"
                      autoComplete="email"
                    />
                  ) : null}

                  {(view === "login" || view === "register") ? (
                    <Field
                      label="Mot de passe"
                      value={password}
                      onChange={handleFieldChange(setPassword)}
                      placeholder="6 caracteres minimum"
                      type={showPassword ? "text" : "password"}
                      icon="*"
                      autoComplete={view === "login" ? "current-password" : "new-password"}
                      action={
                        <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? "Masquer" : "Afficher"}
                        </button>
                      }
                    />
                  ) : null}

                  {view === "register" ? (
                    <Field
                      label="Confirmer le mot de passe"
                      value={confirmPassword}
                      onChange={handleFieldChange(setConfirmPassword)}
                      placeholder="Repetez le mot de passe"
                      type={showConfirmPassword ? "text" : "password"}
                      icon="*"
                      autoComplete="new-password"
                      action={
                        <button type="button" className="auth-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                          {showConfirmPassword ? "Masquer" : "Afficher"}
                        </button>
                      }
                    />
                  ) : null}

                  {view === "register" ? (
                    <Field
                      label="Telephone"
                      value={phone}
                      onChange={(val) => handleFieldChange(setPhone)(val.replace(/\D/g, "").slice(0, 8))}
                      placeholder="Ex: 22 333 444"
                      type="tel"
                      icon="Tel"
                      autoComplete="tel"
                    />
                  ) : null}

                  {view === "login" && !isAdminLogin ? (
                    <div className="auth-row-right">
                      <button
                        type="button"
                        className="auth-link"
                        onClick={() => {
                          setView("forgot-password")
                          setError("")
                          setSuccessMsg("")
                        }}
                      >
                        Mot de passe oublie ?
                      </button>
                    </div>
                  ) : null}

                  {view === "verify-code" ? <CodeInput value={resetCode} onChange={handleFieldChange(setResetCode)} /> : null}

                  {view === "reset-password" ? (
                    <Field
                      label="Nouveau mot de passe"
                      value={newPassword}
                      onChange={handleFieldChange(setNewPassword)}
                      placeholder="Nouveau mot de passe"
                      type={showPassword ? "text" : "password"}
                      icon="*"
                      autoComplete="new-password"
                      action={
                        <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? "Masquer" : "Afficher"}
                        </button>
                      }
                    />
                  ) : null}

                  {view === "reset-password" ? (
                    <Field
                      label="Confirmer le nouveau mot de passe"
                      value={confirmNewPassword}
                      onChange={handleFieldChange(setConfirmNewPassword)}
                      placeholder="Confirmez le mot de passe"
                      type={showConfirmNewPassword ? "text" : "password"}
                      icon="*"
                      autoComplete="new-password"
                      action={
                        <button type="button" className="auth-eye" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}>
                          {showConfirmNewPassword ? "Masquer" : "Afficher"}
                        </button>
                      }
                    />
                  ) : null}

                  {view === "register" && !isAdminLogin ? (
                    <label className="auth-field">
                      <span className="auth-label">Type de compte</span>
                      <select className="auth-input" value={role} onChange={(e) => setRole(e.target.value as Extract<UserRole, "owner" | "tenant">)}>
                        <option value="tenant">Locataire</option>
                        <option value="owner">Locateur</option>
                      </select>
                    </label>
                  ) : null}

                  {error ? <div className="auth-notice auth-error">{error}</div> : null}
                  {successMsg ? <div className="auth-notice auth-success">{successMsg}</div> : null}

                  {view === "register" ? (
                    <div className="auth-checks">
                      <label>
                        <input type="checkbox" checked={agreesToTerms} onChange={(e) => setAgreesToTerms(e.target.checked)} />
                        <span>J'accepte les conditions d'utilisation et la politique de confidentialite.</span>
                      </label>
                      <label>
                        <input type="checkbox" checked={wantsMarketing} onChange={(e) => setWantsMarketing(e.target.checked)} />
                        <span>Je souhaite recevoir les nouveautes et offres d'ImmoSmart.</span>
                      </label>
                    </div>
                  ) : null}

                  <button type="submit" className={`auth-submit ${isAdminLogin ? "admin" : ""}`} disabled={isLoading || (view === "register" && !agreesToTerms)}>
                    {isLoading
                      ? "Traitement..."
                      : view === "login"
                        ? "Se connecter"
                        : view === "register"
                          ? "Creer mon compte"
                          : view === "forgot-password"
                            ? "Envoyer le code"
                            : view === "verify-code"
                              ? "Verifier le code"
                              : "Confirmer"}
                  </button>

                  {(view === "login" || view === "register") && !isAdminLogin ? (
                    <>
                      <div className="auth-divider">
                        <span>ou</span>
                      </div>
                      <GoogleButton view={view} onClick={handleGoogleAuthClick} />
                    </>
                  ) : null}

                  <div className="auth-footer">
                    {view === "login" && !isAdminLogin ? (
                      <p>
                        Pas encore inscrit ?{" "}
                        <button type="button" className="auth-link-accent" onClick={() => navigateToAuthRoute("register")}>
                          Creer un compte
                        </button>
                      </p>
                    ) : null}

                    {view === "register" ? (
                      <p>
                        Vous avez deja un compte ?{" "}
                        <button type="button" className="auth-link-accent" onClick={() => navigateToAuthRoute("login")}>
                          Se connecter
                        </button>
                      </p>
                    ) : null}

                    {(view === "forgot-password" || view === "verify-code" || view === "reset-password") ? (
                      <button
                        type="button"
                        className="auth-back"
                        onClick={() => {
                          navigateToAuthRoute("login")
                          setError("")
                          setSuccessMsg("")
                        }}
                      >
                        Retour a la connexion
                      </button>
                    ) : null}
                  </div>

                  {(view === "login" || view === "register") ? (
                    <button
                      type="button"
                      className="auth-admin"
                      onClick={() => {
                        const next = !isAdminLogin
                        setIsAdminLogin(next)
                        history.replace(`/login${location.search}`)
                        setError("")
                        setSuccessMsg("")
                        if (next) {
                          setEmail(ADMIN_EMAIL)
                          setPassword(ADMIN_PASSWORD)
                        } else {
                          setEmail("")
                          setPassword("")
                        }
                      }}
                    >
                      {isAdminLogin ? "Retour au portail public" : "Acces reserve a l'administration"}
                    </button>
                  ) : null}
                </form>
              </div>
            </section>
          </div>

          {showCaptchaOverlay ? (
            <div className="auth-overlay">
              <div className="auth-overlay-bg" onClick={() => setShowCaptchaOverlay(false)} />
              <div className="auth-overlay-card">
                <div className="auth-overlay-head">
                  <p>Verification finale</p>
                  <h3>Confirmez que vous etes une personne reelle</h3>
                </div>
                <ImageCaptcha
                  onVerify={(ok) => {
                    if (!ok) return
                    setIsCaptchaVerified(true)
                    window.setTimeout(() => {
                      setShowCaptchaOverlay(false)
                      window.setTimeout(() => {
                        const form = document.querySelector("form")
                        if (form) form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
                      }, 120)
                    }, 500)
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Tab3
