import { PackageOpen } from 'lucide-react';

export default function EmptyState({ title = 'No records found', message = 'There are no items to display yet.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="p-5 bg-bg-surface border border-border rounded-2xl mb-4">
        <PackageOpen size={40} className="text-text-muted" />
      </div>
      <h3 className="text-base font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-sm text-text-muted max-w-xs">{message}</p>
    </div>
  );
}
