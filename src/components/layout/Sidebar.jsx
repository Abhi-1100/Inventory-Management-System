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
  Boxes,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',               icon: LayoutDashboard },
  { label: 'Products',     href: '/products',                icon: Package },
  { label: 'Receipts',     href: '/operations/receipts',     icon: PackageOpen },
  { label: 'Deliveries',   href: '/operations/deliveries',   icon: Truck },
  { label: 'Transfers',    href: '/operations/transfers',    icon: ArrowLeftRight },
  { label: 'Adjustments',  href: '/operations/adjustments',  icon: ClipboardList },
  { label: 'Move History', href: '/move-history',            icon: History },
  { label: 'Settings',     href: '/settings/warehouses',     icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  
  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 h-screen flex-shrink-0 flex flex-col fixed top-0 left-0 z-20"
      style={{ backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0' }}>

      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded shrink-0 flex items-center justify-center shadow-[0_2px_4px_rgba(242,125,33,0.3)]"
          style={{ backgroundColor: '#F27D21' }}>
          <Boxes size={18} className="text-white" />
        </div>
        <h1 className="font-extrabold text-lg tracking-tight" style={{ color: '#1a1a1a' }}>CoreInventory</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
              style={active
                ? { backgroundColor: '#F0F0F0', color: '#1a1a1a' }
                : { color: '#7a8fa6' }
              }
              onMouseOver={(e) => { if (!active) { e.currentTarget.style.backgroundColor = '#F8F9FA'; e.currentTarget.style.color = '#393939'; } }}
              onMouseOut={(e) => { if (!active) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7a8fa6'; } }}
            >
              <Icon size={18} style={{ color: active ? '#1a1a1a' : '#A4B6C2' }} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
