'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Check, X } from 'lucide-react';
import AppLayout from '../../../../components/layout/AppLayout';
import StatusBadge from '../../../../components/shared/StatusBadge';
import LoadingSpinner from '../../../../components/shared/LoadingSpinner';
import ConfirmModal from '../../../../components/shared/ConfirmModal';
import api from '../../../../lib/axios';
import { createTransferSchema } from '../../../../schemas/transfer.schema';
import Link from 'next/link';

const STEPS = ['draft', 'waiting', 'ready', 'done'];

export default function TransferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [transfer, setTransfer] = useState(null);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({ resolver: zodResolver(createTransferSchema) });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const fetchTransfer = useCallback(async () => {
    try {
      const res = await api.get(`/operations/transfers/${id}`);
      setTransfer(res.data);
      reset({
        sourceLocationId: res.data.sourceLocation?.id,
        destLocationId: res.data.destLocation?.id,
        scheduledDate: res.data.scheduledDate?.slice(0, 10),
        lines: res.data.lines?.map((l) => ({ productId: l.product?.id, qty: l.qty })) ?? [],
      });
    } catch (err) {
      if (err.response?.status === 404) { toast.error('Transfer not found'); router.push('/operations/transfers'); }
      else toast.error(err.response?.data?.error || 'Failed to load transfer', { duration: 5000 });
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchTransfer(); }, [fetchTransfer]);
  useEffect(() => {
    Promise.all([api.get('/settings/locations'), api.get('/products', { params: { limit: 100 } })]).then(([l, p]) => { setLocations(l.data.data ?? []); setProducts(p.data.data ?? []); }).catch(() => { });
  }, []);

  const isEditable = transfer?.status === 'draft' || transfer?.status === 'waiting';
  const isDone = transfer?.status === 'done' || transfer?.status === 'cancelled';
  const lines = watch('lines') ?? [];
  const allZero = lines.every((l) => !l.qty || Number(l.qty) === 0);

  const onSave = async (data) => {
    setSaving(true);
    try {
      await api.put(`/operations/transfers/${id}`, { sourceLocationId: data.sourceLocationId, destLocationId: data.destLocationId, scheduledDate: data.scheduledDate, lines: data.lines.map((l) => ({ productId: l.productId, qty: Number(l.qty) })) });
      toast.success('Transfer saved!');
      fetchTransfer();
    } catch (err) { toast.error(err.response?.data?.error || 'Save failed', { duration: 5000 }); }
    finally { setSaving(false); }
  };

  const handleValidate = async () => {
    setValidating(true);
    try { await api.post(`/operations/transfers/${id}/validate`); toast.success('Transfer validated!'); fetchTransfer(); }
    catch (err) { toast.error(err.response?.data?.error || 'Validation failed', { duration: 5000 }); }
    finally { setValidating(false); }
  };

  const handleCancel = async () => {
    try { await api.post(`/operations/transfers/${id}/cancel`); toast.success('Transfer cancelled'); setCancelModal(false); fetchTransfer(); }
    catch (err) { toast.error(err.response?.data?.error || 'Cancel failed', { duration: 5000 }); }
  };

  const cls = (e) => `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors disabled:opacity-50 ${e ? 'border-danger' : 'border-border'}`;

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <ConfirmModal isOpen={cancelModal} title="Cancel Transfer" message="Cancel this transfer?" onConfirm={handleCancel} onCancel={() => setCancelModal(false)} confirmLabel="Cancel Transfer" danger />
      <div className="mb-6">
        <Link href="/operations/transfers" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors"><ArrowLeft size={14} /> Transfers</Link>
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold text-text-primary">{transfer?.referenceNo}</h1><div className="flex items-center gap-2 mt-1"><StatusBadge status={transfer?.status} /></div></div>
          {!isDone && <div className="flex gap-2">
            <button onClick={() => setCancelModal(true)} className="flex items-center gap-1.5 px-3 py-2 border border-border text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/10 rounded-lg text-sm transition-colors"><X size={15} /> Cancel</button>
            <button onClick={handleValidate} disabled={validating || allZero} title={allZero ? 'Enter at least one quantity' : ''} className="flex items-center gap-1.5 px-4 py-2 bg-success hover:bg-success/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"><Check size={15} /> {validating ? 'Validating...' : 'Validate'}</button>
          </div>}
        </div>
      </div>
      <div className="flex items-center gap-2 mb-6 bg-bg-card border border-border rounded-xl p-4">
        {STEPS.map((s, i) => { const ci = STEPS.indexOf(transfer?.status); const done = i <= ci; return (<div key={s} className="flex items-center gap-2"><div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${done ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-bg-surface text-text-muted border border-border'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</div>{i < STEPS.length - 1 && <div className={`h-px w-6 ${done ? 'bg-accent' : 'bg-border'}`} />}</div>); })}
      </div>
      <form onSubmit={handleSubmit(onSave)} className="max-w-4xl space-y-4">
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Header</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium text-text-secondary mb-1.5">From Location</label><select {...register('sourceLocationId')} disabled={!isEditable} className={cls()}><option value="">Select...</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-text-secondary mb-1.5">To Location</label><select {...register('destLocationId')} disabled={!isEditable} className={cls()}><option value="">Select...</option>{locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-text-secondary mb-1.5">Scheduled Date</label><input {...register('scheduledDate')} type="date" disabled={!isEditable} className={cls()} /></div>
          </div>
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Product Lines</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold uppercase text-text-muted px-1"><div className="col-span-8">Product</div><div className="col-span-3">Qty</div><div className="col-span-1"></div></div>
            {fields.map((field, idx) => (<div key={field.id} className="grid grid-cols-12 gap-3 items-center">
              <div className="col-span-8"><select {...register(`lines.${idx}.productId`)} disabled={!isEditable} className={cls()}><option value="">Select...</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
              <div className="col-span-3"><input {...register(`lines.${idx}.qty`)} type="number" min="0" disabled={isDone} className={cls()} /></div>
              <div className="col-span-1 flex justify-center">{isEditable && fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors"><Trash2 size={14} /></button>}</div>
            </div>))}
          </div>
          {isEditable && <button type="button" onClick={() => append({ productId: '', qty: 0 })} className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors"><Plus size={15} /> Add Product Line</button>}
        </div>
        {isEditable && <div className="flex gap-3"><button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">{saving ? 'Saving...' : 'Save Draft'}</button></div>}
      </form>
    </AppLayout>
  );
}
