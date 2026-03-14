'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Check, X } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmModal from '@/components/shared/ConfirmModal';
import api from '@/lib/axios';
import { createDeliverySchema } from '@/schemas/delivery.schema';
import Link from 'next/link';

const STEPS = ['draft', 'waiting', 'ready', 'done'];

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [delivery, setDelivery] = useState(null);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({ resolver: zodResolver(createDeliverySchema) });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const fetchDelivery = useCallback(async () => {
    try {
      const res = await api.get(`/operations/deliveries/${id}`);
      setDelivery(res.data);
      reset({
        customerName: res.data.customerName,
        sourceLocationId: res.data.sourceLocation?.id,
        scheduledDate: res.data.scheduledDate?.slice(0, 10),
        lines: res.data.lines?.map((l) => ({ productId: l.product?.id, demandQty: l.demandQty, doneQty: l.doneQty })) ?? [],
      });
    } catch (err) {
      if (err.response?.status === 404) { toast.error('Delivery not found'); router.push('/operations/deliveries'); }
      else toast.error(err.response?.data?.error || 'Failed to load delivery', { duration: 5000 });
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDelivery(); }, [fetchDelivery]);
  useEffect(() => {
    Promise.all([api.get('/settings/locations'), api.get('/products', { params: { limit: 100 } })]).then(([l, p]) => { setLocations(l.data.data ?? []); setProducts(p.data.data ?? []); }).catch(() => {});
  }, []);

  const isEditable = delivery?.status === 'draft' || delivery?.status === 'waiting';
  const isDone = delivery?.status === 'done' || delivery?.status === 'cancelled';

  const onSave = async (data) => {
    setSaving(true);
    try {
      await api.put(`/operations/deliveries/${id}`, { customerName: data.customerName, sourceLocationId: data.sourceLocationId, scheduledDate: data.scheduledDate, lines: data.lines.map((l) => ({ productId: l.productId, demandQty: Number(l.demandQty), doneQty: Number(l.doneQty) })) });
      toast.success('Delivery saved!');
      fetchDelivery();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed', { duration: 5000 }); }
    finally { setSaving(false); }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      await api.post(`/operations/deliveries/${id}/validate`);
      toast.success('Delivery validated!');
      fetchDelivery();
    } catch (err) {
      const code = err.response?.status;
      const msg = err.response?.data?.error || 'Validation failed';
      toast.error(msg, { duration: 5000 });
    } finally { setValidating(false); }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/operations/deliveries/${id}/cancel`);
      toast.success('Delivery cancelled');
      setCancelModal(false);
      fetchDelivery();
    } catch (err) { toast.error(err.response?.data?.error || 'Cancel failed', { duration: 5000 }); }
    finally { setCancelling(false); }
  };

  const lines = watch('lines') ?? [];
  const allZero = lines.every((l) => !l.doneQty || Number(l.doneQty) === 0);
  const cls = (e) => `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors disabled:opacity-50 ${e ? 'border-danger' : 'border-border'}`;

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <ConfirmModal isOpen={cancelModal} title="Cancel Delivery" message="Are you sure you want to cancel this delivery?" onConfirm={handleCancel} onCancel={() => setCancelModal(false)} confirmLabel="Cancel Delivery" danger />
      <div className="mb-6">
        <Link href="/operations/deliveries" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors"><ArrowLeft size={14} /> Deliveries</Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{delivery?.referenceNo}</h1>
            <div className="flex items-center gap-2 mt-1"><StatusBadge status={delivery?.status} /><span className="text-xs text-text-muted">{delivery?.customerName}</span></div>
          </div>
          {!isDone && (
            <div className="flex items-center gap-2">
              <button onClick={() => setCancelModal(true)} disabled={cancelling} className="flex items-center gap-1.5 px-3 py-2 border border-border text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/10 rounded-lg text-sm transition-colors"><X size={15} /> Cancel</button>
              <button onClick={handleValidate} disabled={validating || allZero} title={allZero ? 'Enter at least one done quantity' : ''} className="flex items-center gap-1.5 px-4 py-2 bg-success hover:bg-success/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"><Check size={15} /> {validating ? 'Validating...' : 'Validate'}</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-6 bg-bg-card border border-border rounded-xl p-4">
        {STEPS.map((s, i) => { const ci = STEPS.indexOf(delivery?.status); const done = i <= ci; return (<div key={s} className="flex items-center gap-2"><div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${done ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-bg-surface text-text-muted border border-border'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</div>{i < STEPS.length - 1 && <div className={`h-px w-6 ${done ? 'bg-accent' : 'bg-border'}`} />}</div>); })}
      </div>

      <form onSubmit={handleSubmit(onSave)} className="max-w-4xl space-y-4">
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Header</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Customer Name</label><input {...register('customerName')} disabled={!isEditable} className={cls(errors.customerName)} /></div>
            <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Source Location</label><select {...register('sourceLocationId')} disabled={!isEditable} className={cls(errors.sourceLocationId)}><option value="">Select...</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Scheduled Date</label><input {...register('scheduledDate')} type="date" disabled={!isEditable} className={cls(errors.scheduledDate)} /></div>
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Product Lines</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold uppercase text-text-muted px-1"><div className="col-span-4">Product</div><div className="col-span-2">UoM</div><div className="col-span-3">Demand Qty</div><div className="col-span-2">Done Qty</div><div className="col-span-1"></div></div>
            {fields.map((field, idx) => {
              const pi = products.find((p) => p.id === watch(`lines.${idx}.productId`));
              return (<div key={field.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4"><select {...register(`lines.${idx}.productId`)} disabled={!isEditable} className={cls()}><option value="">Select...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
                <div className="col-span-2 text-xs text-text-muted px-1">{pi?.unitOfMeasure || '—'}</div>
                <div className="col-span-3"><input {...register(`lines.${idx}.demandQty`)} type="number" min="0" disabled={!isEditable} className={cls()} /></div>
                <div className="col-span-2"><input {...register(`lines.${idx}.doneQty`)} type="number" min="0" disabled={isDone} className={cls()} /></div>
                <div className="col-span-1 flex justify-center">{isEditable && fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"><Trash2 size={14} /></button>}</div>
              </div>);
            })}
          </div>
          {isEditable && <button type="button" onClick={() => append({ productId: '', demandQty: 0, doneQty: 0 })} className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"><Plus size={15} /> Add Product Line</button>}
        </div>
        {isEditable && <div className="flex gap-3"><button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">{saving ? 'Saving...' : 'Save Draft'}</button></div>}
      </form>
    </AppLayout>
  );
}
