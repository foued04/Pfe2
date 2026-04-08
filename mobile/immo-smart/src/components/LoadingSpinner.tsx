type Props = {
  message?: string
}

const LoadingSpinner: React.FC<Props> = ({ message = "Chargement..." }) => (
  <div className="loading-spinner">
    <div className="loading-spinner-circle" />
    <p>{message}</p>
  </div>
)

export default LoadingSpinner
