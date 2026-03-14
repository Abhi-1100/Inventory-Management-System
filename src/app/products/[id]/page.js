'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import ConfirmModal from '@/components/shared/ConfirmModal';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import api from '@/lib/axios';
import { updateProductSchema } from '@/schemas/product.schema';
import Link from 'next/link';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(updateProductSchema),
  });

  useEffect(() => {
    api.get('/products/categories').then((r) => setCategories(r.data.data ?? [])).catch(() => {});
  }, []);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => {
        setProduct(res.data);
        reset({ name: res.data.name, categoryId: res.data.category?.id, unitOfMeasure: res.data.unitOfMeasure });
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          toast.error('Product not found');
          router.push('/products');
        } else {
          toast.error(err.response?.data?.error || 'Failed to load product', { duration: 5000 });
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await api.put(`/products/${id}`, { name: data.name, categoryId: data.categoryId, unitOfMeasure: data.unitOfMeasure });
      toast.success('Product updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed', { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      router.push('/products');
    } catch (err) {
      const msg = err.response?.data?.error || 'Delete failed';
      toast.error(msg, { duration: 5000 });
    }
    setShowDelete(false);
  };

  const inputCls = (err) =>
    `w-full bg-bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${err ? 'border-danger' : 'border-border'}`;

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <ConfirmModal
        isOpen={showDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${product?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
        confirmLabel="Delete"
        danger
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/products" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors">
            <ArrowLeft size={14} /> Products
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">{product?.name}</h1>
          <p className="text-xs text-text-muted font-mono mt-0.5">SKU: {product?.sku}</p>
        </div>
        <button onClick={() => setShowDelete(true)} className="flex items-center gap-2 px-3 py-2 border border-danger/30 text-danger hover:bg-danger/10 rounded-lg text-sm transition-colors">
          <Trash2 size={15} /> Delete
        </button>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Edit form */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary mb-2">Product Details</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Name *</label>
              <input {...register('name')} className={inputCls(errors.name)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Unit of Measure *</label>
              <input {...register('unitOfMeasure')} className={inputCls(errors.unitOfMeasure)} />
              {errors.unitOfMeasure && <p className="text-xs text-danger mt-1">{errors.unitOfMeasure.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Category *</label>
            <select {...register('categoryId')} className={inputCls(errors.categoryId)}>
              <option value="">Select category...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-xs text-danger mt-1">{errors.categoryId.message}</p>}
          </div>
          <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Stock by location */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Stock by Location</h2>
          {(!product?.stockByLocation || product.stockByLocation.length === 0) ? (
            <p className="text-sm text-text-muted">No stock records found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-text-muted">Location</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold uppercase text-text-muted">Warehouse</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase text-text-muted">Qty on Hand</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold uppercase text-text-muted">Reorder Min</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {product.stockByLocation.map((s) => (
                    <tr key={s.location?.id}>
                      <td className="py-2.5 px-3 text-text-primary">{s.location?.name}</td>
                      <td className="py-2.5 px-3 text-text-secondary">{s.warehouse?.name || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-text-primary">{s.quantityOnHand}</td>
                      <td className="py-2.5 px-3 text-right text-text-muted">{s.reorderMin ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
