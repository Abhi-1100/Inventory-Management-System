'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Plus, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import AppLayout from '@/components/layout/AppLayout';
import StatusBadge from '@/components/shared/StatusBadge';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import ConfirmModal from '@/components/shared/ConfirmModal';
import api from '@/lib/axios';
import { createReceiptSchema } from '@/schemas/receipt.schema';
import Link from 'next/link';

const STEPS = ['draft', 'waiting', 'ready', 'done'];

export default function ReceiptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [receipt, setReceipt] = useState(null);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const isEditable = (s) => s === 'draft' || s === 'waiting';

  const { register, handleSubmit, control, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(createReceiptSchema),
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const fetchReceipt = useCallback(async () => {
    try {
      const res = await api.get(`/operations/receipts/${id}`);
      setReceipt(res.data);
      reset({
        supplierName: res.data.supplierName,
        destLocationId: res.data.destLocation?.id,
        scheduledDate: res.data.scheduledDate?.slice(0, 10),
        lines: res.data.lines?.map((l) => ({
          productId: l.product?.id,
          demandQty: l.demandQty,
          doneQty: l.doneQty,
        })) ?? [],
      });
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Receipt not found');
        router.push('/operations/receipts');
      } else {
        toast.error(err.response?.data?.error || 'Failed to load receipt', { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchReceipt(); }, [fetchReceipt]);

  useEffect(() => {
    Promise.all([api.get('/settings/locations'), api.get('/products', { params: { limit: 100 } })])
      .then(([locRes, prodRes]) => {
        setLocations(locRes.data.data ?? []);
        setProducts(prodRes.data.data ?? []);
      }).catch(() => {});
  }, []);

  const onSave = async (data) => {
    if (!isEditable(receipt?.status)) return;
    setSaving(true);
    try {
      await api.put(`/operations/receipts/${id}`, {
        supplierName: data.supplierName,
        destLocationId: data.destLocationId,
        scheduledDate: data.scheduledDate,
        lines: data.lines.map((l) => ({ productId: l.productId, demandQty: Number(l.demandQty), doneQty: Number(l.doneQty) })),
      });
      toast.success('Receipt saved!');
      fetchReceipt();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed', { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    try {
      await api.post(`/operations/receipts/${id}/validate`);
      toast.success('Receipt validated!');
      fetchReceipt();
    } catch (err) {
      const msg = err.response?.data?.error || 'Validation failed';
      toast.error(msg, { duration: 5000 });
    } finally {
      setValidating(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/operations/receipts/${id}/cancel`);
      toast.success('Receipt cancelled');
      setCancelModal(false);
      fetchReceipt();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Cancel failed', { duration: 5000 });
    } finally {
      setCancelling(false);
    }
  };

  const lines = watch('lines') ?? [];
  const allZero = lines.every((l) => !l.doneQty || Number(l.doneQty) === 0);

  const inputCls = (err) =>
    `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors disabled:opacity-50 ${err ? 'border-danger' : 'border-border'}`;

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;

  const editable = isEditable(receipt?.status);
  const isDone = receipt?.status === 'done' || receipt?.status === 'cancelled';

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <ConfirmModal isOpen={cancelModal} title="Cancel Receipt" message="Are you sure you want to cancel this receipt?" onConfirm={handleCancel} onCancel={() => setCancelModal(false)} confirmLabel="Cancel Receipt" danger />

      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/operations/receipts" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors">
          <ArrowLeft size={14} /> Receipts
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{receipt?.referenceNo}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={receipt?.status} />
              <span className="text-xs text-text-muted">{receipt?.supplierName}</span>
            </div>
          </div>
          {/* Action buttons */}
          {!isDone && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCancelModal(true)}
                disabled={cancelling}
                className="flex items-center gap-1.5 px-3 py-2 border border-border text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/10 rounded-lg text-sm transition-colors"
              >
                <X size={15} /> Cancel
              </button>
              <button
                onClick={handleValidate}
                disabled={validating || allZero}
                title={allZero ? 'Enter at least one done quantity' : ''}
                className="flex items-center gap-1.5 px-4 py-2 bg-success hover:bg-success/80 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-sm transition-colors"
              >
                <Check size={15} /> {validating ? 'Validating...' : 'Validate'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status stepper */}
      <div className="flex items-center gap-2 mb-6 bg-bg-card border border-border rounded-xl p-4">
        {STEPS.map((s, i) => {
          const currentIdx = STEPS.indexOf(receipt?.status);
          const isDoneStep = i <= currentIdx;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isDoneStep ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-bg-surface text-text-muted border border-border'}`}>
                <span>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`h-px w-6 ${isDoneStep ? 'bg-accent' : 'bg-border'}`} />}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSave)} className="max-w-4xl space-y-4">
        {/* Header fields */}
        <div className="bg-bg-card border border-border rounded-xl p-6 space-y-4">
          <h2 className="text-base font-semibold text-text-primary">Header</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Supplier Name</label>
              <input {...register('supplierName')} disabled={!editable} className={inputCls(errors.supplierName)} />
              {errors.supplierName && <p className="text-xs text-danger mt-1">{errors.supplierName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Destination Location</label>
              <select {...register('destLocationId')} disabled={!editable} className={inputCls(errors.destLocationId)}>
                <option value="">Select location...</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Scheduled Date</label>
              <input {...register('scheduledDate')} type="date" disabled={!editable} className={inputCls(errors.scheduledDate)} />
            </div>
          </div>
        </div>

        {/* Lines */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h2 className="text-base font-semibold text-text-primary mb-4">Product Lines</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-3 text-xs font-semibold uppercase text-text-muted px-1">
              <div className="col-span-4">Product</div>
              <div className="col-span-2">UoM</div>
              <div className="col-span-3">Demand Qty</div>
              <div className="col-span-2">Done Qty</div>
              <div className="col-span-1"></div>
            </div>
            {fields.map((field, idx) => {
              const productInfo = products.find((p) => p.id === watch(`lines.${idx}.productId`));
              return (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-4">
                    <select {...register(`lines.${idx}.productId`)} disabled={!editable} className={inputCls(errors.lines?.[idx]?.productId)}>
                      <option value="">Select product...</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 text-xs text-text-muted px-1">{productInfo?.unitOfMeasure || '—'}</div>
                  <div className="col-span-3">
                    <input {...register(`lines.${idx}.demandQty`)} type="number" min="0" disabled={!editable} className={inputCls()} />
                  </div>
                  <div className="col-span-2">
                    <input {...register(`lines.${idx}.doneQty`)} type="number" min="0" disabled={isDone} className={inputCls()} />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    {editable && fields.length > 1 && (
                      <button type="button" onClick={() => remove(idx)} className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {editable && (
            <button type="button" onClick={() => append({ productId: '', demandQty: 0, doneQty: 0 })} className="mt-3 flex items-center gap-1.5 text-sm text-accent hover:text-accent-hover transition-colors">
              <Plus size={15} /> Add Product Line
            </button>
          )}
        </div>

        {editable && (
          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors">
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        )}
      </form>
    </AppLayout>
  );
}
