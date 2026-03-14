'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, AlertTriangle, PackageX } from 'lucide-react';
import { createColumnHelper } from '@tanstack/react-table';
import AppLayout from '../../components/layout/AppLayout';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import SearchInput from '../../components/shared/SearchInput';
import api from '../../lib/axios';
import Link from 'next/link';

const columnHelper = createColumnHelper();

export default function ProductsPage() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', categoryId: '', page: 1 });

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
    api.get('/products/categories').then((res) => setCategories(res.data.data ?? [])).catch(() => { });
  }, []);

  const columns = [
    columnHelper.accessor('name', { header: 'Product Name', cell: (info) => <span className="font-medium text-text-primary">{info.getValue()}</span> }),
    columnHelper.accessor('sku', { header: 'SKU', cell: (info) => <span className="font-mono text-xs text-text-secondary">{info.getValue()}</span> }),
    columnHelper.accessor('category.name', { header: 'Category', cell: (info) => info.getValue() || '—' }),
    columnHelper.accessor('unitOfMeasure', { header: 'UoM' }),
    columnHelper.accessor('totalStock', { header: 'Stock', cell: (info) => <span className="font-semibold">{info.getValue() ?? 0}</span> }),
    columnHelper.accessor('isLowStock', {
      header: 'Status',
      cell: (info) => {
        const row = info.row.original;
        if (row.isOutOfStock) return <span className="flex items-center gap-1 text-danger text-xs"><PackageX size={13} /> Out of stock</span>;
        if (row.isLowStock) return <span className="flex items-center gap-1 text-warning text-xs"><AlertTriangle size={13} /> Low stock</span>;
        return <span className="text-success text-xs">In stock</span>;
      },
    }),
  ];

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <PageHeader
        title="Products"
        subtitle={`${total} product${total !== 1 ? 's' : ''} total`}
        action={
          <Link href="/products/new" className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> New Product
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <SearchInput
          value={filters.search}
          onChange={(v) => setFilters((f) => ({ ...f, search: v, page: 1 }))}
          placeholder="Search products..."
        />
        <select
          value={filters.categoryId}
          onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value, page: 1 }))}
          className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

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
