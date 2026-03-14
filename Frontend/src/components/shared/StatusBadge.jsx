export default function StatusBadge({ status }) {
  const classes = {
    draft: 'bg-gray-100 text-gray-700 border border-gray-200',
    waiting: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    ready: 'bg-blue-50 text-blue-700 border border-blue-200',
    done: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-red-50 text-red-700 border border-red-200',
  };

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  // Check if status exists, default to draft style if not matched
  const mappedStatus = status?.toLowerCase() || 'draft';
  const cls = classes[mappedStatus] || classes.draft;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {label}
    </span>
  );
}
