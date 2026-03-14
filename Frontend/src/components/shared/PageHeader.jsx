export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight" style={{ color: '#0f172a' }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1" style={{ color: '#94a3b8' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
