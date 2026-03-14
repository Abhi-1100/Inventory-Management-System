'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast, { Toaster } from 'react-hot-toast';
import { Save, RefreshCw, Info, AlertTriangle, Eye, FileText } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import { createProductSchema } from '@/schemas/product.schema';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(createProductSchema),
    defaultValues: { initialStock: 0 },
  });

  const initialStock = watch('initialStock');

  useEffect(() => {
    api.get('/products/categories').then((r) => setCategories(r.data.data ?? [])).catch(() => {});
    api.get('/settings/locations').then((r) => setLocations(r.data.data ?? [])).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        name: data.name,
        sku: data.sku,
        categoryId: data.categoryId,
        unitOfMeasure: data.unitOfMeasure,
      };
      if (data.initialStock > 0) {
        payload.initialStock = Number(data.initialStock);
        payload.initialLocationId = data.initialLocationId;
      }
      await api.post('/products', payload);
      toast.success('Product created successfully!');
      router.push('/products');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create product', { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Helper for input styling
  const inputStyle = (hasError) => ({
    width: '100%',
    borderRadius: '0.5rem',
    border: `1px solid ${hasError ? '#ef4444' : '#cbd5e1'}`,
    backgroundColor: '#ffffff',
    color: '#0f172a',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    outline: 'none',
  });

  return (
    <AppLayout>
      <Toaster position="bottom-right" />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/products" className="text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#f07c28'; }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
        >
          Products
        </Link>
        <span className="text-sm" style={{ color: '#94a3b8' }}>/</span>
        <span className="text-sm font-semibold" style={{ color: '#f07c28' }}>Add New Product</span>
      </div>

      {/* Page Title */}
      <div className="flex justify-between items-end gap-3 pb-6 mb-8" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-tight" style={{ color: '#0f172a' }}>
            Create New Product
          </h1>
          <p className="text-base mt-1" style={{ color: '#94a3b8' }}>
            Enter the core details to initialize this item in your warehouse system.
          </p>
        </div>
      </div>

      {/* Main Form Card */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl overflow-hidden shadow-sm" style={{ border: '1px solid #e2e8f0' }}>
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Product Name — full width */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                  Product Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair G-200"
                  style={inputStyle(errors.name)}
                  onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.name ? '#ef4444' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
                {errors.name && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.name.message}</p>}
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                  SKU (Stock Keeping Unit)
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('sku')}
                    type="text"
                    placeholder="FUR-CH-01"
                    className="uppercase"
                    style={{ ...inputStyle(errors.sku), flex: 1 }}
                    onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = errors.sku ? '#ef4444' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                  />
                  <button
                    type="button"
                    title="Clear SKU"
                    onClick={() => setValue('sku', '')}
                    className="px-3 rounded border transition-colors flex items-center"
                    style={{ backgroundColor: '#f1f5f9', borderColor: '#cbd5e1', color: '#64748b' }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#e2e8f0'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                {errors.sku && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.sku.message}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                  Category
                </label>
                <select
                  {...register('categoryId')}
                  style={inputStyle(errors.categoryId)}
                  onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.categoryId ? '#ef4444' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="" disabled>Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.categoryId.message}</p>}
              </div>

              {/* Unit of Measure */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                  Unit of Measure
                </label>
                <input
                  {...register('unitOfMeasure')}
                  type="text"
                  placeholder="e.g. pcs, kg, box, set"
                  style={inputStyle(errors.unitOfMeasure)}
                  onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.unitOfMeasure ? '#ef4444' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
                {errors.unitOfMeasure && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.unitOfMeasure.message}</p>}
              </div>

              {/* Warehouse Location */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                  Warehouse Location
                </label>
                <select
                  {...register('initialLocationId')}
                  disabled={!initialStock || initialStock <= 0}
                  style={{ ...inputStyle(errors.initialLocationId), opacity: (!initialStock || initialStock <= 0) ? 0.5 : 1, cursor: (!initialStock || initialStock <= 0) ? 'not-allowed' : 'pointer' }}
                  onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = errors.initialLocationId ? '#ef4444' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                >
                  <option value="">Select location...</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.name} ({l.warehouse?.name})</option>
                  ))}
                </select>
                {errors.initialLocationId && <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{errors.initialLocationId.message}</p>}
              </div>

              {/* Initial Stock Level */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                  Initial Stock Level
                </label>
                <div className="relative">
                  <input
                    {...register('initialStock', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    placeholder="0"
                    style={inputStyle(errors.initialStock)}
                    onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = errors.initialStock ? '#ef4444' : '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-10 pointer-events-none">
                    <span className="text-xs" style={{ color: '#94a3b8' }}>UNITS</span>
                  </div>
                </div>
              </div>

              {/* Reorder Threshold */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
                  Reorder Threshold
                </label>
                <input
                  type="number"
                  placeholder="Low stock alert level"
                  style={inputStyle(false)}
                  onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

            </div>

            {/* Description Section */}
            <div className="mt-10 pt-10" style={{ borderTop: '1px solid #f1f5f9' }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#0f172a' }}>
                <FileText size={20} style={{ color: '#f07c28' }} />
                Product Description
              </h3>
              <textarea
                rows={4}
                placeholder="Provide a detailed description of the product features, dimensions, or technical specifications..."
                className="w-full rounded-lg resize-none focus:outline-none"
                style={{
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  padding: '0.75rem 1rem',
                  fontSize: '0.875rem',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#f07c28'; e.target.style.boxShadow = '0 0 0 3px rgba(240,124,40,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div
            className="px-8 py-6 flex items-center justify-end gap-4"
            style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}
          >
            <Link
              href="/products"
              className="px-6 py-2.5 rounded-lg text-sm font-semibold border transition-all active:scale-[0.98]"
              style={{ borderColor: '#cbd5e1', color: '#334155' }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
              style={{ backgroundColor: '#f07c28', boxShadow: '0 4px 14px rgba(240,124,40,0.25)' }}
              onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#e06d14'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#f07c28'; }}
            >
              <Save size={16} />
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </div>
      </form>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <div className="p-4 rounded-lg flex gap-4" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
          <Info size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#2563eb' }} />
          <div>
            <h4 className="text-sm font-bold mb-1" style={{ color: '#1e3a5f' }}>Auto-SKU Generation</h4>
            <p className="text-xs" style={{ color: 'rgba(37,99,235,0.75)' }}>
              Leave SKU empty to let the system generate one based on the category.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-lg flex gap-4" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#d97706' }} />
          <div>
            <h4 className="text-sm font-bold mb-1" style={{ color: '#78350f' }}>Initial Stock</h4>
            <p className="text-xs" style={{ color: 'rgba(217,119,6,0.75)' }}>
              Entering initial stock will create an automatic Adjustment Log entry.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-lg flex gap-4" style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
          <Eye size={20} className="flex-shrink-0 mt-0.5" style={{ color: '#9333ea' }} />
          <div>
            <h4 className="text-sm font-bold mb-1" style={{ color: '#581c87' }}>Visibility</h4>
            <p className="text-xs" style={{ color: 'rgba(147,51,234,0.75)' }}>
              Product will be immediately available for Order Management once saved.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
