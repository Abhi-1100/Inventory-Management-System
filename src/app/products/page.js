'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, AlertTriangle, PackageX, Download, Printer, MoreVertical, Package, ChevronDown, Filter } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import DataTable from '@/components/shared/DataTable';
import api from '@/lib/axios';
import Link from 'next/link';

// Custom dropdown pill filter button
function DropdownFilter({ label, value, options, onChange, placeholder }) {
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
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          color: '#334155',
        }}
        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#f07c28'; }}
        onMouseOut={(e) => { if (!open) e.currentTarget.style.borderColor = '#e2e8f0'; }}
      >
        {displayLabel}
        <ChevronDown size={14} style={{ color: '#94a3b8' }} />
      </button>
      {open && (
        <div
          className="absolute left-0 mt-1 w-48 rounded-xl shadow-lg z-50 py-1 overflow-hidden"
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

const columnHelper = createColumnHelper();

// Status badge component
function StockStatusBadge({ row }) {
  if (row.isOutOfStock) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border"
        style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#dc2626' }} />
        Out of Stock
      </span>
    );
  }
  if (row.isLowStock) {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border"
        style={{ backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fecaca' }}
      >
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#dc2626' }} />
        Low Stock
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full border"
      style={{ backgroundColor: '#d1fae5', color: '#059669', borderColor: '#a7f3d0' }}
    >
      In Stock
    </span>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', categoryId: '', statusFilter: '', page: 1 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 20 };
      if (filters.search) params.search = filters.search;
      if (filters.categoryId) params.categoryId = filters.categoryId;
      const res = await api.get('/products', { params });
      setData(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load products', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    api.get('/products/categories').then((res) => setCategories(res.data.data ?? [])).catch(() => {});
  }, []);

  const columns = [
    // Product Name with icon placeholder
    columnHelper.accessor('name', {
      header: 'Product Name',
      cell: (info) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#f1f5f9' }}
          >
            <Package size={18} style={{ color: '#94a3b8' }} />
          </div>
          <span className="font-semibold text-sm" style={{ color: '#0f172a' }}>
            {info.getValue()}
          </span>
        </div>
      ),
    }),
    // SKU
    columnHelper.accessor('sku', {
      header: 'SKU',
      cell: (info) => (
        <span className="font-mono text-xs" style={{ color: '#94a3b8' }}>
          {info.getValue() || '—'}
        </span>
      ),
    }),
    // Category
    columnHelper.accessor('category.name', {
      header: 'Category',
      cell: (info) => info.getValue() ? (
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ backgroundColor: '#f1f5f9', color: '#475569' }}
        >
          {info.getValue()}
        </span>
      ) : '—',
    }),
    // Unit of Measure
    columnHelper.accessor('unitOfMeasure', {
      header: 'UoM',
      cell: (info) => <span className="text-sm">{info.getValue() || '—'}</span>,
    }),
    // Qty / Stock
    columnHelper.accessor('totalStock', {
      header: 'Qty',
      cell: (info) => (
        <span className="text-sm font-bold" style={{ color: '#0f172a' }}>
          {info.getValue() ?? 0}
        </span>
      ),
    }),
    // Location
    columnHelper.accessor('location', {
      header: 'Location',
      cell: (info) => (
        <span className="text-sm" style={{ color: '#64748b' }}>
          {info.getValue() || '—'}
        </span>
      ),
    }),
    // Status badge
    columnHelper.accessor('isLowStock', {
      header: 'Status',
      cell: (info) => <StockStatusBadge row={info.row.original} />,
    }),
    // Actions
    columnHelper.display({
      id: 'actions',
      header: () => <span className="block text-right">Actions</span>,
      cell: (info) => (
        <div className="flex justify-end">
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="p-1 rounded transition-colors hover:opacity-70"
            style={{ color: '#94a3b8' }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      ),
    }),
  ];

  return (
    <AppLayout>
      <Toaster position="top-right" />

      {/* Page Header */}
      <PageHeader
        title="Products"
        subtitle="Manage your catalog, monitor stock levels and locations."
        action={
          <Link
            href="/products/new"
            className="flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-lg"
            style={{ backgroundColor: '#f07c28', boxShadow: '0 4px 14px rgba(240,124,40,0.25)' }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e06d14'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f07c28'; }}
          >
            <Plus size={18} />
            Add Product
          </Link>
        }
      />

      {/* Filters Bar */}
      <div
        className="bg-white rounded-xl p-4 flex flex-wrap items-center gap-3 mb-6"
        style={{ border: '1px solid #e2e8f0' }}
      >
        <span className="text-xs font-bold uppercase tracking-wider ml-1" style={{ color: '#94a3b8' }}>
          Filters:
        </span>

        {/* Category dropdown pill */}
        <DropdownFilter
          label="Category"
          value={filters.categoryId}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          onChange={(v) => setFilters((f) => ({ ...f, categoryId: v, page: 1 }))}
        />

        {/* Status filter pill */}
        <button
          type="button"
          onClick={() => setFilters((f) => ({ ...f, statusFilter: f.statusFilter === 'low' ? '' : 'low', page: 1 }))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={filters.statusFilter === 'low'
            ? { backgroundColor: '#fee2e2', border: '1px solid #fecaca', color: '#dc2626' }
            : { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155' }
          }
        >
          {filters.statusFilter === 'low' ? 'Status: Low Stock' : 'Status: All'}
          <Filter size={13} style={{ color: filters.statusFilter === 'low' ? '#dc2626' : '#94a3b8' }} />
        </button>

        {/* Export + Print */}
        <div className="ml-auto flex items-center gap-2">
          <button
            className="p-2 transition-colors rounded"
            style={{ color: '#94a3b8' }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#f07c28'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
            title="Export"
          >
            <Download size={18} />
          </button>
          <button
            className="p-2 transition-colors rounded"
            style={{ color: '#94a3b8' }}
            onMouseOver={(e) => { e.currentTarget.style.color = '#f07c28'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
            title="Print"
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        total={total}
        page={filters.page}
        limit={20}
        onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        onRowClick={(row) => router.push(`/products/${row.id}`)}
      />
    </AppLayout>
  );
}
