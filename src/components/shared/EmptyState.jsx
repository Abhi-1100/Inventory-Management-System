import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'There are no items to display yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-5 rounded-2xl mb-4" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
        <PackageOpen size={40} style={{ color: '#94a3b8' }} />
      </div>
      <h3 className="text-base font-medium mb-1" style={{ color: '#0f172a' }}>{title}</h3>
      <p className="text-sm max-w-xs" style={{ color: '#94a3b8' }}>{message}</p>
    </div>
  );
}
