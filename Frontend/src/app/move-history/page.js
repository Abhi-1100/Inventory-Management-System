'use client';
import { useEffect, useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { createColumnHelper } from '@tanstack/react-table';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import api from '@/lib/axios';

const columnHelper = createColumnHelper();
const TYPES = ['receipt', 'delivery', 'transfer', 'adjustment'];

export default function MoveHistoryPage() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({ type: '', productId: '', locationId: '', from: '', to: '', page: 1 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 50 };
      if (filters.type) params.type = filters.type;
      if (filters.productId) params.productId = filters.productId;
      if (filters.locationId) params.locationId = filters.locationId;
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      const res = await api.get('/move-history', { params });
      setData(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load move history', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    Promise.all([api.get('/products', { params: { limit: 100 } }), api.get('/settings/locations')]).then(([p, l]) => {
      setProducts(p.data.data ?? []);
      setLocations(l.data.data ?? []);
    }).catch(() => {});
  }, []);

  const columns = [
    columnHelper.accessor('createdAt', { header: 'Date', cell: (info) => info.getValue() ? format(new Date(info.getValue()), 'MMM d, yyyy HH:mm') : '—' }),
    columnHelper.accessor('referenceNo', { header: 'Reference', cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span> }),
    columnHelper.accessor('type', { header: 'Type', cell: (info) => <span className="capitalize text-text-secondary">{info.getValue()}</span> }),
    columnHelper.accessor('product.name', { header: 'Product', cell: (info) => <span className="font-medium">{info.getValue()}</span> }),
    columnHelper.accessor('fromLocation.name', { header: 'From', cell: (info) => info.getValue() ?? <span className="text-text-muted">—</span> }),
    columnHelper.accessor('toLocation.name', { header: 'To', cell: (info) => info.getValue() ?? <span className="text-text-muted">—</span> }),
    columnHelper.accessor('quantityChange', {
      header: 'Qty Change',
      cell: (info) => {
        const v = info.getValue();
        return <span className={`font-semibold font-mono ${v > 0 ? 'text-success' : v < 0 ? 'text-danger' : 'text-text-muted'}`}>{v > 0 ? `+${v}` : v}</span>;
      }
    }),
    columnHelper.accessor('status', { header: 'Status', cell: (info) => <span className="capitalize text-xs text-text-muted">{info.getValue()}</span> }),
  ];

  const setF = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <PageHeader title="Move History" subtitle={`${total} movement records`} />

      <div className="flex flex-wrap gap-3 mb-5">
        <select value={filters.type} onChange={(e) => setF('type', e.target.value)} className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors">
          <option value="">All Types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select value={filters.productId} onChange={(e) => setF('productId', e.target.value)} className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors">
          <option value="">All Products</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filters.locationId} onChange={(e) => setF('locationId', e.target.value)} className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors">
          <option value="">All Locations</option>
          {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={filters.from} onChange={(e) => setF('from', e.target.value)} className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors" />
          <span className="text-text-muted text-sm">to</span>
          <input type="date" value={filters.to} onChange={(e) => setF('to', e.target.value)} className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors" />
        </div>
        {(filters.type || filters.productId || filters.locationId || filters.from || filters.to) && (
          <button onClick={() => setFilters({ type: '', productId: '', locationId: '', from: '', to: '', page: 1 })} className="px-3 py-2 text-sm text-text-muted hover:text-text-primary border border-border rounded-lg hover:bg-bg-surface transition-colors">
            Clear Filters
          </button>
        )}
      </div>

      <DataTable data={data} columns={columns} loading={loading} total={total} page={filters.page} limit={50} onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))} />
    </AppLayout>
  );
}
