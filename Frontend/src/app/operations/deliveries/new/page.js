'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import { createDeliverySchema } from '@/schemas/delivery.schema';
import Link from 'next/link';

export default function NewDeliveryPage() {
  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(createDeliverySchema),
    defaultValues: { customerName: '', sourceLocationId: '', scheduledDate: format(new Date(), 'yyyy-MM-dd'), lines: [{ productId: '', demandQty: 0, doneQty: 0 }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  useEffect(() => {
    Promise.all([api.get('/settings/locations'), api.get('/products', { params: { limit: 100 } })]).then(([l, p]) => {
      setLocations(l.data.data ?? []);
      setProducts(p.data.data ?? []);
    }).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/operations/deliveries', {
        customerName: data.customerName,
        sourceLocationId: data.sourceLocationId,
        scheduledDate: data.scheduledDate,
        lines: data.lines.map((l) => ({ productId: l.productId, demandQty: Number(l.demandQty), doneQty: Number(l.doneQty) })),
      });
      toast.success('Delivery created!');
      router.push(`/operations/deliveries/${res.data.id}`);
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
        <Link href="/operations/deliveries" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors"><ArrowLeft size={14} /> Deliveries</Link>
        <h1 className="text-2xl font-bold text-text-primary">New Delivery</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl space-y-4">
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Header</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Customer Name *</label>
              <input {...register('customerName')} placeholder="e.g. Acme Ltd" className={cls(errors.customerName)} />
              {errors.customerName && <p className="text-xs text-danger mt-1">{errors.customerName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Source Location *</label>
              <select {...register('sourceLocationId')} className={cls(errors.sourceLocationId)}>
                <option value="">Select location...</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {errors.sourceLocationId && <p className="text-xs text-danger mt-1">{errors.sourceLocationId.message}</p>}
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
              <div className="col-span-5">Product</div><div className="col-span-3">Demand Qty</div><div className="col-span-3">Done Qty</div><div className="col-span-1"></div>
            </div>
            {fields.map((field, idx) => (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-5"><select {...register(`lines.${idx}.productId`)} className={cls(errors.lines?.[idx]?.productId)}><option value="">Select product...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
                <div className="col-span-3"><input {...register(`lines.${idx}.demandQty`)} type="number" min="0" placeholder="0" className={cls()} /></div>
                <div className="col-span-3"><input {...register(`lines.${idx}.doneQty`)} type="number" min="0" placeholder="0" className={cls()} /></div>
                <div className="col-span-1 flex justify-center">{fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"><Trash2 size={14} /></button>}</div>
              </div>
            ))}
          </div>
          {errors.lines && <p className="text-xs text-danger mt-2">{errors.lines.message}</p>}
          <button type="button" onClick={() => append({ productId: '', demandQty: 0, doneQty: 0 })} className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"><Plus size={15} /> Add Product Line</button>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">{loading ? 'Creating...' : 'Save Draft'}</button>
          <Link href="/operations/deliveries" className="px-5 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors">Cancel</Link>
        </div>
      </form>
    </AppLayout>
  );
}
