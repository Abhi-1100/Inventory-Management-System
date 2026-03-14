'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { Plus } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import api from '@/lib/axios';
import { reorderRuleSchema } from '@/schemas/product.schema';

export default function ReorderRulesPage() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(reorderRuleSchema) });

  const fetchData = async () => {
    try {
      const [rulesRes, productsRes, locationsRes] = await Promise.all([
        api.get('/products/reorder-rules'),
        api.get('/products'),
        api.get('/settings/locations'),
      ]);
      setRules(rulesRes.data.data ?? []);
      setProducts(productsRes.data.data ?? []);
      setLocations(locationsRes.data.data ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load data', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const onSubmit = async (data) => {
    setCreating(true);
    try {
      await api.post('/products/reorder-rules', {
        productId: data.productId,
        locationId: data.locationId,
        minQty: Number(data.minQty),
        maxQty: Number(data.maxQty),
      });
      toast.success('Reorder rule created!');
      reset();
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Create failed', { duration: 5000 });
    } finally {
      setCreating(false);
    }
  };

  const inputCls = (err) =>
    `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${err ? 'border-danger' : 'border-border'}`;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <PageHeader
        title="Reorder Rules"
        subtitle="Automatic replenishment thresholds"
        action={
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Add Rule
          </button>
        }
      />

      {showForm && (
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-5 max-w-2xl">
          <h3 className="text-sm font-semibold text-text-primary mb-4">New Reorder Rule</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Product *</label>
              <select {...register('productId')} className={inputCls(errors.productId)}>
                <option value="">Select product...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
              {errors.productId && <p className="text-xs text-danger mt-1">{errors.productId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Location *</label>
              <select {...register('locationId')} className={inputCls(errors.locationId)}>
                <option value="">Select location...</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              {errors.locationId && <p className="text-xs text-danger mt-1">{errors.locationId.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Min Qty *</label>
              <input {...register('minQty')} type="number" min="0" placeholder="0" className={inputCls(errors.minQty)} />
              {errors.minQty && <p className="text-xs text-danger mt-1">{errors.minQty.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1.5">Max Qty *</label>
              <input {...register('maxQty')} type="number" min="0" placeholder="0" className={inputCls(errors.maxQty)} />
              {errors.maxQty && <p className="text-xs text-danger mt-1">{errors.maxQty.message}</p>}
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={creating} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                {creating ? 'Creating...' : 'Create Rule'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-text-muted">Loading...</div>
        ) : rules.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">No reorder rules configured yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bg-surface border-b border-border">
              <tr>
                {['Product', 'SKU', 'Location', 'Min Qty', 'Max Qty'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 text-text-primary font-medium">{r.product?.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{r.product?.sku}</td>
                  <td className="px-4 py-3 text-text-secondary">{r.location?.name}</td>
                  <td className="px-4 py-3 text-warning font-semibold">{r.minQty}</td>
                  <td className="px-4 py-3 text-text-primary font-semibold">{r.maxQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
