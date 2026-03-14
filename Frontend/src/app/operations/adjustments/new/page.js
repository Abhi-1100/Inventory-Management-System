'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import { createAdjustmentSchema } from '@/schemas/adjustment.schema';
import Link from 'next/link';

export default function NewAdjustmentPage() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [systemQtys, setSystemQtys] = useState({});

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    resolver: zodResolver(createAdjustmentSchema),
    defaultValues: { locationId: '', lines: [{ productId: '', countedQty: 0, note: '' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });
  const selectedLocationId = watch('locationId');

  useEffect(() => {
    Promise.all([api.get('/settings/locations'), api.get('/products', { params: { limit: 100 } })]).then(([l, p]) => {
      setLocations(l.data.data ?? []);
      setProducts(p.data.data ?? []);
    }).catch(() => {});
  }, []);

  const fetchSystemQty = async (productId, locationId) => {
    if (!productId || !locationId) return;
    try {
      const res = await api.get('/operations/adjustments/prefill', { params: { productId, locationId } });
      setSystemQtys((prev) => ({ ...prev, [productId]: res.data.systemQty }));
    } catch { /* silent */ }
  };

  const handleProductChange = (idx, productId) => {
    if (selectedLocationId) fetchSystemQty(productId, selectedLocationId);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/operations/adjustments', {
        locationId: data.locationId,
        lines: data.lines.map((l) => ({ productId: l.productId, countedQty: Number(l.countedQty), ...(l.note ? { note: l.note } : {}) })),
      });
      toast.success('Adjustment created!');
      router.push(`/operations/adjustments/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Create failed', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const cls = (e) => `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${e ? 'border-danger' : 'border-border'}`;
  const lineValues = watch('lines') ?? [];

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <div className="mb-6">
        <Link href="/operations/adjustments" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors"><ArrowLeft size={14} /> Adjustments</Link>
        <h1 className="text-2xl font-bold text-text-primary">New Adjustment</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-4">
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Location</h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Location *</label>
            <select {...register('locationId')} className={cls(errors.locationId)}>
              <option value="">Select location...</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            {errors.locationId && <p className="text-xs text-danger mt-1">{errors.locationId.message}</p>}
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Product Lines</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold uppercase text-text-muted px-1">
              <div className="col-span-4">Product</div><div className="col-span-2">System Qty</div><div className="col-span-2">Counted Qty</div><div className="col-span-3">Note</div><div className="col-span-1"></div>
            </div>
            {fields.map((field, idx) => {
              const productId = lineValues[idx]?.productId;
              const sysQty = productId ? (systemQtys[productId] ?? '—') : '—';
              const counted = Number(lineValues[idx]?.countedQty ?? 0);
              const diff = sysQty !== '—' ? counted - sysQty : '—';
              return (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <select {...register(`lines.${idx}.productId`)} onChange={(e) => { register(`lines.${idx}.productId`).onChange(e); handleProductChange(idx, e.target.value); }} className={cls(errors.lines?.[idx]?.productId)}>
                      <option value="">Select product...</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 text-center text-sm text-text-muted font-mono">{sysQty}</div>
                  <div className="col-span-2"><input {...register(`lines.${idx}.countedQty`)} type="number" min="0" placeholder="0" className={cls()} /></div>
                  <div className="col-span-3"><input {...register(`lines.${idx}.note`)} placeholder="Optional note" className={cls()} /></div>
                  <div className="col-span-1 flex justify-center">{fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"><Trash2 size={14} /></button>}</div>
                </div>
              );
            })}
          </div>
          {errors.lines && <p className="text-xs text-danger mt-2">{errors.lines.message}</p>}
          <button type="button" onClick={() => append({ productId: '', countedQty: 0, note: '' })} className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"><Plus size={15} /> Add Product Line</button>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">{loading ? 'Creating...' : 'Save Draft'}</button>
          <Link href="/operations/adjustments" className="px-5 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors">Cancel</Link>
        </div>
      </form>
    </AppLayout>
  );
}
