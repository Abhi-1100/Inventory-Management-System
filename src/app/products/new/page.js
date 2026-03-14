'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import { createProductSchema } from '@/schemas/product.schema';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: { initialStock: 0 },
  });

  const initialStock = watch('initialStock');

  useEffect(() => {
    api.get('/products/categories').then((r) => setCategories(r.data.data ?? [])).catch(() => {});
    api.get('/settings/locations').then((r) => setLocations(r.data.data ?? [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        unitOfMeasure: data.unitOfMeasure,
      };
      if (data.initialStock > 0) {
        payload.initialStock = Number(data.initialStock);
        payload.initialLocationId = data.initialLocationId;
      }
      await api.post('/products', payload);
      toast.success('Product created successfully!');
      router.push('/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (err) =>
    `w-full bg-bg-surface border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${err ? 'border-danger' : 'border-border'}`;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <div className="mb-6">
        <Link href="/products" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-3 transition-colors">
          <ArrowLeft size={14} /> Products
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">New Product</h1>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-bg-card border border-border rounded-xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Product Name *</label>
              <input {...register('name')} placeholder="e.g. Wireless Mouse" className={inputCls(errors.name)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">SKU *</label>
              <input {...register('sku')} placeholder="e.g. WM-001" className={inputCls(errors.sku)} />
              {errors.sku && <p className="text-xs text-danger mt-1">{errors.sku.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Category *</label>
              <select {...register('categoryId')} className={inputCls(errors.categoryId)}>
                <option value="">Select category...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-danger mt-1">{errors.categoryId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Unit of Measure *</label>
              <input {...register('unitOfMeasure')} placeholder="e.g. pcs, kg, box" className={inputCls(errors.unitOfMeasure)} />
              {errors.unitOfMeasure && <p className="text-xs text-danger mt-1">{errors.unitOfMeasure.message}</p>}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Initial Stock (Optional)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Initial Quantity</label>
                <input {...register('initialStock', { valueAsNumber: true })} type="number" min="0" placeholder="0" className={inputCls(errors.initialStock)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Initial Location</label>
                <select {...register('initialLocationId')} disabled={!initialStock || initialStock <= 0} className={inputCls(errors.initialLocationId)}>
                  <option value="">Select location...</option>
                  {locations.map((l) => <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.name})</option>)}
                </select>
                {errors.initialLocationId && <p className="text-xs text-danger mt-1">{errors.initialLocationId.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              {loading ? 'Creating...' : 'Create Product'}
            </button>
            <Link href="/products" className="px-5 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
