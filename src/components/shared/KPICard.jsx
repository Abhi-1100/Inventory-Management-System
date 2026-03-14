export default function KPICard({ title, value, icon: Icon, color = 'accent', subtitle }) {
  const colorMap = {
    accent: 'text-accent',
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    info: 'text-info',
  };

  return (
    <div className="bg-bg-card border border-border rounded-xl p-6 flex items-start gap-4 hover:border-accent/50 transition-colors">
      {Icon && (
        <div className={`p-3 rounded-lg bg-bg-surface ${colorMap[color]}`}>
          <Icon size={22} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase text-text-muted tracking-wider">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${colorMap[color]}`}>{value ?? '—'}</p>
        {subtitle && <p className="text-xs text-text-muted mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
