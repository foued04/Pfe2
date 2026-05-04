import type { ReactNode } from "react"

type Props = {
  id?: string
  title: string
  documentId: string
  date: string
  infoLeft?: ReactNode
  infoRight?: ReactNode
  footerNotes?: string
  children: ReactNode
}

const MobilePdfLayout: React.FC<Props> = ({
  id,
  title,
  documentId,
  date,
  infoLeft,
  infoRight,
  footerNotes,
  children,
}) => (
  <div id={id} className="mobile-pdf-layout">
    <div className="mobile-pdf-watermark">ImmoSmart Secure</div>

    <header className="mobile-pdf-header">
      <div>
        <div className="mobile-pdf-brand">
          <div className="mobile-pdf-badge">IS</div>
          <div>
            <h1>ImmoSmart</h1>
            <p>Excellence Immobiliere Premium</p>
          </div>
        </div>
        <div className="mobile-pdf-contact">
          <p>ImmoSmart Monastir</p>
          <p>Zone Touristique Skanes, 5000 Monastir</p>
          <p>+216 73 000 000 | contact@immosmart.tn</p>
        </div>
      </div>

      <div className="mobile-pdf-title-block">
        <h2>{title}</h2>
        <p>ID: #{documentId}</p>
        <span>DATE : {date}</span>
      </div>
    </header>

    {infoLeft || infoRight ? (
      <div className="mobile-pdf-info-grid">
        {infoLeft ? <div className="mobile-pdf-info-card">{infoLeft}</div> : null}
        {infoRight ? <div className="mobile-pdf-info-card mobile-pdf-info-right">{infoRight}</div> : null}
      </div>
    ) : null}

    <main className="mobile-pdf-main">{children}</main>

    <footer className="mobile-pdf-footer">
      <div>
        <p>{footerNotes || "Ce document est genere electroniquement par le systeme ImmoSmart Secure."}</p>
        <small>ImmoSmart.tn - Monastir, Tunisie - MF: 1234567/A/B/C/000</small>
      </div>
      <div className="mobile-pdf-footer-page">Page 1 / 1</div>
    </footer>
  </div>
)

export default MobilePdfLayout
