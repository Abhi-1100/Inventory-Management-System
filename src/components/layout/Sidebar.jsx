'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PackageOpen,
  Truck,
  ArrowLeftRight,
  ClipboardList,
  History,
  Settings,
  UserCircle,
  LogOut,
  Boxes,
  BarChart2,
  Warehouse,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',               icon: LayoutDashboard },
  { label: 'Products',     href: '/products',                icon: Package },
  { label: 'Operations',   href: '/operations/receipts',     icon: PackageOpen },
  { label: 'Move History', href: '/move-history',            icon: History },
  { label: 'Reports',      href: '/settings/warehouses',     icon: BarChart2 },
];

const bottomItems = [
  { label: 'Settings',    href: '/settings/warehouses', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen flex-shrink-0 flex flex-col fixed top-0 left-0 z-20"
      style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0' }}>

      {/* Logo */}
      <div className="p-6 flex items-center gap-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
          style={{ backgroundColor: '#f07c28', boxShadow: '0 4px 12px rgba(240,124,40,0.25)' }}>
          <Boxes size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight" style={{ color: '#0f172a' }}>CoreInventory</h1>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Inventory Management</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
              style={active
                ? { backgroundColor: 'rgba(240,124,40,0.1)', color: '#f07c28' }
                : { color: '#475569' }
              }
              onMouseOver={(e) => { if (!active) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; } }}
              onMouseOut={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; } }}
            >
              <Icon size={18} style={{ color: active ? '#f07c28' : 'inherit' }} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Settings + Logout */}
      <div className="p-4 space-y-1" style={{ borderTop: '1px solid #e2e8f0' }}>
        <Link
          href="/settings/warehouses"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
          style={{ color: '#475569' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
        >
          <Settings size={18} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
          style={{ color: '#475569' }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
