'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import { ArrowLeft, Check, X } from 'lucide-react';
import AppLayout from '../../../../components/layout/AppLayout';
import StatusBadge from '../../../../components/shared/StatusBadge';
import LoadingSpinner from '../../../../components/shared/LoadingSpinner';
import ConfirmModal from '../../../../components/shared/ConfirmModal';
import api from '../../../../lib/axios';
import Link from 'next/link';

export default function AdjustmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [adjustment, setAdjustment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);

  const fetchAdjustment = useCallback(async () => {
    try {
      const res = await api.get(`/operations/adjustments/${id}`);
      setAdjustment(res.data);
    } catch (err) {
      if (err.response?.status === 404) { toast.error('Adjustment not found'); router.push('/operations/adjustments'); }
      else toast.error(err.response?.data?.error || 'Failed to load adjustment', { duration: 5000 });
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchAdjustment(); }, [fetchAdjustment]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      await api.post(`/operations/adjustments/${id}/validate`);
      toast.success('Adjustment validated!');
      fetchAdjustment();
    } catch (err) { toast.error(err.response?.data?.error || 'Validation failed', { duration: 5000 }); }
    finally { setValidating(false); }
  };

  const handleCancel = async () => {
    try {
      await api.post(`/operations/adjustments/${id}/cancel`);
      toast.success('Adjustment cancelled');
      setCancelModal(false);
      fetchAdjustment();
    } catch (err) { toast.error(err.response?.data?.error || 'Cancel failed', { duration: 5000 }); }
  };

  if (loading) return <AppLayout><LoadingSpinner /></AppLayout>;
  const isDone = adjustment?.status === 'done' || adjustment?.status === 'cancelled';

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <ConfirmModal isOpen={cancelModal} title="Cancel Adjustment" message="Cancel this inventory adjustment?" onConfirm={handleCancel} onCancel={() => setCancelModal(false)} confirmLabel="Cancel" danger />

      <div className="mb-6">
        <Link href="/operations/adjustments" className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary mb-2 transition-colors"><ArrowLeft size={14} /> Adjustments</Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{adjustment?.referenceNo}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={adjustment?.status} />
              <span className="text-xs text-text-muted">{adjustment?.location?.name}</span>
            </div>
          </div>
          {!isDone && (
            <div className="flex gap-2">
              <button onClick={() => setCancelModal(true)} className="flex items-center gap-1.5 px-3 py-2 border border-border text-text-secondary hover:text-danger hover:border-danger/30 hover:bg-danger/10 rounded-lg text-sm transition-colors"><X size={15} /> Cancel</button>
              <button onClick={handleValidate} disabled={validating} className="flex items-center gap-1.5 px-4 py-2 bg-success hover:bg-success/80 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-colors"><Check size={15} /> {validating ? 'Validating...' : 'Validate'}</button>
            </div>
          )}
        </div>
      </div>

      {/* Status stepper - simple: Draft → Done */}
      <div className="flex items-center gap-2 mb-6 bg-bg-card border border-border rounded-xl p-4">
        {['draft', 'done'].map((s, i) => {
          const done = adjustment?.status === 'done' ? true : (i === 0 && adjustment?.status === 'draft');
          return (<div key={s} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${done ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-bg-surface text-text-muted border border-border'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</div>
            {i === 0 && <div className={`h-px w-6 ${adjustment?.status === 'done' ? 'bg-accent' : 'bg-border'}`} />}
          </div>);
        })}
      </div>

      {/* Lines table */}
      <div className="max-w-4xl bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-text-primary">Product Lines</h2>
          <p className="text-xs text-text-muted mt-0.5">Location: {adjustment?.location?.name}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-surface">
              <tr>
                {['Product', 'SKU', 'UoM', 'System Qty', 'Counted Qty', 'Difference', 'Note'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(adjustment?.lines ?? []).map((line) => {
                const diff = line.difference ?? (line.countedQty - line.systemQty);
                return (
                  <tr key={line.id}>
                    <td className="px-4 py-3 text-text-primary font-medium">{line.product?.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-text-secondary">{line.product?.sku}</td>
                    <td className="px-4 py-3 text-text-muted">{line.product?.unitOfMeasure}</td>
                    <td className="px-4 py-3 text-text-secondary">{line.systemQty}</td>
                    <td className="px-4 py-3 text-text-primary font-semibold">{line.countedQty}</td>
                    <td className={`px-4 py-3 font-semibold ${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-text-muted'}`}>
                      {diff > 0 ? `+${diff}` : diff}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs">{line.note || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
