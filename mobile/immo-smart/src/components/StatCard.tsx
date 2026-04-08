type Props = {
  label: string
  value: string | number
}

const StatCard: React.FC<Props> = ({ label, value }) => (
  <article className="stat-card">
    <h4>{value}</h4>
    <p>{label}</p>
  </article>
)

export default StatCard
