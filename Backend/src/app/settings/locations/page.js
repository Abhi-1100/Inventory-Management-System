'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Pencil } from 'lucide-react';
import AppLayout from '../../../components/layout/AppLayout';
import PageHeader from '../../../components/shared/PageHeader';
import api from '../../../lib/axios';

const LOCATION_TYPES = ['internal', 'view', 'production', 'vendor', 'customer'];

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterWarehouse, setFilterWarehouse] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchData = async () => {
    try {
      const params = {};
      if (filterWarehouse) params.warehouseId = filterWarehouse;
      const [locRes, whRes] = await Promise.all([api.get('/settings/locations', { params }), api.get('/settings/warehouses')]);
      setLocations(locRes.data.data ?? []);
      setWarehouses(whRes.data.data ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load data', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filterWarehouse]);

  const openCreate = () => { reset({ name: '', shortCode: '', warehouseId: '', warehouseType: 'internal' }); setEditId(null); setShowForm(true); };
  const openEdit = (l) => { setValue('name', l.name); setValue('shortCode', l.shortCode); setValue('warehouseId', l.warehouse?.id); setValue('warehouseType', l.warehouseType); setEditId(l.id); setShowForm(true); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/settings/locations/${editId}`, { name: data.name, shortCode: data.shortCode, warehouseType: data.warehouseType });
      } else {
        await api.post('/settings/locations', data);
      }
      toast.success(editId ? 'Location updated!' : 'Location created!');
      reset(); setShowForm(false); setEditId(null); fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Operation failed', { duration: 5000 });
    } finally { setSaving(false); }
  };

  const cls = (e) => `w-full bg-bg-surface border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors ${e ? 'border-danger' : 'border-border'}`;

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <PageHeader title="Locations" subtitle={`${locations.length} locations`} action={<button onClick={openCreate} className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"><Plus size={16} /> Add Location</button>} />

      {showForm && (
        <div className="bg-bg-card border border-border rounded-xl p-5 mb-5 max-w-lg">
          <h3 className="text-sm font-semibold text-text-primary mb-4">{editId ? 'Edit Location' : 'New Location'}</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Name *</label>
                <input {...register('name', { required: 'Required' })} className={cls(errors.name)} />
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Short Code *</label>
                <input {...register('shortCode', { required: 'Required' })} className={cls(errors.shortCode)} />
              </div>
            </div>
            {!editId && (
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Warehouse *</label>
                <select {...register('warehouseId', { required: 'Required' })} className={cls(errors.warehouseId)}>
                  <option value="">Select warehouse...</option>
                  {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
                {errors.warehouseId && <p className="text-xs text-danger mt-1">{errors.warehouseId.message}</p>}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Type *</label>
              <select {...register('warehouseType', { required: 'Required' })} className={cls()}>
                {LOCATION_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="px-4 py-2 border border-border rounded-lg text-sm text-text-secondary hover:bg-bg-surface transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-4">
        <select value={filterWarehouse} onChange={(e) => setFilterWarehouse(e.target.value)} className="bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors">
          <option value="">All Warehouses</option>
          {warehouses.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
      </div>

      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        {loading ? <div className="p-8 text-center text-sm text-text-muted">Loading...</div> : locations.length === 0 ? <div className="p-8 text-center text-sm text-text-muted">No locations found.</div> : (
          <table className="w-full text-sm">
            <thead className="bg-bg-surface border-b border-border">
              <tr>{['Name', 'Short Code', 'Type', 'Warehouse', ''].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase text-text-muted">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {locations.map((l) => (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-text-primary font-medium">{l.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-secondary">{l.shortCode}</td>
                  <td className="px-4 py-3"><span className="capitalize text-xs px-2 py-1 bg-bg-surface border border-border rounded-full text-text-secondary">{l.warehouseType}</span></td>
                  <td className="px-4 py-3 text-text-secondary">{l.warehouse?.name || '—'}</td>
                  <td className="px-4 py-3"><button onClick={() => openEdit(l)} className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-bg-surface transition-colors"><Pencil size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppLayout>
  );
}
