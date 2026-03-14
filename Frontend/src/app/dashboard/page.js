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
  TrendingUp,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import api from '@/lib/axios';
import Link from 'next/link';

// ── Static Recent Activity rows ────────────────────────────────────────────
const RECENT_ACTIVITY = [
  { id: '#TR-89210', product: 'Wireless Earbuds Pro',    action: 'Delivery', actionColor: '#3b82f6', date: 'Oct 24, 2023', status: 'Completed',  statusBg: '#dcfce7', statusColor: '#16a34a', amount: '$1,240.00' },
  { id: '#TR-89211', product: 'Mechanical Keyboard G2',  action: 'Receipt',  actionColor: '#f07c28', date: 'Oct 23, 2023', status: 'Processing', statusBg: '#fef3c7', statusColor: '#d97706', amount: '$4,800.00' },
  { id: '#TR-89212', product: 'Smart Watch Series 5',    action: 'Transfer', actionColor: '#a855f7', date: 'Oct 22, 2023', status: 'In Transit', statusBg: '#dbeafe', statusColor: '#2563eb', amount: '$2,100.00' },
  { id: '#TR-89213', product: '4K Monitor 27"',           action: 'Delivery', actionColor: '#3b82f6', date: 'Oct 22, 2023', status: 'Cancelled',  statusBg: '#fee2e2', statusColor: '#dc2626', amount: '$450.00' },
];

