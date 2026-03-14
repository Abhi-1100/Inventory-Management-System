'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import StatusBadge from '@/components/shared/StatusBadge';
import api from '@/lib/axios';
import Link from 'next/link';

const columnHelper = createColumnHelper();
const STATUSES = ['draft', 'done', 'cancelled'];

export default function AdjustmentsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', page: 1 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 20 };
      if (filters.status) params.status = filters.status;
      const res = await api.get('/operations/adjustments', { params });
      setData(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load adjustments', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const columns = [
    columnHelper.accessor('referenceNo', { header: 'Reference No', cell: (info) => <span className="font-mono text-xs font-medium text-text-primary">{info.getValue()}</span> }),
    columnHelper.accessor('location.name', { header: 'Location', cell: (info) => info.getValue() ?? '—' }),
    columnHelper.accessor('createdAt', { header: 'Created Date', cell: (info) => info.getValue() ? format(new Date(info.getValue()), 'MMM d, yyyy') : '—' }),
    columnHelper.accessor('status', { header: 'Status', cell: (info) => <StatusBadge status={info.getValue()} /> }),
  ];

  return (
    <AppLayout>
      <Toaster position="bottom-right" />
      <PageHeader
        title="Adjustments"
        subtitle={`${total} adjustment(s)`}
        action={<Link href="/operations/adjustments/new" className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"><Plus size={16} /> New Adjustment</Link>}
      />
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))} className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <DataTable data={data} columns={columns} loading={loading} total={total} page={filters.page} limit={20} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} onRowClick={(row) => router.push(`/operations/adjustments/${row.id}`)} />
    </AppLayout>
  );
}
