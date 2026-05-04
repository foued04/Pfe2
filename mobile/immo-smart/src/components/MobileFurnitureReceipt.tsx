import { IonIcon } from "@ionic/react"
import { arrowBackOutline, downloadOutline, printOutline } from "ionicons/icons"
import { useState } from "react"
import type { BackendFurnitureOrder, BackendProperty, BackendAuthUser } from "../types/api"
import MobilePdfLayout from "./MobilePdfLayout"

type ReceiptItem = {
  id: string
  name: string
  category: string
  quantity: number
  price: number
}

type ReceiptOrder = {
  id: string
  propertyId: string
  propertyName: string
  date: string
  items: ReceiptItem[]
  total: number
  paymentMethod: string
  status: string
}

type Props = {
  order: ReceiptOrder
  property?: BackendProperty | null
  userName?: string
  userEmail?: string
  userPhone?: string
  onBack: () => void
}

const MobileFurnitureReceipt: React.FC<Props> = ({ order, property, userName, userEmail, userPhone, onBack }) => {
  const [isDownloading, setIsDownloading] = useState(false)

  const handlePrint = () => {
    const element = document.getElementById("mobile-receipt-content")
    if (!element) return

    const printWindow = window.open("", "_blank", "width=900,height=1200")
    if (!printWindow) return

    const styles = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((node) => node.outerHTML)
      .join("")

    printWindow.document.open()
    printWindow.document.write(`
      <html>
        <head>
          <title>Commande ImmoSmart ${order.id}</title>
          ${styles}
        </head>
        <body style="margin:0;background:#ffffff;">
          ${element.outerHTML}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true)
      const html2pdf = (await import("html2pdf.js")).default
      const element = document.getElementById("mobile-receipt-content")
      if (!element) return

      await html2pdf()
        .set({
          margin: 10,
          filename: `Commande-ImmoSmart-${order.id}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .from(element)
        .save()
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="mobile-receipt-shell">
      <div className="mobile-receipt-toolbar">
        <button type="button" className="mobile-receipt-tool-btn" onClick={onBack}>
          <IonIcon icon={arrowBackOutline} />
          Retour
        </button>
        <div className="mobile-receipt-tool-actions">
          <button type="button" className="mobile-receipt-tool-btn" onClick={handleDownloadPdf} disabled={isDownloading}>
            <IonIcon icon={downloadOutline} />
            {isDownloading ? "Generation..." : "PDF"}
          </button>
          <button type="button" className="mobile-receipt-tool-btn primary" onClick={handlePrint}>
            <IonIcon icon={printOutline} />
            Imprimer
          </button>
        </div>
      </div>

      <MobilePdfLayout
        id="mobile-receipt-content"
        title="Bon de Commande"
        documentId={order.id}
        date={order.date}
        infoLeft={
          <div className="mobile-receipt-party">
            <p className="mobile-receipt-kicker">Information Locataire</p>
            <strong>{userName || "Locataire ImmoSmart"}</strong>
            <p>{userEmail || "client@immosmart.tn"}</p>
            <p>{userPhone || "+216 00 000 000"}</p>
          </div>
        }
        infoRight={
          <div className="mobile-receipt-party">
            <p className="mobile-receipt-kicker">Bien Immobilier A Equiper</p>
            <strong>{order.propertyName}</strong>
            <p>{property ? `${property.city} - ${property.address}` : `ID Propriete: ${order.propertyId}`}</p>
            <p>{property ? `${property.type.toUpperCase()} - ${property.surface} m2` : "Validation ImmoSmart"}</p>
          </div>
        }
        footerNotes="Le reglement s'effectuera selon les termes convenus avec ImmoSmart. Ce document officiel valide la commande du mobilier pour le bien reference."
      >
        <div className="mobile-receipt-status-row">
          <span>Statut :</span>
          <strong>{order.status}</strong>
        </div>

        <table className="mobile-receipt-table">
          <thead>
            <tr>
              <th>Article</th>
              <th>Qt.</th>
              <th>Prix</th>
              <th>Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>
                  <strong>{item.name}</strong>
                  <span>{item.category}</span>
                </td>
                <td>{item.quantity}</td>
                <td>{item.price.toLocaleString("fr-TN")} DT</td>
                <td>{(item.price * item.quantity).toLocaleString("fr-TN")} DT</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mobile-receipt-total-box">
          <div>
            <span>Sous-total</span>
            <strong>{order.total.toLocaleString("fr-TN")} DT</strong>
          </div>
          <div>
            <span>Livraison</span>
            <strong>Offerte</strong>
          </div>
          <div className="grand-total">
            <span>Total a regler</span>
            <strong>{order.total.toLocaleString("fr-TN")} DT</strong>
            <small>{order.paymentMethod}</small>
          </div>
        </div>

        <div className="mobile-receipt-signatures">
          <div>
            <div className="signature-line" />
            <strong>Direction ImmoSmart</strong>
            <span>Cachet et Signature</span>
          </div>
          <div>
            <div className="signature-line" />
            <strong>Locataire</strong>
            <span>Lu et Approuve</span>
          </div>
        </div>
      </MobilePdfLayout>
    </div>
  )
}

export default MobileFurnitureReceipt
