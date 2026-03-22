'use client';
import { useEffect, useState, useMemo } from 'react';
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

export default function DashboardPage() {
  const [kpis, setKpis] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  const [stockMovement, setStockMovement] = useState(null);
  const [chartDays, setChartDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [kpisRes, activityRes, alertsRes, stockRes] = await Promise.all([
        api.get('/dashboard/kpis'),
        api.get('/dashboard/recent-activity'),
        api.get('/dashboard/inventory-alerts'),
        api.get('/dashboard/stock-movement'),
      ]);
      setKpis(kpisRes.data);
      setRecentActivity(activityRes.data);
      setInventoryAlerts(alertsRes.data);
      setStockMovement(stockRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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

  // ── Stock Movement Chart Logic ──
  const chartData = useMemo(() => {
    if (!stockMovement) return null;
    let currentTotal = stockMovement.currentTotalQuantity;
    const dailyChanges = stockMovement.dailyChanges;

    // Generate array of dates for the last `chartDays`
    const dates = [];
    const values = []; // Will hold values backwards initially
    const today = new Date();
    
    // We walk backwards from today to N days ago
    for (let i = 0; i < chartDays; i++) {
       const d = new Date(today);
       d.setDate(today.getDate() - i);
       const dateStr = d.toISOString().split('T')[0];
       
       dates.unshift(d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })); // prepend
       values.unshift(currentTotal); // the total stock at end of `d`
       
       // To get total stock at end of `d-1`, subtract the changes that happened on `d`
       const changeOnDay = dailyChanges[dateStr] || 0;
       currentTotal -= changeOnDay;
    }

    // Determine min/max for scaling
    const minVal = Math.min(...values) * 0.9; // 10% padding below
    const maxVal = Math.max(...values) * 1.05; // 5% padding above
    const range = maxVal - minVal || 1; // avoid divide by zero

    // SVG coordinates: W = 478, H = 150 (from viewBox)
    const points = values.map((val, idx) => {
       const x = (idx / (chartDays - 1)) * 478;
       const y = 150 - ((val - minVal) / range) * 150;
       return `${x},${y}`;
    });

    const pathD = `M${points[0]} ` + points.map((p, i) => i > 0 ? `L${p}` : '').join(' ');
    const fillD = `${pathD} V150 H0 Z`;

    return { dates, points, pathD, fillD };
  }, [stockMovement, chartDays]);

  return (
    <AppLayout>
      <Toaster position="bottom-right" />

      <div className="space-y-8">

        {/* ── KPI Cards ── */}
        {loading && !kpis ? (
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
                <p className="text-sm" style={{ color: '#94a3b8' }}>Inventory flow over the last {chartDays} days</p>
              </div>
              <select
                className="rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 cursor-pointer"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#475569',
                }}
                value={chartDays}
                onChange={(e) => setChartDays(Number(e.target.value))}
              >
                <option value={30}>Last 30 Days</option>
                <option value={7}>Last 7 Days</option>
              </select>
            </div>

            {/* SVG Chart */}
            <div className="h-52 flex flex-col justify-between">
              {loading && !chartData ? (
                <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
              ) : chartData ? (
                <>
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
                    {/* Gradient fill */}
                    <path
                      d={chartData.fillD}
                      fill="url(#gradient-chart)"
                    />
                    {/* Line */}
                    <path
                      d={chartData.pathD}
                      stroke="#f07c28"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex justify-between text-xs px-2 pt-3" style={{ color: '#94a3b8' }}>
                    <span>{chartData.dates[0]}</span>
                    <span>{chartData.dates[Math.floor(chartDays * 0.25)]}</span>
                    <span>{chartData.dates[Math.floor(chartDays * 0.5)]}</span>
                    <span>{chartData.dates[Math.floor(chartDays * 0.75)]}</span>
                    <span>{chartData.dates[chartDays - 1]}</span>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">No data available</div>
              )}
            </div>
          </div>

          {/* Inventory Alerts */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold" style={{ color: '#334155' }}>Inventory Alerts</h3>
            {loading && inventoryAlerts.length === 0 ? (
              <div className="p-5 bg-white rounded-xl animate-pulse shadow-sm h-28" style={{ border: '1px solid #e2e8f0' }} />
            ) : inventoryAlerts.length > 0 ? (
              inventoryAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-5 bg-white rounded-xl transition-all duration-150 shadow-sm"
                  style={{ border: '1px solid #e2e8f0' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: alert.iconBg }}
                  >
                    {alert.badge === 'OUT OF STOCK' ? (
                      <PackageX size={24} style={{ color: alert.iconColor, strokeWidth: 2.5 }} />
                    ) : (
                      <AlertTriangle size={24} style={{ color: alert.iconColor, strokeWidth: 2.5 }} />
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0 pt-0.5">
                    <p className="font-bold text-lg leading-snug" style={{ color: '#0f172a' }}>{alert.title}</p>
                    <p className="text-base mt-2 mb-4" style={{ color: '#64748b' }}>{alert.desc}</p>
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider"
                      style={{ backgroundColor: alert.badgeBg, color: alert.badgeColor }}
                    >
                      {alert.badge}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-5 bg-white rounded-xl shadow-sm text-center text-slate-500" style={{ border: '1px solid #e2e8f0' }}>
                <p className="font-medium mb-1">All clear!</p>
                <p className="text-sm">No inventory alerts at this time.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Activity Table ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #e2e8f0' }}>
          {/* Table header */}
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
                  {['Transaction ID', 'Product', 'Action', 'Date', 'Status', 'Quantity'].map((col) => (
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
                {loading && recentActivity.length === 0 ? (
                   [...Array(3)].map((_, i) => (
                     <tr key={i} style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}>
                       <td colSpan="6" className="px-6 py-4">
                         <div className="h-4 bg-slate-100 rounded animate-pulse w-full"></div>
                       </td>
                     </tr>
                   ))
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((row, idx) => (
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
                          className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                          style={{ backgroundColor: row.statusBg, color: row.statusColor }}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold" style={{ color: '#0f172a' }}>{row.amount}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                      No recent activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
