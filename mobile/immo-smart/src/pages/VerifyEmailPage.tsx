import { IonContent, IonPage } from "@ionic/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { useHistory, useLocation } from "react-router-dom"
import { API_URL } from "../lib/api"
import { useAuth } from "../lib/auth-context"

const getDashboardPath = (role?: string) => {
  if (role === "owner" || role === "tenant") return "/tab3"
  if (role === "admin") return "/account"
  return "/tab3"
}

function VerificationInput({
  length = 6,
  onChange,
  onComplete,
}: {
  length?: number
  onChange: (value: string) => void
  onComplete?: (value: string) => void
}) {
  const [code, setCode] = useState<string[]>(Array(length).fill(""))
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus()
  }

  const updateCode = (nextCode: string[]) => {
    setCode(nextCode)
    const combined = nextCode.join("")
    onChange(combined)
    if (nextCode.every((digit) => digit !== "") && onComplete) {
      onComplete(combined)
    }
  }

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    if (!digit && value !== "") return

    const nextCode = [...code]
    nextCode[index] = digit
    updateCode(nextCode)
    if (digit && index < length - 1) {
      focusInput(index + 1)
    }
  }

  return (
    <div className="verify-code-row" onPaste={(e) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, length)
      if (!pasted) return
      const nextCode = Array(length).fill("")
      pasted.split("").forEach((char, index) => {
        nextCode[index] = char
      })
      updateCode(nextCode)
    }}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={code[index]}
          onChange={(event) => handleChange(event.target.value, index)}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !code[index] && index > 0) {
              focusInput(index - 1)
            }
          }}
          className="verify-code-input"
        />
      ))}
    </div>
  )
}

const VerifyEmailPage: React.FC = () => {
  const history = useHistory()
  const location = useLocation<{
    info?: string
    emailDelivered?: boolean
  }>()
  const { verifyEmail } = useAuth()
  const [email, setEmail] = useState(new URLSearchParams(location.search).get("email") || "")
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState(() => location.state?.info || "")
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = window.setTimeout(() => setResendTimer((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendTimer])

  const maskedEmail = useMemo(() => email || "votre adresse email", [email])

  const handleVerify = async (targetEmail: string, targetCode: string) => {
    if (!targetEmail || targetCode.length < 6) return

    setIsLoading(true)
    setError("")
    setInfo("")

    try {
      const result = await verifyEmail(targetEmail, targetCode)
      if (!result.success) {
        setError(result.message || "Code invalide ou expire.")
        return
      }

      setSuccess(true)
      window.setTimeout(() => {
        history.replace(getDashboardPath(result.role))
      }, 1800)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email || resendTimer > 0) return

    setIsLoading(true)
    setError("")
    setInfo("")

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        setError("Erreur lors du renvoi du code.")
        return
      }

      const data = await response.json().catch(() => null) as { message?: string; emailDelivered?: boolean } | null
      const message = data?.message || "Un nouveau code de verification a ete envoye."
      setInfo(message)
      setResendTimer(60)
    } catch {
      setError("Erreur de connexion.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen className="auth-content">
        <main className="verify-page">
          <div className="verify-shell">
            <section className="verify-left">
              <div className="verify-left-inner">
                <div className="verify-home">ImmoSmart</div>
                <div>
                  <p className="verify-kicker">Verification securisee</p>
                  <h1>Confirmez votre adresse email pour activer votre espace.</h1>
                  <p className="verify-copy">
                    Saisissez le code recu par email pour finaliser votre connexion et acceder a votre tableau de bord ImmoSmart.
                  </p>
                </div>
                <div className="verify-email-box">
                  <p>Adresse verifiee</p>
                  <strong>{maskedEmail}</strong>
                </div>
              </div>
            </section>

            <section className="verify-right">
              <div className="verify-card">
                <div className="verify-header">
                  <h2>Verification du compte</h2>
                  <p>
                    {success ? "Votre compte est active. Redirection en cours vers votre espace." : `Entrez le code a 6 chiffres envoye a ${maskedEmail}.`}
                  </p>
                </div>

                {!success ? (
                  <div className="verify-form">
                    <label className="auth-field">
                      <span className="auth-label">Email</span>
                      <input
                        className="auth-input"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="votre@email.tn"
                      />
                    </label>

                    <div className="verify-code-block">
                      <p>Code de verification</p>
                      <VerificationInput length={6} onChange={setCode} onComplete={(value) => handleVerify(email, value)} />
                    </div>

                    {error ? <div className="auth-notice auth-error">{error}</div> : null}
                    {info ? <div className="auth-notice auth-success">{info}</div> : null}

                    <button type="button" className="auth-submit" disabled={isLoading || code.length < 6} onClick={() => handleVerify(email, code)}>
                      {isLoading ? "Verification..." : "Verifier le compte"}
                    </button>

                    <button type="button" className="verify-link" disabled={resendTimer > 0 || !email || isLoading} onClick={handleResend}>
                      {resendTimer > 0 ? `Renvoyer le code dans ${resendTimer}s` : "Je n'ai pas recu le code"}
                    </button>
                  </div>
                ) : (
                  <div className="verify-success-box">
                    <p>Compte active</p>
                    <span>Votre verification a bien ete prise en compte.</span>
                  </div>
                )}

                <button type="button" className="verify-back-home" onClick={() => history.push("/")}>
                  Retour a l'accueil
                </button>
              </div>
            </section>
          </div>
        </main>
      </IonContent>
    </IonPage>
  )
}

export default VerifyEmailPage
