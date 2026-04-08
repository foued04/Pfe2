type SectionHeaderProps = {
  badge?: string
  title: string
  subtitle?: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ badge, title, subtitle }) => (
  <div className="section-header">
    {badge ? <span className="section-badge">{badge}</span> : null}
    <h2>{title}</h2>
    {subtitle ? <p>{subtitle}</p> : null}
  </div>
)

export default SectionHeader
