import { IonContent, IonIcon, IonPage } from "@ionic/react"
import {
  sparklesOutline,
  homeOutline,
  keyOutline,
  eyeOutline,
  eyeOffOutline,
  checkmarkCircleOutline,
  personOutline,
  mailOutline,
  callOutline,
  arrowForwardOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons"
import { useMemo, useState, useEffect } from "react"
import { http } from "../lib/api"
import { useAuth } from "../lib/auth-context"
import "./Tab3.css"

type AuthMode = "login" | "register" | "verify-email" | "forgot-password" | "verify-reset-code" | "reset-password"

const ADMIN_EMAIL = "admin@immosmart.tn"
const ADMIN_PASSWORD = "admin123"

const Tab3: React.FC = () => {
  const { user, isAuthenticated, login, register, verifyEmail, logout, loading } = useAuth()
  const [mode, setMode] = useState<AuthMode>("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [resetCode, setResetCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState<"tenant" | "owner">("tenant")
  const [isAdminLogin, setIsAdminLogin] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptNews, setAcceptNews] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const title = useMemo(() => {
    if (loading) return "Connexion en cours"
    if (!isAuthenticated) return "Connexion"
    return `Bienvenue ${user?.name}`
  }, [loading, isAuthenticated, user])

  useEffect(() => {
    if (!isAuthenticated || !user) return

    // When the user is authenticated, stay on the auth page and show the logged-in status.
    // This app is intentionally limited to authentication only.
  }, [isAuthenticated, user])

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError("")
    setSuccess("")
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError("")
    setSuccess("")

    try {
      if (mode === "login") {
        const result = await login(email, password, isAdminLogin ? "admin" : undefined)
        if (!result.success) {
          throw new Error(result.message || "Email ou mot de passe incorrect")
        }
        setPassword("")
        setSuccess("Connexion reussie.")
      } else if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas")
        }
        if (!acceptTerms) {
          throw new Error("Veuillez accepter les conditions d'utilisation")
        }

        const result = await register({
          fullName,
          email,
          password,
          role,
          phone,
        })

        if (!result.success) {
          throw new Error(result.message || "Erreur inscription")
        }

        setVerificationCode("")
        switchMode("verify-email")
        setSuccess(result.devCode ? `Code de verification (dev): ${result.devCode}` : "Code envoye par email.")
      } else if (mode === "verify-email") {
        if (!verificationCode.trim()) {
          throw new Error("Saisissez le code de verification recu par email")
        }

        const result = await verifyEmail(email, verificationCode)
        if (!result.success) {
          throw new Error(result.message || "Verification impossible")
        }

        setSuccess(result.message || "Email verifie avec succes.")
      } else if (mode === "forgot-password") {
        await http.post<{ message: string }>("/auth/forgot-password", { email: email.trim().toLowerCase() })
        switchMode("verify-reset-code")
        setSuccess("Code de reinitialisation envoye. Verifiez votre email.")
      } else if (mode === "verify-reset-code") {
        await http.post<{ message: string }>("/auth/verify-reset-code", {
          email: email.trim().toLowerCase(),
          code: resetCode.trim(),
        })
        switchMode("reset-password")
        setSuccess("Code valide. Definissez votre nouveau mot de passe.")
      } else {
        if (newPassword !== confirmNewPassword) {
          throw new Error("Les nouveaux mots de passe ne correspondent pas")
        }

        await http.post<{ message: string }>("/auth/reset-password", {
          email: email.trim().toLowerCase(),
          code: resetCode.trim(),
          newPassword: newPassword.trim(),
        })

        setNewPassword("")
        setConfirmNewPassword("")
        setResetCode("")
        switchMode("login")
        setSuccess("Mot de passe reinitialise avec succes. Vous pouvez vous connecter.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Operation impossible")
    } finally {
      setBusy(false)
    }
  }

  const startForgotPassword = () => {
    setError("")
    setSuccess("")
    if (!email.trim()) {
      setError("Saisissez votre email avant de demander la reinitialisation")
      return
    }

    switchMode("forgot-password")
  }

  const toggleAdmin = () => {
    const next = !isAdminLogin
    setIsAdminLogin(next)
    switchMode("login")

    if (next) {
      setEmail(ADMIN_EMAIL)
      setPassword(ADMIN_PASSWORD)
      return
    }

    setEmail("")
    setPassword("")
  }

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <div className="auth-page-shell">
          <aside className="auth-hero">
            <div className="auth-hero-overlay">
              <div className="auth-brand">
                <IonIcon icon={homeOutline} />
                <span>ImmoSmart</span>
              </div>

              <p className="auth-kicker">Plateforme immobiliere</p>
              <h2>
                Trouvez votre bien
                <br />
                avec une
                <br />
                <span>experience premium</span>
              </h2>
              <p className="auth-copy">
                Locations, annonces et contrats dans une interface claire, moderne et inspiree de l'univers ImmoSmart.
              </p>

              <div className="auth-metrics">
                <div>
                  <strong>150+</strong>
                  <small>Biens verifies</small>
                </div>
                <div>
                  <strong>98%</strong>
                  <small>Clients satisfaits</small>
                </div>
                <div>
                  <strong>24h</strong>
                  <small>Reponse moyenne</small>
                </div>
              </div>
            </div>
          </aside>

          <section className="auth-form-side">
            {isAuthenticated ? (
              <div className="auth-card logged-card">
                <div className="welcome-badge">
                  <IonIcon icon={checkmarkCircleOutline} />
                  Session active
                </div>
                <h1>{title}</h1>
                <p className="subtitle">Connexion reussie sur le meme backend que la version web.</p>
                <div className="logged-grid">
                  <div>
                    <span>Nom</span>
                    <strong>{user?.name}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong>{user?.email}</strong>
                  </div>
                  <div>
                    <span>Role</span>
                    <strong>{user?.role}</strong>
                  </div>
                </div>
                <button type="button" className="submit-btn" onClick={logout}>
                  Se deconnecter
                </button>
              </div>
            ) : (
              <form className="auth-card" onSubmit={submit}>
                <div className="welcome-badge">
                  <IonIcon icon={sparklesOutline} />
                  {isAdminLogin ? "Espace securise" : "Bienvenue"}
                </div>

                <h1>
                  {mode === "login" && (isAdminLogin ? "Acces administrateur" : "Connexion")}
                  {mode === "register" && "Inscription"}
                  {mode === "verify-email" && "Verifier votre email"}
                  {mode === "forgot-password" && "Mot de passe oublie"}
                  {mode === "verify-reset-code" && "Verifier le code"}
                  {mode === "reset-password" && "Nouveau mot de passe"}
                </h1>
                <p className="subtitle">
                  {mode === "login"
                    ? isAdminLogin
                      ? "Acces reserve a l'administration ImmoSmart."
                      : "Connectez-vous a votre espace immobilier."
                    : mode === "register"
                      ? "Creez votre compte pour commencer."
                      : mode === "verify-email"
                        ? "Entrez le code recu pour activer votre compte."
                        : mode === "forgot-password"
                          ? "Recevez un code par email pour recuperer votre acces."
                          : mode === "verify-reset-code"
                            ? "Entrez le code envoye a votre adresse email."
                            : "Choisissez un nouveau mot de passe securise."}
                </p>

                {(mode === "login" || mode === "register") && (
                  <div className="auth-tabs">
                    <button type="button" className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")}>
                      Connexion
                    </button>
                    {!isAdminLogin && (
                      <button type="button" className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")}>
                        Inscription
                      </button>
                    )}
                  </div>
                )}

                {mode === "register" && (
                  <label className="auth-field">
                    <span>Nom complet</span>
                    <div className="auth-field-input">
                      <IonIcon icon={personOutline} />
                      <input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Ex: Mohamed Ben Ali" />
                    </div>
                  </label>
                )}

                <label className="auth-field">
                  <span>Email</span>
                  <div className="auth-field-input">
                    <IonIcon icon={mailOutline} />
                    <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="votre@email.tn" />
                  </div>
                </label>

                {(mode === "login" || mode === "register" || mode === "reset-password") && (
                  <label className="auth-field">
                    <span>{mode === "reset-password" ? "Nouveau mot de passe" : "Mot de passe"}</span>
                    <div className="auth-field-input">
                      <IonIcon icon={keyOutline} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={mode === "reset-password" ? newPassword : password}
                        onChange={(event) =>
                          mode === "reset-password" ? setNewPassword(event.target.value) : setPassword(event.target.value)
                        }
                        placeholder={mode === "reset-password" ? "Nouveau mot de passe" : "6 caracteres minimum"}
                      />
                      <button type="button" className="eye-btn" onClick={() => setShowPassword((prev) => !prev)}>
                        <IonIcon icon={showPassword ? eyeOffOutline : eyeOutline} />
                      </button>
                    </div>
                  </label>
                )}

                {mode === "register" && (
                  <>
                    <label className="auth-field">
                      <span>Confirmer le mot de passe</span>
                      <div className="auth-field-input">
                        <IonIcon icon={keyOutline} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(event) => setConfirmPassword(event.target.value)}
                          placeholder="Repetez le mot de passe"
                        />
                      </div>
                    </label>

                    <label className="auth-field">
                      <span>Telephone</span>
                      <div className="auth-field-input">
                        <IonIcon icon={callOutline} />
                        <input type="tel" maxLength={8} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Ex: 22 333 444" />
                      </div>
                    </label>

                    <label className="auth-field">
                      <span>Type de compte</span>
                      <div className="auth-field-input no-icon">
                        <select value={role} onChange={(event) => setRole(event.target.value as "tenant" | "owner")}>
                          <option value="tenant">Locataire</option>
                          <option value="owner">Proprietaire</option>
                        </select>
                      </div>
                    </label>

                    <label className="check-row">
                      <input type="checkbox" checked={acceptTerms} onChange={(event) => setAcceptTerms(event.target.checked)} />
                      <span>J'accepte les conditions d'utilisation et la politique de confidentialite.</span>
                    </label>
                    <label className="check-row">
                      <input type="checkbox" checked={acceptNews} onChange={(event) => setAcceptNews(event.target.checked)} />
                      <span>Je souhaite recevoir les nouveautes et offres d'ImmoSmart.</span>
                    </label>
                  </>
                )}

                {mode === "verify-email" && (
                  <label className="auth-field">
                    <span>Code de verification</span>
                    <div className="auth-field-input">
                      <IonIcon icon={mailOutline} />
                      <input
                        value={verificationCode}
                        onChange={(event) => setVerificationCode(event.target.value)}
                        placeholder="Ex: 123456"
                        inputMode="numeric"
                      />
                    </div>
                  </label>
                )}

                {mode === "forgot-password" && (
                  <p className="panel-copy">
                    Nous allons envoyer un code a votre email pour reinitialiser votre mot de passe.
                  </p>
                )}

                {mode === "verify-reset-code" && (
                  <label className="auth-field">
                    <span>Code de reinitialisation</span>
                    <div className="auth-field-input">
                      <IonIcon icon={mailOutline} />
                      <input
                        value={resetCode}
                        onChange={(event) => setResetCode(event.target.value)}
                        placeholder="Ex: 654321"
                        inputMode="numeric"
                      />
                    </div>
                  </label>
                )}

                {mode === "reset-password" ? (
                  <label className="auth-field">
                    <span>Confirmer le nouveau mot de passe</span>
                    <div className="auth-field-input">
                      <IonIcon icon={keyOutline} />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(event) => setConfirmNewPassword(event.target.value)}
                        placeholder="Repetez le nouveau mot de passe"
                      />
                    </div>
                  </label>
                ) : null}

                {mode === "login" ? (
                  <button type="button" className="forgot-link" onClick={startForgotPassword}>
                    Mot de passe oublie ?
                  </button>
                ) : null}

                {error ? <p className="auth-status error">{error}</p> : null}
                {success ? <p className="auth-status success">{success}</p> : null}

                <button type="submit" className="submit-btn" disabled={busy || loading}>
                  {busy
                    ? "Traitement..."
                    : mode === "login"
                      ? "Se connecter"
                      : mode === "register"
                        ? "Creer mon compte"
                        : mode === "verify-email"
                          ? "Verifier mon email"
                          : mode === "forgot-password"
                            ? "Envoyer le code"
                            : mode === "verify-reset-code"
                              ? "Verifier le code"
                              : "Confirmer le nouveau mot de passe"}
                  {(mode === "login" || mode === "register") && <IonIcon icon={arrowForwardOutline} />}
                </button>

                {(mode === "login" || mode === "register") && (
                  <>
                    <div className="separator">
                      <span>OU</span>
                    </div>

                    <button
                      type="button"
                      className="google-btn"
                      onClick={() => setError("Connexion Google disponible sur la version web actuellement.")}
                    >
                      <span className="google-icon">G</span>
                      {mode === "register" ? "S'inscrire avec Google" : "Se connecter avec Google"}
                    </button>
                  </>
                )}

                {mode !== "login" && mode !== "register" && (
                  <button type="button" className="link-btn" onClick={() => switchMode("login")}>
                    Retour a la connexion
                  </button>
                )}

                {(mode === "login" || mode === "register") && (
                  <button type="button" className="link-btn" onClick={toggleAdmin}>
                    <IonIcon icon={shieldCheckmarkOutline} />
                    {isAdminLogin ? "Retour au portail public" : "Acces reserve a l'administration"}
                  </button>
                )}
              </form>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default Tab3
