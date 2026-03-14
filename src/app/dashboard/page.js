'use client';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  Package,
  AlertTriangle,
  PackageX,
  PackageOpen,
  Truck,
  ArrowLeftRight,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import KPICard from '@/components/shared/KPICard';
import PageHeader from '@/components/shared/PageHeader';
import api from '@/lib/axios';

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const MOCK_KPIS = {
    totalProductsInStock: 248,
    lowStockItems: 12,
    outOfStockItems: 3,
    pendingReceipts: 7,
    pendingDeliveries: 5,
    scheduledTransfers: 4,
  };

  const fetchKPIs = async () => {
    try {
      const res = await api.get('/dashboard/kpis');
      setKpis(res.data);
    } catch {
      // No backend — use demo data silently
      setKpis(MOCK_KPIS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKPIs();
  }, []);

  const cards = kpis
    ? [
        { title: 'Total Products in Stock', value: kpis.totalProductsInStock, icon: Package, color: 'accent' },
        { title: 'Low Stock Items', value: kpis.lowStockItems, icon: AlertTriangle, color: 'warning' },
        { title: 'Out of Stock Items', value: kpis.outOfStockItems, icon: PackageX, color: 'danger' },
        { title: 'Pending Receipts', value: kpis.pendingReceipts, icon: PackageOpen, color: 'info' },
        { title: 'Pending Deliveries', value: kpis.pendingDeliveries, icon: Truck, color: 'success' },
        { title: 'Scheduled Transfers', value: kpis.scheduledTransfers, icon: ArrowLeftRight, color: 'accent' },
      ]
    : [];

  return (
    <AppLayout>
      <Toaster position="top-right" />
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your inventory operations"
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-6 animate-pulse">
              <div className="h-3 w-24 bg-bg-surface rounded mb-3" />
              <div className="h-8 w-16 bg-bg-surface rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <KPICard key={card.title} {...card} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
