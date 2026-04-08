import { IonIcon } from "@ionic/react"

type Props = {
  icon: string
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

const EmptyState: React.FC<Props> = ({ icon, title, message, actionLabel, onAction }) => (
  <div className="empty-state">
    <IonIcon icon={icon} />
    <p style={{ fontWeight: 700, marginBottom: 4 }}>{title}</p>
    {message ? <p style={{ fontSize: 12 }}>{message}</p> : null}
    {actionLabel && onAction ? (
      <button
        type="button"
        className="primary-btn solid"
        style={{ marginTop: 10, fontSize: 13 }}
        onClick={onAction}
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
)

export default EmptyState