// ── Quick Action items ──────────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Create Receipt',  desc: 'Record inbound inventory',       icon: ShoppingCart, iconBg: '#fff7ed', iconColor: '#f07c28', href: '/operations/receipts' },
  { label: 'Create Delivery', desc: 'Ship out customer orders',       icon: Truck,        iconBg: '#eff6ff', iconColor: '#3b82f6', href: '/operations/deliveries' },
  { label: 'Create Transfer', desc: 'Move stock between warehouses',  icon: ArrowLeftRight, iconBg: '#faf5ff', iconColor: '#a855f7', href: '/operations/transfers' },
];

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [kpiRes, alertsRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/products/alerts/low-stock'),
      ]);
      setKpis(kpiRes.data);
      setAlerts(alertsRes.data.alerts || []);
    } catch (err) {
      setKpis(null);
      const msg = err.response?.data?.error || 'Failed to load dashboard data';
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map KPI data to the 5 cards matching the design
  const kpiCards = kpis
    ? [
        {
          title: 'Total Products',
          value: kpis.totalProductsInStock,
          badge: '+2.4%',
          badgeBg: '#dcfce7',
          badgeColor: '#16a34a',
          badgeIcon: <TrendingUp size={12} />,
        },
        {
          title: 'Low Stock',
          value: kpis.lowStockItems,
          badge: 'Requires Attention',
          badgeBg: '#fff7ed',
          badgeColor: '#f07c28',
          badgeIcon: <AlertTriangle size={12} />,
        },
        {
          title: 'Out of Stock',
          value: kpis.outOfStockItems,
          badge: 'Critical Level',
          badgeBg: '#fee2e2',
          badgeColor: '#dc2626',
          badgeIcon: <PackageX size={12} />,
        },
        {
          title: 'Pending Receipts',
          value: kpis.pendingReceipts,
          badge: 'Inbound shipments',
          badgeBg: '#fff7ed',
          badgeColor: '#f07c28',
          badgeIcon: <PackageOpen size={12} />,
        },
        {
          title: 'Pending Deliveries',
          value: kpis.pendingDeliveries,
          badge: 'Outbound orders',
          badgeBg: '#f1f5f9',
          badgeColor: '#64748b',
          badgeIcon: <Truck size={12} />,
        },
      ]
    : [];

  return (
    <AppLayout>
      <Toaster position="bottom-right" />

      <div className="space-y-8">

        {/* ── KPI Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse shadow-sm">
                <div className="h-3 w-24 bg-slate-100 rounded mb-3" />
                <div className="h-8 w-16 bg-slate-100 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {kpiCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl p-5 shadow-sm"
                style={{ border: '1px solid #e2e8f0' }}
              >
                <p className="text-sm font-medium" style={{ color: '#64748b' }}>{card.title}</p>
                <h3 className="text-2xl font-bold mt-1" style={{ color: '#0f172a' }}>
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </h3>
                <div
                  className="inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: card.badgeBg, color: card.badgeColor }}
                >
                  {card.badgeIcon}
                  <span>{card.badge}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Chart + Quick Actions row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Stock Movement Chart */}
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #e2e8f0' }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>Stock Movement</h3>
                <p className="text-sm" style={{ color: '#94a3b8' }}>Inventory flow over the last 30 days</p>
              </div>
              <select
                className="rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 cursor-pointer"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                }}
              >
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>

            {/* SVG Chart */}
            <div className="h-52 flex flex-col justify-between">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 478 150"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="gradient-chart" x1="236" y1="21" x2="236" y2="150" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f07c28" stopOpacity="0.2" />
                    <stop offset="1" stopColor="#f07c28" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149V150H0V109Z"
                  fill="url(#gradient-chart)"
                />
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 110 363.077 110C381.231 110 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#f07c28"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-xs px-2 pt-3" style={{ color: '#94a3b8' }}>
                <span>May 01</span>
                <span>May 07</span>
                <span>May 14</span>
                <span>May 21</span>
                <span>May 30</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h3 className="font-bold" style={{ color: '#334155' }}>Quick Actions</h3>
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl transition-all duration-150 group shadow-sm"
                  style={{ border: '1px solid #e2e8f0' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: action.iconBg }}
                  >
                    <Icon size={18} style={{ color: action.iconColor }} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-semibold text-sm" style={{ color: '#0f172a' }}>{action.label}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>{action.desc}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: '#cbd5e1' }} className="group-hover:text-[#f07c28] transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Inventory Alerts Section ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-[#f07c28]" />
              <h3 className="font-bold text-[#0f172a]">In-Stock Alerts</h3>
            </div>
            <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500 font-semibold">
              {alerts.length} Active Alerts
            </span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {alerts.length === 0 ? (
              <div className="px-6 py-8 text-center text-slate-400 text-sm">
                No stock alerts at the moment. Your inventory levels are healthy!
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`mt-1 p-1.5 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-[#f07c28]'
                    }`}>
                      {alert.severity === 'critical' ? <PackageX size={16} /> : <AlertTriangle size={16} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#334155]">{alert.product?.name}</span>
                        <span className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded">
                          {alert.product?.sku}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {alert.location?.name} ({alert.location?.warehouse})
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">On Hand</p>
                      <p className={`text-lg font-bold ${
                        alert.severity === 'critical' ? 'text-red-600' : 'text-[#f07c28]'
                      }`}>
                        {alert.quantityOnHand} {alert.product?.unitOfMeasure}
                      </p>
                    </div>
                    <div className="text-right border-l border-slate-100 pl-6">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Min Thresh</p>
                      <p className="text-lg font-bold text-slate-600">
                        {alert.reorderMin}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Recent Activity Table ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: '1px solid #e2e8f0' }}
          >
            <h3 className="text-lg font-bold" style={{ color: '#0f172a' }}>Recent Activity</h3>
            <Link
              href="/move-history"
              className="text-sm font-semibold transition-colors hover:opacity-70"
              style={{ color: '#f07c28' }}
            >
              View All
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  {['Transaction ID', 'Product', 'Action', 'Date', 'Status', 'Amount'].map((col) => (
                    <th
                      key={col}
                      className="px-6 py-4 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: '#94a3b8' }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ACTIVITY.map((row, idx) => (
                  <tr
                    key={row.id}
                    style={{ borderTop: idx > 0 ? '1px solid #f1f5f9' : 'none' }}
                  >
                    <td className="px-6 py-4 text-sm font-semibold" style={{ color: '#0f172a' }}>{row.id}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#475569' }}>{row.product}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm" style={{ color: '#475569' }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.actionColor }} />
                        {row.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#94a3b8' }}>{row.date}</td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: row.statusBg, color: row.statusColor }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold" style={{ color: '#0f172a' }}>{row.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
