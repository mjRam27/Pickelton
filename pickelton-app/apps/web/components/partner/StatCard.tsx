type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <div className="stat-card">
      <h4>{title}</h4>
      <h2>{value}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}