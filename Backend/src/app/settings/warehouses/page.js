'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil, X, Check } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import PageHeader from '../../../components/shared/PageHeader';
import api from '../../../lib/axios';

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/settings/warehouses');
      setWarehouses(res.data.data ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load warehouses', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const openCreate = () => { reset({ name: '', shortCode: '', address: '' }); setEditId(null); setShowForm(true); };
  const openEdit = (w) => { setValue('name', w.name); setValue('shortCode', w.shortCode); setValue('address', w.address || ''); setEditId(w.id); setShowForm(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/settings/warehouses/${editId}`, data);
        toast.success('Warehouse updated!');
      } else {
        await api.post('/settings/warehouses', data);
        toast.success('Warehouse created!');
      }
      reset();
      setShowForm(false);
      setEditId(null);
      fetchWarehouses();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed', { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const cls = (e) => `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${e ? 'border-danger' : 'border-border'}`;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <PageHeader
        title="Warehouses"
        subtitle={`${warehouses.length} warehouse${warehouses.length !== 1 ? 's' : ''}`}
        action={<button onClick={openCreate} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"><Plus size={16} /> Add Warehouse</button>}
      />

      {showForm && (
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-5 max-w-lg">
          <h3 className="text-sm font-semibold text-text-primary mb-4">{editId ? 'Edit Warehouse' : 'New Warehouse'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Name *</label>
              <input {...register('name', { required: 'Required' })} className={cls(errors.name)} />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Short Code *</label>
              <input {...register('shortCode', { required: 'Required' })} placeholder="e.g. WH1" className={cls(errors.shortCode)} />
              {errors.shortCode && <p className="text-xs text-danger mt-1">{errors.shortCode.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Address</label>
              <input {...register('address')} placeholder="Optional address" className={cls()} />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden max-w-2xl">
        {loading ? <div className="p-8 text-center text-sm text-text-muted">Loading...</div> : warehouses.length === 0 ? <div className="p-8 text-center text-sm text-text-muted">No warehouses yet.</div> : (
          <table className="w-full text-sm">
            <thead className="bg-bg-surface border-b border-border">
              <tr>{['Name', 'Short Code', 'Address', 'Locations', ''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-muted">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {warehouses.map((w) => (
                <tr key={w.id}>
                  <td className="px-4 py-3 text-text-primary font-medium">{w.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{w.shortCode}</td>
                  <td className="px-4 py-3 text-text-muted text-xs">{w.address || '—'}</td>
                  <td className="px-4 py-3 text-text-secondary">{w.locationCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openEdit(w)} className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors"><Pencil size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
