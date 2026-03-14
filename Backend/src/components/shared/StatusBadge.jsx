export default function StatusBadge({ status }) {
  const classes = {
    draft: 'bg-gray-700 text-gray-300',
    waiting: 'bg-yellow-900 text-yellow-300',
    ready: 'bg-blue-900 text-blue-300',
    done: 'bg-green-900 text-green-300',
    cancelled: 'bg-red-900 text-red-300',
  };

  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  const cls = classes[status] || 'bg-gray-700 text-gray-300';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
