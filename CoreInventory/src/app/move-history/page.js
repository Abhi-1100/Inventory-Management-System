'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { format } from 'date-fns';
import { ChevronDown, X } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import api from '@/lib/axios';

const columnHelper = createColumnHelper();
const TYPES = ['receipt', 'delivery', 'transfer', 'adjustment'];

// Reusable styled dropdown pill — same design as Products page
function DropdownFilter({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find((o) => o.value === value);
  const displayLabel = selected ? `${label}: ${selected.label}` : `${label}: All`;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
        style={{
          backgroundColor: value ? 'rgba(240,124,40,0.08)' : '#f8fafc',
          border: `1px solid ${value ? '#f07c28' : '#e2e8f0'}`,
          color: value ? '#f07c28' : '#334155',
        }}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#f07c28'; }}
        onMouseOut={(e) => { if (!open && !value) e.currentTarget.style.borderColor = '#e2e8f0'; }}
      >
        {displayLabel}
        <ChevronDown size={14} style={{ color: value ? '#f07c28' : '#94a3b8' }} />
      </button>
      {open && (
        <div
          className="absolute left-0 mt-1 w-52 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
          style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0' }}
        >
          <button
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full text-left px-4 py-2 text-sm transition-colors"
            style={{ color: !value ? '#f07c28' : '#334155', fontWeight: !value ? 600 : 400 }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            All
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm transition-colors"
              style={{ color: value === opt.value ? '#f07c28' : '#334155', fontWeight: value === opt.value ? 600 : 400 }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
    Promise.all([
      api.get('/products', { params: { limit: 100 } }),
      api.get('/settings/locations'),
    ]).then(([p, l]) => {
      setProducts(p.data.data ?? []);
      setLocations(l.data.data ?? []);
    }).catch(() => {});
  }, []);

  const columns = [
    columnHelper.accessor('createdAt', {
      header: 'Date',
      cell: (info) => info.getValue() ? format(new Date(info.getValue()), 'MMM d, yyyy HH:mm') : '—',
    }),
    columnHelper.accessor('referenceNo', {
      header: 'Reference',
      cell: (info) => <span className="font-mono text-xs">{info.getValue()}</span>,
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <span
          className="capitalize text-xs font-semibold px-2 py-1 rounded-full"
          style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('product.name', {
      header: 'Product',
      cell: (info) => <span className="font-medium" style={{ color: '#0f172a' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('fromLocation.name', {
      header: 'From',
      cell: (info) => info.getValue() ?? <span style={{ color: '#94a3b8' }}>—</span>,
    }),
    columnHelper.accessor('toLocation.name', {
      header: 'To',
      cell: (info) => info.getValue() ?? <span style={{ color: '#94a3b8' }}>—</span>,
    }),
    columnHelper.accessor('quantityChange', {
      header: 'Qty Change',
      cell: (info) => {
        const v = info.getValue();
        return (
          <span
            className="font-semibold font-mono text-sm"
            style={{ color: v > 0 ? '#059669' : v < 0 ? '#dc2626' : '#94a3b8' }}
          >
            {v > 0 ? `+${v}` : v}
          </span>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => <span className="capitalize text-xs" style={{ color: '#94a3b8' }}>{info.getValue()}</span>,
    }),
  ];

  const setF = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  const hasActiveFilters = filters.type || filters.productId || filters.locationId || filters.from || filters.to;

  const dateInputStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '0.5rem',
    padding: '0.375rem 0.75rem',
    fontSize: '0.875rem',
    color: '#334155',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <AppLayout>
      <Toaster position="bottom-right" />
      <PageHeader title="Move History" subtitle={`${total} movement records`} />

      {/* Filter bar — same pill design as Products page */}
      <div
        className="bg-white rounded-xl p-4 flex flex-wrap items-center gap-3 mb-6"
        style={{ border: '1px solid #e2e8f0' }}
      >
        <span className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: '#94a3b8' }}>
          Filters:
        </span>

        {/* Type */}
        <DropdownFilter
          label="Type"
          value={filters.type}
          options={TYPES.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))}
          onChange={(v) => setF('type', v)}
        />

        {/* Product */}
        <DropdownFilter
          label="Product"
          value={filters.productId}
          options={products.map((p) => ({ value: p.id, label: p.name }))}
          onChange={(v) => setF('productId', v)}
        />

        {/* Location */}
        <DropdownFilter
          label="Location"
          value={filters.locationId}
          options={locations.map((l) => ({ value: l.id, label: l.name }))}
          onChange={(v) => setF('locationId', v)}
        />

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filters.from}
            onChange={(e) => setF('from', e.target.value)}
            style={filters.from ? { ...dateInputStyle, borderColor: '#f07c28', color: '#f07c28' } : dateInputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
            onBlur={(e) => { if (!filters.from) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; } }}
          />
          <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>to</span>
          <input
            type="date"
            value={filters.to}
            onChange={(e) => setF('to', e.target.value)}
            style={filters.to ? { ...dateInputStyle, borderColor: '#f07c28', color: '#f07c28' } : dateInputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
            onBlur={(e) => { if (!filters.to) { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; } }}
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ type: '', productId: '', locationId: '', from: '', to: '', page: 1 })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ml-auto"
            style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fecaca'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
          >
            <X size={13} />
            Clear Filters
          </button>
        )}
      </div>

      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        total={total}
        page={filters.page}
        limit={50}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
      />
    </AppLayout>
  );
}
