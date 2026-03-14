'use client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmModal from '@/components/shared/ConfirmModal';
import api from '@/lib/axios';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, name: '' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.data ?? []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to load categories', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await api.post('/products/categories', { name: newName.trim() });
      toast.success('Category created!');
      setNewName('');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Create failed', { duration: 5000 });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/categories/${deleteModal.id}`);
      toast.success('Category deleted');
      setDeleteModal({ open: false, id: null, name: '' });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed', { duration: 5000 });
      setDeleteModal({ open: false, id: null, name: '' });
    }
  };

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Category"
        message={`Delete "${deleteModal.name}"? Products in this category must be reassigned first.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null, name: '' })}
        confirmLabel="Delete"
        danger
      />
      <PageHeader title="Product Categories" subtitle={`${categories.length} categories`} />

      {/* Create form */}
      <div className="max-w-md mb-6">
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New category name..."
            className="flex-1 bg-bg-surface border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />
          <button type="submit" disabled={creating || !newName.trim()} className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            <Plus size={15} /> Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="max-w-md">
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-sm text-text-muted">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="p-6 text-center text-sm text-text-muted">No categories yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{cat.name}</p>
                    <p className="text-xs text-text-muted">{cat.productCount ?? 0} products</p>
                  </div>
                  <button
                    onClick={() => setDeleteModal({ open: true, id: cat.id, name: cat.name })}
                    className="p-1.5 text-text-muted hover:text-danger transition-colors rounded-lg hover:bg-danger/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
