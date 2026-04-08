type PrimaryButtonProps = {
  label: string
  variant?: "solid" | "outline"
  full?: boolean
  onClick?: () => void
  disabled?: boolean
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ label, variant = "solid", full = false, onClick, disabled }) => (
  <button
    className={`primary-btn ${variant === "outline" ? "outline" : "solid"} ${full ? "full" : ""}`}
    onClick={onClick}
    disabled={disabled}
    type="button"
  >
    {label}
  </button>
)

export default PrimaryButton
