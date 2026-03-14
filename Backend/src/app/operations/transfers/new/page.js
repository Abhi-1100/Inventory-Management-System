'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '../../../../components/layout/AppLayout';
import api from '../../../../lib/axios';
import { createTransferSchema } from '../../../../schemas/transfer.schema';
import Link from 'next/link';

export default function NewTransferPage() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(createTransferSchema),
    defaultValues: { sourceLocationId: '', destLocationId: '', scheduledDate: format(new Date(), 'yyyy-MM-dd'), lines: [{ productId: '', qty: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  useEffect(() => {
    Promise.all([api.get('/settings/locations'), api.get('/products', { params: { limit: 100 } })]).then(([l, p]) => {
      setLocations(l.data.data ?? []);
      setProducts(p.data.data ?? []);
    }).catch(() => { });
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/operations/transfers', {
        sourceLocationId: data.sourceLocationId,
        destLocationId: data.destLocationId,
        scheduledDate: data.scheduledDate,
        lines: data.lines.map((l) => ({ productId: l.productId, qty: Number(l.qty) })),
      });
      toast.success('Transfer created!');
      router.push(`/operations/transfers/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Create failed', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const cls = (e) => `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${e ? 'border-danger' : 'border-border'}`;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <div className="mb-6">
        <Link href="/operations/transfers" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors"><ArrowLeft size={14} /> Transfers</Link>
        <h1 className="text-2xl font-bold text-text-primary">New Transfer</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-4">
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Header</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">From Location *</label>
              <select {...register('sourceLocationId')} className={cls(errors.sourceLocationId)}>
                <option value="">Select source...</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {errors.sourceLocationId && <p className="text-xs text-danger mt-1">{errors.sourceLocationId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">To Location *</label>
              <select {...register('destLocationId')} className={cls(errors.destLocationId)}>
                <option value="">Select destination...</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {errors.destLocationId && <p className="text-xs text-danger mt-1">{errors.destLocationId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Scheduled Date *</label>
              <input {...register('scheduledDate')} type="date" className={cls(errors.scheduledDate)} />
            </div>
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Product Lines</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold uppercase text-text-muted px-1">
              <div className="col-span-8">Product</div><div className="col-span-3">Qty</div><div className="col-span-1"></div>
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-8"><select {...register(`lines.${idx}.productId`)} className={cls(errors.lines?.[idx]?.productId)}><option value="">Select product...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
                <div className="col-span-3"><input {...register(`lines.${idx}.qty`)} type="number" min="0" placeholder="0" className={cls()} /></div>
                <div className="col-span-1 flex justify-center">{fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"><Trash2 size={14} /></button>}</div>
              </div>
            ))}
          </div>
          {errors.lines && <p className="text-xs text-danger mt-2">{errors.lines.message}</p>}
          <button type="button" onClick={() => append({ productId: '', qty: 0 })} className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"><Plus size={15} /> Add Product Line</button>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">{loading ? 'Creating...' : 'Save Draft'}</button>
          <Link href="/operations/transfers" className="px-5 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors">Cancel</Link>
        </div>
      </form>
    </AppLayout>
  );
}
